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

    // Crear contenido del email
    const emailSubject = `[CONTACTO WEB] ${cleanSubject}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          Nuevo Mensaje de Contacto
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Información del Usuario:</h3>
          <p style="margin: 5px 0;"><strong>Nombre:</strong> ${userName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #374151; margin-bottom: 10px;">Asunto:</h3>
          <p style="background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            ${cleanSubject}
          </p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #374151; margin-bottom: 10px;">Mensaje:</h3>
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; line-height: 1.6;">
            ${cleanMessage.replace(/\n/g, '<br>')}
          </div>
        </div>

        <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Nota:</strong> Este mensaje fue enviado a través del formulario de contacto del sitio web.
            Para responder, utiliza la dirección de email del remitente: ${userEmail}
          </p>
        </div>
      </div>
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