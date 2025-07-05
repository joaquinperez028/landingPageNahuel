import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { sendBulkEmails, createEmailTemplate, createPromotionalEmailTemplate } from '@/lib/emailService';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

/**
 * API para envío masivo de emails
 * POST: Enviar email a grupo de usuarios seleccionado
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📧 [API] Bulk Email - método:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Conectar a la base de datos
    await dbConnect();

    // Verificar que el usuario sea admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    const { 
      recipients, 
      recipientType, 
      subject, 
      message, 
      emailType = 'general',
      offer,
      expiryDate,
      buttonText,
      buttonUrl
    } = req.body;

    // Validaciones
    if (!subject || !message) {
      return res.status(400).json({ error: 'Asunto y mensaje son requeridos' });
    }

    let targetEmails: string[] = [];

    // Determinar destinatarios
    if (recipientType === 'all') {
      const allUsers = await User.find({}, 'email');
      targetEmails = allUsers.map(user => user.email);
    } else if (recipientType === 'custom' && recipients) {
      // Validar emails individuales
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      targetEmails = recipients.filter((email: string) => emailRegex.test(email));
    } else if (recipientType === 'subscribers') {
      // Solo usuarios suscriptores
      const subscribers = await User.find({ role: 'suscriptor' }, 'email');
      targetEmails = subscribers.map(user => user.email);
    } else if (recipientType === 'admins') {
      // Solo administradores
      const admins = await User.find({ role: 'admin' }, 'email');
      targetEmails = admins.map(user => user.email);
    }

    if (targetEmails.length === 0) {
      return res.status(400).json({ error: 'No se encontraron destinatarios válidos' });
    }

    console.log(`📧 Preparando envío masivo a ${targetEmails.length} destinatarios`);

    // Crear HTML del email basado en el tipo
    let emailHtml: string;
    
    switch (emailType) {
      case 'promotional':
        emailHtml = createPromotionalEmailTemplate({
          title: subject,
          content: message,
          offer,
          expiryDate,
          buttonText,
          buttonUrl
        });
        break;
      
      case 'alert':
        emailHtml = createEmailTemplate({
          title: `🚨 ${subject}`,
          content: `
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">⚠️ Alerta Importante</h3>
              <p style="margin: 0; color: #92400e;">
                ${message}
              </p>
            </div>
          `,
          buttonText,
          buttonUrl
        });
        break;

      case 'newsletter':
        emailHtml = createEmailTemplate({
          title: `📰 ${subject}`,
          content: `
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <h3 style="color: #1e3a8a; margin-top: 0;">📧 Newsletter</h3>
              <div style="color: #1e3a8a;">
                ${message.split('\n').map((paragraph: string) => 
                  paragraph.trim() ? `<p style="margin: 0 0 12px 0;">${paragraph}</p>` : ''
                ).join('')}
              </div>
            </div>
          `,
          buttonText,
          buttonUrl
        });
        break;

      default: // general
        emailHtml = createEmailTemplate({
          title: subject,
          content: message,
          buttonText,
          buttonUrl
        });
    }

    // Enviar emails masivos
    const results = await sendBulkEmails({
      recipients: targetEmails,
      subject,
      html: emailHtml
    });

    console.log(`📊 Envío masivo completado: ${results.sent} enviados, ${results.failed} fallidos`);

    return res.status(200).json({
      success: true,
      message: `Emails enviados exitosamente a ${results.sent} destinatarios`,
      results: {
        sent: results.sent,
        failed: results.failed,
        total: targetEmails.length,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('❌ Error en envío masivo:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 