import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { z } from 'zod';
import { createTrainingEvent, createAdvisoryEvent } from '@/lib/googleCalendar';
import { 
  sendTrainingConfirmationEmail, 
  sendAdvisoryConfirmationEmail, 
  sendAdminNotificationEmail 
} from '@/lib/emailNotifications';

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

      console.log('🔍 Datos de la nueva reserva:', {
        userEmail,
        type,
        serviceType,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        duration,
        startDateFormatted: startDateTime.toLocaleString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Montevideo'
        })
      });

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

      console.log(`🔍 Reservas conflictivas encontradas: ${conflictingBookings.length}`);
      
      if (conflictingBookings.length > 0) {
        console.log('❌ Detalles de reservas conflictivas:');
        conflictingBookings.forEach((booking, index) => {
          console.log(`  ${index + 1}. ID: ${booking._id}`);
          console.log(`     Usuario: ${booking.userEmail}`);
          console.log(`     Tipo: ${booking.type} - ${booking.serviceType}`);
          console.log(`     Inicio: ${booking.startDate.toISOString()}`);
          console.log(`     Fin: ${booking.endDate.toISOString()}`);
          console.log(`     Formateado: ${booking.startDate.toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Montevideo'
          })}`);
        });
        
        return res.status(409).json({ 
          error: 'Horario no disponible. Ya existe una reserva en ese período.',
          conflictingBookings: conflictingBookings.map(b => ({
            id: b._id,
            userEmail: b.userEmail,
            startDate: b.startDate,
            endDate: b.endDate,
            type: b.type,
            serviceType: b.serviceType
          }))
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

      // Definir nombre del evento
      const eventName = serviceType || (type === 'training' ? 'Entrenamiento de Trading' : 'Asesoría Financiera');

      // Crear evento solo en el calendario del admin
      try {
        console.log('📅 Intentando crear evento en Google Calendar...');
        console.log('🔑 Variables de entorno disponibles:', {
          hasAdminAccessToken: !!process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
          hasAdminRefreshToken: !!process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
          hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
          hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          timezone: process.env.GOOGLE_CALENDAR_TIMEZONE
        });
        
        let googleEvent;
        
        if (type === 'training') {
          console.log('🏋️ Creando evento de entrenamiento...');
          googleEvent = await createTrainingEvent(userEmail, eventName, startDateTime, duration);
        } else {
          console.log('💼 Creando evento de asesoría...');
          googleEvent = await createAdvisoryEvent(userEmail, eventName, startDateTime, duration);
        }

        // Actualizar la reserva con el ID del evento de Google
        if (googleEvent?.id) {
          console.log('✅ Evento creado exitosamente con ID:', googleEvent.id);
          await Booking.findByIdAndUpdate(newBooking._id, {
            googleEventId: googleEvent.id
          });
        } else {
          console.log('⚠️ Evento creado pero sin ID');
        }
      } catch (calendarError: any) {
        console.error('❌ Error detallado al crear evento en Google Calendar:', {
          error: calendarError?.message || 'Error desconocido',
          stack: calendarError?.stack,
          code: calendarError?.code,
          status: calendarError?.status
        });
        // No fallar la reserva si el calendario falla
      }

      // ✅ CRÍTICO: Invalidar caché de turnos después de crear reserva exitosa
      try {
        console.log('🧹 Invalidando caché de turnos después de crear reserva...');
        
        // Usar endpoint interno para invalidar caché
        const invalidateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/turnos/invalidate-cache`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (invalidateResponse.ok) {
          console.log('✅ Caché de turnos invalidado exitosamente');
        } else {
          console.log('⚠️ Error al invalidar caché, pero continúo');
        }
      } catch (cacheError) {
        console.error('⚠️ Error al invalidar caché (no crítico):', cacheError);
        // No fallar la reserva si la invalidación de caché falla
      }

      console.log('✅ Reserva creada exitosamente:', newBooking._id);
      return res.status(201).json({ 
        success: true, 
        booking: newBooking,
        message: 'Reserva creada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error al crear reserva:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor al crear la reserva',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 