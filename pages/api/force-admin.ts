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
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const { securityCode } = req.body;

    // Código de seguridad para emergencias
    if (securityCode !== 'FORCE_ADMIN_EMERGENCY_2024') {
      return res.status(403).json({ 
        message: 'Código de seguridad incorrecto',
        required: 'FORCE_ADMIN_EMERGENCY_2024'
      });
    }

    await dbConnect();

    // Buscar y actualizar el usuario actual
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        role: 'admin',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado',
        email: session.user.email
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rol de administrador asignado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error al asignar admin:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: (error as Error).message
    });
  }
} 