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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Calcular fecha límite (6 meses atrás)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Criterios para usuarios inactivos:
    // 1. No son administradores
    // 2. No son suscriptores activos 
    // 3. No han iniciado sesión en los últimos 6 meses (o nunca)
    // 4. No han sido creados en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsersQuery = {
      $and: [
        { role: { $ne: 'admin' } }, // No admins
        { role: { $ne: 'suscriptor' } }, // No suscriptores
        { createdAt: { $lt: thirtyDaysAgo } }, // Creados hace más de 30 días
        {
          $or: [
            { lastLogin: { $exists: false } }, // Nunca han iniciado sesión
            { lastLogin: null }, // lastLogin es null
            { lastLogin: { $lt: sixMonthsAgo } } // No han iniciado sesión en 6 meses
          ]
        }
      ]
    };

    // Primero contar cuántos usuarios serán eliminados
    const usersToDelete = await User.countDocuments(inactiveUsersQuery);

    if (usersToDelete === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay usuarios inactivos para eliminar',
        deletedCount: 0
      });
    }

    // Eliminar usuarios inactivos
    const deleteResult = await User.deleteMany(inactiveUsersQuery);

    return res.status(200).json({
      success: true,
      message: `${deleteResult.deletedCount} usuarios inactivos eliminados exitosamente`,
      deletedCount: deleteResult.deletedCount,
      criteria: {
        'No administradores': true,
        'No suscriptores': true,
        'Sin login en 6 meses': true,
        'Creados hace más de 30 días': true
      }
    });

  } catch (error) {
    console.error('Error al limpiar base de datos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 