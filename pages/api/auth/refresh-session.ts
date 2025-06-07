import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    console.log('🔄 Iniciando refresh de sesión...');
    
    // Obtener sesión actual
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ 
        message: 'No hay sesión activa',
        success: false 
      });
    }

    console.log(`👤 Verificando usuario: ${session.user.email}`);

    // Conectar a BD y verificar rol actual
    await dbConnect();
    const dbUser = await User.findOne({ email: session.user.email })
      .select('_id name email role picture suscripciones lastLogin')
      .lean() as any;

    if (!dbUser) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado en la base de datos',
        success: false 
      });
    }

    console.log(`🗄️ Usuario en BD - Rol: ${dbUser.role}, Email: ${dbUser.email}`);
    console.log(`🔐 Sesión actual - Rol: ${session.user.role}, Email: ${session.user.email}`);

    const needsUpdate = session.user.role !== dbUser.role;

    return res.status(200).json({
      success: true,
      message: needsUpdate ? 'Sesión necesita actualización' : 'Sesión está actualizada',
      needsUpdate,
      currentSession: {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        id: session.user.id
      },
      databaseUser: {
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        id: dbUser._id.toString(),
        lastLogin: dbUser.lastLogin
      },
      instructions: needsUpdate ? [
        '1. Cierra sesión completamente',
        '2. Vuelve a iniciar sesión con Google',
        '3. Tu nuevo rol se aplicará automáticamente'
      ] : [
        'Tu sesión ya tiene el rol correcto'
      ]
    });

  } catch (error) {
    console.error('❌ Error en refresh-session:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 