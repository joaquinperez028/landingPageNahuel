import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar sesión
    const session = await getServerSession(req, res, authOptions);
    
         // Verificar variables de entorno
     const envVars = {
       MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Configurado' : 'No configurado',
       MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY ? 'Configurado' : 'No configurado',
       NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'No configurado',
       NODE_ENV: process.env.NODE_ENV || 'No configurado',
       VERCEL_ENV: process.env.VERCEL_ENV || 'No configurado',
       VERCEL_URL: process.env.VERCEL_URL || 'No configurado'
     };

    // Verificar si el usuario está autenticado
    const authStatus = session?.user?.email ? 'Autenticado' : 'No autenticado';

    console.log('🔧 Debug MercadoPago:', {
      session: authStatus,
      user: session?.user?.email || 'N/A',
      envVars
    });

    return res.status(200).json({
      success: true,
      session: authStatus,
      user: session?.user?.email || null,
      envVars,
      message: 'Debug completado'
    });
  } catch (error) {
    console.error('❌ Error en debug:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en debug',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 