import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Conectar a la base de datos con timeout
    const connection = await dbConnect();
    if (!connection) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Verificar que el usuario sea administrador
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    // Obtener estadísticas básicas de usuarios de forma segura
    let finalTotalUsers = 0;
    let finalUsersByRole: any[] = [];
    let finalRecentUsers: any[] = [];

    try {
      finalTotalUsers = await User.countDocuments();
    } catch (error) {
      console.error('Error obteniendo total de usuarios:', error);
    }

    try {
      finalUsersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);
    } catch (error) {
      console.error('Error obteniendo usuarios por rol:', error);
    }

    try {
      finalRecentUsers = await User.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');
    } catch (error) {
      console.error('Error obteniendo usuarios recientes:', error);
    }

    // Procesar usuarios por rol
    const roleStats = {
      admin: 0,
      suscriptor: 0,
      normal: 0
    };

    finalUsersByRole.forEach((role: any) => {
      if (role._id && roleStats.hasOwnProperty(role._id)) {
        roleStats[role._id as keyof typeof roleStats] = role.count;
      }
    });

    // Generar actividad reciente
    const recentActivity = [
      {
        description: 'Sistema iniciado correctamente',
        time: 'Hace unos minutos',
        type: 'system'
      },
      {
        description: 'Dashboard cargado',
        time: 'Ahora',
        type: 'dashboard'
      }
    ];

    // Agregar actividad de usuarios recientes si hay datos
    finalRecentUsers.forEach((recentUser: any) => {
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
      totalUsers: finalTotalUsers,
      adminUsers: roleStats.admin,
      suscriptorUsers: roleStats.suscriptor,
      normalUsers: roleStats.normal,
      totalNotifications: 0, // Simplificado por ahora
      activeNotifications: 0, // Simplificado por ahora
      recentActivity: limitedActivity,
      
      // Estadísticas adicionales
      userGrowth: {
        thisWeek: finalRecentUsers.length,
        lastWeek: 0
      },
      
      // Métricas simplificadas
      notificationMetrics: {
        active: 0,
        inactive: 0,
        recentlyCreated: 0
      }
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('❌ Error al obtener estadísticas del dashboard:', error);
    
    // Retornar estadísticas básicas en caso de error
    return res.status(200).json({
      totalUsers: 0,
      adminUsers: 0,
      suscriptorUsers: 0,
      normalUsers: 0,
      totalNotifications: 0,
      activeNotifications: 0,
      recentActivity: [
        {
          description: 'Error al cargar estadísticas, modo básico activado',
          time: 'Ahora',
          type: 'error'
        }
      ],
      userGrowth: { thisWeek: 0, lastWeek: 0 },
      notificationMetrics: { active: 0, inactive: 0, recentlyCreated: 0 }
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