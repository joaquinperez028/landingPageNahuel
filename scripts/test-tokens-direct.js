const { google } = require('googleapis');

console.log('🧪 PROBANDO TOKENS DIRECTAMENTE');
console.log('=' .repeat(50));

// Usar los tokens directamente (los que obtuviste del OAuth Playground)
const ACCESS_TOKEN = 'ya29.a0AW4XtxjzHPG7a4uqPlKzcFrchrgIiNmOydj5zh-5qOny6ST6v9BWmiGgOtlhnvLyJN5O8G5DxW06aMAb341ubnCJ1jp_tmPyJkoVWH3Zcmb6RYDtPkHonfpt8Pzt610qavaVI3hpGREwmtiMWo9GdvHHht5bRi8Q6geR2ceEaCgYKAdQSARYSFQHGX2MiiAl9aEY7K9DvHVWi732Zwg0175';
const REFRESH_TOKEN = '1//04KfS0a4p3xHaCgYIARAAGAQSNwF-L9IrDbeYTXN4S4V74C5afuUT8dIji7VQV-8gcIgJta0vP01Na8dh3NwxJhGrbfcgGdSLLZ8';

// Configurar cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  '543877130645-56odc6i9t4oh1p14lfb0khbju43qnb8c.apps.googleusercontent.com',
  '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',
  'urn:ietf:wg:oauth:2.0:oob'
);

// Configurar tokens
oauth2Client.setCredentials({
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

async function testTokens() {
  try {
    console.log('🔑 Probando tokens con cuenta joaquinperez028@gmail.com...');
    
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

    // 2. Identificar cuál es el calendario primary real
    const primaryCalendar = calendarList.data.items.find(cal => cal.primary);
    if (primaryCalendar) {
      console.log('🏠 CALENDARIO PRIMARY IDENTIFICADO:');
      console.log(`   ID: ${primaryCalendar.id}`);
      console.log(`   Nombre: ${primaryCalendar.summary}`);
      console.log('');
    }

    // 3. Probar acceso específico a joaquinperez028@gmail.com
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
      
      // Si no puede acceder directamente, verificar si está en la lista
      const foundInList = calendarList.data.items.find(cal => 
        cal.id === 'joaquinperez028@gmail.com' || 
        cal.id.includes('joaquinperez028')
      );
      
      if (foundInList) {
        console.log('✅ PERO SÍ está en la lista de calendarios:');
        console.log(`   ID: ${foundInList.id}`);
        console.log(`   Nombre: ${foundInList.summary}`);
      } else {
        console.log('❌ Tampoco está en la lista de calendarios disponibles');
      }
    }

    // 4. Crear evento de prueba en primary
    console.log('\n🧪 CREANDO EVENTO DE PRUEBA EN PRIMARY:');
    const testEvent = {
      summary: 'PRUEBA - Tokens joaquinperez028@gmail.com',
      description: 'Evento de prueba para verificar que los tokens de joaquinperez028@gmail.com funcionan',
      start: {
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // En 1 hora
        timeZone: 'America/Montevideo'
      },
      end: {
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // En 2 horas
        timeZone: 'America/Montevideo'
      }
    };

    try {
      const createdEvent = await calendar.events.insert({
        calendarId: 'primary',
        resource: testEvent
      });
      console.log('✅ ÉXITO: Evento de prueba creado en primary');
      console.log(`   ID: ${createdEvent.data.id}`);
      console.log(`   Link: ${createdEvent.data.htmlLink}`);
      console.log(`   ⚠️ Verifica en qué calendario apareció este evento`);
      
      // NO eliminar automáticamente para que puedas verificar
      console.log('📝 Evento dejado para verificación manual');
    } catch (error) {
      console.log('❌ ERROR: No se pudo crear evento de prueba');
      console.log(`   Código: ${error.code}`);
      console.log(`   Mensaje: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ ERROR GENERAL:', error.message);
    if (error.code) {
      console.error(`   Código: ${error.code}`);
    }
  }
}

console.log('🚀 Iniciando pruebas...\n');
testTokens(); 