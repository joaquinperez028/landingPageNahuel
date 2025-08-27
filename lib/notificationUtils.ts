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
    
    console.log('🔔 [ALERT NOTIFICATION] Iniciando creación de notificación para alerta:', alert.symbol);
    console.log('🔔 [ALERT NOTIFICATION] Detalles de alerta:', {
      symbol: alert.symbol,
      action: alert.action,
      tipo: alert.tipo,
      entryPriceRange: alert.entryPriceRange
    });

    // Determinar el grupo de usuarios basado en el tipo de alerta
    let targetUsers = 'alertas_trader'; // por defecto
    
    if (alert.tipo === 'SmartMoney') {
      targetUsers = 'alertas_smart';
    } else if (alert.tipo === 'CashFlow') {
      targetUsers = 'alertas_cashflow';
    } else if (alert.tipo === 'TraderCall') {
      targetUsers = 'alertas_trader';
    }

    console.log('🔔 [ALERT NOTIFICATION] Grupo de usuarios objetivo:', targetUsers);

    // Buscar usuarios con suscripciones activas al servicio específico para validar
    const subscribedUsers = await User.find({
      $or: [
        {
          'suscripciones': {
            $elemMatch: {
              servicio: alert.tipo,
              activa: true,
              fechaVencimiento: { $gte: new Date() }
            }
          }
        },
        {
          'subscriptions': {
            $elemMatch: {
              tipo: alert.tipo,
              activa: true,
              $or: [
                { fechaFin: { $gte: new Date() } },
                { fechaFin: { $exists: false } }
              ]
            }
          }
        }
      ]
    }, 'email name');

    console.log('👥 [ALERT NOTIFICATION] Usuarios suscritos al servicio encontrados:', subscribedUsers.length);
    
    if (subscribedUsers.length === 0) {
      console.log('⚠️ [ALERT NOTIFICATION] No hay usuarios suscritos al servicio:', alert.tipo);
      return;
    }

    // Buscar plantilla específica para alertas
    const template = await NotificationTemplate.findOne({ name: 'nueva_alerta' });
    console.log('🎨 [ALERT NOTIFICATION] Plantilla encontrada:', !!template);
    
    let notification: any;
    
    if (template) {
      // Usar plantilla con variables dinámicas
      const variables = {
        alertType: alert.tipo,
        symbol: alert.symbol,
        action: alert.action,
        price: `${alert.entryPriceRange?.min || 'N/A'} - ${alert.entryPriceRange?.max || 'N/A'}`,
        takeProfit: alert.takeProfit?.toString() || 'N/A',
        stopLoss: alert.stopLoss?.toString() || 'N/A'
      };
      
      notification = {
        title: template.render(variables).title,
        message: template.render(variables).message,
        type: 'alerta',
        priority: 'alta', // Usar valor válido en español
        targetUsers: targetUsers,
        icon: '🚨',
        actionUrl: getAlertActionUrl(alert.tipo),
        actionText: 'Ver Alertas',
        isActive: true,
        createdBy: 'sistema', // Campo requerido
        isAutomatic: true,
        relatedAlertId: alert._id,
        templateId: template._id,
        metadata: {
          alertSymbol: alert.symbol,
          alertAction: alert.action,
          alertPrice: `${alert.entryPriceRange?.min || 'N/A'} - ${alert.entryPriceRange?.max || 'N/A'}`,
          alertService: alert.tipo,
          automatic: true
        }
      };
    } else {
      console.log('🎨 [ALERT NOTIFICATION] Usando notificación manual (sin plantilla)');
      // Crear notificación manual si no hay plantilla
      notification = {
        title: `🚨 Nueva Alerta ${alert.tipo}`,
        message: `${alert.action} ${alert.symbol} en $${alert.entryPriceRange?.min || 'N/A'} - $${alert.entryPriceRange?.max || 'N/A'}. TP: $${alert.takeProfit}, SL: $${alert.stopLoss}`,
        type: 'alerta',
        priority: 'alta', // Usar valor válido en español
        targetUsers: targetUsers,
        icon: '🚨',
        actionUrl: getAlertActionUrl(alert.tipo),
        actionText: 'Ver Alertas',
        isActive: true,
        createdBy: 'sistema', // Campo requerido
        isAutomatic: true,
        relatedAlertId: alert._id,
        metadata: {
          alertSymbol: alert.symbol,
          alertAction: alert.action,
          alertPrice: `${alert.entryPriceRange?.min || 'N/A'} - ${alert.entryPriceRange?.max || 'N/A'}`,
          alertService: alert.tipo,
          automatic: true
        }
      };
    }

    console.log('📧 [ALERT NOTIFICATION] Creando notificación global:', {
      title: notification.title,
      targetUsers: notification.targetUsers,
      subscribedUsers: subscribedUsers.length
    });

    // Crear UNA notificación global que se muestre a todos los usuarios del grupo
    const notificationDoc = new Notification(notification);
    await notificationDoc.save();

    console.log(`✅ [ALERT NOTIFICATION] Notificación global creada exitosamente: ${notificationDoc._id}`);
    console.log(`📊 [ALERT NOTIFICATION] Se mostrará a ${subscribedUsers.length} usuarios suscritos al servicio ${alert.tipo}`);

    // Enviar emails a usuarios suscritos
    let emailsSent = 0;
    const emailErrors: string[] = [];

    for (const user of subscribedUsers) {
      try {
        const emailSuccess = await sendEmailNotification(user, notificationDoc);
        if (emailSuccess) {
          emailsSent++;
        } else {
          emailErrors.push(`Error enviando email a ${user.email}`);
        }
      } catch (error) {
        console.error(`❌ Error enviando email a ${user.email}:`, error);
        emailErrors.push(`Error para ${user.email}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`📧 [ALERT NOTIFICATION] Emails enviados: ${emailsSent}/${subscribedUsers.length}`);
    
    if (emailErrors.length > 0) {
      console.error('❌ [ALERT NOTIFICATION] Errores de email:', emailErrors.slice(0, 3));
    }

  } catch (error) {
    console.error('❌ [ALERT NOTIFICATION] Error creando notificación de alerta:', error);
  }
}

/**
 * Crea notificación automática cuando se crea un informe
 */
export async function createReportNotification(report: any): Promise<void> {
  try {
    await dbConnect();
    
    console.log('📰 [REPORT NOTIFICATION] Iniciando creación de notificación para informe:', report.title);
    console.log('📰 [REPORT NOTIFICATION] Detalles del informe:', {
      title: report.title,
      type: report.type,
      category: report.category,
      author: report.author
    });

    // Mapear categoría del informe al grupo de usuarios
    let targetUsers = 'alertas_trader'; // por defecto
    let serviceType = 'TraderCall';
    
    if (report.category === 'trader-call') {
      targetUsers = 'alertas_trader';
      serviceType = 'TraderCall';
    } else if (report.category === 'smart-money') {
      targetUsers = 'alertas_smart';
      serviceType = 'SmartMoney';
    }

    console.log('📰 [REPORT NOTIFICATION] Grupo de usuarios objetivo:', targetUsers, 'para servicio:', serviceType);

    // Buscar usuarios con suscripciones activas al servicio específico para validar
    const subscribedUsers = await User.find({
      $or: [
        {
          'suscripciones': {
            $elemMatch: {
              servicio: serviceType,
              activa: true,
              fechaVencimiento: { $gte: new Date() }
            }
          }
        },
        {
          'subscriptions': {
            $elemMatch: {
              tipo: serviceType,
              activa: true,
              $or: [
                { fechaFin: { $gte: new Date() } },
                { fechaFin: { $exists: false } }
              ]
            }
          }
        }
      ]
    }, 'email name');

    console.log('👥 [REPORT NOTIFICATION] Usuarios suscritos al servicio encontrados:', subscribedUsers.length);
    
    if (subscribedUsers.length === 0) {
      console.log('⚠️ [REPORT NOTIFICATION] No hay usuarios suscritos al servicio:', serviceType);
      return;
    }

    // Crear notificación para informe
    const notification = {
      title: `📰 Nuevo Informe ${serviceType}: ${report.title}`,
      message: `Se ha publicado un nuevo informe de análisis para ${serviceType}. ${report.content.substring(0, 100)}...`,
      type: 'actualizacion',
      priority: 'media', // Usar valor válido en español
      targetUsers: targetUsers,
      icon: '📰',
      actionUrl: `/reports/${report._id}`, // URL específica del informe
      actionText: 'Leer Informe',
      isActive: true,
      createdBy: 'sistema', // Campo requerido
      isAutomatic: true,
      relatedReportId: report._id,
      metadata: {
        reportTitle: report.title,
        reportType: report.type,
        reportCategory: report.category,
        serviceType: serviceType,
        automatic: true
      }
    };

    console.log('📧 [REPORT NOTIFICATION] Creando notificación global:', {
      title: notification.title,
      targetUsers: notification.targetUsers,
      subscribedUsers: subscribedUsers.length
    });

    // Crear UNA notificación global que se muestre a todos los usuarios del grupo
    const notificationDoc = new Notification(notification);
    await notificationDoc.save();

    console.log(`✅ [REPORT NOTIFICATION] Notificación global creada exitosamente: ${notificationDoc._id}`);
    console.log(`📊 [REPORT NOTIFICATION] Se mostrará a ${subscribedUsers.length} usuarios suscritos al servicio ${serviceType}`);

    // Enviar emails a usuarios suscritos
    let emailsSent = 0;
    const emailErrors: string[] = [];

    for (const user of subscribedUsers) {
      try {
        const emailSuccess = await sendEmailNotification(user, notificationDoc);
        if (emailSuccess) {
          emailsSent++;
        } else {
          emailErrors.push(`Error enviando email a ${user.email}`);
        }
      } catch (error) {
        console.error(`❌ Error enviando email a ${user.email}:`, error);
        emailErrors.push(`Error para ${user.email}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`📧 [REPORT NOTIFICATION] Emails enviados: ${emailsSent}/${subscribedUsers.length}`);
    
    if (emailErrors.length > 0) {
      console.error('❌ [REPORT NOTIFICATION] Errores de email:', emailErrors.slice(0, 3));
    }

  } catch (error) {
    console.error('❌ [REPORT NOTIFICATION] Error creando notificación de informe:', error);
  }
}

/**
 * Envía notificación a usuarios suscritos (función original para notificaciones manuales)
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

    // Buscar usuarios suscritos para validar y enviar emails
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
    console.log(`📧 Creando notificación global para ${userEmails.length} usuarios suscritos`);

    // Determinar targetUsers para la notificación global
    let targetUsers = 'todos'; // por defecto
    
    // Mapear tipos de suscripción a grupos de usuarios
    switch (targetSubscriptionType) {
      case 'notificaciones_alertas':
        targetUsers = 'suscriptores';
        break;
      case 'notificaciones_promociones':
        targetUsers = 'todos';
        break;
      case 'notificaciones_actualizaciones':
        targetUsers = 'suscriptores';
        break;
      case 'notificaciones_sistema':
      default:
        targetUsers = 'todos';
        break;
    }

    // Crear UNA notificación global que se muestre a todos los usuarios del grupo
    const notificationDoc = new Notification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority || 'media',
      targetUsers: targetUsers,
      icon: notification.icon || '📧',
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      isActive: true,
      createdBy: notification.metadata?.sentBy || 'admin',
      isAutomatic: notification.isAutomatic || false,
      metadata: notification.metadata || {}
    });

    await notificationDoc.save();
    console.log(`✅ Notificación global creada exitosamente: ${notificationDoc._id}`);

    // Enviar emails a usuarios suscritos
    let emailsSent = 0;
    const errors: string[] = [];

    for (const email of userEmails) {
      try {
        const user = await User.findOne({ email });
        if (!user) continue;

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
        console.error(`❌ Error enviando email a ${email}:`, error);
        errors.push(`Error para ${email}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`📊 Notificación global creada. Emails enviados: ${emailsSent}/${userEmails.length}`);

    return {
      sent: 1, // Una notificación global creada
      failed: 0,
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
    
    console.log(`🔔 [INIT SUBSCRIPTIONS] Inicializando suscripciones para: ${userEmail}`);
    
    // Verificar si ya tiene suscripciones
    const existing = await UserSubscription.findOne({ userEmail });
    if (existing) {
      console.log(`ℹ️ [INIT SUBSCRIPTIONS] Usuario ${userEmail} ya tiene suscripciones configuradas`);
      return;
    }
    
    // Crear suscripciones por defecto - ACTIVAR ALERTAS POR DEFECTO
    await UserSubscription.create({
      userEmail,
      subscriptions: {
        // ✅ ALERTAS ACTIVADAS POR DEFECTO - los usuarios recibirán notificaciones
        alertas_trader: true,
        alertas_smart: true, 
        alertas_cashflow: true,
        // ✅ NOTIFICACIONES GENERALES ACTIVADAS
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
    
    console.log(`✅ [INIT SUBSCRIPTIONS] Suscripciones inicializadas para: ${userEmail} (todas las alertas ACTIVADAS)`);
    
  } catch (error) {
    console.error('❌ [INIT SUBSCRIPTIONS] Error inicializando suscripciones:', error);
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

    default:
      return '/alertas';
  }
}

/**
 * Asegura que todos los usuarios tengan suscripciones configuradas
 */
export async function ensureUserSubscriptions(): Promise<void> {
  try {
    await dbConnect();
    
    console.log('🔔 [SUBSCRIPTION CHECK] Verificando suscripciones de usuarios...');
    
    // Obtener todos los usuarios
    const allUsers = await User.find({}, 'email');
    console.log('👥 [SUBSCRIPTION CHECK] Total usuarios encontrados:', allUsers.length);
    
    // Obtener usuarios que ya tienen suscripciones
    const usersWithSubscriptions = await UserSubscription.find({}, 'userEmail');
    const emailsWithSubscriptions = usersWithSubscriptions.map(sub => sub.userEmail);
    
    console.log('📋 [SUBSCRIPTION CHECK] Usuarios con suscripciones:', emailsWithSubscriptions.length);
    
    // Encontrar usuarios sin suscripciones
    const usersWithoutSubscriptions = allUsers.filter(user => 
      !emailsWithSubscriptions.includes(user.email)
    );
    
    console.log('⚠️ [SUBSCRIPTION CHECK] Usuarios SIN suscripciones:', usersWithoutSubscriptions.length);
    
    // Crear suscripciones para usuarios que no las tienen
    for (const user of usersWithoutSubscriptions) {
      await initializeUserSubscriptions(user.email);
      console.log('✅ [SUBSCRIPTION CHECK] Suscripciones creadas para:', user.email);
    }
    
    // Mostrar estadísticas finales
    const finalSubscriptions = await UserSubscription.find({});
    console.log('📊 [SUBSCRIPTION CHECK] Total usuarios con suscripciones después:', finalSubscriptions.length);
    
    // Mostrar ejemplos de suscripciones para debugging
    for (const sub of finalSubscriptions.slice(0, 3)) {
      console.log('📊 [SUBSCRIPTION CHECK] Ejemplo:', sub.userEmail, {
        alertas_trader: sub.subscriptions.alertas_trader,
        alertas_smart: sub.subscriptions.alertas_smart,

        notificaciones_actualizaciones: sub.subscriptions.notificaciones_actualizaciones
      });
    }
    
  } catch (error) {
    console.error('❌ [SUBSCRIPTION CHECK] Error verificando suscripciones:', error);
  }
}

/**
 * Función de diagnóstico para verificar el estado del sistema de notificaciones
 */
export async function diagnoseNotificationSystem(): Promise<{
  users: number;
  subscriptions: number;
  templates: number;
  recentNotifications: number;
  alertSubscribers: {
    trader: number;
    smart: number;

  };
}> {
  try {
    await dbConnect();
    
    const [
      totalUsers,
      totalSubscriptions,
      totalTemplates,
      recentNotifications,
      traderSubscribers,
      smartSubscribers,

    ] = await Promise.all([
      User.countDocuments(),
      UserSubscription.countDocuments(),
      NotificationTemplate.countDocuments(),
      Notification.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      }),
      UserSubscription.countDocuments({ 'subscriptions.alertas_trader': true }),
      UserSubscription.countDocuments({ 'subscriptions.alertas_smart': true }),

    ]);
    
    return {
      users: totalUsers,
      subscriptions: totalSubscriptions,
      templates: totalTemplates,
      recentNotifications,
      alertSubscribers: {
        trader: traderSubscribers,
        smart: smartSubscribers,

      }
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return {
      users: 0,
      subscriptions: 0,
      templates: 0,
      recentNotifications: 0,
      alertSubscribers: { trader: 0, smart: 0 }
    };
  }
} 