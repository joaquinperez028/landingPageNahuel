const { MongoClient } = require('mongodb');
require('dotenv').config();

async function diagnoseBookingIssues() {
  console.log('🔍 Diagnóstico de problemas con reservas de asesorías\n');

  // 1. Verificar variables de entorno
  console.log('📋 1. Verificando variables de entorno...');
  
  const requiredEnvVars = {
    'MONGODB_URI': process.env.MONGODB_URI,
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
    'ADMIN_GOOGLE_ACCESS_TOKEN': process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
    'ADMIN_GOOGLE_REFRESH_TOKEN': process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
    'GOOGLE_CALENDAR_ID': process.env.GOOGLE_CALENDAR_ID,
    'SMTP_HOST': process.env.SMTP_HOST,
    'SMTP_PORT': process.env.SMTP_PORT,
    'SMTP_USER': process.env.SMTP_USER,
    'SMTP_PASS': process.env.SMTP_PASS,
    'ADMIN_EMAIL': process.env.ADMIN_EMAIL
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.log('❌ Variables faltantes:', missingVars);
  } else {
    console.log('✅ Todas las variables de entorno están configuradas');
  }

  // 2. Verificar conexión a MongoDB
  console.log('\n📊 2. Verificando conexión a MongoDB...');
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Conexión a MongoDB exitosa');
    
    const db = client.db();
    
    // 3. Verificar colecciones
    console.log('\n🗂️ 3. Verificando colecciones...');
    const collections = await db.listCollections().toArray();
    const requiredCollections = ['bookings', 'availableslots', 'users', 'advisoryschedules'];
    
    for (const collection of requiredCollections) {
      const exists = collections.some(col => col.name === collection);
      console.log(`${exists ? '✅' : '❌'} Colección ${collection}: ${exists ? 'existe' : 'NO existe'}`);
    }

    // 4. Verificar reservas existentes
    console.log('\n📅 4. Verificando reservas existentes...');
    const bookings = await db.collection('bookings').find({}).toArray();
    console.log(`📊 Total de reservas: ${bookings.length}`);
    
    if (bookings.length > 0) {
      const recentBookings = bookings.slice(-5);
      console.log('📋 Últimas 5 reservas:');
      recentBookings.forEach((booking, index) => {
        console.log(`  ${index + 1}. ${booking.type} - ${booking.userEmail} - ${booking.startDate} - Status: ${booking.status}`);
      });
    }

    // 5. Verificar slots disponibles
    console.log('\n⏰ 5. Verificando slots disponibles...');
    const availableSlots = await db.collection('availableslots').find({}).toArray();
    console.log(`📊 Total de slots: ${availableSlots.length}`);
    
    const availableCount = availableSlots.filter(slot => slot.available).length;
    const bookedCount = availableSlots.filter(slot => !slot.available).length;
    console.log(`✅ Slots disponibles: ${availableCount}`);
    console.log(`🔒 Slots reservados: ${bookedCount}`);

    // 6. Verificar horarios de asesoría
    console.log('\n📋 6. Verificando horarios de asesoría...');
    const advisorySchedules = await db.collection('advisoryschedules').find({}).toArray();
    console.log(`📊 Total de horarios de asesoría: ${advisorySchedules.length}`);

    await client.close();
  } catch (error) {
    console.log('❌ Error conectando a MongoDB:', error.message);
  }

  // 7. Verificar configuración de email
  console.log('\n📧 7. Verificando configuración de email...');
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('✅ Configuración SMTP básica presente');
    console.log(`📧 Host: ${process.env.SMTP_HOST}`);
    console.log(`📧 Usuario: ${process.env.SMTP_USER}`);
    console.log(`📧 Puerto: ${process.env.SMTP_PORT || '587'}`);
  } else {
    console.log('❌ Configuración SMTP incompleta');
  }

  // 8. Verificar configuración de Google Calendar
  console.log('\n📅 8. Verificando configuración de Google Calendar...');
  if (process.env.ADMIN_GOOGLE_ACCESS_TOKEN && process.env.ADMIN_GOOGLE_REFRESH_TOKEN) {
    console.log('✅ Tokens de Google Calendar configurados');
    console.log(`📅 Calendar ID: ${process.env.GOOGLE_CALENDAR_ID || 'primary'}`);
  } else {
    console.log('❌ Tokens de Google Calendar faltantes');
    console.log('💡 Necesitas configurar ADMIN_GOOGLE_ACCESS_TOKEN y ADMIN_GOOGLE_REFRESH_TOKEN');
  }

  console.log('\n🔍 Diagnóstico completado');
  console.log('\n📋 Resumen de problemas encontrados:');
  
  if (missingVars.length > 0) {
    console.log(`❌ Variables de entorno faltantes: ${missingVars.length}`);
  }
  
  if (!process.env.ADMIN_GOOGLE_ACCESS_TOKEN || !process.env.ADMIN_GOOGLE_REFRESH_TOKEN) {
    console.log('❌ Google Calendar no funcionará sin los tokens de admin');
  }
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Emails no se enviarán sin configuración SMTP');
  }
}

diagnoseBookingIssues().catch(console.error);
