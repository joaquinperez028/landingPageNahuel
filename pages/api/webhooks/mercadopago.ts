import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { getMercadoPagoPayment, isPaymentSuccessful, isPaymentPending, isPaymentRejected } from '@/lib/mercadopago';

/**
 * API de webhooks para MercadoPago
 * POST: Procesar notificaciones de pago
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`📡 ${req.method} /api/webhooks/mercadopago`);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await dbConnect();

    // Obtener datos del webhook
    const { data } = req.body;
    
    if (!data || !data.id) {
      console.log('⚠️ Webhook sin datos válidos:', req.body);
      return res.status(400).json({ error: 'Datos de webhook inválidos' });
    }

    const paymentId = data.id;
    console.log('🔔 Webhook recibido para pago:', paymentId);

    // Obtener información del pago desde MercadoPago
    const paymentResult = await getMercadoPagoPayment(paymentId.toString());
    
    if (!paymentResult.success) {
      console.error('❌ Error obteniendo información del pago:', paymentResult.error);
      return res.status(500).json({ error: 'Error obteniendo información del pago' });
    }

    const paymentInfo = paymentResult.payment;
    
    if (!paymentInfo) {
      console.error('❌ Información del pago no disponible');
      return res.status(500).json({ error: 'Información del pago no disponible' });
    }
    
    console.log('📊 Información del pago:', {
      id: paymentInfo.id,
      status: paymentInfo.status,
      externalReference: paymentInfo.external_reference,
      amount: paymentInfo.transaction_amount,
      currency: paymentInfo.currency_id
    });

    // Buscar el pago en nuestra base de datos
    let payment = await Payment.findOne({ 
      externalReference: paymentInfo.external_reference 
    });

    if (!payment) {
      console.log('🆕 Creando nuevo registro de pago para:', paymentInfo.external_reference);
      
      // Crear nuevo registro de pago con los datos del webhook
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      payment = new Payment({
        userId: null, // Se actualizará cuando procesemos el pago
        userEmail: paymentInfo.payer?.email || '',
        service: 'TraderCall', // Se actualizará basado en external_reference
        amount: paymentInfo.transaction_amount,
        currency: paymentInfo.currency_id,
        status: paymentInfo.status,
        mercadopagoPaymentId: paymentInfo.id,
        externalReference: paymentInfo.external_reference,
        paymentMethodId: paymentInfo.payment_method_id || '',
        paymentTypeId: paymentInfo.payment_type_id || '',
        installments: paymentInfo.installments || 1,
        transactionDate: new Date(),
        expiryDate,
        metadata: {
          createdFromWebhook: true,
          originalStatus: paymentInfo.status
        }
      });
      
      await payment.save();
    }

    // Actualizar información del pago
    payment.mercadopagoPaymentId = paymentInfo.id;
    payment.paymentMethodId = paymentInfo.payment_method_id || '';
    payment.paymentTypeId = paymentInfo.payment_type_id || '';
    payment.installments = paymentInfo.installments || 1;
    payment.status = paymentInfo.status;
    payment.transactionDate = new Date();
    payment.updatedAt = new Date();
    
    // Si el pago no tiene userId, intentar encontrarlo por email
    if (!payment.userId && payment.userEmail) {
      const user = await User.findOne({ email: payment.userEmail });
      if (user) {
        payment.userId = user._id;
        console.log('✅ Usuario encontrado y asignado:', user.email);
      }
    }

    await payment.save();

    // Procesar según el estado del pago
    if (isPaymentSuccessful(paymentInfo)) {
      console.log('✅ Pago exitoso, procesando suscripción...');
      await processSuccessfulPayment(payment, paymentInfo);
    } else if (isPaymentRejected(paymentInfo)) {
      console.log('❌ Pago rechazado:', paymentInfo.status_detail);
      await processRejectedPayment(payment, paymentInfo);
    } else if (isPaymentPending(paymentInfo)) {
      console.log('⏳ Pago pendiente:', paymentInfo.status_detail);
      // No hacer nada, esperar confirmación
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Webhook procesado correctamente' 
    });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
}

/**
 * Procesa un pago exitoso
 */
async function processSuccessfulPayment(payment: any, paymentInfo: any) {
  try {
    // Buscar usuario
    const user = await User.findById(payment.userId);
    if (!user) {
      console.error('❌ Usuario no encontrado:', payment.userId);
      return;
    }

    const service = payment.service;
    const amount = payment.amount;
    const currency = payment.currency;

    // Determinar tipo de pago basado en external_reference
    const externalRef = payment.externalReference;
    const isSubscription = ['TraderCall', 'SmartMoney', 'CashFlow'].includes(service);
    const isTraining = ['SwingTrading', 'DowJones'].includes(service);
    const isBooking = externalRef && externalRef.startsWith('booking_');

    if (isSubscription) {
      // Procesar suscripción
      await user.renewSubscription(service, amount, currency, paymentInfo.id);
      
      console.log('✅ Suscripción activada:', {
        user: user.email,
        service,
        expiryDate: user.subscriptionExpiry
      });

    } else if (isTraining) {
      // Procesar entrenamiento
      const nuevoEntrenamiento = {
        tipo: service,
        fechaInscripcion: new Date(),
        progreso: 0,
        activo: true,
        precio: amount,
        metodoPago: 'mercadopago',
        transactionId: paymentInfo.id
      };

      user.entrenamientos.push(nuevoEntrenamiento);
      await user.save();

      console.log('✅ Entrenamiento activado:', {
        user: user.email,
        training: service,
        transactionId: paymentInfo.id
      });

    } else if (isBooking) {
      // Procesar reserva
      console.log('✅ Procesando pago de reserva...');
      
      // Extraer datos de la reserva del external_reference
      const refParts = externalRef.split('_');
      const serviceType = refParts[1];
      const userId = refParts[2];
      const timestamp = refParts[3];
      
      console.log('📋 Datos extraídos del external_reference:', {
        serviceType,
        userId,
        timestamp,
        externalRef
      });
      
      // Crear la reserva después del pago exitoso
      try {
        // Buscar el usuario
        const bookingUser = await User.findById(userId);
        if (!bookingUser) {
          console.error('❌ Usuario no encontrado para crear reserva:', userId);
          return;
        }
        
        // Obtener los datos de reserva del metadata del pago
        const reservationData = payment.metadata?.reservationData;
        let startDate = new Date();
        let endDate = new Date(Date.now() + 60 * 60 * 1000);
        
        if (reservationData && reservationData.startDate) {
          startDate = new Date(reservationData.startDate);
          endDate = new Date(startDate.getTime() + (reservationData.duration || 60) * 60 * 1000);
        }
        
        // Crear la reserva con los datos correctos
        const newBooking = new Booking({
          userId: userId,
          userEmail: bookingUser.email,
          userName: bookingUser.name || bookingUser.email,
          type: reservationData?.type || 'advisory',
          serviceType: serviceType,
          startDate: startDate,
          endDate: endDate,
          duration: reservationData?.duration || 60,
          status: 'confirmed',
          price: amount,
          paymentStatus: 'paid',
          notes: reservationData?.notes || `Reserva creada automáticamente después del pago exitoso - Transaction ID: ${paymentInfo.id}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newBooking.save();
        
        console.log('✅ Reserva creada y confirmada después del pago:', {
          bookingId: newBooking._id,
          user: bookingUser.email,
          serviceType: serviceType,
          startDate: startDate,
          endDate: endDate,
          amount: amount,
          transactionId: paymentInfo.id
        });
        
        // Si es una reserva de asesoría, marcar la fecha como reservada
        if (serviceType === 'ConsultorioFinanciero') {
          try {
            // Importar el modelo AdvisoryDate
            const { default: AdvisoryDate } = await import('@/models/AdvisoryDate');
            
            // Buscar la fecha de asesoría que coincida con la fecha de inicio
            const advisoryDate = await AdvisoryDate.findOne({
              advisoryType: 'ConsultorioFinanciero',
              date: {
                $gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
                $lt: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
              },
              time: `${startDate.getHours()}:${String(startDate.getMinutes()).padStart(2, '0')}`,
              isBooked: false
            });
            
            if (advisoryDate) {
              advisoryDate.isBooked = true;
              advisoryDate.confirmedBooking = true; // Marcar como confirmada por pago
              advisoryDate.tempReservationTimestamp = undefined; // Limpiar datos temporales
              advisoryDate.tempReservationExpiresAt = undefined;
              await advisoryDate.save();
              console.log('✅ Fecha de asesoría marcada como reservada confirmada:', advisoryDate._id);
            } else {
              console.log('⚠️ No se encontró fecha de asesoría para marcar como reservada');
            }
          } catch (advisoryError) {
            console.error('❌ Error marcando fecha de asesoría como reservada:', advisoryError);
          }
        }
        
        // Crear evento en Google Calendar
        try {
          console.log('📅 Intentando crear evento en Google Calendar...');
          console.log('📅 Datos del evento:', {
            userEmail: bookingUser.email,
            serviceType: serviceType,
            startDate: startDate.toISOString(),
            duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
          });
          
          const { createAdvisoryEvent } = await import('@/lib/googleCalendar');
          console.log('✅ Función createAdvisoryEvent importada correctamente');
          
          const eventResult = await createAdvisoryEvent(
            bookingUser.email,
            serviceType,
            startDate,
            Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
          );
          
          console.log('📅 Resultado de createAdvisoryEvent:', eventResult);
          
          if (eventResult.success) {
            console.log('✅ Evento creado en Google Calendar:', eventResult.eventId);
            
            // Actualizar la reserva con el ID del evento
            newBooking.googleCalendarEventId = eventResult.eventId;
            await newBooking.save();
            console.log('✅ Reserva actualizada con ID del evento de Google Calendar');
          } else {
            console.error('❌ Error creando evento en Google Calendar:', eventResult.error);
          }
        } catch (calendarError: any) {
          console.error('❌ Error creando evento en Google Calendar:', calendarError);
          console.error('🔍 Stack trace del error:', calendarError.stack);
        }
        
        // Enviar email de confirmación
        try {
          console.log('📧 Intentando enviar email de confirmación...');
          console.log('📧 Datos del email:', {
            userEmail: bookingUser.email,
            userName: bookingUser.name || bookingUser.email,
            serviceType: serviceType,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            amount: amount
          });
          
          const { sendBookingConfirmationEmail } = await import('@/lib/emailNotifications');
          console.log('✅ Función sendBookingConfirmationEmail importada correctamente');
          
          await sendBookingConfirmationEmail(
            bookingUser.email,
            bookingUser.name || bookingUser.email,
            serviceType,
            startDate,
            endDate,
            amount
          );
          
          console.log('✅ Email de confirmación enviado exitosamente a:', bookingUser.email);
        } catch (emailError: any) {
          console.error('❌ Error enviando email de confirmación:', emailError);
          console.error('🔍 Stack trace del error de email:', emailError.stack);
        }
        
      } catch (bookingError) {
        console.error('❌ Error creando reserva después del pago:', bookingError);
      }
    }

    // Actualizar estado del pago
    payment.status = 'approved';
    payment.updatedAt = new Date();
    await payment.save();

    console.log('✅ Pago procesado exitosamente:', paymentInfo.id);

  } catch (error) {
    console.error('❌ Error procesando pago exitoso:', error);
    throw error;
  }
}

/**
 * Procesa un pago rechazado
 */
async function processRejectedPayment(payment: any, paymentInfo: any) {
  try {
    // Actualizar estado del pago
    payment.status = 'rejected';
    payment.updatedAt = new Date();
    await payment.save();

    console.log('❌ Pago rechazado procesado:', {
      paymentId: paymentInfo.id,
      reason: paymentInfo.status_detail
    });

  } catch (error) {
    console.error('❌ Error procesando pago rechazado:', error);
    throw error;
  }
} 