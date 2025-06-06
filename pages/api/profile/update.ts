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

    // Conectar a la base de datos
    await dbConnect();

    const {
      fullName,
      cuitCuil,
      educacionFinanciera,
      brokerPreferencia,
      avatarUrl
    } = req.body;

    // Validación básica
    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ message: 'El nombre completo es obligatorio' });
    }

    // Buscar o crear el usuario
    let user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      // Si el usuario no existe, lo creamos con la información de la sesión
      user = new User({
        googleId: (session.user as any).id || session.user.email, // Fallback si no hay ID
        name: session.user.name || fullName.trim(),
        email: session.user.email,
        picture: session.user.image,
        fullName: fullName.trim(),
        cuitCuil: cuitCuil || null,
        educacionFinanciera: educacionFinanciera || null,
        brokerPreferencia: brokerPreferencia || null,
        avatarUrl: avatarUrl || session.user.image,
      });

      await user.save();
      console.log('✅ Usuario creado:', user.email);
    } else {
      // Si el usuario existe, lo actualizamos
      user.fullName = fullName.trim();
      user.cuitCuil = cuitCuil || null;
      user.educacionFinanciera = educacionFinanciera || null;
      user.brokerPreferencia = brokerPreferencia || null;
      user.avatarUrl = avatarUrl || user.picture; // Usar avatar personalizado o el de Google
      
      // Actualizar también campos básicos si han cambiado
      if (session.user.name && user.name !== session.user.name) {
        user.name = session.user.name;
      }
      if (session.user.image && user.picture !== session.user.image) {
        user.picture = session.user.image;
      }

      await user.save();
      console.log('✅ Usuario actualizado:', user.email);
    }

    // Crear objeto de respuesta con los datos actualizados
    const updatedProfile = {
      email: user.email,
      name: user.name,
      fullName: user.fullName,
      cuitCuil: user.cuitCuil,
      educacionFinanciera: user.educacionFinanciera,
      brokerPreferencia: user.brokerPreferencia,
      avatarUrl: user.avatarUrl || user.picture,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 