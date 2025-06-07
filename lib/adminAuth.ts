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
    console.log('🔍 Verificando acceso de admin...');
    
    // Obtener sesión usando getServerSession (más confiable que getSession)
    const session = await getServerSession(context.req, context.res, authOptions);
    
    if (!session || !session.user?.email) {
      console.log('❌ No hay sesión válida');
      return {
        isValid: false,
        isAdmin: false,
        redirectTo: '/api/auth/signin'
      };
    }

    console.log('✅ Sesión encontrada para:', session.user.email);
    console.log('👤 Rol en sesión:', session.user.role);

    // Ahora confiamos en el rol de la sesión ya que el JWT siempre consulta la BD
    if (session.user.role !== 'admin') {
      console.log('❌ Usuario no es admin según sesión');
      return {
        isValid: true,
        isAdmin: false,
        redirectTo: '/'
      };
    }

    console.log('✅ Usuario es admin según sesión, acceso permitido');
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
    console.error('💥 Error en verificación de admin:', error);
    
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