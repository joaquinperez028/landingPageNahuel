import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAPI } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // Verificar autenticación y permisos de admin
  const adminCheck = await verifyAdminAPI(req, res);
  if (!adminCheck.isAdmin) {
    return res.status(401).json({ error: adminCheck.error || 'No autorizado' });
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