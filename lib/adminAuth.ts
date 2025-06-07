import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { GetServerSidePropsContext } from 'next';

export interface AdminVerificationResult {
  isValid: boolean;
  isAdmin: boolean;
  user?: any;
  redirectTo?: string;
}

/**
 * Verifica si el usuario actual es administrador
 * Para usar en getServerSideProps
 */
export async function verifyAdminAccess(context: GetServerSidePropsContext): Promise<AdminVerificationResult> {
  try {
    console.log('🔍 [ADMIN AUTH] Iniciando verificación...');
    
    // Obtener sesión usando getServerSession (más confiable que getSession)
    const session = await getServerSession(context.req, context.res, authOptions);
    
    console.log('🔍 [ADMIN AUTH] Sesión obtenida:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email,
      role: session?.user?.role
    });
    
    if (!session || !session.user?.email) {
      console.log('❌ [ADMIN AUTH] No hay sesión válida - redirigiendo a login');
      return {
        isValid: false,
        isAdmin: false,
        redirectTo: '/api/auth/signin'
      };
    }

    console.log('✅ [ADMIN AUTH] Sesión encontrada para:', session.user.email);
    console.log('👤 [ADMIN AUTH] Rol en sesión:', session.user.role);

    // Verificar rol directamente de la sesión
    const isAdmin = session.user.role === 'admin';
    
    if (!isAdmin) {
      console.log('❌ [ADMIN AUTH] Usuario no es admin según sesión - redirigiendo a home');
      return {
        isValid: true,
        isAdmin: false,
        redirectTo: '/'
      };
    }

    console.log('✅ [ADMIN AUTH] Usuario ES admin - acceso permitido');
    return {
      isValid: true,
      isAdmin: true,
      user: {
        _id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    };

  } catch (error) {
    console.error('💥 [ADMIN AUTH] Error en verificación:', error);
    
    // En caso de error, redirigir a home por seguridad
    return {
      isValid: false,
      isAdmin: false,
      redirectTo: '/'
    };
  }
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