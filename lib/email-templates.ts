// Plantillas de email sin dependencias de servidor para preview
// Estas son versiones separadas para evitar problemas de compilación en el cliente

// Plantilla HTML mejorada para emails
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
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.1;
            }
            
            .header h1 {
                color: #ffffff;
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
            
            .logo-container {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                position: relative;
                z-index: 1;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                padding: 8px;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            
            .logo-container img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 50%;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .content h2 {
                color: #1a202c;
                margin: 0 0 24px 0;
                font-size: 24px;
                font-weight: 600;
                line-height: 1.3;
            }
            
            .message-content {
                color: #4a5568;
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 32px;
            }
            
            .message-content p {
                margin: 0 0 16px 0;
            }
            
            .message-content p:last-child {
                margin-bottom: 0;
            }
            
            .cta-section {
                text-align: center;
                margin: 40px 0;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: #ffffff !important;
                text-decoration: none !important;
                padding: 16px 32px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                letter-spacing: 0.025em;
                transition: all 0.3s ease;
                box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
                border: none;
                cursor: pointer;
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.5);
            }
            
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                margin: 32px 0;
            }
            
            .footer {
                background: #f7fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
                color: #718096;
                font-size: 14px;
                margin: 0 0 8px 0;
                line-height: 1.5;
            }
            
            .footer a {
                color: #3b82f6;
                text-decoration: none;
                font-weight: 500;
            }
            
            .footer a:hover {
                text-decoration: underline;
            }
            
            .social-links {
                margin: 20px 0;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
            }
            
            .social-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
                border-radius: 12px;
                color: #4a5568;
                text-decoration: none;
                transition: all 0.3s ease;
                font-size: 18px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .social-link:hover {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }
            
            .contact-section {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                padding: 30px;
                border-radius: 16px;
                margin: 30px 0;
                border: 1px solid #bae6fd;
                text-align: center;
            }
            
            .contact-section h3 {
                color: #0c4a6e;
                margin: 0 0 16px 0;
                font-size: 20px;
                font-weight: 700;
            }
            
            .contact-info {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
                margin-top: 16px;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.8);
                padding: 12px 18px;
                border-radius: 25px;
                color: #0f172a;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .contact-item:hover {
                background: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                color: #3b82f6;
            }
            
            .disclaimer {
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #a0aec0;
                line-height: 1.4;
            }
            
            /* Responsive Design */
            @media only screen and (max-width: 600px) {
                body {
                    padding: 10px;
                }
                
                .email-container {
                    border-radius: 12px;
                }
                
                .header, .content, .footer {
                    padding: 24px 20px;
                }
                
                .header h1 {
                    font-size: 28px;
                }
                
                .content h2 {
                    font-size: 22px;
                }
                
                .cta-button {
                    padding: 14px 28px;
                    font-size: 15px;
                }
                
                .social-links {
                    gap: 12px;
                }
                
                .social-link {
                    width: 40px;
                    height: 40px;
                    font-size: 16px;
                }
                
                .contact-info {
                    flex-direction: column;
                    gap: 12px;
                }
                
                .contact-item {
                    justify-content: center;
                    min-width: 200px;
                }
                
                .contact-section {
                    padding: 24px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo-container">
                    <img src="https://lozanonahuel.vercel.app/logos/logo%20notificaciones.png" alt="Nahuel Lozano Logo" />
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
                
                <div class="contact-section">
                    <h3>💬 Contacto Masivo & Soporte</h3>
                    <p style="color: #475569; margin-bottom: 16px;">¿Necesitas ayuda o tienes preguntas? Estamos aquí para ti</p>
                    
                    <div class="contact-info">
                        <a href="https://lozanonahuel.vercel.app" class="contact-item">
                            🌐 Plataforma
                        </a>
                        <a href="mailto:info@lozanonahuel.com" class="contact-item">
                            📧 Email Directo
                        </a>
                        <a href="https://lozanonahuel.vercel.app/asesorias" class="contact-item">
                            🤝 Asesorías
                        </a>
                    </div>
                </div>
                
                <div class="social-links">
                    <a href="https://lozanonahuel.vercel.app" class="social-link" title="Sitio Web">🌐</a>
                    <a href="mailto:info@lozanonahuel.com" class="social-link" title="Email">📧</a>
                    <a href="https://lozanonahuel.vercel.app/alertas" class="social-link" title="Alertas">📊</a>
                    <a href="https://lozanonahuel.vercel.app/recursos" class="social-link" title="Recursos">📚</a>
                </div>
                
                <div class="disclaimer">
                    <p>Si tienes preguntas, contáctanos en: <a href="mailto:info@lozanonahuel.com">info@lozanonahuel.com</a></p>
                    <p>© ${new Date().getFullYear()} Nahuel Lozano Trading Platform. Todos los derechos reservados.</p>
                    <p>Este email fue enviado porque eres parte de nuestra comunidad de trading. Si no deseas recibir más emails, <a href="https://lozanonahuel.vercel.app/perfil">puedes gestionar tus preferencias aquí</a>.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Plantilla especializada para emails de bienvenida
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
}) {
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
    buttonUrl: buttonUrl || 'https://lozanonahuel.vercel.app/perfil'
  });
}

// Plantilla especializada para alertas de trading
export function createAlertEmailTemplate({
  alertType,
  title,
  content,
  urgency = 'medium',
  buttonText,
  buttonUrl
}: {
  alertType: string;
  title: string;
  content: string;
  urgency?: 'low' | 'medium' | 'high';
  buttonText?: string;
  buttonUrl?: string;
}) {
  const urgencyConfig = {
    low: { emoji: '📊', color: '#3b82f6', bg: '#eff6ff' },
    medium: { emoji: '⚡', color: '#f59e0b', bg: '#fffbeb' },
    high: { emoji: '🚨', color: '#ef4444', bg: '#fef2f2' }
  };
  
  const config = urgencyConfig[urgency];
  
  return createEmailTemplate({
    title: `${config.emoji} ${title}`,
    content: `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: ${config.color}; color: white; padding: 8px 16px; border-radius: 50px; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
          ${alertType} • ${urgency.toUpperCase()}
        </div>
      </div>
      
      ${content}
      
      <div style="background: ${config.bg}; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid ${config.color}33;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 20px; margin-right: 12px;">${config.emoji}</span>
          <strong style="color: ${config.color}; font-size: 16px;">Información Importante</strong>
        </div>
        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
          Esta alerta ha sido generada en base a nuestro análisis técnico y fundamental. Recuerda siempre hacer tu propia investigación antes de tomar decisiones de inversión.
        </p>
      </div>
    `,
    buttonText: buttonText || 'Ver Detalles Completos',
    buttonUrl: buttonUrl || 'https://lozanonahuel.vercel.app/alertas'
  });
}

// Plantilla para emails promocionales/marketing
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
}) {
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
    buttonUrl: buttonUrl || 'https://lozanonahuel.vercel.app'
  });
} 