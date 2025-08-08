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
  from?: string;
}

/**
 * Envía un email individual con mejor manejo de errores
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  const { to, subject, html, from } = options;
  
  console.log(`📧 [EMAIL SERVICE] Enviando email a: ${to}`);
  console.log(`📧 [EMAIL SERVICE] Asunto: ${subject}`);
  
  // Verificar configuración
  const isConfigured = await verifyEmailConfiguration();
  
  if (!isConfigured) {
    console.log('⚠️ [EMAIL SERVICE] Modo simulación - email no se enviará realmente');
    console.log('📧 [EMAIL SERVICE] SIMULACIÓN - Email que se enviaría:');
    console.log('📧 [EMAIL SERVICE] Para:', to);
    console.log('📧 [EMAIL SERVICE] Asunto:', subject);
    console.log('📧 [EMAIL SERVICE] HTML preview:', html.substring(0, 200) + '...');
    
    // En modo simulación, simular éxito
    return;
  }
  
  try {
    console.log('✅ [EMAIL SERVICE] Configuración SMTP válida, enviando email real...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const mailOptions = {
      from: from || `${process.env.EMAIL_FROM_NAME || 'Nahuel Lozano'} <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };
    
    console.log('📧 [EMAIL SERVICE] Enviando con opciones:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: mailOptions.html.length
    });
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ [EMAIL SERVICE] Email enviado exitosamente:', {
      messageId: result.messageId,
      to: to
    });
    
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] Error enviando email:', error);
    console.error('❌ [EMAIL SERVICE] Stack trace:', error instanceof Error ? error.stack : 'No stack available');
    
    // Arrojar el error para que se maneje en sendBulkEmails
    throw error;
  }
}

/**
 * Envía emails masivos con mejor manejo de errores
 */
export async function sendBulkEmails(options: {
  recipients: string[];
  subject: string;
  html: string;
}): Promise<{ sent: number; failed: number; errors: string[] }> {
  const { recipients, subject, html } = options;
  
  console.log('📧 [EMAIL SERVICE] Iniciando envío masivo...');
  console.log('📧 [EMAIL SERVICE] Destinatarios:', recipients.length);
  console.log('📧 [EMAIL SERVICE] Asunto:', subject);
  console.log('📧 [EMAIL SERVICE] HTML generado:', html.length, 'caracteres');
  
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  
  console.log('🔍 [EMAIL SERVICE] Verificando configuración SMTP...');
  const isConfigured = await verifyEmailConfiguration();
  console.log('🔍 [EMAIL SERVICE] Configuración SMTP válida:', isConfigured);
  
  if (!isConfigured) {
    console.log('⚠️ [EMAIL SERVICE] Modo simulación activado - emails no se enviarán realmente');
    console.log('📧 [EMAIL SERVICE] SIMULACIÓN - Email que se enviaría:');
    console.log('📧 [EMAIL SERVICE] Para:', recipients.slice(0, 3).join(', '), recipients.length > 3 ? '...' : '');
    console.log('📧 [EMAIL SERVICE] Asunto:', subject);
    console.log('📧 [EMAIL SERVICE] HTML preview:', html.substring(0, 200) + '...');
    
    // En modo simulación, simular éxito
    return {
      sent: recipients.length,
      failed: 0,
      errors: [`Modo simulación: ${recipients.length} emails simulados exitosamente`]
    };
  }
  
  console.log('✅ [EMAIL SERVICE] Configuración SMTP válida, enviando emails reales...');
  
  // Procesar en lotes para evitar sobrecargar el servidor
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }
  
  console.log('📦 [EMAIL SERVICE] Procesando', batches.length, 'lotes de', batchSize, 'emails cada uno');
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`📦 [EMAIL SERVICE] Procesando lote ${batchIndex + 1}/${batches.length} (${batch.length} emails)`);
    
    const batchPromises = batch.map(async (email) => {
      try {
        console.log(` [EMAIL SERVICE] Enviando a: ${email}`);
        await sendEmail({
          to: email,
          subject,
          html
        });
        console.log(`✅ [EMAIL SERVICE] Enviado exitosamente a: ${email}`);
        sent++;
      } catch (error) {
        console.error(`❌ [EMAIL SERVICE] Error enviando a ${email}:`, error);
        failed++;
        errors.push(`${email}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    });
    
    await Promise.all(batchPromises);
    
    // Pequeña pausa entre lotes
    if (batchIndex < batches.length - 1) {
      console.log('⏰ [EMAIL SERVICE] Pausa de 1 segundo entre lotes...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('✅ [EMAIL SERVICE] Envío masivo completado');
  console.log('📊 [EMAIL SERVICE] Resultados finales:', { sent, failed, errorsCount: errors.length });
  
  return { sent, failed, errors };
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

// PLANTILLAS DE EMAIL CONSOLIDADAS

/**
 * Plantilla base para todos los emails
 */
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
}): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #2d3748;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            
            .header {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .logo-container {
                margin-bottom: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .logo {
                max-width: 120px;
                height: auto;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
                background: rgba(255, 255, 255, 0.1);
                padding: 8px;
                backdrop-filter: blur(10px);
            }
            
            .header h1 {
                color: #00ff88;
                margin: 0 0 8px 0;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: -0.025em;
                position: relative;
                z-index: 1;
            }
            
            .header .subtitle {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                font-weight: 500;
                margin: 0;
                position: relative;
                z-index: 1;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .content h2 {
                color: #1a202c;
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 20px 0;
                text-align: center;
            }
            
            .message-content {
                color: #4a5568;
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
            }
            
            .message-content p {
                margin: 0 0 16px 0;
            }
            
            .cta-section {
                text-align: center;
                margin: 30px 0;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
                color: #000;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 50px;
                font-weight: 700;
                font-size: 16px;
                letter-spacing: 0.025em;
                transition: all 0.3s ease;
                box-shadow: 0 8px 15px rgba(0, 255, 136, 0.3);
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 20px rgba(0, 255, 136, 0.4);
            }
            
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
                margin: 30px 0;
            }
            
            .footer {
                background: #f8fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
                color: #64748b;
                font-size: 14px;
                margin: 0 0 10px 0;
            }
            
            .social-links {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin: 20px 0;
            }
            
            .social-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                text-decoration: none;
                border-radius: 50%;
                font-size: 18px;
                transition: all 0.3s ease;
            }
            
            .social-link:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
            }
            
            .disclaimer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            
            .disclaimer p {
                font-size: 12px;
                color: #9ca3af;
                margin: 0 0 8px 0;
            }
            
            .disclaimer a {
                color: #3b82f6;
                text-decoration: none;
            }
            
            @media only screen and (max-width: 600px) {
                body {
                    padding: 10px;
                }
                
                .header {
                    padding: 30px 20px;
                }
                
                .logo {
                    max-width: 100px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .content h2 {
                    font-size: 22px;
                }
                
                .cta-button {
                    padding: 14px 28px;
                    font-size: 14px;
                }
                
                .social-links {
                    gap: 12px;
                }
                
                .social-link {
                    width: 44px;
                    height: 44px;
                    font-size: 16px;
                }
                
                .footer {
                    padding: 25px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo-container">
                    <img src="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/logos/LOGOTIPO NARANJA SIN FONDO.png" 
                         alt="Nahuel Lozano Trading" 
                         class="logo"
                         style="max-width: 120px; height: auto; border-radius: 12px; box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3); background: rgba(255, 255, 255, 0.1); padding: 8px; backdrop-filter: blur(10px);">
                </div>
                <h1>Nahuel Lozano</h1>
                <p class="subtitle">Trading & Investment Platform</p>
            </div>
            
            <div class="content">
                <h2>${title}</h2>
                <div class="message-content">
                    ${content.split('\n').map(paragraph => 
                        paragraph.trim() ? `<p>${paragraph}</p>` : ''
                    ).join('')}
                </div>
                
                ${buttonText && buttonUrl ? `
                    <div class="cta-section">
                        <a href="${buttonUrl}" class="cta-button">${buttonText}</a>
                    </div>
                ` : ''}
                
                <div class="divider"></div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #4a5568; font-size: 14px;">
                        <strong>💡 Consejo:</strong> Mantente actualizado con las últimas estrategias de trading y análisis de mercado visitando nuestra plataforma regularmente.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Este email fue enviado desde la plataforma de Nahuel Lozano</strong></p>
                <p>Tu fuente confiable para estrategias de trading e inversión</p>
                
                <div class="social-links">
                    <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}" class="social-link" title="Sitio Web">🌐</a>
                    <a href="mailto:${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'info@lozanonahuel.com'}" class="social-link" title="Email">📧</a>
                    <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/alertas" class="social-link" title="Alertas">📊</a>
                    <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/recursos" class="social-link" title="Recursos">📚</a>
                </div>
                
                <div class="disclaimer">
                    <p>Si tienes preguntas, contáctanos en: <a href="mailto:${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'info@lozanonahuel.com'}">${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'info@lozanonahuel.com'}</a></p>
                    <p>© ${new Date().getFullYear()} Nahuel Lozano Trading Platform. Todos los derechos reservados.</p>
                    <p>Este email fue enviado porque eres parte de nuestra comunidad de trading. Si no deseas recibir más emails, <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/perfil">puedes gestionar tus preferencias aquí</a>.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Plantilla específica para notificaciones de informes
 */
export function generateReportEmailTemplate(
  notification: any,
  user: any
): string {
  const actionButton = notification.actionUrl ? 
    `<a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}${notification.actionUrl}" 
        style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); color: #000; text-decoration: none; border-radius: 12px; font-weight: 700; margin-top: 25px; box-shadow: 0 4px 15px rgba(0,255,136,0.3); transition: all 0.3s ease;">
      ${notification.actionText || 'Leer Informe'}
    </a>` : '';

  const reportDetails = notification.metadata ? `
    <div style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid #00ff88;">
      <h3 style="margin: 0 0 15px; font-size: 16px; color: #1e293b; font-weight: 600;">
        📊 Detalles del Informe
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 15px;">
        ${notification.metadata.serviceType ? `
          <div style="flex: 1; min-width: 120px;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 5px;">Servicio</div>
            <div style="font-size: 16px; color: #1e293b; font-weight: 700; background: #00ff88; color: #000; padding: 4px 12px; border-radius: 20px; display: inline-block;">${notification.metadata.serviceType}</div>
          </div>
        ` : ''}
        ${notification.metadata.reportCategory ? `
          <div style="flex: 1; min-width: 120px;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 5px;">Categoría</div>
            <div style="font-size: 16px; color: #1e293b; font-weight: 700; text-transform: capitalize;">${notification.metadata.reportCategory.replace('-', ' ')}</div>
          </div>
        ` : ''}
        ${notification.metadata.reportType ? `
          <div style="flex: 1; min-width: 120px;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 5px;">Tipo</div>
            <div style="font-size: 16px; color: #1e293b; font-weight: 700; text-transform: capitalize;">${notification.metadata.reportType}</div>
          </div>
        ` : ''}
      </div>
    </div>
  ` : '';

  return createNotificationEmailTemplate({
    title: `${notification.icon} ${notification.title}`,
    content: `
      <!-- Logo principal centrado -->
      <div style="text-align: center; margin-bottom: 40px;">
        <img src="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/logos/logo%20notificaciones.png" 
             alt="Nahuel Lozano Trading" 
             style="width: 140px; height: auto; margin: 0 auto; display: block; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      </div>
      
      <!-- Badge de tipo de notificación -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
          📰 Nuevo Contenido Disponible
        </div>
        <h2 style="margin: 0 0 10px; font-size: 22px; color: #1e293b; font-weight: 700;">
          ¡Hola ${user.name || user.email.split('@')[0]}! 👋
        </h2>
        <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.5;">
          Tienes un nuevo informe de análisis disponible en tu cuenta.
        </p>
      </div>
      
      <!-- Contenido principal del informe -->
      <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 2px solid #e2e8f0; border-radius: 16px; padding: 30px; margin: 25px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
          <h3 style="margin: 0 0 10px; font-size: 20px; color: #1e293b; font-weight: 700;">
            ${notification.metadata?.reportTitle || 'Nuevo Informe'}
          </h3>
        </div>
        
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6; text-align: center;">
            ${notification.message}
          </p>
        </div>
        
        ${reportDetails}
        
        <div style="text-align: center; margin-top: 30px;">
          ${actionButton}
        </div>
      </div>
      
      <!-- Sección de análisis exclusivo -->
      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="font-size: 24px;">✨</div>
          <div>
            <h4 style="margin: 0 0 5px; font-size: 16px; color: #065f46; font-weight: 600;">
              Análisis Exclusivo
            </h4>
            <p style="margin: 0; font-size: 14px; color: #047857; line-height: 1.4;">
              Este informe contiene análisis detallado y estrategias específicas para tu servicio suscrito.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Sección de acceso inmediato -->
      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="font-size: 24px;">⏰</div>
          <div>
            <h4 style="margin: 0 0 5px; font-size: 16px; color: #92400e; font-weight: 600;">
              Acceso Inmediato
            </h4>
            <p style="margin: 0; font-size: 14px; color: #b45309; line-height: 1.4;">
              El informe está disponible ahora en tu área de recursos. Te recomendamos leerlo lo antes posible.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Consejo adicional -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="font-size: 24px;">💡</div>
          <div>
            <h4 style="margin: 0 0 5px; font-size: 16px; color: #0c4a6e; font-weight: 600;">
              Consejo
            </h4>
            <p style="margin: 0; font-size: 14px; color: #0369a1; line-height: 1.4;">
              Mantente actualizado con las últimas estrategias de trading y análisis de mercado visitando nuestra plataforma regularmente.
            </p>
          </div>
        </div>
      </div>
    `,
    notificationType: 'info',
    urgency: 'normal',
    buttonText: notification.actionText || 'Leer Informe',
    buttonUrl: notification.actionUrl ? `${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}${notification.actionUrl}` : undefined
  });
}

/**
 * Plantilla mejorada para notificaciones de alertas
 */
export function generateAlertEmailTemplate(
  notification: any, 
  user: any
): string {
  // Si es una notificación de informe, usar la plantilla específica
  if (notification.type === 'actualizacion' || notification.metadata?.reportTitle) {
    return generateReportEmailTemplate(notification, user);
  }

  const actionButton = notification.actionUrl ? 
    `<a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}${notification.actionUrl}" 
        style="display: inline-block; padding: 12px 24px; background: #00ff88; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,255,136,0.3);">
      ${notification.actionText || 'Ver Alerta'}
    </a>` : '';

  const alertDetails = notification.metadata ? `
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
  ` : '';

  return createNotificationEmailTemplate({
    title: `${notification.icon} ${notification.title}`,
    content: `
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="margin: 0 0 10px; font-size: 20px; color: #1e293b; font-weight: 600;">
          ¡Hola ${user.name || user.email.split('@')[0]}! 👋
        </h2>
        <p style="margin: 0; font-size: 16px; color: #64748b;">
          Tienes una nueva alerta de trading disponible en tu cuenta.
        </p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #00ff88;">
        <h3 style="margin: 0 0 15px; font-size: 18px; color: #1e293b; font-weight: 600;">
          📊 Detalles de la Alerta
        </h3>
        <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
          ${notification.message}
        </p>
        ${alertDetails}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        ${actionButton}
      </div>
      
      <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
          ⚡ <strong>Acción Requerida:</strong> Esta es una alerta de alta prioridad. Te recomendamos revisar los detalles completos en la plataforma lo antes posible.
        </p>
      </div>
    `,
    notificationType: 'alert',
    urgency: 'high',
    buttonText: notification.actionText || 'Ver Detalles',
    buttonUrl: notification.actionUrl ? `${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}${notification.actionUrl}` : undefined
  });
}

/**
 * Plantilla para confirmación de entrenamientos
 */
export function createTrainingConfirmationTemplate(
  userEmail: string,
  userName: string,
  trainingDetails: {
    type: string;
    date: string;
    time: string;
    duration: number;
  }
): string {
  return createEmailTemplate({
    title: `🎯 Entrenamiento Confirmado`,
    content: `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
          ✅ Reserva Confirmada
        </div>
      </div>
      
      <p>Hola <strong>${userName}</strong>,</p>
      <p>¡Tu entrenamiento ha sido confirmado exitosamente!</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">📋 Detalles del Entrenamiento:</h3>
        <p style="margin: 8px 0;"><strong>👤 Participante:</strong> ${userName}</p>
        <p style="margin: 8px 0;"><strong>📚 Tipo:</strong> ${trainingDetails.type}</p>
        <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${trainingDetails.date}</p>
        <p style="margin: 8px 0;"><strong>⏰ Hora:</strong> ${trainingDetails.time}</p>
        <p style="margin: 8px 0;"><strong>⏱️ Duración:</strong> ${trainingDetails.duration} minutos</p>
      </div>
      
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88; margin: 20px 0;">
        <h3 style="color: #1a1a1a; margin-top: 0;">📋 Próximos Pasos:</h3>
        <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Recibirás el link de la reunión por email 24 horas antes</li>
          <li>Asegúrate de tener una conexión estable a internet</li>
          <li>Prepara tus preguntas específicas sobre trading</li>
          <li>Ten a mano tu plataforma de trading si quieres revisarla</li>
        </ul>
      </div>
      
      <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
        Si necesitas reprogramar o cancelar, contáctanos con al menos 24 horas de anticipación.
      </p>
    `,
    buttonText: 'Ver Mi Perfil',
    buttonUrl: `${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/perfil`
  });
}

/**
 * Plantilla para confirmación de asesorías
 */
export function createAdvisoryConfirmationTemplate(
  userEmail: string,
  userName: string,
  advisoryDetails: {
    type: string;
    date: string;
    time: string;
    duration: number;
    price?: number;
  }
): string {
  return createEmailTemplate({
    title: `🩺 Asesoría Confirmada`,
    content: `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
          ✅ Consulta Agendada
        </div>
      </div>
      
      <p>Hola <strong>${userName}</strong>,</p>
      <p>¡Tu asesoría ha sido agendada exitosamente!</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">📋 Detalles de la Asesoría:</h3>
        <p style="margin: 8px 0;"><strong>👤 Cliente:</strong> ${userName}</p>
        <p style="margin: 8px 0;"><strong>🩺 Servicio:</strong> ${advisoryDetails.type}</p>
        <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${advisoryDetails.date}</p>
        <p style="margin: 8px 0;"><strong>⏰ Hora:</strong> ${advisoryDetails.time}</p>
        <p style="margin: 8px 0;"><strong>⏱️ Duración:</strong> ${advisoryDetails.duration} minutos</p>
        ${advisoryDetails.price ? `<p style="margin: 8px 0;"><strong>💰 Precio:</strong> $${advisoryDetails.price} USD</p>` : ''}
      </div>
      
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88; margin: 20px 0;">
        <h3 style="color: #1a1a1a; margin-top: 0;">📋 Qué Incluye tu Asesoría:</h3>
        <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Análisis completo de tu situación financiera actual</li>
          <li>Evaluación de tu perfil de riesgo</li>
          <li>Recomendaciones específicas de inversión</li>
          <li>Plan de acción detallado y personalizado</li>
          <li>Seguimiento por email durante 30 días</li>
          <li>Grabación de la sesión para tu referencia</li>
        </ul>
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <h3 style="color: #1a1a1a; margin-top: 0;">📝 Preparación para la Sesión:</h3>
        <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Ten a mano información sobre tus inversiones actuales</li>
          <li>Prepara datos sobre tus ingresos y gastos mensuales</li>
          <li>Define tus objetivos financieros a corto y largo plazo</li>
          <li>Anota las preguntas específicas que quieras hacer</li>
        </ul>
      </div>
      
      <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
        Recibirás el link de Google Meet 24 horas antes de la sesión.
      </p>
    `,
    buttonText: 'Ver Mi Perfil',
    buttonUrl: `${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/perfil`
  });
}

/**
 * Plantilla para notificaciones al admin
 */
export function createAdminNotificationTemplate(
  bookingDetails: {
    userEmail: string;
    userName: string;
    type: 'training' | 'advisory';
    serviceType: string;
    date: string;
    time: string;
    duration: number;
    price?: number;
  }
): string {
  const typeEmoji = bookingDetails.type === 'training' ? '🎯' : '🩺';
  const typeLabel = bookingDetails.type === 'training' ? 'Entrenamiento' : 'Asesoría';
  
  return createEmailTemplate({
    title: `${typeEmoji} Nueva Reserva de ${typeLabel}`,
    content: `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
          🔔 Nueva Reserva
        </div>
      </div>
      
      <p>Se ha realizado una nueva reserva en la plataforma.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a;">📋 Detalles de la Reserva:</h3>
        <p style="margin: 8px 0;"><strong>👤 Usuario:</strong> ${bookingDetails.userName} (${bookingDetails.userEmail})</p>
        <p style="margin: 8px 0;"><strong>📚 Tipo:</strong> ${typeLabel}</p>
        <p style="margin: 8px 0;"><strong>🔧 Servicio:</strong> ${bookingDetails.serviceType}</p>
        <p style="margin: 8px 0;"><strong>📅 Fecha:</strong> ${bookingDetails.date}</p>
        <p style="margin: 8px 0;"><strong>⏰ Hora:</strong> ${bookingDetails.time}</p>
        <p style="margin: 8px 0;"><strong>⏱️ Duración:</strong> ${bookingDetails.duration} minutos</p>
        ${bookingDetails.price ? `<p style="margin: 8px 0;"><strong>💰 Precio:</strong> $${bookingDetails.price} USD</p>` : ''}
      </div>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">📋 Acciones Requeridas:</h3>
        <ul style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Confirmar disponibilidad para la fecha y hora</li>
          <li>Enviar link de Google Meet 24 horas antes</li>
          <li>Revisar el perfil del usuario si es necesario</li>
          <li>Preparar material específico según el tipo de sesión</li>
        </ul>
      </div>
      
      <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
        Puedes gestionar esta reserva desde el panel de administración.
      </p>
    `,
    buttonText: 'Ir al Panel Admin',
    buttonUrl: `${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/admin`
  });
}

/**
 * Plantilla para emails de bienvenida
 */
export function createWelcomeEmailTemplate({
  userName,
  content,
  buttonText,
  buttonUrl
}: {
  userName: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}): string {
  return createEmailTemplate({
    title: `¡Bienvenido a bordo, ${userName}! 🚀`,
    content: `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
          🎉 ¡Cuenta Activada!
        </div>
      </div>
      
      <p>Hola <strong>${userName}</strong>,</p>
      
      ${content}
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #0ea5e9;">
        <h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 18px;">🎯 Próximos pasos:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #0f172a;">
          <li style="margin-bottom: 8px;">Completa tu perfil en la plataforma</li>
          <li style="margin-bottom: 8px;">Explora nuestras alertas de trading</li>
          <li style="margin-bottom: 8px;">Únete a nuestra comunidad</li>
          <li>Revisa los recursos educativos</li>
        </ul>
      </div>
    `,
    buttonText: buttonText || 'Comenzar Mi Viaje',
    buttonUrl: buttonUrl || `${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/perfil`
  });
}

/**
 * Plantilla para emails promocionales
 */
export function createPromotionalEmailTemplate({
  title,
  content,
  offer,
  buttonText,
  buttonUrl,
  expiryDate
}: {
  title: string;
  content: string;
  offer?: string;
  buttonText?: string;
  buttonUrl?: string;
  expiryDate?: string;
}): string {
  return createEmailTemplate({
    title: title,
    content: `
      ${offer ? `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 16px 24px; border-radius: 12px; margin-bottom: 20px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; right: 0; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 0 12px 0 12px; font-size: 12px; font-weight: bold;">
              OFERTA ESPECIAL
            </div>
            <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">${offer}</h3>
            ${expiryDate ? `<p style="margin: 0; font-size: 14px; opacity: 0.9;">Válido hasta: ${expiryDate}</p>` : ''}
          </div>
        </div>
      ` : ''}
      
      ${content}
      
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #f59e0b;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 20px; margin-right: 12px;">⭐</span>
          <strong style="color: #92400e; font-size: 16px;">¿Por qué elegir Nahuel Lozano?</strong>
        </div>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
          <li style="margin-bottom: 6px;">Estrategias probadas y rentables</li>
          <li style="margin-bottom: 6px;">Alertas en tiempo real</li>
          <li style="margin-bottom: 6px;">Comunidad activa de traders</li>
          <li>Soporte personalizado</li>
        </ul>
      </div>
    `,
    buttonText: buttonText || 'Aprovechar Oferta',
    buttonUrl: buttonUrl || `${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}`
  });
} 

/**
 * Plantilla específica para notificaciones con logo prominente
 */
export function createNotificationEmailTemplate({
  title,
  content,
  notificationType = 'info',
  buttonText,
  buttonUrl,
  urgency = 'normal'
}: {
  title: string;
  content: string;
  notificationType?: 'info' | 'alert' | 'success' | 'warning';
  buttonText?: string;
  buttonUrl?: string;
  urgency?: 'low' | 'normal' | 'high';
}): string {
  const urgencyColors = {
    low: '#10b981',
    normal: '#3b82f6', 
    high: '#ef4444'
  };

  const typeIcons = {
    info: '📊',
    alert: '🚨',
    success: '✅',
    warning: '⚠️'
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #2d3748;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            
            .header {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .logo-container {
                margin-bottom: 25px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .logo {
                max-width: 140px;
                height: auto;
                border-radius: 16px;
                box-shadow: 0 12px 30px rgba(0, 255, 136, 0.4);
                background: rgba(255, 255, 255, 0.15);
                padding: 12px;
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .notification-badge {
                display: inline-block;
                background: ${urgencyColors[urgency]};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 15px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .header h1 {
                color: #00ff88;
                margin: 0 0 8px 0;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: -0.025em;
                position: relative;
                z-index: 1;
            }
            
            .header .subtitle {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                font-weight: 500;
                margin: 0;
                position: relative;
                z-index: 1;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .content h2 {
                color: #1a202c;
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 20px 0;
                text-align: center;
            }
            
            .message-content {
                color: #4a5568;
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
            }
            
            .message-content p {
                margin: 0 0 16px 0;
            }
            
            .cta-section {
                text-align: center;
                margin: 30px 0;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
                color: #000;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 50px;
                font-weight: 700;
                font-size: 16px;
                letter-spacing: 0.025em;
                transition: all 0.3s ease;
                box-shadow: 0 8px 15px rgba(0, 255, 136, 0.3);
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 20px rgba(0, 255, 136, 0.4);
            }
            
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
                margin: 30px 0;
            }
            
            .footer {
                background: #f8fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
                color: #64748b;
                font-size: 14px;
                margin: 0 0 10px 0;
            }
            
            .social-links {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin: 20px 0;
            }
            
            .social-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                text-decoration: none;
                border-radius: 50%;
                font-size: 18px;
                transition: all 0.3s ease;
            }
            
            .social-link:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
            }
            
            .disclaimer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            
            .disclaimer p {
                font-size: 12px;
                color: #9ca3af;
                margin: 0 0 8px 0;
            }
            
            .disclaimer a {
                color: #3b82f6;
                text-decoration: none;
            }
            
            @media only screen and (max-width: 600px) {
                body {
                    padding: 10px;
                }
                
                .header {
                    padding: 30px 20px;
                }
                
                .logo {
                    max-width: 120px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .content {
                    padding: 30px 20px;
                }
                
                .content h2 {
                    font-size: 22px;
                }
                
                .cta-button {
                    padding: 14px 28px;
                    font-size: 14px;
                }
                
                .social-links {
                    gap: 12px;
                }
                
                .social-link {
                    width: 44px;
                    height: 44px;
                    font-size: 16px;
                }
                
                .footer {
                    padding: 25px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo-container">
                    <img src="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/logos/LOGOTIPO NARANJA SIN FONDO.png" 
                         alt="Nahuel Lozano Trading" 
                         class="logo"
                         style="max-width: 140px; height: auto; border-radius: 16px; box-shadow: 0 12px 30px rgba(0, 255, 136, 0.4); background: rgba(255, 255, 255, 0.15); padding: 12px; backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2);">
                </div>
                <div class="notification-badge">
                    ${typeIcons[notificationType]} ${notificationType.toUpperCase()}
                </div>
                <h1>Nahuel Lozano</h1>
                <p class="subtitle">Trading & Investment Platform</p>
            </div>
            
            <div class="content">
                <h2>${title}</h2>
                <div class="message-content">
                    ${content.split('\n').map(paragraph => 
                        paragraph.trim() ? `<p>${paragraph}</p>` : ''
                    ).join('')}
                </div>
                
                ${buttonText && buttonUrl ? `
                    <div class="cta-section">
                        <a href="${buttonUrl}" class="cta-button">${buttonText}</a>
                    </div>
                ` : ''}
                
                <div class="divider"></div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #4a5568; font-size: 14px;">
                        <strong>💡 Consejo:</strong> Mantente actualizado con las últimas estrategias de trading y análisis de mercado visitando nuestra plataforma regularmente.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Este email fue enviado desde la plataforma de Nahuel Lozano</strong></p>
                <p>Tu fuente confiable para estrategias de trading e inversión</p>
                
                <div class="social-links">
                    <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}" class="social-link" title="Sitio Web">🌐</a>
                    <a href="mailto:${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'info@lozanonahuel.com'}" class="social-link" title="Email">📧</a>
                    <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/alertas" class="social-link" title="Alertas">📊</a>
                    <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/recursos" class="social-link" title="Recursos">📚</a>
                </div>
                
                <div class="disclaimer">
                    <p>Si tienes preguntas, contáctanos en: <a href="mailto:${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'info@lozanonahuel.com'}">${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'info@lozanonahuel.com'}</a></p>
                    <p>© ${new Date().getFullYear()} Nahuel Lozano Trading Platform. Todos los derechos reservados.</p>
                    <p>Este email fue enviado porque eres parte de nuestra comunidad de trading. Si no deseas recibir más emails, <a href="${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/perfil">puedes gestionar tus preferencias aquí</a>.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
} 