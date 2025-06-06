import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
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

    const { id } = req.query;
    const { isActive } = req.body;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID de notificación inválido' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'El estado isActive debe ser un booleano' });
    }

    // Verificar que la notificación existe
    const existingNotification = await Notification.findById(id);
    if (!existingNotification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Actualizar el estado activo/inactivo
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      {
        isActive,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'No se pudo actualizar el estado de la notificación' });
    }

    console.log(`🔄 Estado de notificación cambiado por ${session.user.email}:`, {
      id: updatedNotification._id,
      title: updatedNotification.title,
      newStatus: isActive ? 'Activada' : 'Desactivada'
    });

    return res.status(200).json({
      message: `Notificación ${isActive ? 'activada' : 'desactivada'} exitosamente`,
      notification: {
        _id: updatedNotification._id,
        title: updatedNotification.title,
        message: updatedNotification.message,
        type: updatedNotification.type,
        priority: updatedNotification.priority,
        targetUsers: updatedNotification.targetUsers,
        isActive: updatedNotification.isActive,
        createdBy: updatedNotification.createdBy,
        createdAt: updatedNotification.createdAt,
        expiresAt: updatedNotification.expiresAt,
        icon: updatedNotification.icon,
        actionUrl: updatedNotification.actionUrl,
        actionText: updatedNotification.actionText
      }
    });

  } catch (error) {
    console.error('❌ Error al cambiar estado de notificación:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 