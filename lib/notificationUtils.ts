import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import NotificationTemplate from '@/models/NotificationTemplate';
import UserSubscription from '@/models/UserSubscription';
import User from '@/models/User';
import { IAlert } from '@/models/Alert';
import { sendEmail, generateAlertEmailTemplate } from '@/lib/emailService';

/**
 * Crea una notificación automática cuando se crea una alerta
 */
export async function createAlertNotification(alert: IAlert & { _id: string }): Promise<void> {
  try {
    await dbConnect();
    
    console.log(`🔔 Creando notificación automática para alerta: ${alert.symbol} ${alert.action}`);
    
    // Determinar el tipo de destino basado en el tipo de alerta
    let targetUsers: string;
    let alertType: string;
    
    switch (alert.tipo) {
      case 'TraderCall':
        targetUsers = 'alertas_trader';
        alertType = 'Trader Call';
        break;
      case 'SmartMoney':
        targetUsers = 'alertas_smart';
        alertType = 'Smart Money';
        break;
      case 'CashFlow':
        targetUsers = 'alertas_cashflow';
        alertType = 'Cash Flow';
        break;
      default:
        targetUsers = 'todos';
        alertType = 'Trading';
    }
    
    // Buscar plantilla para alertas
    const template = await NotificationTemplate.findOne({ 
      name: 'nueva_alerta',
      isActive: true 
    });
    
    let notificationData: any;
    
    if (template) {
      // Usar plantilla
      const variables = {
        alertType,
        symbol: alert.symbol,
        action: alert.action,
        price: alert.entryPrice,
        takeProfit: alert.takeProfit,
        stopLoss: alert.stopLoss
      };
      
      const rendered = template.render(variables);
      
      notificationData = {
        ...rendered,
        targetUsers,
        isAutomatic: true,
        templateId: template._id,
        relatedAlertId: alert._id,
        createdBy: 'system',
        metadata: {
          alertType: alert.tipo,
          alertSymbol: alert.symbol,
          alertAction: alert.action,
          alertPrice: alert.entryPrice
        }
      };
    } else {
      // Crear notificación manual sin plantilla
      notificationData = {
        title: `🚨 Nueva Alerta ${alertType}`,
        message: `${alert.action} ${alert.symbol} en $${alert.entryPrice}. TP: $${alert.takeProfit}, SL: $${alert.stopLoss}`,
        type: 'alerta',
        priority: 'alta',
        targetUsers,
        icon: '🚨',
        actionUrl: `/alertas/${alert.tipo.toLowerCase().replace('call', '-call')}`,
        actionText: 'Ver Alerta',
        isAutomatic: true,
        relatedAlertId: alert._id,
        createdBy: 'system',
        metadata: {
          alertType: alert.tipo,
          alertSymbol: alert.symbol,
          alertAction: alert.action,
          alertPrice: alert.entryPrice
        }
      };
    }
    
    // Crear la notificación
    const notification = await Notification.create(notificationData);
    
    // Enviar notificaciones (email y push)
    await sendNotificationToSubscribers(notification);
    
    console.log(`✅ Notificación automática creada: ${notification._id}`);
    
  } catch (error) {
    console.error('❌ Error al crear notificación automática:', error);
  }
}

/**
 * Envía notificaciones a usuarios suscritos
 */
export async function sendNotificationToSubscribers(notification: any): Promise<void> {
  try {
    await dbConnect();
    
    console.log(`📤 Enviando notificación a usuarios suscritos: ${notification.targetUsers}`);
    
    let subscribedUsers: any[] = [];
    
    // Obtener usuarios suscritos según el tipo
    if (notification.targetUsers === 'todos') {
      // Obtener todos los usuarios activos
      subscribedUsers = await User.find({ 
        isActive: true 
      }).select('email name');
    } else if (notification.targetUsers.startsWith('alertas_')) {
      // Obtener usuarios suscritos a alertas específicas
      const alertType = notification.targetUsers.replace('alertas_', '');
      
      // Construir query para el tipo de alerta específico
      const query: any = {};
      query[`subscriptions.alertas_${alertType}`] = true;
      
      const subscriptions = await UserSubscription.find(query).select('userEmail preferences');
      
      // Obtener información completa de usuarios
      const emails = subscriptions.map((sub: any) => sub.userEmail);
      subscribedUsers = await User.find({ 
        email: { $in: emails },
        isActive: true 
      }).select('email name');
    } else {
      // Para otros tipos (suscriptores, admin, etc.)
      const role = notification.targetUsers === 'admin' ? 'admin' : 'suscriptor';
      subscribedUsers = await User.find({ 
        role,
        isActive: true 
      }).select('email name');
    }
    
    console.log(`📧 Enviando a ${subscribedUsers.length} usuarios`);
    
    // Enviar emails en paralelo
    const emailPromises = subscribedUsers.map(user => 
      sendEmailNotification(user, notification)
    );
    
    // Ejecutar envíos en lotes para evitar sobrecarga
    const batchSize = 10;
    for (let i = 0; i < emailPromises.length; i += batchSize) {
      const batch = emailPromises.slice(i, i + batchSize);
      await Promise.allSettled(batch);
    }
    
    // Marcar como enviada por email
    notification.emailSent = true;
    await notification.save();
    
    console.log(`✅ Notificaciones enviadas exitosamente`);
    
  } catch (error) {
    console.error('❌ Error al enviar notificaciones:', error);
  }
}

/**
 * Envía notificación por email a un usuario específico
 */
export async function sendEmailNotification(user: any, notification: any): Promise<boolean> {
  try {
    // Verificar preferencias del usuario
    const subscription = await UserSubscription.findOne({ userEmail: user.email });
    
    if (subscription && !subscription.preferences.emailNotifications) {
      console.log(`📧 Usuario ${user.email} tiene emails desactivados`);
      return false;
    }

    console.log(`📧 Enviando email a: ${user.email}`);
    
    // Usar la nueva plantilla de email mejorada para alertas
    const htmlContent = generateAlertEmailTemplate(notification, user);
    
    // Enviar email usando el servicio real
    const emailSent = await sendEmail({
      to: user.email,
      subject: notification.title,
      html: htmlContent
    });

    if (emailSent) {
      console.log(`✅ Email enviado exitosamente a: ${user.email}`);
    } else {
      console.log(`❌ Error enviando email a: ${user.email}`);
    }
    
    return emailSent;
    
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