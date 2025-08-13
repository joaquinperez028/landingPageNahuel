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
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    // Obtener email del query parameter
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email requerido' });
    }

    // Verificar que el usuario solo puede consultar su propio rol
    if (email !== session.user.email) {
      return res.status(403).json({ message: 'No autorizado para consultar otros usuarios' });
    }

    // Buscar usuario en la base de datos
    const user = await User.findOne({ email }).select('role');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      success: true,
      role: user.role || 'normal'
    });

  } catch (error) {
    console.error('Error obteniendo rol de usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 