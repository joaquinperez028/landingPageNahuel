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

    if (req.method === 'GET') {
      // Listar todas las notificaciones
      try {
        const notifications = await Notification.find({})
          .sort({ createdAt: -1 })
          .limit(50);

        return res.status(200).json({
          success: true,
          notifications: notifications || []
        });
      } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return res.status(200).json({
          success: true,
          notifications: []
        });
      }

    } else if (req.method === 'POST') {
      // Crear nueva notificación
      const {
        title,
        message,
        type = 'novedad',
        priority = 'media',
        targetUsers = 'todos',
        icon = '📢',
        actionUrl,
        actionText,
        expiresAt
      } = req.body;

      // Validaciones básicas
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'El título y mensaje son obligatorios'
        });
      }

      if (title.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'El título no puede exceder 100 caracteres'
        });
      }

      if (message.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'El mensaje no puede exceder 500 caracteres'
        });
      }

      try {
        const notificationData: any = {
          title: title.trim(),
          message: message.trim(),
          type,
          priority,
          targetUsers,
          icon,
          createdBy: session.user.email,
          isActive: true
        };

        // Agregar campos opcionales si existen
        if (actionUrl) {
          notificationData.actionUrl = actionUrl.trim();
        }
        if (actionText) {
          notificationData.actionText = actionText.trim();
        }
        if (expiresAt) {
          notificationData.expiresAt = new Date(expiresAt);
        }

        const notification = new Notification(notificationData);
        await notification.save();

        return res.status(201).json({
          success: true,
          message: 'Notificación creada exitosamente',
          notification
        });

      } catch (error) {
        console.error('Error al crear notificación:', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor al crear la notificación'
        });
      }

    } else {
      return res.status(405).json({ 
        success: false,
        message: 'Método no permitido' 
      });
    }

  } catch (error) {
    console.error('❌ Error en API de notificaciones:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 