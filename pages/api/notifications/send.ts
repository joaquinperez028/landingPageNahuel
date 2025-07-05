import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { sendEmail, createEmailTemplate } from '@/lib/emailService';
import { sendNotificationToSubscribers } from '@/lib/notificationUtils';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para envío de notificaciones por email
 * POST: Enviar notificación por email a usuario específico
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    await dbConnect();

    // Verificar que el usuario sea admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    const { 
      title, 
      message, 
      type = 'sistema', 
      priority = 'medium',
      targetUsers = 'all',
      sendEmail: shouldSendEmail = true,
      actionUrl,
      actionText
    } = req.body;

    // Validaciones
    if (!title || !message) {
      return res.status(400).json({ error: 'Título y mensaje son requeridos' });
    }

    console.log('📧 Creando notificación manual desde admin');

    // Crear la notificación usando el sistema existente
    const notification = {
      title,
      message,
      type,
      priority,
      icon: getIconForType(type),
      actionUrl,
      actionText,
      isAutomatic: false,
      metadata: {
        sentBy: session.user.email,
        manual: true
      }
    };

    // Enviar notificación usando el sistema existente
    const result = await sendNotificationToSubscribers(
      notification,
      type,
      shouldSendEmail
    );

    console.log(`✅ Notificación enviada: ${result.sent} usuarios notificados`);

    return res.status(200).json({
      success: true,
      message: `Notificación enviada exitosamente`,
      results: {
        sent: result.sent,
        failed: result.failed,
        emailsSent: result.emailsSent || 0,
        errors: result.errors || []
      }
    });

  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

/**
 * Obtiene el icono apropiado para el tipo de notificación
 */
function getIconForType(type: string): string {
  switch (type) {
    case 'alerta':
      return '🚨';
    case 'sistema':
      return '⚙️';
    case 'promocion':
      return '🎉';
    case 'actualizacion':
      return '🔄';
    case 'novedad':
      return '📢';
    default:
      return '📧';
  }
} 