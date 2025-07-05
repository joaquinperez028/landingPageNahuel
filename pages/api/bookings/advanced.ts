import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';

/**
 * API endpoint para reservas avanzadas con Google Meet automático
 * POST /api/bookings/advanced
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();
    
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    console.log('🚀 Procesando reserva avanzada para:', session.user.email);

    const {
      type,
      serviceType,
      startDate,
      duration,
      price,
      notes,
      autoCreateMeet = true,
      fastConfirmation = true,
      timezone,
      source
    } = req.body;

    // Validaciones
    if (!type || !serviceType || !startDate || !duration) {
      return res.status(400).json({ 
        error: 'Datos requeridos: type, serviceType, startDate, duration' 
      });
    }

    // Validar fecha
    const bookingDate = new Date(startDate);
    const now = new Date();
    
    if (bookingDate <= now) {
      return res.status(400).json({ 
        error: 'La fecha de la reserva debe ser en el futuro' 
      });
    }

    // Calcular fecha de fin
    const endDate = new Date(bookingDate.getTime() + duration * 60 * 1000);

    // Verificar disponibilidad del horario
    const conflictingBooking = await Booking.findOne({
      startDate: {
        $lt: endDate
      },
      endDate: {
        $gt: bookingDate
      },
      status: { $ne: 'cancelled' },
      serviceType
    });

    if (conflictingBooking) {
      return res.status(409).json({ 
        error: 'El horario seleccionado ya está ocupado' 
      });
    }

    // Generar código de confirmación
    const confirmationCode = generateConfirmationCode();
    
    console.log('📅 Creando nueva reserva:', {
      user: session.user.email,
      serviceType,
      startDate: bookingDate.toISOString(),
      confirmationCode
    });

    // Crear la reserva
    const booking = new Booking({
      userId: session.user.email, // En el futuro usar ID real del usuario
      type,
      serviceType,
      startDate: bookingDate,
      endDate,
      duration,
      price,
      notes: notes || '',
      status: fastConfirmation ? 'confirmed' : 'pending',
      confirmationCode,
      userEmail: session.user.email,
      userName: session.user.name || 'Usuario',
      timezone: timezone || 'UTC',
      source: source || 'advanced_booking',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await booking.save();

    console.log('✅ Reserva creada en base de datos:', booking._id);

    // Preparar respuesta base
    let bookingResponse: any = {
      id: booking._id.toString(),
      confirmationCode: booking.confirmationCode,
      status: booking.status,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      serviceType: booking.serviceType,
      price: booking.price,
      paymentStatus: booking.paymentStatus
    };

    // Crear Google Meet automáticamente si está habilitado
    if (autoCreateMeet) {
      try {
        const meetData = await createGoogleMeet({
          title: `${serviceType} - ${session.user.name}`,
          startTime: bookingDate,
          endTime: endDate,
          attendeeEmail: session.user.email,
          description: notes || `Reserva de ${serviceType}`
        });

        if (meetData.success) {
          bookingResponse.googleMeetLink = meetData.meetLink;
          bookingResponse.calendarEventId = meetData.eventId;
          
          // Actualizar la reserva con los datos de Google Meet
          booking.googleMeetLink = meetData.meetLink;
          booking.calendarEventId = meetData.eventId;
          await booking.save();
          
          console.log('✅ Google Meet creado:', meetData.meetLink);
        } else {
          console.log('⚠️ No se pudo crear Google Meet:', meetData.error);
        }
      } catch (meetError) {
        console.error('❌ Error al crear Google Meet:', meetError);
        // No fallar la reserva por error en Meet
      }
    }

    // Generar link de pago si es necesario
    if (price > 0) {
      try {
        const paymentLink = await generatePaymentLink({
          amount: price,
          description: `${serviceType} - ${confirmationCode}`,
          metadata: {
            bookingId: booking._id.toString(),
            userEmail: session.user.email,
            serviceType
          }
        });
        
        if (paymentLink) {
          bookingResponse.paymentLink = paymentLink;
          booking.paymentLink = paymentLink;
          await booking.save();
        }
      } catch (paymentError) {
        console.error('❌ Error al generar link de pago:', paymentError);
      }
    }

    // Enviar notificaciones (email, etc.)
    if (fastConfirmation) {
      try {
        await sendBookingNotifications({
          booking,
          userEmail: session.user.email,
          userName: session.user.name || 'Usuario',
          type: 'confirmation'
        });
      } catch (notificationError) {
        console.error('❌ Error al enviar notificaciones:', notificationError);
      }
    }

    console.log('🎉 Reserva completada exitosamente:', confirmationCode);

    return res.status(201).json(bookingResponse);

  } catch (error) {
    console.error('❌ Error en reserva avanzada:', error);
    
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

/**
 * Genera un código de confirmación único
 */
function generateConfirmationCode(): string {
  const prefix = 'CF'; // Consultorio Financiero
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${prefix}${timestamp}${random}`;
}

/**
 * Crea una reunión de Google Meet (simulado)
 * En producción, integrar con Google Calendar API
 */
async function createGoogleMeet(data: {
  title: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail: string;
  description: string;
}) {
  // Simular creación de Google Meet
  // En producción, usar Google Calendar API y Google Meet API
  
  try {
    // Esta sería la integración real:
    // const calendar = google.calendar({version: 'v3', auth});
    // const event = await calendar.events.insert({...});
    
    // Por ahora, simular datos
    const meetId = `meet_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const meetLink = `https://meet.google.com/${meetId}`;
    const eventId = `event_${Date.now()}`;
    
    console.log('🔗 Google Meet simulado creado:', meetLink);
    
    return {
      success: true,
      meetLink,
      eventId,
      calendarLink: `https://calendar.google.com/event?action=TEMPLATE&text=${encodeURIComponent(data.title)}&dates=${data.startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${data.endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(data.description + '\n\nUnirse a la reunión: ' + meetLink)}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Genera link de pago con MercadoPago
 */
async function generatePaymentLink(data: {
  amount: number;
  description: string;
  metadata: any;
}) {
  // Integración con MercadoPago
  // Por ahora simular el link
  
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // En producción usar MercadoPago SDK:
  // const preference = await mercadopago.preferences.create({...});
  
  return `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${paymentId}`;
}

/**
 * Envía notificaciones de confirmación
 */
async function sendBookingNotifications(data: {
  booking: any;
  userEmail: string;
  userName: string;
  type: 'confirmation' | 'reminder' | 'cancellation';
}) {
  // Integración con servicio de email (SendGrid, etc.)
  console.log('📧 Enviando notificación de reserva:', {
    to: data.userEmail,
    type: data.type,
    confirmationCode: data.booking.confirmationCode
  });
  
  // Por ahora solo log, en producción enviar email real
  return true;
} 