import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // Verificar autenticación y permisos de admin
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const currentUser = await User.findOne({ email: session.user?.email });
  if (!currentUser || currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Permisos insuficientes' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener estadísticas de usuarios
    const totalContacts = await User.countDocuments({});
    
    // Contar usuarios con emails válidos (que tengan email)
    const totalEmails = await User.countDocuments({ 
      $and: [
        { email: { $exists: true } },
        { email: { $ne: null } },
        { email: { $ne: '' } }
      ]
    });
    
    // Contar suscriptores activos
    const totalSuscriptors = await User.countDocuments({ 
      role: 'suscriptor' 
    });

    // Simular última exportación (esto se puede mejorar con un modelo de logs)
    // Por ahora retornamos null, luego puedes implementar un sistema de logs
    const lastExport = null;

    return res.status(200).json({
      success: true,
      totalContacts,
      totalEmails,
      totalSuscriptors,
      lastExport
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de BD:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 