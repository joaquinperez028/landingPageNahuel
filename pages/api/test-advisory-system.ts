import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import AdvisoryDate from '@/models/AdvisoryDate';
import Booking from '@/models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await dbConnect();
    console.log('🔍 Probando sistema completo de asesorías...');

    // 1. Verificar fechas de asesoría disponibles
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const advisoryDates = await AdvisoryDate.find({
      date: { $gte: today },
      advisoryType: 'ConsultorioFinanciero',
      isActive: true,
      isBooked: false
    }).sort({ date: 1, time: 1 });

    console.log(`📊 Fechas de asesoría disponibles: ${advisoryDates.length}`);

    // 2. Verificar reservas existentes
    const existingBookings = await Booking.find({
      type: 'advisory',
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ startDate: -1 }).limit(10);

    console.log(`📅 Reservas de asesoría existentes: ${existingBookings.length}`);

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

    // 4. Crear una fecha de prueba si no hay ninguna
    let testDate = null;
    if (advisoryDates.length === 0) {
      console.log('📝 Creando fecha de prueba...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0); // 10:00 AM
      
      testDate = new AdvisoryDate({
        advisoryType: 'ConsultorioFinanciero',
        date: tomorrow,
        time: '10:00',
        title: 'Consultorio de Prueba',
        description: 'Fecha creada automáticamente para pruebas',
        isActive: true,
        isBooked: false,
        createdBy: 'system@test.com'
      });
      
      await testDate.save();
      console.log('✅ Fecha de prueba creada:', testDate._id);
    }

    return res.status(200).json({
      status: '✅ Sistema funcionando correctamente',
      test: {
        date: today.toISOString().split('T')[0],
        availableAdvisoryDates: advisoryDates.length,
        existingBookings: existingBookings.length,
        sampleDate: advisoryDates[0] ? {
          id: advisoryDates[0]._id,
          date: advisoryDates[0].date,
          time: advisoryDates[0].time,
          title: advisoryDates[0].title
        } : null,
        testDateCreated: testDate ? {
          id: testDate._id,
          date: testDate.date,
          time: testDate.time
        } : null
      },
      config,
      recommendations: [
        advisoryDates.length === 0 ? 'No hay fechas disponibles - crea fechas desde /admin/asesorias-fechas' : 'Sistema listo para reservas',
        'Verifica que las fechas estén en el futuro',
        'Asegúrate de que las fechas no estén marcadas como reservadas'
      ]
    });

  } catch (error) {
    console.error('❌ Error en prueba del sistema:', error);
    return res.status(500).json({
      status: '❌ Error en el sistema',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
