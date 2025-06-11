import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();
    let user = await User.findOne({ email: session.user.email });

    if (req.method === 'GET') {
      // Ver información del usuario
      return res.status(200).json({
        debug: true,
        session: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        },
        user: user ? {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          roleType: typeof user.role,
          suscripciones: user.suscripciones,
          subscriptions: user.subscriptions,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        } : null,
        message: user ? 'Usuario encontrado' : 'Usuario NO encontrado en BD'
      });
    }

    if (req.method === 'POST') {
      const { action, newRole } = req.body;

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (action === 'makeAdmin') {
        // Cambiar rol a admin
        user.role = 'admin';
        await user.save();
        
        return res.status(200).json({
          success: true,
          message: 'Usuario actualizado a admin',
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            roleType: typeof user.role
          }
        });
      }

      if (action === 'setRole' && newRole) {
        // Cambiar a rol específico
        user.role = newRole;
        await user.save();
        
        return res.status(200).json({
          success: true,
          message: `Usuario actualizado a ${newRole}`,
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            roleType: typeof user.role
          }
        });
      }

      return res.status(400).json({ message: 'Acción no válida' });
    }

    return res.status(405).json({ message: 'Método no permitido' });

  } catch (error) {
    console.error('❌ Error en debug-user-role:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 