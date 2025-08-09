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
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    // Obtener el usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('🗑️ [NOTIFICATIONS] Eliminando notificaciones leídas para usuario:', user.email);

    // Eliminar todas las notificaciones leídas del usuario
    const deleteResult = await Notification.deleteMany({
      recipients: user._id,
      'readBy.user': user._id,
      'readBy.readAt': { $exists: true }
    });

    console.log('🗑️ [NOTIFICATIONS] Notificaciones eliminadas:', deleteResult.deletedCount);

    return res.status(200).json({
      success: true,
      message: 'Notificaciones leídas eliminadas correctamente',
      deletedCount: deleteResult.deletedCount
    });

  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Error al eliminar notificaciones leídas:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 