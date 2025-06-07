import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { 
  sendEmail, 
  createEmailTemplate, 
  createWelcomeEmailTemplate, 
  createAlertEmailTemplate,
  createPromotionalEmailTemplate 
} from '@/lib/smtp';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para envío de notificaciones por email
 * POST: Enviar notificación por email a usuario específico
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📧 [API] Send Notification - método:', req.method);
  
  await connectDB();

  // Verificar autenticación básica
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId, type, title, message, actionUrl, actionText, urgency, offer, expiryDate } = req.body;

    // Validar datos de entrada
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: userId, type, title, message' 
      });
    }

    // Obtener información del usuario destinatario
    const targetUser = await User.findById(userId).select('email name');
    if (!targetUser || !targetUser.email) {
      return res.status(404).json({
        error: 'Usuario no encontrado o sin email válido'
      });
    }

    console.log(`📧 Enviando notificación a: ${targetUser.email}`);

    // Crear HTML del email según el tipo de notificación
    let emailHTML = '';
    let subject = '';

    switch (type) {
      case 'welcome':
        subject = `¡Bienvenido a la plataforma, ${targetUser.name}!`;
        emailHTML = createWelcomeEmailTemplate({
          userName: targetUser.name,
          content: message,
          buttonText: actionText || 'Comenzar Ahora',
          buttonUrl: actionUrl || 'https://lozanonahuel.vercel.app/perfil'
        });
        break;
        
      case 'alert':
      case 'trader-call':
      case 'smart-money':
      case 'cash-flow':
        subject = `🚨 ${title}`;
        emailHTML = createAlertEmailTemplate({
          alertType: type === 'alert' ? 'Alerta General' : type.replace('-', ' ').toUpperCase(),
          title: title,
          content: message,
          urgency: urgency || 'medium',
          buttonText: actionText || 'Ver Alerta',
          buttonUrl: actionUrl || 'https://lozanonahuel.vercel.app/alertas'
        });
        break;
        
      case 'subscription':
      case 'promotional':
      case 'offer':
        subject = `📈 ${title}`;
        emailHTML = createPromotionalEmailTemplate({
          title: title,
          content: message,
          offer: offer,
          buttonText: actionText || 'Ver Suscripción',
          buttonUrl: actionUrl || 'https://lozanonahuel.vercel.app/perfil',
          expiryDate: expiryDate
        });
        break;
        
      case 'general':
      default:
        subject = title;
        emailHTML = createEmailTemplate({
          title: title,
          content: message,
          buttonText: actionText,
          buttonUrl: actionUrl
        });
        break;
    }

    // Enviar email
    const result = await sendEmail({
      to: targetUser.email,
      subject,
      html: emailHTML,
      from: process.env.ADMIN_EMAIL
    });

    if (result.success) {
      console.log(`✅ Notificación enviada exitosamente a ${targetUser.email}`);
      
      return res.status(200).json({
        success: true,
        message: 'Notificación enviada exitosamente',
        messageId: result.messageId,
        recipient: targetUser.email
      });
    } else {
      console.error(`❌ Error al enviar notificación a ${targetUser.email}:`, result.error);
      
      return res.status(500).json({
        success: false,
        error: 'Error al enviar notificación',
        details: result.error
      });
    }

  } catch (error) {
    console.error('💥 Error en envío de notificación:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 