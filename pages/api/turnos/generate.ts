import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import TrainingSchedule from '@/models/TrainingSchedule';
import { z } from 'zod';

// Schema de validación
const generateTurnosSchema = z.object({
  type: z.enum(['training', 'advisory']).optional(),
  days: z.number().min(1).max(60).default(30), // Próximos X días
  maxSlotsPerDay: z.number().min(1).max(20).default(6)
});

interface TurnoData {
  fecha: string;
  horarios: string[];
  disponibles: number;
  type?: 'training' | 'advisory';
}

/**
 * API para generar turnos dinámicos
 * GET: Genera turnos disponibles para los próximos días
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔄 Generando turnos dinámicos...');

    // Validar parámetros
    const validationResult = generateTurnosSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Parámetros inválidos',
        details: validationResult.error.errors 
      });
    }

    const { type, days, maxSlotsPerDay } = validationResult.data;
    const turnos: TurnoData[] = [];
    const today = new Date();

    // Obtener horarios de entrenamiento configurados
    const trainingSchedules = await TrainingSchedule.find({ activo: true });

    // Generar turnos para los próximos días
    for (let i = 1; i <= days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      
      // Saltar fines de semana si no hay entrenamientos configurados
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const hasWeekendTraining = trainingSchedules.some(ts => ts.dayOfWeek === dayOfWeek);
        if (!hasWeekendTraining && type === 'training') continue;
      }

      const dateStr = targetDate.toISOString().split('T')[0];
      
      // Obtener slots disponibles para este día
      const availableSlots = await getAvailableSlotsForDate(
        targetDate, 
        type, 
        trainingSchedules
      );

      if (availableSlots.length > 0) {
        // Limitar número de slots mostrados
        const limitedSlots = availableSlots.slice(0, maxSlotsPerDay);
        
        turnos.push({
          fecha: formatDateForDisplay(targetDate),
          horarios: limitedSlots,
          disponibles: limitedSlots.length,
          type
        });
      }

      // Limitar número total de días con turnos
      if (turnos.length >= 10) break;
    }

    console.log(`✅ Generados ${turnos.length} días con turnos disponibles`);

    return res.status(200).json({ 
      turnos,
      generatedAt: new Date().toISOString(),
      type: type || 'all'
    });

  } catch (error) {
    console.error('❌ Error al generar turnos:', error);
    return res.status(500).json({ error: 'Error al generar turnos' });
  }
}

/**
 * Obtiene slots disponibles para una fecha específica
 */
async function getAvailableSlotsForDate(
  targetDate: Date, 
  type?: 'training' | 'advisory',
  trainingSchedules: any[] = []
): Promise<string[]> {
  const dayOfWeek = targetDate.getDay();
  const duration = 90; // Duración estándar en minutos

  // Generar todos los slots posibles del día
  const allSlots: string[] = [];
  for (let hour = 8; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotEndTime = hour * 60 + minute + duration;
      if (slotEndTime <= 22 * 60) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
  }

  // Obtener reservas existentes para esta fecha
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await Booking.find({
    status: { $in: ['pending', 'confirmed'] },
    startDate: { $gte: startOfDay, $lte: endOfDay }
  });

  // Filtrar slots disponibles
  const availableSlots = allSlots.filter(slot => {
    const [slotHour, slotMinute] = slot.split(':').map(Number);
    const slotStartMinutes = slotHour * 60 + slotMinute;
    const slotEndMinutes = slotStartMinutes + duration;

    // Verificar conflicto con entrenamientos configurados
    const conflictsWithTraining = trainingSchedules.some(training => {
      if (training.dayOfWeek !== dayOfWeek) return false;
      
      const trainingStart = training.hour * 60 + training.minute;
      const trainingEnd = trainingStart + training.duration;
      
      return (
        (slotStartMinutes >= trainingStart && slotStartMinutes < trainingEnd) ||
        (slotEndMinutes > trainingStart && slotEndMinutes <= trainingEnd) ||
        (slotStartMinutes <= trainingStart && slotEndMinutes >= trainingEnd)
      );
    });

    if (conflictsWithTraining && type !== 'training') return false;

    // Verificar conflicto con reservas existentes
    const conflictsWithBooking = existingBookings.some(booking => {
      const bookingStart = booking.startDate.getTime();
      const bookingEnd = booking.endDate.getTime();
      
      const slotStart = new Date(targetDate);
      slotStart.setHours(slotHour, slotMinute, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      return (
        (slotStart.getTime() >= bookingStart && slotStart.getTime() < bookingEnd) ||
        (slotEnd.getTime() > bookingStart && slotEnd.getTime() <= bookingEnd) ||
        (slotStart.getTime() <= bookingStart && slotEnd.getTime() >= bookingEnd)
      );
    });

    if (conflictsWithBooking) return false;

    // Si es para entrenamientos, solo mostrar slots que coincidan con horarios configurados
    if (type === 'training') {
      return trainingSchedules.some(training => 
        training.dayOfWeek === dayOfWeek &&
        training.hour === slotHour && 
        training.minute === slotMinute
      );
    }

    return true;
  });

  return availableSlots;
}

/**
 * Formatea fecha para mostrar en español
 */
function formatDateForDisplay(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  return `${dayName} ${day} de ${month}`;
} 