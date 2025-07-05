import nodemailer from 'nodemailer';

// Configuración del transportador de email
const createEmailTransporter = () => {
  // Verificar que las variables de entorno estén configuradas
  const requiredEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASS'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Variables de entorno faltantes para email: ${missingVars.join(', ')}`);
    console.warn('📧 Modo simulación activado - emails no se enviarán realmente');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Configuraciones adicionales para diferentes proveedores
      ...(process.env.SMTP_HOST?.includes('gmail') && {
        service: 'gmail',
      }),
      // Configuración de seguridad mejorada
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('📧 Transportador de email configurado correctamente');
    return transporter;
  } catch (error) {
    console.error('❌ Error configurando transportador de email:', error);
    return null;
  }
};

// Instancia global del transportador
let emailTransporter: any = null;

// Inicializar transportador
const initializeEmailService = () => {
  if (!emailTransporter) {
    emailTransporter = createEmailTransporter();
  }
  return emailTransporter;
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envía un email usando Nodemailer
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = initializeEmailService();
    
    // Si no hay transportador configurado, simular envío
    if (!transporter) {
      console.log('📧 SIMULACIÓN - Email que se enviaría:');
      console.log(`📧 Para: ${options.to}`);
      console.log(`📧 Asunto: ${options.subject}`);
      console.log(`📧 HTML: ${options.html.substring(0, 100)}...`);
      
      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    }

    // Configurar email
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Nahuel Lozano Trading',
        address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'noreply@lozanonahuel.com'
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Versión texto sin HTML
      // Headers adicionales
      headers: {
        'X-Mailer': 'Nahuel Lozano Trading Platform',
        'X-Priority': '1', // Alta prioridad para alertas
      }
    };

    // Enviar email
    console.log(`📧 Enviando email a: ${options.to}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email enviado exitosamente a ${options.to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return true;

  } catch (error) {
    console.error(`❌ Error enviando email a ${options.to}:`, error);
    
    // Log adicional para debugging
    if (error instanceof Error) {
      console.error(`❌ Error details: ${error.message}`);
      if (error.stack) {
        console.error(`❌ Stack trace: ${error.stack}`);
      }
    }
    
    return false;
  }
}

/**
 * Verifica la configuración del servicio de email
 */
export async function verifyEmailConfiguration(): Promise<boolean> {
  try {
    const transporter = initializeEmailService();
    
    if (!transporter) {
      console.log('📧 Configuración de email no disponible - usando modo simulación');
      return false;
    }

    console.log('🔍 Verificando configuración de email...');
    await transporter.verify();
    
    console.log('✅ Configuración de email verificada correctamente');
    return true;

  } catch (error) {
    console.error('❌ Error verificando configuración de email:', error);
    return false;
  }
}

/**
 * Obtiene información sobre el estado del servicio de email
 */
export function getEmailServiceStatus(): {
  configured: boolean;
  provider: string | null;
  fromAddress: string | null;
} {
  const configured = !!(
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS
  );

  return {
    configured,
    provider: process.env.SMTP_HOST || null,
    fromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || null
  };
}

/**
 * Plantilla base para emails de alertas
 */
export function generateAlertEmailTemplate(
  notification: any, 
  user: any
): string {
  const actionButton = notification.actionUrl ? 
    `<a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}${notification.actionUrl}" 
        style="display: inline-block; padding: 12px 24px; background: #00ff88; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,255,136,0.3);">
      ${notification.actionText || 'Ver Alerta'}
    </a>` : '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${notification.title}</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .header { padding: 20px !important; }
          .content { padding: 15px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
      <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 0;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${notification.icon} ${notification.title}
          </h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9; font-weight: 500;">
            Nueva Alerta de Trading Disponible
          </p>
        </div>
        
        <!-- Content -->
        <div class="content" style="padding: 30px; background-color: #ffffff;">
          
          <!-- Greeting -->
          <div style="margin-bottom: 25px;">
            <h2 style="margin: 0 0 10px; font-size: 20px; color: #1e293b; font-weight: 600;">
              ¡Hola ${user.name || user.email.split('@')[0]}! 👋
            </h2>
            <p style="margin: 0; font-size: 16px; color: #64748b;">
              Tienes una nueva alerta de trading disponible en tu cuenta.
            </p>
          </div>
          
          <!-- Alert Details -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #00ff88;">
            <h3 style="margin: 0 0 15px; font-size: 18px; color: #1e293b; font-weight: 600;">
              📊 Detalles de la Alerta
            </h3>
            <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
              ${notification.message}
            </p>
            
            ${notification.metadata ? `
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                  ${notification.metadata.alertSymbol ? `
                    <div style="text-align: center; min-width: 80px;">
                      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 5px;">Símbolo</div>
                      <div style="font-size: 16px; color: #1e293b; font-weight: 700;">${notification.metadata.alertSymbol}</div>
                    </div>
                  ` : ''}
                  ${notification.metadata.alertAction ? `
                    <div style="text-align: center; min-width: 80px;">
                      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 5px;">Acción</div>
                      <div style="font-size: 16px; color: ${notification.metadata.alertAction === 'BUY' ? '#22c55e' : '#ef4444'}; font-weight: 700;">${notification.metadata.alertAction}</div>
                    </div>
                  ` : ''}
                  ${notification.metadata.alertPrice ? `
                    <div style="text-align: center; min-width: 80px;">
                      <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 5px;">Precio</div>
                      <div style="font-size: 16px; color: #1e293b; font-weight: 700;">$${notification.metadata.alertPrice}</div>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            ${actionButton}
          </div>
          
          <!-- Additional Info -->
          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
              ⚡ <strong>Acción Requerida:</strong> Esta es una alerta de alta prioridad. Te recomendamos revisar los detalles completos en la plataforma lo antes posible.
            </p>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
          <div style="margin-bottom: 15px;">
            <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}" style="color: #3b82f6; text-decoration: none; font-weight: 600; font-size: 16px;">
              🌐 Visitar Plataforma
            </a>
          </div>
          
          <p style="margin: 0 0 10px; font-size: 14px; color: #64748b;">
            Este es un email automático de <strong>Nahuel Lozano Trading</strong>
          </p>
          
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Si no deseas recibir estas notificaciones, puedes 
            <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/perfil" style="color: #6b7280; text-decoration: underline;">
              configurar tus preferencias aquí
            </a>
          </p>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 11px; color: #9ca3af;">
              © ${new Date().getFullYear()} Nahuel Lozano Trading. Todos los derechos reservados.
            </p>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
} 