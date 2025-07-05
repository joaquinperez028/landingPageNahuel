import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail, createEmailTemplate } from '@/lib/emailService';

interface ContactFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  mensaje: string;
  servicio?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { nombre, apellido, email, telefono, mensaje, servicio }: ContactFormData = req.body;

      // Validación básica
      if (!nombre || !apellido || !email || !mensaje) {
        return res.status(400).json({ 
          success: false, 
          message: 'Todos los campos requeridos deben ser completados' 
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'El formato del email no es válido' 
        });
      }

      console.log('📧 Procesando mensaje de contacto de:', email);

      // Crear email para el admin con la nueva plantilla
      const adminEmailContent = `
        Se ha recibido un nuevo mensaje de contacto a través del formulario web.
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">📋 Información del Contacto:</h3>
          <p style="margin: 8px 0;"><strong>👤 Nombre:</strong> ${nombre} ${apellido}</p>
          <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${email}</p>
          ${telefono ? `<p style="margin: 8px 0;"><strong>📱 Teléfono:</strong> ${telefono}</p>` : ''}
          ${servicio ? `<p style="margin: 8px 0;"><strong>🔧 Servicio de Interés:</strong> ${servicio}</p>` : ''}
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88; margin: 20px 0;">
          <h3 style="color: #1a1a1a; margin-top: 0;">💬 Mensaje:</h3>
          <p style="color: #333; line-height: 1.6; margin: 0; font-style: italic;">
            "${mensaje}"
          </p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">📋 Próximos Pasos:</h3>
          <ul style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Revisar el mensaje y evaluar el tipo de consulta</li>
            <li>Responder al email del cliente en un plazo de 24 horas</li>
            <li>Si es necesario, programar una llamada o reunión</li>
            <li>Registrar el seguimiento en el CRM</li>
          </ul>
        </div>
      `;

      const adminHtml = createEmailTemplate({
        title: '📧 Nuevo Mensaje de Contacto',
        content: adminEmailContent,
        buttonText: 'Responder al Cliente',
        buttonUrl: `mailto:${email}?subject=Re: Consulta desde LozanoNahuel.com&body=Hola ${nombre},%0A%0AGracias por tu mensaje.%0A%0A`
      });

      // Crear email de confirmación para el usuario
      const userEmailContent = `
        Hola <strong>${nombre}</strong>,
        
        ¡Gracias por contactarnos! Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad.
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">📋 Resumen de tu Consulta:</h3>
          <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${email}</p>
          ${servicio ? `<p style="margin: 8px 0;"><strong>🔧 Servicio:</strong> ${servicio}</p>` : ''}
          <p style="margin: 8px 0;"><strong>💬 Mensaje:</strong> "${mensaje.substring(0, 100)}${mensaje.length > 100 ? '...' : ''}"</p>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88; margin: 20px 0;">
          <h3 style="color: #1a1a1a; margin-top: 0;">⏰ Qué Esperar:</h3>
          <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Responderemos tu consulta en un plazo máximo de 24 horas</li>
            <li>Recibirás información detallada sobre nuestros servicios</li>
            <li>Si es necesario, programaremos una llamada gratuita</li>
            <li>Te mantendremos informado sobre nuevas oportunidades</li>
          </ul>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3 style="color: #1e3a8a; margin-top: 0;">📚 Mientras Esperas:</h3>
          <ul style="color: #1e3a8a; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Explora nuestras alertas de trading gratuitas</li>
            <li>Revisa nuestros recursos educativos</li>
            <li>Síguenos en redes sociales para tips diarios</li>
            <li>Únete a nuestra newsletter</li>
          </ul>
        </div>
      `;

      const userHtml = createEmailTemplate({
        title: '✅ Mensaje Recibido',
        content: userEmailContent,
        buttonText: 'Explorar Plataforma',
        buttonUrl: process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'
      });

      // Obtener email del admin
      const adminEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'admin@lozanonahuel.com';

      // Enviar emails usando el nuevo sistema
      const [adminResult, userResult] = await Promise.allSettled([
        sendEmail({
          to: adminEmail,
          subject: `🔔 Nuevo Contacto: ${nombre} ${apellido} - ${servicio || 'Consulta General'}`,
          html: adminHtml
        }),
        sendEmail({
          to: email,
          subject: '✅ Hemos recibido tu mensaje - Nahuel Lozano Trading',
          html: userHtml
        })
      ]);

      // Verificar resultados
      const adminSent = adminResult.status === 'fulfilled' && adminResult.value;
      const userSent = userResult.status === 'fulfilled' && userResult.value;

      if (adminSent && userSent) {
        console.log('✅ Emails de contacto enviados exitosamente');
        return res.status(200).json({
          success: true,
          message: 'Mensaje enviado exitosamente. Te responderemos a la brevedad.'
        });
      } else {
        console.log('⚠️ Algunos emails no se pudieron enviar:', {
          admin: adminSent,
          user: userSent
        });
        return res.status(200).json({
          success: true,
          message: 'Mensaje recibido. Te responderemos a la brevedad.',
          warning: 'Algunos emails de confirmación pueden estar en proceso'
        });
      }

    } catch (error) {
      console.error('❌ Error en el formulario de contacto:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor. Por favor intenta nuevamente.'
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }
} 