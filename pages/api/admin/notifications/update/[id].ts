import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    // Verificar que la notificación existe
    const existingNotification = await Notification.findById(id);
    if (!existingNotification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    const {
      title,
      message,
      type,
      priority,
      targetUsers,
      icon,
      actionUrl,
      actionText,
      expiresAt
    } = req.body;

    // Validaciones
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'El mensaje es obligatorio' });
    }

    if (title.length > 100) {
      return res.status(400).json({ message: 'El título no puede superar los 100 caracteres' });
    }

    if (message.length > 500) {
      return res.status(400).json({ message: 'El mensaje no puede superar los 500 caracteres' });
    }

    // Validar tipos válidos
    const validTypes = ['novedad', 'actualizacion', 'sistema', 'promocion'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ message: 'Tipo de notificación inválido' });
    }

    const validPriorities = ['alta', 'media', 'baja'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Prioridad inválida' });
    }

    const validTargets = ['todos', 'suscriptores', 'admin'];
    if (targetUsers && !validTargets.includes(targetUsers)) {
      return res.status(400).json({ message: 'Destinatarios inválidos' });
    }

    // Validar URL de acción si se proporciona
    if (actionUrl && actionText) {
      try {
        new URL(actionUrl);
      } catch {
        return res.status(400).json({ message: 'URL de acción inválida' });
      }

      if (actionText.length > 50) {
        return res.status(400).json({ message: 'El texto del botón no puede superar los 50 caracteres' });
      }
    }

    // Validar fecha de expiración
    let expirationDate = null;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return res.status(400).json({ message: 'Fecha de expiración inválida' });
      }
      if (expirationDate <= new Date()) {
        return res.status(400).json({ message: 'La fecha de expiración debe ser futura' });
      }
    }

    // Actualizar la notificación
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        message: message.trim(),
        type: type || existingNotification.type,
        priority: priority || existingNotification.priority,
        targetUsers: targetUsers || existingNotification.targetUsers,
        icon: icon || existingNotification.icon,
        actionUrl: actionUrl || null,
        actionText: actionText || null,
        expiresAt: expirationDate,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'No se pudo actualizar la notificación' });
    }

    console.log(`✅ Notificación actualizada por ${session.user.email}:`, {
      id: updatedNotification._id,
      title: updatedNotification.title,
      type: updatedNotification.type
    });

    return res.status(200).json({
      message: 'Notificación actualizada exitosamente',
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
    console.error('❌ Error al actualizar notificación:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 