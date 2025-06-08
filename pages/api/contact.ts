import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
// @ts-ignore: isomorphic-dompurify no tiene tipos TypeScript perfectos
import DOMPurify from 'isomorphic-dompurify';
import { authOptions } from '@/lib/googleAuth';
import { sendEmail } from '@/lib/smtp';

// Rate limiting storage (en producción usar Redis o similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 3, // Máximo 3 mensajes
  windowMs: 15 * 60 * 1000, // En 15 minutos
  blockDurationMs: 30 * 60 * 1000, // Bloqueo por 30 minutos si se excede
};

// Schema de validación con Zod
const contactSchema = z.object({
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(100, 'El asunto no puede exceder 100 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_.,:;¿?¡!áéíóúñüÁÉÍÓÚÑÜ]+$/, 'El asunto contiene caracteres no permitidos'),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede exceder 2000 caracteres'),
  timestamp: z.number().optional(),
});

/**
 * Limpiar y sanitizar texto para prevenir XSS
 */
function sanitizeText(text: string): string {
  // Eliminar cualquier HTML/XML tags
  const cleaned = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [], // No permitir ningún tag HTML
    ALLOWED_ATTR: [] // No permitir ningún atributo
  });
  
  // Escapar caracteres especiales adicionales
  return cleaned
    .replace(/[<>\"\']/g, '') // Eliminar caracteres peligrosos
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .replace(/on\w+=/gi, '') // Eliminar event handlers
    .trim();
}

/**
 * Verificar patrones sospechosos en el contenido
 */
function containsSuspiciousPatterns(text: string): boolean {
  const suspiciousPatterns = [
    // Scripts maliciosos
    /<script[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    
    // Inyección SQL básica
    /('|(\\['\"])|(--)|(\*))[\s\S]*(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,
    
    // Comandos del sistema
    /(\||&|;|\$\(|\`)/g,
    
    // Metadatos de archivos
    /\.\.\/|\.\.\\/g,
    
    // Código base64 sospechoso
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /location\./gi,
    
    // Patrones de spam
    /https?:\/\/[^\s]+[^\s.]/gi, // URLs (bloquear URLs en mensajes)
    /(viagra|cialis|casino|poker|lottery|winner|prize|congratulations|million|dollars)/gi,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(text));
}

/**
 * Implementar rate limiting básico
 */
function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit) {
    // Primera solicitud del usuario
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return { allowed: true };
  }

  if (now > userLimit.resetTime) {
    // La ventana de tiempo ha expirado, resetear contador
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return { allowed: true };
  }

  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    // Límite excedido
    return { 
      allowed: false, 
      resetTime: userLimit.resetTime + RATE_LIMIT.blockDurationMs 
    };
  }

  // Incrementar contador
  userLimit.count++;
  return { allowed: true };
}

/**
 * Limpiar periódicamente el mapa de rate limiting
 */
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime + RATE_LIMIT.blockDurationMs) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitMap.delete(key));
}, 5 * 60 * 1000); // Limpiar cada 5 minutos

/**
 * Handler principal del endpoint de contacto
 * @param req - Request de Next.js
 * @param res - Response de Next.js
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido',
      allowedMethods: ['POST']
    });
  }

  try {
    console.log('📧 Iniciando proceso de contacto...');

    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      console.log('❌ Usuario no autenticado');
      return res.status(401).json({ 
        error: 'Debes iniciar sesión para enviar un mensaje' 
      });
    }

    const userEmail = session.user.email;
    const userName = session.user.name || 'Usuario';

    // Rate limiting por email de usuario
    const rateLimitCheck = checkRateLimit(userEmail);
    if (!rateLimitCheck.allowed) {
      console.log(`⚠️  Rate limit excedido para ${userEmail}`);
      const resetTime = rateLimitCheck.resetTime || Date.now();
      const waitMinutes = Math.ceil((resetTime - Date.now()) / (1000 * 60));
      
      return res.status(429).json({ 
        error: `Has enviado demasiados mensajes. Intenta de nuevo en ${waitMinutes} minutos.`,
        retryAfter: resetTime
      });
    }

    // Validar y parsear datos de entrada
    let validatedData;
    try {
      validatedData = contactSchema.parse(req.body);
    } catch (error) {
      console.log('❌ Error de validación:', error);
      return res.status(400).json({ 
        error: 'Datos de entrada inválidos',
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }

    // Sanitizar contenido
    const cleanSubject = sanitizeText(validatedData.subject);
    const cleanMessage = sanitizeText(validatedData.message);

    // Verificar patrones sospechosos
    const combinedContent = `${cleanSubject} ${cleanMessage}`;
    if (containsSuspiciousPatterns(combinedContent)) {
      console.log('⚠️  Contenido sospechoso detectado:', combinedContent.substring(0, 100));
      return res.status(400).json({ 
        error: 'El contenido del mensaje contiene elementos no permitidos' 
      });
    }

    // Verificar longitudes después de sanitización
    if (cleanSubject.length < 3 || cleanMessage.length < 8) {
      return res.status(400).json({ 
        error: 'El contenido del mensaje es demasiado corto después del procesamiento' 
      });
    }

    // Preparar email para el administrador
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('❌ ADMIN_EMAIL no configurado');
      return res.status(500).json({ 
        error: 'Configuración del servidor incompleta' 
      });
    }

    // Crear contenido del email con plantilla profesional
    const emailSubject = `[CONTACTO WEB] ${cleanSubject}`;
    const emailContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo Mensaje de Contacto</title>
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
                  max-width: 650px;
                  margin: 20px auto;
                  background: #ffffff;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
              }
              .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 40px 35px;
                  text-align: center;
                  position: relative;
              }
              .header::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>') repeat;
                  opacity: 0.3;
              }
              .header-content {
                  position: relative;
                  z-index: 1;
              }
              .header h1 {
                  margin: 0 0 10px 0;
                  font-size: 32px;
                  font-weight: 700;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .header .icon {
                  font-size: 48px;
                  margin-bottom: 15px;
                  display: block;
              }
              .header p {
                  margin: 0;
                  font-size: 16px;
                  opacity: 0.95;
                  font-weight: 400;
              }
              .content {
                  padding: 45px 35px;
              }
              .user-info-card {
                  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                  border: 1px solid #e2e8f0;
                  border-radius: 16px;
                  padding: 25px;
                  margin-bottom: 35px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                  position: relative;
              }
              .user-info-card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 4px;
                  background: linear-gradient(90deg, #667eea, #764ba2);
                  border-radius: 16px 16px 0 0;
              }
              .user-info-title {
                  font-size: 18px;
                  font-weight: 700;
                  color: #1e293b;
                  margin: 0 0 20px 0;
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }
              .user-info-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 15px;
              }
              .user-info-item {
                  display: flex;
                  flex-direction: column;
                  gap: 5px;
              }
              .user-info-label {
                  font-size: 13px;
                  font-weight: 600;
                  color: #64748b;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              .user-info-value {
                  font-size: 15px;
                  font-weight: 600;
                  color: #1e293b;
              }
              .message-section {
                  margin: 35px 0;
              }
              .section-title {
                  font-size: 20px;
                  font-weight: 700;
                  color: #1e293b;
                  margin: 0 0 15px 0;
                  padding-bottom: 10px;
                  border-bottom: 2px solid #e2e8f0;
                  position: relative;
              }
              .section-title::after {
                  content: '';
                  position: absolute;
                  bottom: -2px;
                  left: 0;
                  width: 60px;
                  height: 2px;
                  background: linear-gradient(90deg, #667eea, #764ba2);
              }
              .subject-box {
                  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                  border: 1px solid #bfdbfe;
                  border-left: 4px solid #3b82f6;
                  padding: 20px;
                  border-radius: 12px;
                  margin-bottom: 25px;
              }
              .subject-text {
                  font-size: 17px;
                  font-weight: 600;
                  color: #1e40af;
                  margin: 0;
                  line-height: 1.4;
              }
              .message-box {
                  background: #ffffff;
                  border: 2px solid #f1f5f9;
                  border-radius: 12px;
                  padding: 25px;
                  font-size: 16px;
                  line-height: 1.7;
                  color: #334155;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                  position: relative;
              }
              .message-box::before {
                  content: '"';
                  position: absolute;
                  top: -10px;
                  left: 20px;
                  font-size: 60px;
                  color: #e2e8f0;
                  font-family: Georgia, serif;
                  line-height: 1;
              }
              .timestamp {
                  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                  border: 1px solid #f59e0b;
                  color: #92400e;
                  padding: 15px 20px;
                  border-radius: 12px;
                  font-size: 14px;
                  text-align: center;
                  margin-top: 35px;
                  font-weight: 600;
              }
              .footer {
                  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                  padding: 35px;
                  border-top: 1px solid #e2e8f0;
                  text-align: center;
              }
              .footer-title {
                  font-size: 16px;
                  font-weight: 700;
                  color: #1e293b;
                  margin: 0 0 15px 0;
              }
              .footer-text {
                  font-size: 14px;
                  color: #64748b;
                  margin: 0 0 10px 0;
                  line-height: 1.5;
              }
              .reply-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  text-decoration: none;
                  padding: 12px 25px;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 14px;
                  margin-top: 15px;
                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                  transition: transform 0.2s ease;
              }
              .reply-button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
              }
              @media only screen and (max-width: 600px) {
                  .container {
                      margin: 10px;
                      border-radius: 12px;
                  }
                  .header {
                      padding: 30px 25px;
                  }
                  .header h1 {
                      font-size: 26px;
                  }
                  .content {
                      padding: 30px 25px;
                  }
                  .footer {
                      padding: 25px;
                  }
                  .user-info-grid {
                      grid-template-columns: 1fr;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="header-content">
                      <span class="icon">📧</span>
                      <h1>Nuevo Mensaje de Contacto</h1>
                      <p>Un usuario se ha puesto en contacto contigo a través del sitio web</p>
                  </div>
              </div>
              
              <div class="content">
                  <div class="user-info-card">
                      <h3 class="user-info-title">
                          👤 Información del Remitente
                      </h3>
                      <div class="user-info-grid">
                          <div class="user-info-item">
                              <span class="user-info-label">Nombre</span>
                              <span class="user-info-value">${userName}</span>
                          </div>
                          <div class="user-info-item">
                              <span class="user-info-label">Email</span>
                              <span class="user-info-value">${userEmail}</span>
                          </div>
                          <div class="user-info-item">
                              <span class="user-info-label">Fecha y Hora</span>
                              <span class="user-info-value">${new Date().toLocaleString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                          </div>
                      </div>
                  </div>

                  <div class="message-section">
                      <h3 class="section-title">📋 Asunto del Mensaje</h3>
                      <div class="subject-box">
                          <p class="subject-text">${cleanSubject}</p>
                      </div>
                  </div>

                  <div class="message-section">
                      <h3 class="section-title">💬 Contenido del Mensaje</h3>
                      <div class="message-box">
                          ${cleanMessage.replace(/\n/g, '<br>')}
                      </div>
                  </div>

                  <div class="timestamp">
                      ⏰ Mensaje recibido el ${new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })} a las ${new Date().toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                  </div>
              </div>

              <div class="footer">
                  <h4 class="footer-title">¿Cómo responder?</h4>
                  <p class="footer-text">
                      Para responder a este mensaje, simplemente envía un email directamente a:
                  </p>
                  <p class="footer-text">
                      <strong>${userEmail}</strong>
                  </p>
                  <a href="mailto:${userEmail}?subject=Re: ${cleanSubject}" class="reply-button">
                      Responder Email
                  </a>
                  <p class="footer-text" style="margin-top: 25px; font-size: 13px; color: #94a3b8;">
                      Este mensaje fue enviado automáticamente desde el formulario de contacto de tu sitio web.<br>
                      No respondas a este email directamente.
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;

    // Enviar email al administrador
    console.log(`📤 Enviando email a administrador: ${adminEmail}`);
    const emailResult = await sendEmail({
      to: adminEmail,
      subject: emailSubject,
      html: emailContent,
      from: `"${userName}" <${process.env.SMTP_USER}>` // Usar el SMTP como remitente, pero incluir info del usuario
    });

    if (!emailResult.success) {
      console.error('❌ Error al enviar email:', emailResult.error);
      return res.status(500).json({ 
        error: 'Error interno del servidor al enviar el mensaje' 
      });
    }

    // Respuesta exitosa
    console.log('✅ Mensaje de contacto enviado exitosamente');
    res.status(200).json({ 
      success: true, 
      message: 'Mensaje enviado correctamente',
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('❌ Error en endpoint de contacto:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
} 