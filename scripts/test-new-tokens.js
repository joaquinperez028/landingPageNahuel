const { google } = require('googleapis');

console.log('🧪 PROBANDO NUEVOS TOKENS DE JOAQUINPEREZ028@GMAIL.COM');
console.log('=' .repeat(60));

// Configurar cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);

// Configurar tokens (los que acabas de generar)
oauth2Client.setCredentials({
  access_token: process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.ADMIN_GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

async function testTokens() {
  try {
    console.log('🔑 Probando tokens...');
    
    // 1. Listar todos los calendarios disponibles
    console.log('\n📋 LISTANDO CALENDARIOS DISPONIBLES:');
    const calendarList = await calendar.calendarList.list();
    
    console.log(`✅ Encontrados ${calendarList.data.items.length} calendarios:`);
    calendarList.data.items.forEach((cal, index) => {
      console.log(`${index + 1}. ID: ${cal.id}`);
      console.log(`   Nombre: ${cal.summary}`);
      console.log(`   Acceso: ${cal.accessRole}`);
      console.log(`   Primary: ${cal.primary || false}`);
      console.log('');
    });

    // 2. Probar acceso específico a joaquinperez028@gmail.com
    console.log('🎯 PROBANDO ACCESO A joaquinperez028@gmail.com:');
    try {
      const specificCalendar = await calendar.calendars.get({
        calendarId: 'joaquinperez028@gmail.com'
      });
      console.log('✅ ÉXITO: Acceso directo a joaquinperez028@gmail.com');
      console.log(`   Nombre: ${specificCalendar.data.summary}`);
      console.log(`   Timezone: ${specificCalendar.data.timeZone}`);
    } catch (error) {
      console.log('❌ ERROR: No se puede acceder a joaquinperez028@gmail.com');
      console.log(`   Código: ${error.code}`);
      console.log(`   Mensaje: ${error.message}`);
    }

    // 3. Probar acceso al calendario primary
    console.log('\n🏠 PROBANDO ACCESO AL CALENDARIO PRIMARY:');
    try {
      const primaryCalendar = await calendar.calendars.get({
        calendarId: 'primary'
      });
      console.log('✅ ÉXITO: Acceso al calendario primary');
      console.log(`   ID real: ${primaryCalendar.data.id}`);
      console.log(`   Nombre: ${primaryCalendar.data.summary}`);
      console.log(`   Timezone: ${primaryCalendar.data.timeZone}`);
    } catch (error) {
      console.log('❌ ERROR: No se puede acceder al primary');
      console.log(`   Código: ${error.code}`);
      console.log(`   Mensaje: ${error.message}`);
    }

    // 4. Crear evento de prueba
    console.log('\n🧪 CREANDO EVENTO DE PRUEBA:');
    const testEvent = {
      summary: 'PRUEBA - Verificación de tokens',
      description: 'Evento de prueba para verificar que los tokens funcionan correctamente',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
        timeZone: 'America/Montevideo'
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Mañana + 1 hora
        timeZone: 'America/Montevideo'
      }
    };

    try {
      const createdEvent = await calendar.events.insert({
        calendarId: 'primary',
        resource: testEvent
      });
      console.log('✅ ÉXITO: Evento de prueba creado');
      console.log(`   ID: ${createdEvent.data.id}`);
      console.log(`   Link: ${createdEvent.data.htmlLink}`);
      
      // Eliminar el evento de prueba
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: createdEvent.data.id
      });
      console.log('🗑️ Evento de prueba eliminado');
    } catch (error) {
      console.log('❌ ERROR: No se pudo crear evento de prueba');
      console.log(`   Código: ${error.code}`);
      console.log(`   Mensaje: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ ERROR GENERAL:', error.message);
  }
}

console.log('🚀 Iniciando pruebas...\n');
testTokens(); 