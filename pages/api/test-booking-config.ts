import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  console.log('🔍 Verificando configuración de reservas...');

  const config = {
    // Variables de entorno
    env: {
      MONGODB_URI: !!process.env.MONGODB_URI,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      ADMIN_GOOGLE_ACCESS_TOKEN: !!process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      ADMIN_GOOGLE_REFRESH_TOKEN: !!process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
      GOOGLE_CALENDAR_ID: !!process.env.GOOGLE_CALENDAR_ID,
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL
    },
    
    // Valores específicos (sin mostrar datos sensibles)
    values: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      hasAccessToken: !!process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      hasRefreshToken: !!process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
      hasSmtpPass: !!process.env.SMTP_PASS
    }
  };

  // Verificar configuración crítica
  const criticalIssues = [];
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    criticalIssues.push('Configuración SMTP incompleta');
  }
  
  if (!process.env.ADMIN_GOOGLE_ACCESS_TOKEN || !process.env.ADMIN_GOOGLE_REFRESH_TOKEN) {
    criticalIssues.push('Tokens de Google Calendar faltantes');
  }

  const status = criticalIssues.length === 0 ? '✅ Configuración OK' : '❌ Problemas detectados';

  return res.status(200).json({
    status,
    config,
    criticalIssues,
    recommendations: [
      'Verificar que SMTP_PASS esté configurado (no SMTP_PASSWORD)',
      'Obtener tokens de Google Calendar desde OAuth Playground',
      'Redeploy después de agregar variables en Vercel'
    ]
  });
}
