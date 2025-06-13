import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import TrainingSchedule from '@/models/TrainingSchedule';
import { validateScheduleSlot, ScheduleSlot } from '@/lib/scheduleUtils';

/**
 * API para validar conflictos de horarios
 * Consulta tanto asesorías como entrenamientos
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar autenticación de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const { 
      dayOfWeek, 
      startTime, 
      endTime, 
      type,
      title,
      graceMinutes = 30,
      excludeId // Para excluir el horario actual al editar
    } = req.body;

    // Validar datos requeridos
    if (dayOfWeek === undefined || !startTime || !endTime || !type) {
      return res.status(400).json({ 
        message: 'Faltan datos requeridos: dayOfWeek, startTime, endTime, type' 
      });
    }

    console.log('🔍 Validando horario:', { dayOfWeek, startTime, endTime, type, graceMinutes });

    // Obtener todos los horarios existentes de entrenamientos desde la BD
    const trainingSchedules: ScheduleSlot[] = [];
    try {
      const trainings = await TrainingSchedule.find({ 
        ...(excludeId && { _id: { $ne: excludeId } })
      });
      
      trainings.forEach(training => {
        // Convertir formato de hora/minuto a HH:MM si es necesario
        let startTimeFormatted = training.startTime;
        let endTimeFormatted = training.endTime;
        
        // Si el training tiene hour/minute en lugar de startTime/endTime
        if (training.hour !== undefined && training.minute !== undefined) {
          startTimeFormatted = `${training.hour.toString().padStart(2, '0')}:${training.minute.toString().padStart(2, '0')}`;
          // Calcular endTime basado en duración
          const endMinutes = training.hour * 60 + training.minute + (training.duration || 120);
          const endHour = Math.floor(endMinutes / 60);
          const endMin = endMinutes % 60;
          endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
        }
        
        trainingSchedules.push({
          dayOfWeek: training.dayOfWeek,
          startTime: startTimeFormatted,
          endTime: endTimeFormatted,
          type: 'entrenamiento',
          title: training.title || training.type
        });
      });
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar horarios de entrenamientos:', error);
    }

    // Para asesorías, por ahora usamos un array vacío ya que no tenemos modelo específico
    // En el futuro se puede agregar el modelo de asesorías
    const asesoriaSchedules: ScheduleSlot[] = [];

    // Combinar todos los horarios existentes
    const allExistingSchedules = [...asesoriaSchedules, ...trainingSchedules];
    
    console.log('📅 Horarios existentes encontrados:', allExistingSchedules.length);

    // Crear el horario propuesto
    const proposedSchedule: ScheduleSlot = {
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      type: type as 'asesoria' | 'entrenamiento',
      title
    };

    // Validar el horario propuesto
    const validation = validateScheduleSlot(
      proposedSchedule,
      allExistingSchedules,
      parseInt(graceMinutes)
    );

    console.log('✅ Resultado de validación:', validation);

    return res.status(200).json({
      success: true,
      validation: {
        isValid: validation.isValid,
        message: validation.message,
        conflicts: validation.conflicts,
        suggestions: validation.suggestions,
        graceMinutes: parseInt(graceMinutes)
      }
    });

  } catch (error) {
    console.error('💥 Error al validar horario:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 