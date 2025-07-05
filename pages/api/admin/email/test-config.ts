import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyEmailConfiguration, getEmailServiceStatus } from '@/lib/emailService';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

/**
 * API para verificar la configuración de email (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    console.log('🔍 Verificando configuración de email...');

    // Obtener estado del servicio
    const emailStatus = getEmailServiceStatus();
    
    // Verificar configuración si está configurado
    let canSendEmails = false;
    if (emailStatus.configured) {
      try {
        canSendEmails = await verifyEmailConfiguration();
      } catch (error) {
        console.error('❌ Error verificando configuración:', error);
      }
    }

    // Verificar variables específicas
    const envVars = {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      EMAIL_FROM_NAME: !!process.env.EMAIL_FROM_NAME,
      EMAIL_FROM_ADDRESS: !!process.env.EMAIL_FROM_ADDRESS
    };

    const missingRequired = Object.entries(envVars)
      .filter(([key, exists]) => !exists && ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'].includes(key))
      .map(([key]) => key);

    const response = {
      configured: emailStatus.configured,
      canSendEmails,
      mode: emailStatus.configured ? 'REAL' : 'SIMULATION',
      provider: emailStatus.provider,
      fromAddress: emailStatus.fromAddress,
      environmentVariables: envVars,
      missingRequired,
      status: emailStatus.configured ? (canSendEmails ? 'READY' : 'CONFIGURATION_ERROR') : 'NOT_CONFIGURED'
    };

    console.log('📧 Estado del servicio de email:', response);

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error verificando configuración de email:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 