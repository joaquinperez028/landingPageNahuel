import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    // Buscar el usuario en la base de datos
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado en la base de datos',
        sessionEmail: session.user.email
      });
    }

    // Retornar información completa del usuario para debug
    return res.status(200).json({
      success: true,
      debug: {
        sessionEmail: session.user.email,
        userFound: !!user,
        role: user.role,
        name: user.name,
        email: user.email,
        subscriptions: user.subscriptions || [],
        suscripciones: user.suscripciones || [],
        _id: user._id,
        hasRole: user.role !== undefined,
        roleValue: user.role,
        roleType: typeof user.role
      }
    });

  } catch (error) {
    console.error('❌ Error al debuggear usuario:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: (error as Error).message
    });
  }
} 