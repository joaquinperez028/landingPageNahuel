const { google } = require('googleapis');
const readline = require('readline');

// Configuración - usando tus credenciales reales
const CLIENT_ID = '543877130645-56odc6i9t4oh1p14lfb0khbju43qnb8c.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://lozanonahuel.vercel.app/api/auth/callback/google';

// Scopes específicos para Google Calendar API
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

async function generateTokensForJoaquin() {
  console.log('🎯 GENERAR TOKENS ESPECÍFICAMENTE PARA joaquinperez028@gmail.com');
  console.log('=' .repeat(70));
  console.log('📧 Cuenta objetivo: joaquinperez028@gmail.com');
  console.log('🔑 Scopes: Google Calendar API');
  console.log('');

  // Paso 1: Generar URL de autorización
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Fuerza a mostrar la pantalla de consentimiento
    login_hint: 'joaquinperez028@gmail.com' // Sugerirá esta cuenta específica
  });

  console.log('📋 PASO 1: Autorizar la aplicación');
  console.log('Ve a esta URL y autoriza la aplicación:');
  console.log('');
  console.log('🔗 ' + authUrl);
  console.log('');
  console.log('⚠️  CRÍTICO: ASEGÚRATE DE:');
  console.log('1. ✅ Iniciar sesión ESPECÍFICAMENTE con: joaquinperez028@gmail.com');
  console.log('2. ✅ NO usar otra cuenta de Google');
  console.log('3. ✅ Autorizar TODOS los permisos de Calendar');
  console.log('4. ✅ El navegador te redirigirá a tu sitio web');
  console.log('5. ✅ Copiar el "code" que aparece en la URL después de autorizar');
  console.log('');
  console.log('💡 Ejemplo de URL final:');
  console.log('https://lozanonahuel.vercel.app/api/auth/callback/google?code=ESTE_ES_EL_CODIGO&scope=...');
  console.log('');

  // Paso 2: Obtener código de autorización
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('📝 PASO 2: Pega SOLO el código de autorización aquí: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!code) {
    console.log('❌ Error: No se proporcionó código de autorización');
    return;
  }

  console.log('🔄 Intercambiando código por tokens...');

  try {
    // Paso 3: Intercambiar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n🎉 ¡TOKENS GENERADOS EXITOSAMENTE!');
    console.log('=' .repeat(50));
    
    // Verificar que los tokens funcionen
    oauth2Client.setCredentials(tokens);
    
    // Probar acceso a Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();
    
    console.log('✅ Tokens verificados - Acceso a Calendar API exitoso');
    console.log(`✅ Calendarios accesibles: ${calendarList.data.items?.length || 0}`);
    
    // Buscar el calendario de joaquinperez028@gmail.com
    const joaquinCalendar = calendarList.data.items?.find(
      cal => cal.id === 'joaquinperez028@gmail.com' || cal.primary
    );
    
    if (joaquinCalendar) {
      console.log(`✅ Calendario encontrado: ${joaquinCalendar.summary} (${joaquinCalendar.id})`);
      if (joaquinCalendar.id === 'joaquinperez028@gmail.com') {
        console.log('🎯 ¡PERFECTO! Acceso directo a joaquinperez028@gmail.com');
      } else {
        console.log(`🎯 Calendario principal: ${joaquinCalendar.id}`);
      }
    }
    
    console.log('\n📋 VARIABLES PARA VERCEL:');
    console.log('=' .repeat(30));
    console.log(`ADMIN_GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`ADMIN_GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    
    console.log('\n🔧 PASOS SIGUIENTES:');
    console.log('1. Copiar las variables de arriba');
    console.log('2. Actualizar en Vercel Environment Variables');
    console.log('3. Redeploy la aplicación');
    console.log('4. Probar una nueva reserva');
    
    // Opcional: Crear un evento de prueba
    console.log('\n🧪 ¿Quieres crear un evento de prueba? (s/n)');
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const testEvent = await new Promise((resolve) => {
      rl2.question('Respuesta: ', (answer) => {
        rl2.close();
        resolve(answer.toLowerCase().trim() === 's');
      });
    });

    if (testEvent) {
      console.log('\n🧪 Creando evento de prueba...');
      
      const testDate = new Date();
      testDate.setHours(testDate.getHours() + 1);
      const endDate = new Date(testDate.getTime() + 60 * 60000);

      const event = {
        summary: `[PRUEBA] Tokens joaquinperez028@gmail.com - ${new Date().toLocaleString()}`,
        description: 'Evento de prueba para verificar tokens. Puede eliminarse.',
        start: {
          dateTime: testDate.toISOString(),
          timeZone: 'America/Montevideo',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'America/Montevideo',
        }
      };

      const calendarId = joaquinCalendar?.id || 'primary';
      const response = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      console.log('✅ Evento de prueba creado exitosamente!');
      console.log(`🔗 ID: ${response.data.id}`);
      console.log(`🔗 URL: ${response.data.htmlLink}`);
      console.log(`📅 Calendario: ${calendarId}`);
    }

  } catch (error) {
    console.error('\n❌ ERROR al generar tokens:', error.message);
    if (error.code === 'invalid_grant') {
      console.log('💡 El código expiró o es inválido. Intenta de nuevo.');
    }
  }

  console.log('\n' + '=' .repeat(70));
  console.log('🏁 Proceso completado');
}

// Ejecutar
generateTokensForJoaquin().catch(console.error); 