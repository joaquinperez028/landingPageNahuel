import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para corregir fechas de último login para usuarios existentes
 * POST: Actualiza usuarios que no tienen lastLogin configurado
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔧 API fix-login-dates - método:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    console.log('🔍 Buscando usuarios sin fecha de último login...');

    // Encontrar usuarios que no tienen lastLogin o es null
    const usersWithoutLastLogin = await User.find({
      $or: [
        { lastLogin: { $exists: false } },
        { lastLogin: null }
      ]
    });

    console.log(`📊 Encontrados ${usersWithoutLastLogin.length} usuarios sin fecha de último login`);

    if (usersWithoutLastLogin.length === 0) {
      return res.status(200).json({
        message: 'Todos los usuarios ya tienen fecha de último login configurada',
        updated: 0
      });
    }

    const updatedUsers = [];

    // Actualizar cada usuario
    for (const user of usersWithoutLastLogin) {
      try {
        // Establecer lastLogin como su fecha de creación si está disponible,
        // o una fecha por defecto si no está disponible
        const defaultDate = user.createdAt || new Date('2024-01-01');
        
        await User.findByIdAndUpdate(user._id, {
          lastLogin: defaultDate
        });

        updatedUsers.push({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          newLastLogin: defaultDate
        });

        console.log(`✅ Actualizado usuario: ${user.email}`);
      } catch (updateError) {
        console.error(`❌ Error actualizando usuario ${user.email}:`, updateError);
      }
    }

    console.log(`✅ Actualizados ${updatedUsers.length} usuarios exitosamente`);

    return res.status(200).json({
      message: `Se actualizaron ${updatedUsers.length} usuarios con fechas de último login`,
      updated: updatedUsers.length,
      users: updatedUsers
    });

  } catch (error: any) {
    console.error('❌ Error al corregir fechas de login:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 