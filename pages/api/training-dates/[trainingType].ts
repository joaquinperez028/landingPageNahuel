import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import TrainingDate from '@/models/TrainingDate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    
    const { trainingType } = req.query;

    if (req.method === 'GET') {
      return await handleGet(req, res, trainingType as string);
    } else if (req.method === 'POST') {
      return await handlePost(req, res, trainingType as string);
    } else if (req.method === 'DELETE') {
      return await handleDelete(req, res, trainingType as string);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ 
        success: false, 
        error: `Método ${req.method} no permitido` 
      });
    }
  } catch (error) {
    console.error('Error en /api/training-dates:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
}

// GET /api/training-dates/[trainingType] - Obtener fechas de entrenamiento
async function handleGet(req: NextApiRequest, res: NextApiResponse, trainingType: string) {
  try {
    const trainingDates = await TrainingDate.find({
      trainingType,
      isActive: true
    }).sort({ date: 1 });

    return res.status(200).json({
      success: true,
      dates: trainingDates
    });
  } catch (error) {
    console.error('Error obteniendo fechas de entrenamiento:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener fechas de entrenamiento'
    });
  }
}

// POST /api/training-dates/[trainingType] - Crear nueva fecha de entrenamiento (solo admin)
async function handlePost(req: NextApiRequest, res: NextApiResponse, trainingType: string) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Verificar si es admin
    const adminEmails = ['joaquinperez028@gmail.com', 'franco.l.varela99@gmail.com'];
    if (!adminEmails.includes(session.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
    }

    const { date, time, title } = req.body;

    if (!date || !time || !title) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: date, time, title'
      });
    }

    const newTrainingDate = new TrainingDate({
      trainingType,
      date: new Date(date),
      time,
      title,
      isActive: true,
      createdBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newTrainingDate.save();

    return res.status(201).json({
      success: true,
      data: newTrainingDate,
      message: 'Fecha de entrenamiento creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando fecha de entrenamiento:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al crear fecha de entrenamiento'
    });
  }
}

// DELETE /api/training-dates/[trainingType] - Eliminar fecha de entrenamiento (solo admin)
async function handleDelete(req: NextApiRequest, res: NextApiResponse, trainingType: string) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Verificar si es admin
    const adminEmails = ['joaquinperez028@gmail.com', 'franco.l.varela99@gmail.com'];
    if (!adminEmails.includes(session.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
    }

    const { dateId } = req.body;

    if (!dateId) {
      return res.status(400).json({
        success: false,
        error: 'ID de fecha requerido'
      });
    }

    await TrainingDate.findByIdAndUpdate(dateId, {
      isActive: false,
      updatedAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'Fecha de entrenamiento eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando fecha de entrenamiento:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al eliminar fecha de entrenamiento'
    });
  }
}
