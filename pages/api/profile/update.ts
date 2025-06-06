import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getSession({ req });
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

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

    // Aquí conectarías con tu base de datos
    // Por ahora simularemos la actualización
    const updatedProfile = {
      email: session.user.email,
      fullName: fullName.trim(),
      cuitCuil: cuitCuil || null,
      educacionFinanciera: educacionFinanciera || null,
      brokerPreferencia: brokerPreferencia || null,
      avatarUrl: avatarUrl || session.user.image, // Usar avatar de Google por defecto
      updatedAt: new Date().toISOString()
    };

    // TODO: Guardar en base de datos
    // await db.collection('users').doc(session.user.email).update(updatedProfile);

    console.log('Perfil actualizado:', updatedProfile);

    return res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 