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

    // Conectar a base de datos con timeout
    await connectDB();
    
    // Buscar usuario en base de datos con timeout
    const user: any = await User.findOne({ email: session.user.email })
      .maxTimeMS(5000)
      .lean(); // usar lean() para mejor performance
    
    if (!user) {
      console.log('❌ Usuario no encontrado en base de datos:', session.user.email);
      return {
        isValid: true,
        isAdmin: false,
        redirectTo: '/'
      };
    }

    console.log('👤 Usuario encontrado, rol:', user.role);

    if (user.role !== 'admin') {
      console.log('❌ Usuario no es admin');
      return {
        isValid: true,
        isAdmin: false,
        redirectTo: '/'
      };
    }

    console.log('✅ Usuario es admin, acceso permitido');
    return {
      isValid: true,
      isAdmin: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
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

    await connectDB();
    
    const user: any = await User.findOne({ email: session.user.email })
      .maxTimeMS(5000)
      .lean();
    
    if (!user || user.role !== 'admin') {
      return { isAdmin: false, error: 'Permisos insuficientes' };
    }

    return { 
      isAdmin: true, 
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

  } catch (error) {
    console.error('💥 Error en verificación API de admin:', error);
    return { isAdmin: false, error: 'Error interno del servidor' };
  }
} 