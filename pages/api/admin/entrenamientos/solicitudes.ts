import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Training from '@/models/Training';

/**
 * API para obtener solicitudes de entrenamientos (solo admin)
 * GET /api/admin/entrenamientos/solicitudes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    console.log('📊 Admin solicitando datos de entrenamientos...');

    // Obtener todos los entrenamientos con sus solicitudes
    const trainings = await Training.find({}).sort({ createdAt: -1 });
    
    console.log(`✅ Entrenamientos encontrados: ${trainings.length}`);
    
    // Calcular estadísticas generales
    const totalSolicitudes = trainings.reduce((total, training) => 
      total + training.solicitudes.length, 0
    );
    
    const solicitudesPorEstado = trainings.reduce((stats, training) => {
      training.solicitudes.forEach((solicitud: any) => {
        stats[solicitud.estado] = (stats[solicitud.estado] || 0) + 1;
      });
      return stats;
    }, {} as Record<string, number>);

    return res.status(200).json({
      success: true,
      trainings: trainings.map(training => ({
        _id: training._id,
        tipo: training.tipo,
        nombre: training.nombre,
        precio: training.precio,
        solicitudes: training.solicitudes,
        metricas: training.metricas
      })),
      estadisticas: {
        total: totalSolicitudes,
        porEstado: solicitudesPorEstado
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo solicitudes de entrenamientos:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 