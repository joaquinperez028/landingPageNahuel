import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para actualizar el último login del usuario
 * POST: Actualiza el campo lastLogin con la fecha actual
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🕐 API update-login - método:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    console.log('🔗 Conectando a la base de datos...');
    await connectDB();

    console.log('🕐 Actualizando último login para:', session.user.email);
    
    // Actualizar último login
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        lastLogin: new Date(),
        $setOnInsert: { // Solo establecer estos valores si es un nuevo documento
          googleId: session.user.id,
          name: session.user.name,
          email: session.user.email,
          picture: session.user.image,
          role: 'normal'
        }
      },
      { 
        new: true,
        upsert: true // Crear usuario si no existe
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Último login actualizado correctamente');

    return res.status(200).json({ 
      message: 'Último login actualizado',
      lastLogin: updatedUser.lastLogin
    });

  } catch (error: any) {
    console.error('❌ Error al actualizar último login:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 