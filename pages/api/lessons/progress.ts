import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Modelo para el progreso de lecciones
interface LessonProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent?: number; // En minutos
  lastAccessed: Date;
}

const lessonProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  lessonId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados
lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const LessonProgressModel = mongoose.models.LessonProgress || 
  mongoose.model('LessonProgress', lessonProgressSchema);

/**
 * API para gestionar el progreso de lecciones
 * POST: Marcar lección como completada/actualizar progreso
 * GET: Obtener progreso del usuario
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // Verificar sesión
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado'
    });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      console.log('📊 Obteniendo progreso de lecciones para usuario:', userId);

      const { lessonId, tipoEntrenamiento } = req.query;

      let filter: any = { userId };
      
      if (lessonId) {
        filter.lessonId = lessonId;
      }

      // Si se especifica tipo de entrenamiento, buscar lecciones de ese tipo
      if (tipoEntrenamiento) {
        // Aquí podrías hacer un populate o join para filtrar por tipo
        // Por simplicidad, mantenemos el filtro básico
      }

      const progress = await LessonProgressModel.find(filter).sort({ lastAccessed: -1 });

      console.log(`✅ Encontrado progreso de ${progress.length} lecciones`);

      return res.status(200).json({
        success: true,
        data: progress
      });

    } catch (error) {
      console.error('❌ Error al obtener progreso:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener progreso'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('📊 Actualizando progreso de lección');

      const { lessonId, action, timeSpent } = req.body;

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          error: 'lessonId es requerido'
        });
      }

      const updateData: any = {
        userId,
        lessonId,
        lastAccessed: new Date()
      };

      if (action === 'complete') {
        updateData.completed = true;
        updateData.completedAt = new Date();
      }

      if (timeSpent && typeof timeSpent === 'number') {
        updateData.timeSpent = timeSpent;
      }

      // Usar upsert para crear o actualizar
      const progress = await LessonProgressModel.findOneAndUpdate(
        { userId, lessonId },
        { $set: updateData },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      console.log('✅ Progreso actualizado:', progress);

      return res.status(200).json({
        success: true,
        data: progress,
        message: action === 'complete' ? 'Lección marcada como completada' : 'Progreso actualizado'
      });

    } catch (error) {
      console.error('❌ Error al actualizar progreso:', error);
      
      // Manejar error de duplicado
      if ((error as any).code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'El progreso ya existe para esta lección'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Error al actualizar progreso'
      });
    }
  }

  // Método no permitido
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({
    success: false,
    error: `Método ${req.method} no permitido`
  });
} 