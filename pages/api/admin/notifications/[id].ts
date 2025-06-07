import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Conectar a la base de datos
    const connection = await dbConnect();
    if (!connection) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Verificar que el usuario sea administrador
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'ID de notificación inválido' 
      });
    }

    if (req.method === 'PATCH') {
      // Actualizar estado activo/inactivo
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ 
          success: false,
          message: 'El estado isActive debe ser un booleano' 
        });
      }

      try {
        const notification = await Notification.findByIdAndUpdate(
          id,
          { isActive },
          { new: true }
        );

        if (!notification) {
          return res.status(404).json({ 
            success: false,
            message: 'Notificación no encontrada' 
          });
        }

        return res.status(200).json({
          success: true,
          message: `Notificación ${isActive ? 'activada' : 'desactivada'} exitosamente`,
          notification
        });
        
      } catch (error) {
        console.error('Error al actualizar notificación:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor al actualizar la notificación'
        });
      }

    } else if (req.method === 'DELETE') {
      // Eliminar notificación
      try {
        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
          return res.status(404).json({ 
            success: false,
            message: 'Notificación no encontrada' 
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Notificación eliminada exitosamente'
        });
        
      } catch (error) {
        console.error('Error al eliminar notificación:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor al eliminar la notificación'
        });
      }

    } else {
      return res.status(405).json({ 
        success: false,
        message: 'Método no permitido' 
      });
    }

  } catch (error) {
    console.error('❌ Error en API de notificación individual:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 