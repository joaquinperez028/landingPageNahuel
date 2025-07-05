import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { sendEmail, createEmailTemplate } from '@/lib/emailService';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

/**
 * API para enviar email de prueba (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    await dbConnect();

    // Verificar que el usuario sea admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    const { testEmail } = req.body;

    // Usar email del admin si no se proporciona uno específico
    const targetEmail = testEmail || session.user.email;

    console.log(`🧪 Enviando email de prueba a: ${targetEmail}`);

    // Crear contenido del email de prueba
    const testContent = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
          ✅ Configuración Exitosa
        </div>
      </div>
      
      <p>¡Excelente! Tu configuración de email está funcionando correctamente.</p>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
        <h3 style="color: #1e3a8a; margin-top: 0;">📧 Detalles del Test:</h3>
        <ul style="color: #1e3a8a; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
          <li><strong>Enviado desde:</strong> Sistema de Nahuel Lozano</li>
          <li><strong>Tipo:</strong> Email de prueba de configuración</li>
          <li><strong>Admin:</strong> ${user.name} (${user.email})</li>
        </ul>
      </div>
      
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88; margin: 20px 0;">
        <h3 style="color: #1a1a1a; margin-top: 0;">🚀 Sistema Listo Para:</h3>
        <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Notificaciones automáticas de alertas</li>
          <li>Emails masivos a usuarios</li>
          <li>Confirmaciones de entrenamientos y asesorías</li>
          <li>Links de reunión</li>
          <li>Formularios de contacto</li>
        </ul>
      </div>
      
      <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
        Si recibes este email, significa que todo está configurado correctamente. 🎉
      </p>
    `;

    const emailHtml = createEmailTemplate({
      title: '🧪 Test de Configuración de Email',
      content: testContent,
      buttonText: 'Ir al Panel Admin',
      buttonUrl: `${process.env.NEXTAUTH_URL || 'https://lozanonahuel.com'}/admin`
    });

    // Enviar email de prueba
    const success = await sendEmail({
      to: targetEmail,
      subject: '✅ Test de Configuración - Sistema de Emails Nahuel Lozano',
      html: emailHtml
    });

    if (success) {
      console.log(`✅ Email de prueba enviado exitosamente a: ${targetEmail}`);
      return res.status(200).json({
        success: true,
        message: `Email de prueba enviado exitosamente a ${targetEmail}`,
        sentTo: targetEmail
      });
    } else {
      console.log(`❌ Error enviando email de prueba a: ${targetEmail}`);
      return res.status(500).json({
        success: false,
        error: 'Error enviando email de prueba',
        message: 'Verifica la configuración SMTP en las variables de entorno'
      });
    }

  } catch (error) {
    console.error('❌ Error en test de email:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 