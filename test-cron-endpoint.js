// Script de prueba para el endpoint de cron job
// Ejecutar con: node test-cron-endpoint.js

const https = require('https');

// Configuración
const DOMAIN = 'lozanonahuel.vercel.app'; // Cambiar por tu dominio
const CRON_SECRET_TOKEN = 'cron_mp_2024_xyz_789_abc_def_ghi_jkl_mno_pqr_stu_vwx_yz'; // Token real configurado en Vercel

// Función para hacer la petición POST
function testCronEndpoint() {
  const postData = JSON.stringify({});
  
  const options = {
    hostname: DOMAIN,
    port: 443,
    path: '/api/cron/subscription-notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CRON_SECRET_TOKEN}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🔄 Probando endpoint de cron job...');
  console.log(`📍 URL: https://${DOMAIN}/api/cron/subscription-notifications`);
  console.log(`🔑 Token: ${CRON_SECRET_TOKEN}`);
  console.log('⏳ Enviando petición...\n');

  const req = https.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📄 Respuesta:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n✅ ¡Éxito! El endpoint está funcionando correctamente.');
        } else {
          console.log('\n❌ Error: El endpoint devolvió un status code diferente a 200.');
        }
      } catch (e) {
        console.log('📄 Respuesta (texto):', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error en la petición:', e.message);
  });

  req.write(postData);
  req.end();
}

// Función para probar sin token (debería fallar)
function testWithoutToken() {
  const postData = JSON.stringify({});
  
  const options = {
    hostname: DOMAIN,
    port: 443,
    path: '/api/cron/subscription-notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('\n🔒 Probando sin token (debería fallar)...\n');

  const req = https.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 401) {
        console.log('✅ Correcto: Sin token devuelve 401 Unauthorized');
      } else {
        console.log('❌ Error: Sin token debería devolver 401');
      }
      console.log('📄 Respuesta:', data);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error en la petición:', e.message);
  });

  req.write(postData);
  req.end();
}

// Ejecutar pruebas
console.log('🧪 TESTING CRON JOB ENDPOINT');
console.log('================================\n');

testCronEndpoint();

// Esperar 3 segundos y probar sin token
setTimeout(() => {
  testWithoutToken();
}, 3000);

console.log('\n💡 Instrucciones:');
console.log('1. Asegúrate de que CRON_SECRET_TOKEN esté configurado en Vercel');
console.log('2. El endpoint debe devolver status 200 con token válido');
console.log('3. El endpoint debe devolver status 401 sin token');
console.log('4. Revisa los logs en Vercel Dashboard → Functions → Functions Logs');
