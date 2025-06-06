import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

/**
 * Asigna notificaciones existentes a un usuario recién registrado
 * Se llama automáticamente cuando un usuario se registra por primera vez
 */
export async function assignNotificationsToNewUser(userEmail: string): Promise<void> {
  try {
    await dbConnect();

    // Obtener el usuario para verificar su rol
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`❌ Usuario no encontrado: ${userEmail}`);
      return;
    }

    const userRole = user.role || 'normal';
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Construir query para obtener notificaciones relevantes
    let query: any = {
      isActive: true,
      // Solo notificaciones de los últimos 7 días o sin expiración
      $and: [
        {
          $or: [
            { createdAt: { $gte: sevenDaysAgo } }, // Creadas en los últimos 7 días
            { expiresAt: { $exists: false } }, // Sin fecha de expiración
            { expiresAt: null }, // Sin fecha de expiración
            { expiresAt: { $gt: now } } // No expiradas
          ]
        },
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: now } }
          ]
        }
      ]
    };

    // Filtrar por tipo de usuario objetivo
    if (userRole === 'admin') {
      query.targetUsers = { $in: ['todos', 'admin'] };
    } else if (userRole === 'suscriptor') {
      query.targetUsers = { $in: ['todos', 'suscriptores'] };
    } else {
      query.targetUsers = 'todos';
    }

    // Obtener notificaciones relevantes
    const notifications = await Notification.find(query).lean();

    console.log(`📬 Asignando ${notifications.length} notificaciones a usuario nuevo: ${userEmail} (rol: ${userRole})`);

    // Por ahora, las notificaciones se asignan automáticamente por el query de la API
    // En el futuro, aquí podríamos implementar un sistema de tracking más granular
    // como una colección UserNotifications para rastrear qué notificaciones ha visto cada usuario

    return;

  } catch (error) {
    console.error('❌ Error al asignar notificaciones a usuario nuevo:', error);
  }
}

/**
 * Limpia notificaciones expiradas de la vista del usuario (pero las mantiene en la BD)
 * Esta función se puede llamar periódicamente o en cada login
 */
export async function cleanupExpiredUserNotifications(): Promise<void> {
  try {
    await dbConnect();

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Contar notificaciones que ya no son visibles para usuarios normales
    const expiredCount = await Notification.countDocuments({
      $and: [
        { createdAt: { $lt: sevenDaysAgo } }, // Más de 7 días
        {
          $or: [
            { expiresAt: { $lt: now } }, // Expiradas
            { isActive: false } // Desactivadas
          ]
        }
      ]
    });

    console.log(`🧹 ${expiredCount} notificaciones ya no son visibles para usuarios normales (se mantienen en BD para admins)`);

  } catch (error) {
    console.error('❌ Error al limpiar notificaciones expiradas:', error);
  }
}

/**
 * Obtiene estadísticas de notificaciones para el panel de administrador
 */
export async function getNotificationStats() {
  try {
    await dbConnect();

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await Promise.all([
      // Total de notificaciones
      Notification.countDocuments({}),
      // Notificaciones activas
      Notification.countDocuments({ isActive: true }),
      // Notificaciones creadas en los últimos 7 días
      Notification.countDocuments({ 
        createdAt: { $gte: sevenDaysAgo } 
      }),
      // Notificaciones por tipo
      Notification.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      // Notificaciones por prioridad
      Notification.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    return {
      total: stats[0],
      active: stats[1],
      recent: stats[2],
      byType: stats[3],
      byPriority: stats[4]
    };

  } catch (error) {
    console.error('❌ Error al obtener estadísticas de notificaciones:', error);
    return null;
  }
} 