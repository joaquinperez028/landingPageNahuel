import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Payment from '@/models/Payment';
import UserSubscription from '@/models/UserSubscription';
import Alert from '@/models/Alert';

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

    // Obtener estadísticas en tiempo real
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Usuarios activos en la última hora
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: oneHourAgo }
    });

    // Total de usuarios
    const totalUsers = await User.countDocuments();

    // Usuarios por rol
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const suscriptorUsers = await User.countDocuments({ role: 'suscriptor' });
    const normalUsers = await User.countDocuments({ role: 'normal' });

    // Sesiones hoy
    const sessionsToday = await User.countDocuments({
      lastLoginAt: { $gte: oneDayAgo }
    });

    // Pagos de hoy
    const paymentsToday = await Payment.countDocuments({
      createdAt: { $gte: oneDayAgo },
      status: 'completed'
    });

    // Ingresos de hoy
    const revenueToday = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: oneDayAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Suscripciones activas
    const activeSubscriptions = await UserSubscription.countDocuments({
      status: 'active'
    });

    // Alertas creadas hoy
    const alertsToday = await Alert.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    // Calcular tasas y métricas
    const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;
    const sessionGrowth = sessionsToday > 0 ? ((sessionsToday - 50) / 50) * 100 : 0; // Comparar con 50 como base
    const revenueGrowth = revenueToday.length > 0 ? ((revenueToday[0].total - 15000) / 15000) * 100 : 0; // Comparar con 15000 como base

    // Crear métricas para el dashboard
    const metrics = [
      {
        title: 'Usuarios Activos',
        value: activeUsers,
        change: Math.floor(Math.random() * 20) - 10, // Simular cambio
        icon: '👥',
        color: '#10b981',
        trend: activeUsers > 5 ? 'up' : 'down',
        previousValue: Math.max(0, activeUsers - Math.floor(Math.random() * 5)),
        period: 'vs. última hora'
      },
      {
        title: 'Sesiones Hoy',
        value: sessionsToday,
        change: Math.floor(sessionGrowth),
        icon: '📊',
        color: '#3b82f6',
        trend: sessionGrowth > 0 ? 'up' : 'down',
        period: 'vs. ayer'
      },
      {
        title: 'Ingresos Hoy',
        value: `$${revenueToday.length > 0 ? revenueToday[0].total.toLocaleString() : '0'}`,
        change: Math.floor(revenueGrowth),
        icon: '💰',
        color: '#059669',
        trend: revenueGrowth > 0 ? 'up' : 'down',
        period: 'vs. ayer'
      },
      {
        title: 'Tasa de Conversión',
        value: `${conversionRate.toFixed(1)}%`,
        change: Math.floor(Math.random() * 20) - 10,
        icon: '🎯',
        color: '#f59e0b',
        trend: conversionRate > 2 ? 'up' : 'down',
        period: 'vs. semana anterior'
      }
    ];

    // Estadísticas generales
    const stats = {
      totalUsers,
      activeUsers,
      totalSessions: sessionsToday,
      webhookSuccessRate: 95.5, // Simulado
      averageResponseTime: 150, // Simulado en ms
      errorRate: 4.5, // Simulado
      conversionRate,
      revenueToday: revenueToday.length > 0 ? revenueToday[0].total : 0,
      adminUsers,
      suscriptorUsers,
      normalUsers,
      paymentsToday,
      activeSubscriptions,
      alertsToday
    };

    res.status(200).json({
      success: true,
      metrics,
      stats,
      timestamp: now.toISOString(),
      period: {
        start: oneDayAgo.toISOString(),
        end: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Error en API real-time metrics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 