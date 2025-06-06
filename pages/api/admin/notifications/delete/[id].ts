import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID de notificación inválido' });
    }

    // Verificar que la notificación existe antes de eliminar
    const existingNotification = await Notification.findById(id);
    if (!existingNotification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    // Eliminar la notificación
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ message: 'No se pudo eliminar la notificación' });
    }

    console.log(`🗑️ Notificación eliminada por ${session.user.email}:`, {
      id: deletedNotification._id,
      title: deletedNotification.title,
      type: deletedNotification.type
    });

    return res.status(200).json({
      message: 'Notificación eliminada exitosamente',
      notification: {
        _id: deletedNotification._id,
        title: deletedNotification.title,
        type: deletedNotification.type
      }
    });

  } catch (error) {
    console.error('❌ Error al eliminar notificación:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 