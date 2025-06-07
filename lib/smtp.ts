import nodemailer from 'nodemailer';

// Configuración del transportador SMTP
export const createSMTPTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com', // Para Gmail
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER, // Tu email de Gmail
      pass: process.env.SMTP_PASSWORD, // Tu password de aplicación de Gmail
    },
  });
};

// Función para enviar email individual
export async function sendEmail({
  to,
  subject,
  html,
  from
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const transporter = createSMTPTransporter();
  
  const mailOptions = {
    from: from || process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    html,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente a:', to);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email a:', to, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Función para envío masivo de emails
export async function sendBulkEmails({
  recipients,
  subject,
  html,
  from
}: {
  recipients: string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  };

  console.log(`📧 Iniciando envío masivo a ${recipients.length} destinatarios...`);

  // Enviar emails en lotes para evitar sobrecargar el servidor SMTP
  const batchSize = 5;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (email) => {
      const result = await sendEmail({ to: email, subject, html, from });
      
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`${email}: ${result.error || 'Error desconocido'}`);
      }
      
      return result;
    });

    // Esperar que se complete el lote actual
    await Promise.all(batchPromises);
    
    // Pausa pequeña entre lotes para no sobrecargar el servidor SMTP
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`📊 Envío masivo completado: ${results.sent} enviados, ${results.failed} fallidos`);
  
  return results;
}

// Plantilla HTML por defecto para emails
export function createEmailTemplate({
  title,
  content,
  buttonText,
  buttonUrl
}: {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
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
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #3b82f6;
                margin: 0;
                font-size: 28px;
            }
            .content {
                line-height: 1.8;
                font-size: 16px;
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Nahuel Lozano</h1>
                <p>Trading & Investment Platform</p>
            </div>
            
            <div class="content">
                <h2>${title}</h2>
                <div>${content}</div>
                
                ${buttonText && buttonUrl ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${buttonUrl}" class="button">${buttonText}</a>
                    </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p>Este email fue enviado desde la plataforma de Nahuel Lozano</p>
                <p>Si tienes preguntas, contáctanos en: ${process.env.ADMIN_EMAIL || 'info@lozanonahuel.com'}</p>
            </div>
        </div>
    </body>
    </html>
  `;
} 