import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { z } from 'zod';
import nodemailer from 'nodemailer';

// Schema de validación para enviar link de reunión
const sendMeetingLinkSchema = z.object({
  sessionId: z.string().min(1, 'ID de sesión requerido'),
  subject: z.string().min(1, 'Asunto requerido'),
  meetingLink: z.string().url('Link de reunión debe ser una URL válida'),
  customMessage: z.string().optional()
});

/**
 * API para enviar links de reunión por email
 * POST: Envía email con link de reunión y actualiza la reserva
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar permisos de admin
    const adminCheck = await verifyAdminAccess({ req, res } as any);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await dbConnect();

    // Validar datos de entrada
    const validationResult = sendMeetingLinkSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.errors 
      });
    }

    const { sessionId, subject, meetingLink, customMessage } = validationResult.data;

    console.log('📧 Enviando link de reunión para sesión:', sessionId);

    // Buscar la reserva SIN populate (usar datos directos del booking)
    const booking = await Booking.findById(sessionId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    if (!booking.userEmail || !booking.userName) {
      return res.status(400).json({ error: 'Información del usuario incompleta en la reserva' });
    }

    console.log('👤 Datos del usuario:', {
      email: booking.userEmail,
      name: booking.userName
    });

    // Verificar que tenemos las variables de entorno necesarias
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD; // Cambiado de SMTP_PASS a SMTP_PASSWORD
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');

    if (!smtpUser || !smtpPass) {
      console.error('❌ Variables de SMTP no configuradas');
      console.error('SMTP_USER:', !!smtpUser);
      console.error('SMTP_PASSWORD:', !!smtpPass);
      return res.status(500).json({ error: 'Configuración de email no disponible' });
    }

    console.log('📧 Configuración SMTP:', {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      hasPassword: !!smtpPass
    });

    // Configurar el transportador de email
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true para puerto 465, false para otros puertos
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false // Para evitar problemas con certificados en desarrollo
      }
    });

    // Preparar información de la sesión
    const sessionDate = new Date(booking.startDate);
    const sessionInfo = {
      serviceName: getServiceDisplayName(booking.serviceType),
      serviceType: booking.type === 'advisory' ? 'Asesoría' : 'Entrenamiento',
      date: sessionDate.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: sessionDate.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: booking.duration || 60
    };

    // Crear el contenido del email
    const emailContent = createEmailTemplate({
      userName: booking.userName,
      sessionInfo,
      meetingLink,
      customMessage: customMessage || ''
    });

    // Enviar el email
    const mailOptions = {
      from: {
        name: 'Nahuel Lozano',
        address: smtpUser
      },
      to: booking.userEmail,
      subject: subject,
      html: emailContent,
      text: createTextContent({
        userName: booking.userName,
        sessionInfo,
        meetingLink,
        customMessage: customMessage || ''
      })
    };

    console.log('📤 Enviando email a:', booking.userEmail);
    
    await transporter.sendMail(mailOptions);

    // Actualizar la reserva con el link de reunión
    booking.meetingLink = meetingLink;
    booking.notes = (booking.notes || '') + `\n[${new Date().toISOString()}] Link de reunión enviado por admin`;
    await booking.save();

    console.log('✅ Email enviado exitosamente y reserva actualizada');

    return res.status(200).json({ 
      success: true,
      message: 'Link de reunión enviado exitosamente',
      sentTo: booking.userEmail,
      sessionId: booking._id
    });

  } catch (error) {
    console.error('❌ Error al enviar link de reunión:', error);
    
    // Error más específico para problemas de email
    if (error instanceof Error && error.message.includes('SMTP')) {
      return res.status(500).json({ 
        error: 'Error al enviar email. Verifica la configuración SMTP.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    return res.status(500).json({ 
      error: 'Error al enviar link de reunión',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

/**
 * Función para obtener el nombre legible del servicio
 */
function getServiceDisplayName(serviceType: string): string {
  switch (serviceType) {
    case 'ConsultorioFinanciero':
      return 'Consultorio Financiero';
    case 'CuentaAsesorada':
      return 'Cuenta Asesorada';
    case 'TradingFundamentals':
      return 'Trading Fundamentals';
    case 'DowJones':
      return 'Dow Jones - Estrategias Avanzadas';
    default:
      return serviceType || 'Servicio';
  }
}

/**
 * Función para crear el template HTML del email
 */
function createEmailTemplate({ userName, sessionInfo, meetingLink, customMessage }: {
  userName: string;
  sessionInfo: any;
  meetingLink: string;
  customMessage: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Link de Reunión - ${sessionInfo.serviceName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #3b82f6;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .session-info {
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .session-info h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
        }
        .session-detail {
          margin: 8px 0;
          display: flex;
          align-items: center;
        }
        .session-detail strong {
          min-width: 100px;
          color: #374151;
        }
        .meeting-link {
          background: #10b981;
          color: white;
          padding: 15px 25px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          transition: background 0.3s;
        }
        .meeting-link:hover {
          background: #059669;
          color: white;
        }
        .custom-message {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .instructions {
          background: #e0f2fe;
          border-left: 4px solid #0284c7;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .instructions h4 {
          margin: 0 0 10px 0;
          color: #0369a1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Nahuel Lozano</div>
          <p>Link de Reunión</p>
        </div>

        <h2>Hola ${userName},</h2>

        ${customMessage ? `
          <div class="custom-message">
            ${customMessage.replace(/\n/g, '<br>')}
          </div>
        ` : ''}

        <p>Te envío el link para nuestra ${sessionInfo.serviceType.toLowerCase()} programada:</p>

        <div class="session-info">
          <h3>📅 Detalles de la Sesión</h3>
          <div class="session-detail">
            <strong>Servicio:</strong> ${sessionInfo.serviceName}
          </div>
          <div class="session-detail">
            <strong>Fecha:</strong> ${sessionInfo.date}
          </div>
          <div class="session-detail">
            <strong>Hora:</strong> ${sessionInfo.time}
          </div>
          <div class="session-detail">
            <strong>Duración:</strong> ${sessionInfo.duration} minutos
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${meetingLink}" class="meeting-link" target="_blank">
            🔗 UNIRSE A LA REUNIÓN
          </a>
        </div>

        <div class="instructions">
          <h4>📋 Instrucciones:</h4>
          <ul>
            <li>Haz clic en el link unos minutos antes de la hora programada</li>
            <li>Asegúrate de tener una conexión a internet estable</li>
            <li>Ten preparados tus materiales y preguntas</li>
            <li>Si tienes problemas técnicos, contáctame inmediatamente</li>
          </ul>
        </div>

        <p>Si necesitas reprogramar o tienes alguna consulta, no dudes en contactarme.</p>

        <p>¡Nos vemos pronto!</p>

        <p><strong>Nahuel Lozano</strong><br>
        Analista Financiero</p>

        <div class="footer">
          <p>Este email fue enviado desde el sistema de gestión de Nahuel Lozano</p>
          <p>Link de reunión: <a href="${meetingLink}" target="_blank">${meetingLink}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Función para crear el contenido de texto plano del email
 */
function createTextContent({ userName, sessionInfo, meetingLink, customMessage }: {
  userName: string;
  sessionInfo: any;
  meetingLink: string;
  customMessage: string;
}): string {
  return `
Hola ${userName},

${customMessage ? `${customMessage}\n\n` : ''}

Te envío el link para nuestra ${sessionInfo.serviceType.toLowerCase()} programada:

DETALLES DE LA SESIÓN:
- Servicio: ${sessionInfo.serviceName}
- Fecha: ${sessionInfo.date}
- Hora: ${sessionInfo.time}
- Duración: ${sessionInfo.duration} minutos

LINK DE REUNIÓN:
${meetingLink}

INSTRUCCIONES:
- Haz clic en el link unos minutos antes de la hora programada
- Asegúrate de tener una conexión a internet estable
- Ten preparados tus materiales y preguntas
- Si tienes problemas técnicos, contáctame inmediatamente

Si necesitas reprogramar o tienes alguna consulta, no dudes en contactarme.

¡Nos vemos pronto!

Nahuel Lozano
Analista Financiero

---
Este email fue enviado desde el sistema de gestión de Nahuel Lozano
  `;
} 