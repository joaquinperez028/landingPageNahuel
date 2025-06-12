import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { z } from 'zod';
import { createTrainingEvent, createAdvisoryEvent } from '@/lib/googleCalendar';

// Schema de validación para crear reservas
const createBookingSchema = z.object({
  type: z.enum(['training', 'advisory']),
  serviceType: z.enum(['ConsultorioFinanciero', 'CuentaAsesorada', 'TradingFundamentals', 'AdvancedStrategies']).optional(),
  startDate: z.string().datetime(),
  duration: z.number().min(30).max(300).default(90), // Entre 30 minutos y 5 horas
  price: z.number().min(0).optional(),
  notes: z.string().max(500).optional()
});

/**
 * API para gestionar reservas
 * GET: Obtener reservas del usuario autenticado
 * POST: Crear nueva reserva
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Verificar autenticación
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const userEmail = session.user.email;
  const userName = session.user.name || 'Usuario';

  if (req.method === 'GET') {
    try {
      console.log('📅 Obteniendo reservas para:', userEmail);
      
      const bookings = await Booking.find({ userEmail })
        .sort({ startDate: -1 })
        .limit(50);

      return res.status(200).json({ bookings });
    } catch (error) {
      console.error('❌ Error al obtener reservas:', error);
      return res.status(500).json({ error: 'Error al obtener las reservas' });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('📝 Creando nueva reserva para:', userEmail);
      
      // Validar datos de entrada
      const validationResult = createBookingSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      const { type, serviceType, startDate, duration, price, notes } = validationResult.data;
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

      // Verificar que no haya conflictos de horario (bloqueo de 90 minutos)
      const conflictingBookings = await Booking.find({
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          {
            // Nueva reserva empieza durante una existente
            startDate: { $lte: startDateTime },
            endDate: { $gt: startDateTime }
          },
          {
            // Nueva reserva termina durante una existente
            startDate: { $lt: endDateTime },
            endDate: { $gte: endDateTime }
          },
          {
            // Nueva reserva contiene una existente
            startDate: { $gte: startDateTime },
            endDate: { $lte: endDateTime }
          }
        ]
      });

      if (conflictingBookings.length > 0) {
        return res.status(409).json({ 
          error: 'Horario no disponible. Ya existe una reserva en ese período.' 
        });
      }

      // Crear la reserva en la base de datos
      const newBooking = await Booking.create({
        userId: session.user.id || userEmail,
        userEmail,
        userName,
        type,
        serviceType,
        startDate: startDateTime,
        endDate: endDateTime,
        duration,
        price,
        notes,
        status: 'confirmed', // Por ahora confirmamos automáticamente
        paymentStatus: price ? 'pending' : 'paid'
      });

      // Crear evento en Google Calendar
      try {
        let googleEvent;
        const eventName = serviceType || (type === 'training' ? 'Entrenamiento de Trading' : 'Asesoría Financiera');
        
        if (type === 'training') {
          googleEvent = await createTrainingEvent(userEmail, eventName, startDateTime, duration);
        } else {
          googleEvent = await createAdvisoryEvent(userEmail, eventName, startDateTime, duration);
        }

        // Actualizar la reserva con el ID del evento de Google
        if (googleEvent?.id) {
          await Booking.findByIdAndUpdate(newBooking._id, {
            googleEventId: googleEvent.id
          });
        }
      } catch (calendarError) {
        console.error('⚠️ Error al crear evento en Google Calendar:', calendarError);
        // No fallar la reserva si el calendario falla
      }

      console.log('✅ Reserva creada exitosamente:', newBooking._id);
      return res.status(201).json({ booking: newBooking });

    } catch (error) {
      console.error('❌ Error al crear reserva:', error);
      return res.status(500).json({ error: 'Error al crear la reserva' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 