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
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                margin-top: 20px;
                margin-bottom: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.95;
            }
            .content {
                padding: 40px 30px;
            }
            .message-content {
                font-size: 16px;
                line-height: 1.8;
                color: #4a5568;
                margin-bottom: 30px;
            }
            .message-content p {
                margin: 0 0 15px 0;
            }
            .cta-section {
                text-align: center;
                margin: 30px 0;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transition: transform 0.2s ease;
            }
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                margin: 30px 0;
            }
            .footer {
                background: #f8fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            .footer p {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #64748b;
            }
            .social-links {
                margin: 20px 0;
                text-align: center;
            }
            .social-link {
                display: inline-block;
                margin: 0 10px;
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                text-decoration: none;
                line-height: 40px;
                text-align: center;
                font-size: 16px;
                transition: transform 0.2s ease;
            }
            .social-link:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
            .disclaimer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #94a3b8;
                line-height: 1.5;
            }
            .disclaimer a {
                color: #667eea;
                text-decoration: none;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 8px;
                }
                .header {
                    padding: 30px 20px;
                }
                .header h1 {
                    font-size: 24px;
                }
                .content {
                    padding: 30px 20px;
                }
                .footer {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📈 Nahuel Lozano</h1>
                <p>Trading & Estrategias de Inversión</p>
            </div>
            
            <div class="content">
                <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">${title}</h2>
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
                    <a href="https://lozanonahuel.vercel.app" class="social-link" title="Sitio Web">🌐</a>
                    <a href="mailto:${process.env.ADMIN_EMAIL || 'info@lozanonahuel.com'}" class="social-link" title="Email">📧</a>
                    <a href="https://lozanonahuel.vercel.app/alertas" class="social-link" title="Alertas">📊</a>
                    <a href="https://lozanonahuel.vercel.app/recursos" class="social-link" title="Recursos">📚</a>
                </div>
                
                <div class="disclaimer">
                    <p>Si tienes preguntas, contáctanos en: <a href="mailto:${process.env.ADMIN_EMAIL || 'info@lozanonahuel.com'}">${process.env.ADMIN_EMAIL || 'info@lozanonahuel.com'}</a></p>
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