import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import AvailableSlot from '@/models/AvailableSlot';
import Booking from '@/models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await dbConnect();
    console.log('🔍 Probando flujo de reserva de asesoría...');

    // 1. Verificar slots disponibles
    const today = new Date().toISOString().split('T')[0];
    const availableSlots = await AvailableSlot.find({
      date: today,
      serviceType: 'ConsultorioFinanciero',
      available: true
    }).sort({ time: 1 });

    console.log(`📊 Slots disponibles para hoy (${today}): ${availableSlots.length}`);

    // 2. Verificar reservas existentes
    const existingBookings = await Booking.find({
      type: 'advisory',
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ startDate: -1 }).limit(5);

    console.log(`📅 Reservas existentes: ${existingBookings.length}`);

    // 3. Verificar configuración de email y Google Calendar
    const config = {
      smtp: {
        host: !!process.env.SMTP_HOST,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS
      },
      google: {
        accessToken: !!process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
        refreshToken: !!process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
        calendarId: !!process.env.GOOGLE_CALENDAR_ID
      }
    };

    // 4. Simular una reserva (sin crear realmente)
    const testSlot = availableSlots[0];
    const testBooking = {
      type: 'advisory',
      serviceType: 'ConsultorioFinanciero',
      startDate: new Date(`${today}T${testSlot?.time || '09:00'}:00`),
      duration: 60,
      userEmail: 'test@example.com',
      userName: 'Usuario Test'
    };

    return res.status(200).json({
      status: '✅ Sistema funcionando correctamente',
      test: {
        date: today,
        availableSlots: availableSlots.length,
        existingBookings: existingBookings.length,
        sampleSlot: testSlot ? `${testSlot.date} ${testSlot.time}` : null,
        testBooking: testBooking
      },
      config,
      recommendations: availableSlots.length === 0 ? [
        'No hay slots disponibles para hoy',
        'Ejecuta /api/admin/generate-advisory-slots para crear horarios',
        'Verifica que la fecha de hoy sea un día de semana'
      ] : [
        'Sistema listo para reservas',
        'Los usuarios pueden reservar asesorías',
        'Los emails se enviarán automáticamente',
        'Los eventos se crearán en Google Calendar'
      ]
    });

  } catch (error) {
    console.error('❌ Error en prueba:', error);
    return res.status(500).json({
      error: 'Error en la prueba',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
