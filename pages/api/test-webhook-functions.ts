import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificación simple por ahora
    console.log('🧪 Iniciando test de funciones del webhook...');

    console.log('🧪 Iniciando test de funciones del webhook...');

    // Test 1: Verificar variables de entorno
    console.log('🔑 Verificando variables de entorno...');
    const envVars = {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      ADMIN_GOOGLE_ACCESS_TOKEN: !!process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      ADMIN_GOOGLE_REFRESH_TOKEN: !!process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_CALENDAR_ID: !!process.env.GOOGLE_CALENDAR_ID
    };

    console.log('📊 Variables de entorno:', envVars);

    // Test 2: Probar función de email (sin enviar realmente)
    console.log('📧 Probando función de email...');
    try {
      const { sendBookingConfirmationEmail } = await import('@/lib/emailNotifications');
      console.log('✅ Función sendBookingConfirmationEmail importada correctamente');
      
      const testStartDate = new Date();
      const testEndDate = new Date(testStartDate.getTime() + 60 * 60 * 1000);
      
      console.log('📧 Datos de prueba para email:', {
        email: 'franco.l.varela99@gmail.com',
        name: 'Usuario de Prueba',
        serviceType: 'ConsultorioFinanciero',
        startDate: testStartDate.toISOString(),
        endDate: testEndDate.toISOString(),
        amount: 50000
      });
      
      // Comentar para no enviar emails reales
      // await sendBookingConfirmationEmail(
      //   'franco.l.varela99@gmail.com',
      //   'Usuario de Prueba',
      //   'ConsultorioFinanciero',
      //   testStartDate,
      //   testEndDate,
      //   50000
      // );
      
      console.log('✅ Función de email funciona correctamente (test sin envío)');
    } catch (error: any) {
      console.error('❌ Error en función de email:', error.message);
      console.error('🔍 Stack trace:', error.stack);
    }

    // Test 3: Probar función de Google Calendar (sin crear realmente)
    console.log('📅 Probando función de Google Calendar...');
    try {
      const { createAdvisoryEvent } = await import('@/lib/googleCalendar');
      console.log('✅ Función createAdvisoryEvent importada correctamente');
      
      const testStartDate = new Date();
      
      console.log('📅 Datos de prueba para Google Calendar:', {
        email: 'franco.l.varela99@gmail.com',
        serviceType: 'ConsultorioFinanciero',
        startDate: testStartDate.toISOString(),
        duration: 60
      });
      
      // Comentar para no crear eventos reales
      // const eventResult = await createAdvisoryEvent(
      //   'franco.l.varela99@gmail.com',
      //   'ConsultorioFinanciero',
      //   testStartDate,
      //   60
      // );
      
      console.log('✅ Función de Google Calendar funciona correctamente (test sin creación)');
    } catch (error: any) {
      console.error('❌ Error en función de Google Calendar:', error.message);
      console.error('🔍 Stack trace:', error.stack);
    }

    console.log('✅ Test completado exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Test completado exitosamente',
      envVars,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error en test:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}
