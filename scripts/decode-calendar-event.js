const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function decodeEventLink() {
  console.log('🔍 ANALIZANDO DÓNDE SE ESTÁN CREANDO LOS EVENTOS');
  console.log('=' .repeat(60));

  // Link del evento más reciente del log
  const eventLink = 'https://www.google.com/calendar/event?eid=MnZ1amtmb2llcDZyMzFwcTVndTRrNmpiZWMgZnJhbmNvLmwudmFyZWxhOTlAbQ';
  const eventId = '2vujkfoiep6r31pq5gu4k6jbec';

  console.log(`🔗 Link del evento: ${eventLink}`);
  console.log(`🆔 Event ID: ${eventId}`);

  try {
    // Configurar OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://lozanonahuel.vercel.app/api/auth/callback/google'
    );

    // Configurar credenciales
    oauth2Client.setCredentials({
      access_token: process.env.ADMIN_GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
    });

    console.log('\n✅ Tokens configurados');

    // Crear cliente de Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 1. Listar todos los calendarios disponibles
    console.log('\n📋 CALENDARIOS DISPONIBLES:');
    const calendarList = await calendar.calendarList.list();
    
    if (calendarList.data.items) {
      calendarList.data.items.forEach((cal, index) => {
        console.log(`${index + 1}. 📅 ${cal.summary || 'Sin nombre'}`);
        console.log(`   🆔 ID: ${cal.id}`);
        console.log(`   👤 Primary: ${cal.primary ? 'SÍ' : 'NO'}`);
        console.log(`   🔑 Access Role: ${cal.accessRole}`);
        if (cal.primary) {
          console.log('   ⭐ ESTE ES EL CALENDARIO PRINCIPAL');
        }
        console.log('');
      });
    }

    // 2. Buscar el evento en todos los calendarios
    console.log('\n🔍 BUSCANDO EL EVENTO EN TODOS LOS CALENDARIOS:');
    
    let foundEvent = null;
    let foundCalendar = null;

    for (const cal of calendarList.data.items) {
      try {
        console.log(`🧪 Buscando en calendario: ${cal.summary} (${cal.id})`);
        
        const event = await calendar.events.get({
          calendarId: cal.id,
          eventId: eventId
        });

        if (event.data) {
          foundEvent = event.data;
          foundCalendar = cal;
          console.log(`✅ ¡EVENTO ENCONTRADO en: ${cal.summary} (${cal.id})!`);
          break;
        }
      } catch (error) {
        // Continuar buscando en otros calendarios
        console.log(`❌ No encontrado en: ${cal.summary}`);
      }
    }

    if (foundEvent && foundCalendar) {
      console.log('\n🎯 RESULTADO DEL ANÁLISIS:');
      console.log('=' .repeat(40));
      console.log(`📅 El evento SE ESTÁ CREANDO en: ${foundCalendar.summary}`);
      console.log(`🆔 Calendar ID real: ${foundCalendar.id}`);
      console.log(`👤 Es el calendario principal: ${foundCalendar.primary ? 'SÍ' : 'NO'}`);
      console.log(`🔑 Nivel de acceso: ${foundCalendar.accessRole}`);
      
      console.log('\n📋 Detalles del evento:');
      console.log(`   📝 Título: ${foundEvent.summary}`);
      console.log(`   📅 Fecha: ${foundEvent.start?.dateTime || foundEvent.start?.date}`);
      console.log(`   👥 Organizador: ${foundEvent.organizer?.email}`);
      console.log(`   🔗 Link: ${foundEvent.htmlLink}`);

      console.log('\n💡 CONCLUSIÓN:');
      if (foundCalendar.id === 'joaquinperez028@gmail.com') {
        console.log('✅ Los eventos SÍ se están creando en joaquinperez028@gmail.com');
      } else {
        console.log(`❌ Los eventos se están creando en: ${foundCalendar.id}`);
        console.log(`❌ NO en joaquinperez028@gmail.com como esperabas`);
        console.log('\n🔧 NECESITAS:');
        console.log('1. Regenerar tokens específicamente con joaquinperez028@gmail.com');
        console.log(`2. O cambiar GOOGLE_CALENDAR_ID a: ${foundCalendar.id}`);
      }
    } else {
      console.log('❌ No se pudo encontrar el evento en ningún calendario');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Análisis completado');
}

// Ejecutar
decodeEventLink().catch(console.error); 