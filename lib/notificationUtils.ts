import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import NotificationTemplate from '@/models/NotificationTemplate';
import UserSubscription from '@/models/UserSubscription';
import User from '@/models/User';
import { IAlert } from '@/models/Alert';
import { sendEmail, generateAlertEmailTemplate } from '@/lib/emailService';

/**
 * Crea notificación automática cuando se crea una alerta
 */
export async function createAlertNotification(alert: IAlert): Promise<void> {
  try {
    await dbConnect();
    
    console.log('🔔 Creando notificación automática para alerta:', alert.symbol);

    // Determinar el tipo de suscripción basado en el tipo de alerta
    let subscriptionType = 'alertas_trader'; // por defecto
    let alertType = 'TraderCall';
    
    if (alert.tipo === 'SmartMoney') {
      subscriptionType = 'alertas_smart';
      alertType = 'SmartMoney';
    } else if (alert.tipo === 'CashFlow') {
      subscriptionType = 'alertas_cashflow';
      alertType = 'CashFlow';
    }

    // Buscar plantilla específica para alertas
    const template = await NotificationTemplate.findOne({ name: 'nueva_alerta' });
    
    let notification: any;
    
    if (template) {
      // Usar plantilla con variables dinámicas
      const variables = {
        alertType,
        symbol: alert.symbol,
        action: alert.action,
        price: alert.entryPrice?.toString() || 'N/A',
        takeProfit: alert.takeProfit?.toString() || 'N/A',
        stopLoss: alert.stopLoss?.toString() || 'N/A'
      };
      
      notification = {
        title: template.render(variables).title,
        message: template.render(variables).message,
        type: 'alerta',
        priority: template.priority,
        icon: '🤖',
        actionUrl: getAlertActionUrl(alert.tipo),
        actionText: 'Ver Alertas',
        isAutomatic: true,
        relatedAlertId: alert._id,
        templateId: template._id,
        metadata: {
          alertSymbol: alert.symbol,
          alertAction: alert.action,
          alertPrice: alert.entryPrice,
          alertService: alert.tipo,
          automatic: true
        }
      };
    } else {
      // Crear notificación manual si no hay plantilla
      notification = {
        title: `🚨 Nueva Alerta ${alertType}`,
        message: `${alert.action} ${alert.symbol} en $${alert.entryPrice}. TP: $${alert.takeProfit}, SL: $${alert.stopLoss}`,
        type: 'alerta',
        priority: 'high',
        icon: '🤖',
        actionUrl: getAlertActionUrl(alert.tipo),
        actionText: 'Ver Alertas',
        isAutomatic: true,
        relatedAlertId: alert._id,
        metadata: {
          alertSymbol: alert.symbol,
          alertAction: alert.action,
          alertPrice: alert.entryPrice,
          alertService: alert.tipo,
          automatic: true
        }
      };
    }

    // Enviar notificación a usuarios suscritos (incluyendo emails)
    const result = await sendNotificationToSubscribers(notification, subscriptionType, true);
    
    console.log(`✅ Notificación de alerta enviada: ${result.sent} usuarios, ${result.emailsSent} emails`);

  } catch (error) {
    console.error('❌ Error creando notificación de alerta:', error);
  }
}

/**
 * Envía notificación a usuarios suscritos
 */
export async function sendNotificationToSubscribers(
  notification: any, 
  subscriptionType?: string, 
  shouldSendEmail: boolean = true
): Promise<{
  sent: number;
  failed: number;
  emailsSent: number;
  errors: string[];
}> {
  try {
    await dbConnect();

    // Determinar el tipo de suscripción basado en el tipo de notificación
    let targetSubscriptionType = subscriptionType || 'notificaciones_sistema';
    
    // Mapear tipos de notificación a tipos de suscripción
    switch (notification.type) {
      case 'alerta':
        targetSubscriptionType = 'notificaciones_alertas';
        break;
      case 'promocion':
        targetSubscriptionType = 'notificaciones_promociones';
        break;
      case 'actualizacion':
        targetSubscriptionType = 'notificaciones_actualizaciones';
        break;
      case 'sistema':
      default:
        targetSubscriptionType = 'notificaciones_sistema';
        break;
    }

    // Buscar usuarios suscritos
    const subscriptions = await UserSubscription.find({
      [`subscriptions.${targetSubscriptionType}`]: true
    });

    if (subscriptions.length === 0) {
      console.log('📧 No hay usuarios suscritos para este tipo de notificación');
      return {
        sent: 0,
        failed: 0,
        emailsSent: 0,
        errors: []
      };
    }

    const userEmails = subscriptions.map(sub => sub.userEmail);
    console.log(`📧 Enviando notificación a ${userEmails.length} usuarios suscritos`);

    let notificationsSent = 0;
    let notificationsFailed = 0;
    let emailsSent = 0;
    const errors: string[] = [];

    // Crear notificaciones en la base de datos
    for (const email of userEmails) {
      try {
        const user = await User.findOne({ email });
        if (!user) continue;

        // Crear notificación
        const notificationDoc = new Notification({
          userId: user._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority || 'medium',
          icon: notification.icon || '📧',
          actionUrl: notification.actionUrl,
          actionText: notification.actionText,
          isAutomatic: notification.isAutomatic || false,
          metadata: notification.metadata || {}
        });

        await notificationDoc.save();
        notificationsSent++;

        // Enviar email si está habilitado
        if (shouldSendEmail) {
          const emailSuccess = await sendEmailNotification(user, notificationDoc);
          if (emailSuccess) {
            emailsSent++;
          } else {
            errors.push(`Error enviando email a ${email}`);
          }
        }

      } catch (error) {
        console.error(`❌ Error creando notificación para ${email}:`, error);
        notificationsFailed++;
        errors.push(`Error para ${email}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`📊 Notificaciones enviadas: ${notificationsSent}, fallidas: ${notificationsFailed}, emails: ${emailsSent}`);

    return {
      sent: notificationsSent,
      failed: notificationsFailed,
      emailsSent,
      errors
    };

  } catch (error) {
    console.error('❌ Error en sendNotificationToSubscribers:', error);
    return {
      sent: 0,
      failed: 1,
      emailsSent: 0,
      errors: [error instanceof Error ? error.message : 'Error desconocido']
    };
  }
}

/**
 * Envía notificación por email a un usuario específico
 */
export async function sendEmailNotification(user: any, notification: any): Promise<boolean> {
  try {
    console.log(`📧 Enviando email a: ${user.email}`);
    
    // Usar la nueva plantilla de email mejorada para alertas
    const htmlContent = generateAlertEmailTemplate(notification, user);
    
    // Enviar email usando el servicio real
    await sendEmail({
      to: user.email,
      subject: notification.title,
      html: htmlContent
    });

    console.log(`✅ Email enviado exitosamente a: ${user.email}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error enviando email a ${user.email}:`, error);
    return false;
  }
}

/**
 * Genera plantilla HTML para email
 */
export function generateEmailTemplate(notification: any, user: any): string {
  const actionButton = notification.actionUrl ? 
    `<a href="${notification.actionUrl}" style="display: inline-block; padding: 12px 24px; background: #00ff88; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
      ${notification.actionText || 'Ver Más'}
    </a>` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${notification.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
          ${notification.icon} ${notification.title}
        </h1>
      </div>
      
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px; color: #555;">
          Hola ${user.name || user.email},
        </p>
        <p style="margin: 15px 0; font-size: 16px; color: #333;">
          ${notification.message}
        </p>
        
        ${actionButton}
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
        <p>Este es un email automático de <strong>Nahuel Lozano Trading</strong></p>
        <p>Si no deseas recibir estas notificaciones, puedes <a href="/perfil">configurar tus preferencias</a></p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Crea plantillas por defecto para alertas
 */
export async function createDefaultTemplates(): Promise<void> {
  try {
    await dbConnect();
    
    console.log('🎨 Creando plantillas por defecto...');
    
    // Plantilla para nuevas alertas
    const alertTemplate = {
      name: 'nueva_alerta',
      description: 'Plantilla para notificaciones de nuevas alertas',
      type: 'alerta',
      priority: 'alta',
      titleTemplate: '🚨 Nueva Alerta {alertType}',
      messageTemplate: '{action} {symbol} en ${price}. TP: ${takeProfit}, SL: ${stopLoss}',
      icon: '🚨',
      actionUrlTemplate: '/alertas/{alertType}',
      actionTextTemplate: 'Ver Alerta',
      targetUsers: 'todos',
      variables: [
        {
          name: 'alertType',
          description: 'Tipo de alerta (Trader Call, Smart Money, etc.)',
          type: 'string',
          required: true
        },
        {
          name: 'symbol',
          description: 'Símbolo del activo',
          type: 'string',
          required: true
        },
        {
          name: 'action',
          description: 'Acción de la alerta (BUY/SELL)',
          type: 'string',
          required: true
        },
        {
          name: 'price',
          description: 'Precio de entrada',
          type: 'number',
          required: true
        },
        {
          name: 'takeProfit',
          description: 'Precio de take profit',
          type: 'number',
          required: true
        },
        {
          name: 'stopLoss',
          description: 'Precio de stop loss',
          type: 'number',
          required: true
        }
      ],
      isActive: true,
      createdBy: 'system'
    };
    
    // Crear plantilla si no existe
    const existingTemplate = await NotificationTemplate.findOne({ name: 'nueva_alerta' });
    if (!existingTemplate) {
      await NotificationTemplate.create(alertTemplate);
      console.log('✅ Plantilla de alerta creada');
    } else {
      console.log('ℹ️ Plantilla de alerta ya existe');
    }
    
  } catch (error) {
    console.error('❌ Error creando plantillas por defecto:', error);
  }
}

/**
 * Inicializa suscripciones por defecto para un usuario nuevo
 */
export async function initializeUserSubscriptions(userEmail: string): Promise<void> {
  try {
    await dbConnect();
    
    console.log(`🔔 Inicializando suscripciones para: ${userEmail}`);
    
    // Verificar si ya tiene suscripciones
    const existing = await UserSubscription.findOne({ userEmail });
    if (existing) {
      console.log(`ℹ️ Usuario ${userEmail} ya tiene suscripciones configuradas`);
      return;
    }
    
    // Crear suscripciones por defecto
    await UserSubscription.create({
      userEmail,
      subscriptions: {
        alertas_trader: false,
        alertas_smart: false,
        alertas_cashflow: false,
        notificaciones_sistema: true,
        notificaciones_promociones: true,
        notificaciones_actualizaciones: true
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        browserNotifications: true
      }
    });
    
    console.log(`✅ Suscripciones inicializadas para: ${userEmail}`);
    
  } catch (error) {
    console.error('❌ Error inicializando suscripciones:', error);
  }
}

/**
 * Asigna notificaciones existentes a un usuario recién registrado
 */
export async function assignNotificationsToNewUser(userEmail: string): Promise<void> {
  try {
    await dbConnect();
    
    // Inicializar suscripciones
    await initializeUserSubscriptions(userEmail);
    
    // Obtener el usuario para verificar su rol
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`❌ Usuario no encontrado: ${userEmail}`);
      return;
    }

    console.log(`📬 Asignando notificaciones a usuario nuevo: ${userEmail} (rol: ${user.role})`);
    
    // Las notificaciones se asignan automáticamente por el query de la API
    // En el futuro, aquí podríamos implementar un sistema de tracking más granular
    
  } catch (error) {
    console.error('❌ Error al asignar notificaciones a usuario nuevo:', error);
  }
}

/**
 * Obtiene estadísticas reales de notificaciones
 */
export async function getNotificationStats(): Promise<{
  totalNotifications: number;
  activeNotifications: number;
  notificationsByType: Record<string, number>;
  recentNotifications: any[];
}> {
  try {
    await dbConnect();
    
    const [
      totalNotifications,
      activeNotifications,
      notificationsByType,
      recentNotifications
    ] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({ isActive: true }),
      Notification.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Notification.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type createdAt')
    ]);
    
    const typeStats = notificationsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalNotifications,
      activeNotifications,
      notificationsByType: typeStats,
      recentNotifications
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de notificaciones:', error);
    return {
      totalNotifications: 0,
      activeNotifications: 0,
      notificationsByType: {},
      recentNotifications: []
    };
  }
}

/**
 * Obtiene la URL de acción para las alertas según el tipo
 */
function getAlertActionUrl(tipo: string): string {
  switch (tipo) {
    case 'TraderCall':
      return '/alertas/trader-call';
    case 'SmartMoney':
      return '/alertas/smart-money';
    case 'CashFlow':
      return '/alertas/cash-flow';
    default:
      return '/alertas';
  }
} 