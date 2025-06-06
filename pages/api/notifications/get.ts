import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
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

    // Conectar a la base de datos
    await dbConnect();

    // Obtener información del usuario para determinar su rol
    const user = await User.findOne({ email: session.user.email });
    const userRole = user?.role || 'normal';

    const { limit = '5', page = '1', search } = req.query;
    const limitNum = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * limitNum;

    // Construir query basado en el rol del usuario
    let query: any = {
      isActive: true
    };

    // Para usuarios normales: filtrar por fecha de creación (7 días) y expiración
    if (userRole !== 'admin') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      query = {
        ...query,
        // Solo notificaciones de los últimos 7 días o que aún no han expirado
        $and: [
          {
            $or: [
              { createdAt: { $gte: sevenDaysAgo } }, // Creadas en los últimos 7 días
              { expiresAt: { $exists: false } }, // Sin fecha de expiración
              { expiresAt: null }, // Sin fecha de expiración
              { expiresAt: { $gt: new Date() } } // No expiradas
            ]
          },
          {
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: new Date() } }
            ]
          }
        ]
      };
    } else {
      // Para administradores: mostrar todas las notificaciones sin restricción de fecha
      query = {
        ...query,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      };
    }

    // Filtrar por tipo de usuario
    if (userRole === 'admin') {
      query.targetUsers = { $in: ['todos', 'admin'] };
    } else if (userRole === 'suscriptor') {
      query.targetUsers = { $in: ['todos', 'suscriptores'] };
    } else {
      query.targetUsers = 'todos';
    }

    // Agregar búsqueda si se proporciona
    if (search && typeof search === 'string') {
      query = {
        ...query,
        $and: [
          ...(query.$and || []),
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { message: { $regex: search, $options: 'i' } }
            ]
          }
        ]
      };
    }

    // Obtener notificaciones
    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 }) // Prioridad alta primero, luego por fecha
      .limit(limitNum)
      .skip(skip)
      .lean();

    // Contar total para paginación
    const total = await Notification.countDocuments(query);

    // Formatear las notificaciones
    const formattedNotifications = notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      icon: notification.icon,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      createdAt: notification.createdAt,
      expiresAt: notification.expiresAt,
      // Calcular tiempo relativo
      timeAgo: getTimeAgo(notification.createdAt),
      // Información adicional para administradores
      ...(userRole === 'admin' && {
        targetUsers: notification.targetUsers,
        isActive: notification.isActive,
        createdBy: notification.createdBy
      })
    }));

    return res.status(200).json({
      notifications: formattedNotifications,
      pagination: {
        current: parseInt(page as string),
        total: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
        totalItems: total
      },
      unreadCount: formattedNotifications.length, // Por ahora todas son "no leídas"
      userRole // Devolver el rol para que el frontend sepa si es admin
    });

  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
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