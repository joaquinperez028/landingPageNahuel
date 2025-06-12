import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import TrainingSchedule from '@/models/TrainingSchedule';
import { z } from 'zod';

// Schema de validación para consultar slots disponibles
const availableSlotsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  type: z.enum(['training', 'advisory']).optional(),
  duration: z.number().min(30).max(300).default(90)
});

/**
 * API para obtener horarios disponibles
 * GET: Retorna slots libres para una fecha específica
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Validar parámetros de consulta
    const validationResult = availableSlotsSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Parámetros inválidos',
        details: validationResult.error.errors 
      });
    }

    const { date, type, duration } = validationResult.data;
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    console.log('🔍 Consultando slots disponibles para:', date, 'tipo:', type);

    // Generar todos los slots posibles del día (cada 30 minutos de 8:00 a 22:00)
    const allSlots: string[] = [];
    for (let hour = 8; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // No agregar slots que se extenderían más allá de las 22:00
        const slotEndTime = hour * 60 + minute + duration;
        if (slotEndTime <= 22 * 60) {
          allSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
    }

    // Obtener horarios de entrenamiento configurados para este día
    const trainingSchedules = await TrainingSchedule.find({ 
      dayOfWeek,
      activo: true 
    });

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
        const trainingStart = training.hour * 60 + training.minute;
        const trainingEnd = trainingStart + training.duration;
        
        return (
          (slotStartMinutes >= trainingStart && slotStartMinutes < trainingEnd) ||
          (slotEndMinutes > trainingStart && slotEndMinutes <= trainingEnd) ||
          (slotStartMinutes <= trainingStart && slotEndMinutes >= trainingEnd)
        );
      });

      if (conflictsWithTraining) return false;

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

      return !conflictsWithBooking;
    });

    // Si es para entrenamientos, solo mostrar slots que coincidan con horarios configurados
    let finalSlots = availableSlots;
    if (type === 'training') {
      finalSlots = availableSlots.filter(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        return trainingSchedules.some(training => 
          training.hour === slotHour && training.minute === slotMinute
        );
      });
    }

    console.log(`✅ Encontrados ${finalSlots.length} slots disponibles para ${date}`);

    return res.status(200).json({ 
      date,
      availableSlots: finalSlots,
      totalSlots: finalSlots.length,
      trainingSchedules: trainingSchedules.length,
      existingBookings: existingBookings.length
    });

  } catch (error) {
    console.error('❌ Error al obtener slots disponibles:', error);
    return res.status(500).json({ error: 'Error al consultar horarios disponibles' });
  }
} 