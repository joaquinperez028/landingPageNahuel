import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAPI } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para obtener estadísticas de roles y cambios recientes
 * GET: Estadísticas de roles y usuarios con cambios recientes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📊 API roles stats - método:', req.method);
  
  await connectDB();

  // Verificar autenticación y permisos de admin
  const adminCheck = await verifyAdminAPI(req, res);
  if (!adminCheck.isAdmin) {
    return res.status(401).json({ error: adminCheck.error || 'No autorizado' });
  }

  console.log(`✅ [API] Admin verificado para estadísticas de roles: ${adminCheck.user?.email}`);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener estadísticas de roles
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Transformar estadísticas en objeto
    const stats = {
      admin: 0,
      suscriptor: 0,
      normal: 0,
      total: 0
    };

    roleStats.forEach(stat => {
      stats[stat._id as keyof typeof stats] = stat.count;
      stats.total += stat.count;
    });

    // Obtener usuarios con cambios recientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentChanges = await User.find({
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } },
        { updatedAt: { $gte: thirtyDaysAgo } },
        { lastLogin: { $gte: thirtyDaysAgo } }
      ]
    })
    .select('name email picture role createdAt lastLogin updatedAt')
    .sort({ updatedAt: -1 })
    .limit(10);

    console.log(`📊 Estadísticas generadas - Total: ${stats.total} usuarios`);

    return res.status(200).json({
      success: true,
      stats,
      recentChanges: recentChanges.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de roles:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 