const { google } = require('googleapis');
const readline = require('readline');

// Configuración - usando tus credenciales reales
const CLIENT_ID = '543877130645-b6f4m21qsli0qcim6bbeocu3ak76rnn5.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://lozanonahuel.vercel.app/api/auth/callback/google';

// Scopes correctos para Google Calendar API
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

async function getTokens() {
  console.log('🔧 Script para obtener tokens de Google Calendar del Admin');
  console.log('📧 Admin: joaquinperez028@gmail.com\n');

  // Paso 1: Generar URL de autorización
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Fuerza a mostrar la pantalla de consentimiento
  });

  console.log('📋 PASO 1: Autorizar la aplicación');
  console.log('Ve a esta URL y autoriza la aplicación:');
  console.log('\n' + authUrl + '\n');
  console.log('⚠️  IMPORTANTE: Inicia sesión con joaquinperez028@gmail.com');
  console.log('📝 Busca "Google Calendar API" en la lista de APIs');

  // Paso 2: Obtener código de autorización
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('📝 PASO 2: Pega el código de autorización aquí: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  try {
    // Paso 3: Intercambiar código por tokens
    console.log('\n🔄 PASO 3: Intercambiando código por tokens...');
    const { tokens } = await oauth2Client.getToken(code);

    console.log('\n✅ ¡Tokens obtenidos exitosamente!');
    console.log('\n📋 Agrega estas variables a tu .env.local en Vercel:');
    console.log('=====================================');
    console.log(`ADMIN_GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`ADMIN_GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('=====================================\n');

    console.log('💡 Notas importantes:');
    console.log('- El access_token expira en 1 hora');
    console.log('- El refresh_token se usa para obtener nuevos access_tokens');
    console.log('- Agrega estas variables en Vercel Dashboard > Settings > Environment Variables');
    console.log('- Solo el admin (joaquinperez028@gmail.com) necesita estos permisos\n');

    console.log('🚀 Próximos pasos:');
    console.log('1. Agrega las variables en Vercel');
    console.log('2. Redeploya tu aplicación');
    console.log('3. Prueba hacer una reserva para verificar que funciona\n');

  } catch (error) {
    console.error('❌ Error al obtener tokens:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('- Verifica que el código esté completo');
    console.log('- Asegúrate de haber autorizado con joaquinperez028@gmail.com');
    console.log('- Verifica que Google Calendar API esté habilitada en tu proyecto');
    console.log('- Intenta generar un nuevo código\n');
  }
}

console.log('🎯 Generador de Tokens de Google Calendar para Admin');
console.log('📧 Cuenta de admin: joaquinperez028@gmail.com');
console.log('🔑 Client ID configurado: ...rnn5.apps.googleusercontent.com');
console.log('📅 Scopes: Google Calendar API\n');

getTokens(); 