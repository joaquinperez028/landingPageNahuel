import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Conectar a la base de datos
    await dbConnect();

    // Verificar que el usuario sea administrador
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    // Obtener estadísticas de usuarios
    const [
      totalUsers,
      usersByRole,
      totalNotifications,
      activeNotifications,
      recentUsers
    ] = await Promise.all([
      // Total de usuarios
      User.countDocuments(),
      
      // Usuarios por rol
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      
      // Total de notificaciones
      Notification.countDocuments(),
      
      // Notificaciones activas
      Notification.countDocuments({ isActive: true }),
      
      // Usuarios recientes (últimos 7 días)
      User.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt')
    ]);

    // Procesar usuarios por rol
    const roleStats = {
      admin: 0,
      suscriptor: 0,
      normal: 0
    };

    usersByRole.forEach(role => {
      roleStats[role._id as keyof typeof roleStats] = role.count;
    });

    // Generar actividad reciente simulada (puedes reemplazar con datos reales)
    const recentActivity = [
      {
        description: 'Nuevo usuario registrado',
        time: 'Hace 2 horas',
        type: 'user'
      },
      {
        description: 'Notificación creada',
        time: 'Hace 4 horas',
        type: 'notification'
      },
      {
        description: 'Usuario promovido a suscriptor',
        time: 'Hace 1 día',
        type: 'role_change'
      },
      {
        description: 'Exportación de datos realizada',
        time: 'Hace 2 días',
        type: 'export'
      }
    ];

    // Agregar actividad de usuarios recientes
    recentUsers.forEach(recentUser => {
      const timeAgo = getTimeAgo(recentUser.createdAt);
      recentActivity.unshift({
        description: `${recentUser.name} se registró como ${recentUser.role}`,
        time: timeAgo,
        type: 'user_registration'
      });
    });

    // Limitar actividad reciente a los últimos 10 elementos
    const limitedActivity = recentActivity.slice(0, 10);

    const stats = {
      totalUsers,
      adminUsers: roleStats.admin,
      suscriptorUsers: roleStats.suscriptor,
      normalUsers: roleStats.normal,
      totalNotifications,
      activeNotifications,
      recentActivity: limitedActivity,
      
      // Estadísticas adicionales
      userGrowth: {
        thisWeek: recentUsers.length,
        lastWeek: 0 // Aquí podrías calcular usuarios de la semana anterior
      },
      
      // Métricas de notificaciones
      notificationMetrics: {
        active: activeNotifications,
        inactive: totalNotifications - activeNotifications,
        recentlyCreated: 0 // Notificaciones creadas en la última semana
      }
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('❌ Error al obtener estadísticas del dashboard:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

// Función auxiliar para calcular tiempo relativo
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
  } else {
    return 'Hace un momento';
  }
} 