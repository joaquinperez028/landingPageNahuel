import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import TrainingSchedule from '@/models/TrainingSchedule';
import { z } from 'zod';

// Schema de validación para crear horarios
const createScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  duration: z.number().min(30).max(480),
  type: z.string().min(1),
  activo: z.boolean().default(true)
});

/**
 * API para gestionar horarios de entrenamiento
 * GET: Obtener todos los horarios (público)
 * POST: Crear nuevo horario (solo admin)
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      console.log('📅 Obteniendo horarios de entrenamiento');
      
      const schedules = await TrainingSchedule.find({})
        .sort({ dayOfWeek: 1, hour: 1, minute: 1 });

      console.log(`✅ Encontrados ${schedules.length} horarios configurados`);
      return res.status(200).json({ schedules });

    } catch (error) {
      console.error('❌ Error al obtener horarios:', error);
      return res.status(500).json({ error: 'Error al obtener los horarios' });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('📝 Creando nuevo horario de entrenamiento');

      // Validar datos de entrada
      const validationResult = createScheduleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      const scheduleData = validationResult.data;

      // Verificar que no haya conflictos con horarios existentes
      const conflictingSchedule = await TrainingSchedule.findOne({
        dayOfWeek: scheduleData.dayOfWeek,
        hour: scheduleData.hour,
        minute: scheduleData.minute,
        activo: true
      });

      if (conflictingSchedule) {
        return res.status(409).json({ 
          error: 'Ya existe un horario activo en ese día y hora' 
        });
      }

      // Crear el nuevo horario
      const newSchedule = await TrainingSchedule.create(scheduleData);

      console.log('✅ Horario creado exitosamente:', newSchedule._id);
      return res.status(201).json({ schedule: newSchedule });

    } catch (error) {
      console.error('❌ Error al crear horario:', error);
      return res.status(500).json({ error: 'Error al crear el horario' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

// Aplicar middleware de admin solo para POST
export default function protectedHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return requireAdmin(handler)(req, res);
  }
  return handler(req, res);
} 