import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { GetServerSidePropsContext } from 'next';

interface AdminVerificationResult {
  isAdmin: boolean;
  user?: any;
  redirectTo?: string;
}

/**
 * Verifica si el usuario actual tiene permisos de administrador
 */
export async function verifyAdminAccess(context: GetServerSidePropsContext): Promise<AdminVerificationResult> {
  try {
    console.log('🔍 [ADMIN AUTH] Verificando acceso de administrador...');
    
    const session = await getServerSession(context.req, context.res, authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ [ADMIN AUTH] No hay sesión válida');
      return {
        isAdmin: false,
        redirectTo: '/api/auth/signin'
      };
    }

    console.log('👤 [ADMIN AUTH] Usuario:', session.user.email, 'Rol en sesión:', session.user.role);

    // Usar el rol de la sesión ya que JWT siempre consulta la BD
    if (session.user.role !== 'admin') {
      console.log('❌ [ADMIN AUTH] Usuario no es admin. Rol actual:', session.user.role);
      return {
        isAdmin: false,
        redirectTo: '/',
        user: session.user
      };
    }

    console.log('✅ [ADMIN AUTH] Acceso de admin confirmado para:', session.user.email);
    return {
      isAdmin: true,
      user: session.user
    };

  } catch (error) {
    console.error('💥 [ADMIN AUTH] Error verificando acceso de admin:', error);
    return {
      isAdmin: false,
      redirectTo: '/'
    };
  }
}

/**
 * Middleware para proteger rutas de API de administrador
 */
export function requireAdmin(handler: any) {
  return async (req: any, res: any) => {
    console.log('🔍 [REQUIRE ADMIN] Verificando permisos...');
    
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ [REQUIRE ADMIN] No hay sesión válida');
      return res.status(401).json({ error: 'No autorizado' });
    }

    console.log('👤 [REQUIRE ADMIN] Usuario:', session.user.email, 'Rol:', session.user.role);

    // Usar el rol de la sesión ya que JWT siempre consulta la BD
    if (session.user.role !== 'admin') {
      console.log('❌ [REQUIRE ADMIN] Usuario no es admin. Rol actual:', session.user.role);
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    console.log('✅ [REQUIRE ADMIN] Acceso confirmado para:', session.user.email);
    return handler(req, res);
  };
}

/**
 * Verifica si el usuario es admin en API routes
 */
export async function verifyAdminAPI(req: any, res: any): Promise<{ isAdmin: boolean; user?: any; error?: string }> {
  try {
    console.log('🔍 API: Verificando acceso de admin...');
    
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.email) {
      return { isAdmin: false, error: 'No autorizado' };
    }

    console.log('👤 API: Usuario:', session.user.email, 'Rol:', session.user.role);

    // Confiar en el rol de la sesión ya que JWT siempre consulta BD
    if (session.user.role !== 'admin') {
      return { isAdmin: false, error: 'Permisos insuficientes' };
    }

    return { 
      isAdmin: true, 
      user: {
        _id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    };

  } catch (error) {
    console.error('💥 Error en verificación API de admin:', error);
    return { isAdmin: false, error: 'Error interno del servidor' };
  }
} 