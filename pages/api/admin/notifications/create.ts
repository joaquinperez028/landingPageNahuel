import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Tipo de notificación inválido' });
    }

    const validPriorities = ['alta', 'media', 'baja'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Prioridad inválida' });
    }

    const validTargets = ['todos', 'suscriptores', 'admin'];
    if (!validTargets.includes(targetUsers)) {
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

    // Crear la notificación
    const newNotification = new Notification({
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      targetUsers,
      icon: icon || '📢',
      actionUrl: actionUrl || null,
      actionText: actionText || null,
      expiresAt: expirationDate,
      isActive: true,
      createdBy: session.user.email
    });

    const savedNotification = await newNotification.save();

    console.log(`✅ Nueva notificación creada por ${session.user.email}:`, {
      id: savedNotification._id,
      title,
      type,
      targetUsers
    });

    return res.status(201).json({
      message: 'Notificación creada exitosamente',
      notification: {
        _id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: savedNotification.type,
        priority: savedNotification.priority,
        targetUsers: savedNotification.targetUsers,
        isActive: savedNotification.isActive,
        createdBy: savedNotification.createdBy,
        createdAt: savedNotification.createdAt,
        expiresAt: savedNotification.expiresAt,
        icon: savedNotification.icon,
        actionUrl: savedNotification.actionUrl,
        actionText: savedNotification.actionText
      }
    });

  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 