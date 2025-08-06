import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await dbConnect();

    // Verificar sesión y permisos de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificar si es admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { userEmail, service } = req.body;

    if (!userEmail || !service) {
      return res.status(400).json({ error: 'Email y servicio son requeridos' });
    }

    // Buscar usuario
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Mapear nombres de servicios
    const serviceNames: { [key: string]: string } = {
      'TraderCall': 'Trader Call',
      'SmartMoney': 'Smart Money',
      'CashFlow': 'Cash Flow',
      'TradingFundamentals': 'Trading Fundamentals',
      'DowJones': 'Dow Jones'
    };

    const serviceName = serviceNames[service] || service;

    // Crear contenido del email
    const emailSubject = `Recordatorio: Tu suscripción a ${serviceName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">¡Hola ${user.name}!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-top: 0;">Recordatorio sobre tu suscripción</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Te escribimos para recordarte sobre tu suscripción a <strong>${serviceName}</strong>.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para ayudarte.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/perfil" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Ver Mi Perfil
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Este es un recordatorio automático enviado por el administrador.
            </p>
          </div>
        </div>
      </div>
    `;

    // Enviar email
    await sendEmail({
      to: userEmail,
      subject: emailSubject,
      html: emailHtml
    });

    console.log(`✅ Email de recordatorio enviado a ${userEmail} para servicio ${service}`);

    return res.status(200).json({
      success: true,
      message: 'Email de recordatorio enviado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error enviando email de recordatorio:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
}
