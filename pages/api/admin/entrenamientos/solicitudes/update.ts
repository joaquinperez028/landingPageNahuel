import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Training from '@/models/Training';

/**
 * API para actualizar estado de solicitudes de entrenamientos (solo admin)
 * PUT /api/admin/entrenamientos/solicitudes/update
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    const { trainingId, solicitudId, estado } = req.body;

    // Validar datos requeridos
    if (!trainingId || !solicitudId || !estado) {
      return res.status(400).json({ 
        error: 'Datos requeridos: trainingId, solicitudId, estado' 
      });
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    console.log('🔄 Actualizando estado de solicitud:', { trainingId, solicitudId, estado });

    // Buscar el entrenamiento
    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    // Buscar la solicitud específica
    const solicitudIndex = training.solicitudes.findIndex(
      (s: any) => s._id.toString() === solicitudId
    );

    if (solicitudIndex === -1) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    // Actualizar el estado
    training.solicitudes[solicitudIndex].estado = estado;
    
    // Si se confirma, agregar fecha de entrenamiento (opcional)
    if (estado === 'confirmada' && !training.solicitudes[solicitudIndex].fechaEntrenamiento) {
      training.solicitudes[solicitudIndex].fechaEntrenamiento = new Date();
    }

    // Guardar cambios
    await training.save();

    console.log('✅ Estado actualizado exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      solicitud: training.solicitudes[solicitudIndex]
    });

  } catch (error) {
    console.error('❌ Error actualizando estado de solicitud:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 