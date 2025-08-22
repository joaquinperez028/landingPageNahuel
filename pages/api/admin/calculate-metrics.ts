import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAPI } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Training from '@/models/Training';
import Booking from '@/models/Booking';
import Alert from '@/models/Alert';

/**
 * Endpoint para calcular métricas automáticas basándose en datos reales de la BD
 * Solo accesible por administradores
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación y permisos de administrador
    const adminCheck = await verifyAdminAPI(req, res);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }

    // Conectar a la base de datos
    await dbConnect();

    console.log('🔍 Calculando métricas automáticas...');

    // 1. Calcular total de usuarios registrados
    const totalUsers = await User.countDocuments({});
    console.log(`👥 Total usuarios: ${totalUsers}`);

    // 2. Calcular usuarios con suscripciones activas
    const activeSubscriptions = await User.countDocuments({
      $or: [
        { subscriptionExpiry: { $gt: new Date() } },
        { 'activeSubscriptions.isActive': true, 'activeSubscriptions.expiryDate': { $gt: new Date() } }
      ]
    });
    console.log(`✅ Suscripciones activas: ${activeSubscriptions}`);

    // 3. Calcular total de entrenamientos
    const totalTrainings = await Training.countDocuments({ activo: true });
    console.log(`🎓 Total entrenamientos: ${totalTrainings}`);

    // 4. Calcular total de horas de contenido (sumando duración de todos los entrenamientos)
    const trainings = await Training.find({ activo: true }).select('duracion');
    const totalHours = trainings.reduce((sum, training) => sum + (training.duracion || 0), 0);
    console.log(`⏰ Total horas de contenido: ${totalHours}`);

    // 5. Calcular total de reservas/asesorías
    const totalBookings = await Booking.countDocuments({});
    console.log(`📅 Total reservas: ${totalBookings}`);

    // 6. Calcular total de alertas enviadas
    const totalAlerts = await Alert.countDocuments({});
    console.log(`🚨 Total alertas: ${totalAlerts}`);

    // 7. Calcular usuarios que han hecho login en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });
    console.log(`🔄 Usuarios activos (30 días): ${activeUsers}`);

    // 8. Calcular satisfacción promedio (simulado basado en suscripciones activas)
    const satisfactionRate = totalUsers > 0 ? Math.round((activeSubscriptions / totalUsers) * 100) : 95;
    console.log(`⭐ Satisfacción calculada: ${satisfactionRate}%`);

    // Crear métricas automáticas
    const automaticMetrics = [
      {
        id: 'usuarios_registrados',
        number: `+${totalUsers.toLocaleString()}`,
        label: 'Usuarios Registrados',
        color: '#ffffff',
        icon: '👥',
        order: 1
      },
      {
        id: 'suscripciones_activas',
        number: `+${activeSubscriptions.toLocaleString()}`,
        label: 'Suscripciones Activas',
        color: '#ffffff',
        icon: '✅',
        order: 2
      },
      {
        id: 'entrenamientos',
        number: `+${totalTrainings}`,
        label: 'Entrenamientos',
        color: '#ffffff',
        icon: '🎓',
        order: 3
      },
      {
        id: 'horas_contenido',
        number: `+${totalHours}`,
        label: 'Horas de Contenido',
        color: '#ffffff',
        icon: '⏰',
        order: 4
      },
      {
        id: 'reservas_realizadas',
        number: `+${totalBookings.toLocaleString()}`,
        label: 'Reservas Realizadas',
        color: '#ffffff',
        icon: '📅',
        order: 5
      },
      {
        id: 'alertas_enviadas',
        number: `+${totalAlerts.toLocaleString()}`,
        label: 'Alertas Enviadas',
        color: '#ffffff',
        icon: '🚨',
        order: 6
      },
      {
        id: 'usuarios_activos',
        number: `+${activeUsers.toLocaleString()}`,
        label: 'Usuarios Activos (30d)',
        color: '#ffffff',
        icon: '🔄',
        order: 7
      },
      {
        id: 'satisfaccion',
        number: `${satisfactionRate}%`,
        label: 'Satisfacción',
        color: '#ffffff',
        icon: '⭐',
        order: 8
      }
    ];

    console.log('✅ Métricas calculadas exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Métricas calculadas exitosamente',
      metrics: automaticMetrics,
      summary: {
        totalUsers,
        activeSubscriptions,
        totalTrainings,
        totalHours,
        totalBookings,
        totalAlerts,
        activeUsers,
        satisfactionRate
      }
    });

  } catch (error) {
    console.error('❌ Error al calcular métricas:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
