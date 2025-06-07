import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

interface UserStat {
  _id: string;
  count: number;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  lastLogin?: Date;
}

/**
 * API para obtener estadísticas del dashboard administrativo
 * GET: Estadísticas generales del sistema
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📊 API dashboard stats - método:', req.method);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    console.log('🔗 Conectando a la base de datos...');
    await connectDB();

    // Verificar permisos de admin con timeout personalizado
    console.log('👤 Verificando permisos de administrador...');
    const currentUser = await User.findOne({ email: session.user?.email }).maxTimeMS(5000);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    console.log('📊 Obteniendo estadísticas del sistema...');

    // Obtener estadísticas básicas con timeout usando promesas separadas
    const userStatsPromise = User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]).exec();

    const recentUsersPromise = User.find({})
      .select('name email role createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(5)
      .maxTimeMS(5000)
      .exec();

    const [userStats, recentUsers] = await Promise.all([userStatsPromise, recentUsersPromise]);

    // Procesar estadísticas
    const stats = {
      totalUsers: 0,
      adminUsers: 0,
      suscriptorUsers: 0,
      normalUsers: 0,
      totalNotifications: 0,
      activeNotifications: 0,
      recentActivity: [] as Array<{ description: string; time: string }>
    };

    // Procesar estadísticas de usuarios
    userStats.forEach((stat: UserStat) => {
      const count = stat.count;
      stats.totalUsers += count;
      
      switch (stat._id) {
        case 'admin':
          stats.adminUsers = count;
          break;
        case 'suscriptor':
          stats.suscriptorUsers = count;
          break;
        case 'normal':
          stats.normalUsers = count;
          break;
      }
    });

    // Simular notificaciones activas (puedes reemplazar con lógica real)
    stats.activeNotifications = 3;
    stats.totalNotifications = 10;

    // Actividad reciente basada en usuarios recientes
    stats.recentActivity = recentUsers.map((user: RecentUser) => ({
      description: `Usuario ${user.name} se registró`,
      time: user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'Fecha desconocida'
    }));

    console.log('✅ Estadísticas obtenidas exitosamente');

    return res.status(200).json(stats);

  } catch (error: any) {
    console.error('❌ Error en dashboard stats:', error);
    
    // Manejo específico de errores de MongoDB
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        error: 'Error de conexión con la base de datos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 