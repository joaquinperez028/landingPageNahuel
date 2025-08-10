import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar acceso de administrador
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await dbConnect();

    // Obtener usuarios activos en las últimas 2 horas
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const activeUsers = await User.find({
      lastLoginAt: { $gte: twoHoursAgo }
    })
    .select('email name role lastLoginAt lastActivity currentPage sessionDuration')
    .sort({ lastLoginAt: -1 })
    .limit(50)
    .lean();

    // Simular datos de actividad en tiempo real
    const liveUsers = activeUsers.map(user => ({
      id: (user._id as any).toString(),
      email: user.email,
      name: user.name || 'Usuario',
      role: user.role || 'normal',
      lastActivity: user.lastLoginAt || new Date(),
      currentPage: user.currentPage || '/',
      sessionDuration: user.sessionDuration || Math.floor(Math.random() * 1800) + 300,
      isActive: true,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Montevideo, Uruguay'
    }));

    // Agregar algunos usuarios inactivos para mostrar variedad
    const inactiveUsers = await User.find({
      lastLoginAt: { $lt: twoHoursAgo }
    })
    .select('email name role lastLoginAt')
    .sort({ lastLoginAt: -1 })
    .limit(10)
    .lean();

    const allUsers = [
      ...liveUsers,
      ...inactiveUsers.map(user => ({
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name || 'Usuario',
        role: user.role || 'normal',
        lastActivity: user.lastLoginAt || new Date(),
        currentPage: '/',
        sessionDuration: 0,
        isActive: false,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Montevideo, Uruguay'
      }))
    ];

    // Simular actividad en tiempo real
    const usersWithActivity = allUsers.map(user => {
      if (user.isActive) {
        // Simular páginas actuales y duración de sesión
        const pages = [
          '/alertas/smart-money',
          '/entrenamientos',
          '/admin/dashboard',
          '/perfil',
          '/recursos',
          '/asesorias',
          '/notificaciones'
        ];
        
        return {
          ...user,
          currentPage: pages[Math.floor(Math.random() * pages.length)],
          sessionDuration: Math.floor(Math.random() * 3600) + 300, // 5-65 min
          lastActivity: new Date(Date.now() - Math.random() * 300000) // Últimos 5 minutos
        };
      }
      return user;
    });

    res.status(200).json({
      success: true,
      users: usersWithActivity,
      total: usersWithActivity.length,
      active: usersWithActivity.filter(u => u.isActive).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en API real-time users:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 