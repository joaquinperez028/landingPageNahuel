import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir en desarrollo o con clave de administrador
  const debugKey = req.headers['x-debug-key'] || req.query.key;
  const isDev = process.env.NODE_ENV === 'development';
  const isValidKey = debugKey === process.env.ADMIN_DEBUG_KEY;
  
  if (!isDev && !isValidKey) {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    console.log('🔍 [DEBUG SESSION] Iniciando diagnóstico...');
    
    // 1. Verificar variables de entorno
    const envStatus = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV
    };

    // 2. Intentar obtener sesión del servidor
    let serverSession = null;
    let sessionError = null;
    
    try {
      serverSession = await getServerSession(req, res, authOptions);
      console.log('✅ [DEBUG] Sesión del servidor obtenida:', serverSession?.user?.email);
    } catch (error) {
      sessionError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [DEBUG] Error obteniendo sesión del servidor:', error);
    }

    // 3. Verificar conexión a la base de datos
    let dbStatus = 'Unknown';
    let dbUser = null;
    let dbError = null;

    try {
      await dbConnect();
      dbStatus = 'Connected';
      
      if (serverSession?.user?.email) {
        dbUser = await User.findOne({ email: serverSession.user.email }).lean() as any;
        console.log('📊 [DEBUG] Usuario en BD:', dbUser ? 'Found' : 'Not found');
      }
    } catch (error) {
      dbStatus = 'Error';
      dbError = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 [DEBUG] Error en BD:', error);
    }

    // 4. Verificar cookies
    const cookies = req.headers.cookie || '';
    const nextAuthCookies = cookies
      .split(';')
      .filter(c => c.trim().includes('next-auth'))
      .map(c => c.trim());

    // 5. Información de headers relevantes
    const relevantHeaders = {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'host': req.headers.host,
      'origin': req.headers.origin,
      'referer': req.headers.referer
    };

    const debugReport = {
      timestamp: new Date().toISOString(),
      environment: envStatus,
      session: {
        serverSession: serverSession ? {
          email: serverSession.user?.email,
          name: serverSession.user?.name,
          role: serverSession.user?.role,
          id: serverSession.user?.id,
          hasImage: !!serverSession.user?.image
        } : null,
        sessionError
      },
      database: {
        status: dbStatus,
        user: dbUser ? {
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          _id: dbUser._id.toString(),
          lastLogin: dbUser.lastLogin,
          hasGoogleId: !!dbUser.googleId
        } : null,
        error: dbError
      },
      cookies: {
        nextAuthCookiesFound: nextAuthCookies.length,
        cookies: isDev ? nextAuthCookies : ['[Hidden in production]']
      },
      request: {
        method: req.method,
        url: req.url,
        headers: relevantHeaders
      },
      authConfig: {
        strategy: 'jwt',
        hasAdapter: false, // Ya que lo deshabilitamos
        providers: ['google'],
        pages: {
          signIn: '/api/auth/signin',
          error: '/auth/error'
        }
      }
    };

    console.log('📋 [DEBUG] Reporte generado exitosamente');
    
    return res.status(200).json({
      success: true,
      report: debugReport,
      recommendations: generateRecommendations(debugReport)
    });

  } catch (error) {
    console.error('💥 [DEBUG SESSION] Error general:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

function generateRecommendations(report: any): string[] {
  const recommendations: string[] = [];

  // Verificar variables de entorno
  if (report.environment.NEXTAUTH_SECRET === 'Not set') {
    recommendations.push('⚠️ NEXTAUTH_SECRET no está configurado');
  }
  
  if (report.environment.NEXTAUTH_URL === 'Not set') {
    recommendations.push('⚠️ NEXTAUTH_URL no está configurado');
  }

  // Verificar sesión
  if (!report.session.serverSession && !report.session.sessionError) {
    recommendations.push('ℹ️ No hay sesión activa - Usuario no autenticado');
  }

  if (report.session.sessionError) {
    recommendations.push(`❌ Error en sesión: ${report.session.sessionError}`);
  }

  // Verificar base de datos
  if (report.database.status === 'Error') {
    recommendations.push(`💥 Error de conexión a BD: ${report.database.error}`);
  }

  if (report.session.serverSession && !report.database.user) {
    recommendations.push('⚠️ Usuario autenticado pero no encontrado en BD - Posible problema de sincronización');
  }

  // Verificar cookies
  if (report.cookies.nextAuthCookiesFound === 0) {
    recommendations.push('🍪 No se encontraron cookies de NextAuth - Usuario necesita autenticarse');
  }

  // Todo en orden
  if (recommendations.length === 0) {
    recommendations.push('✅ Todo parece estar funcionando correctamente');
  }

  return recommendations;
} 