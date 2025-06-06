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

    // Verificar que el usuario sea administrador
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const { limit = '50', page = '1', type, status } = req.query;
    const limitNum = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * limitNum;

    // Construir query para administradores (sin restricciones de fecha)
    let query: any = {};

    // Filtrar por tipo si se especifica
    if (type && type !== 'todos') {
      query.type = type;
    }

    // Filtrar por estado si se especifica
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Obtener todas las notificaciones (sin filtro de fecha para admin)
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Más recientes primero
      .limit(limitNum)
      .skip(skip)
      .lean();

    // Contar total para paginación
    const total = await Notification.countDocuments(query);

    // Formatear las notificaciones
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      targetUsers: notification.targetUsers,
      isActive: notification.isActive,
      createdBy: notification.createdBy,
      createdAt: notification.createdAt,
      expiresAt: notification.expiresAt,
      icon: notification.icon,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText
    }));

    return res.status(200).json({
      notifications: formattedNotifications,
      pagination: {
        current: parseInt(page as string),
        total: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener notificaciones admin:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 