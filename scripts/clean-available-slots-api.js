const https = require('https');
const http = require('http');

// Función para hacer petición HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function cleanAvailableSlots() {
  try {
    console.log('🧹 Iniciando limpieza de horarios disponibles...');
    
    // Primero, obtener los horarios actuales para mostrar qué se va a eliminar
    console.log('📋 Obteniendo horarios actuales...');
    const currentSlots = await makeRequest('http://localhost:3000/api/turnos/available-slots?serviceType=ConsultorioFinanciero');
    
    if (currentSlots.status === 200 && currentSlots.data.success) {
      console.log(`📊 Horarios encontrados: ${currentSlots.data.total}`);
      console.log('📅 Fechas disponibles:');
      currentSlots.data.turnos.forEach((turno, index) => {
        console.log(`  ${index + 1}. ${turno.fecha} - ${turno.horarios.join(', ')} (${turno.disponibles} disponibles)`);
      });
    } else {
      console.log('❌ No se pudieron obtener los horarios actuales');
      return;
    }
    
    console.log('\n⚠️  ADVERTENCIA: Esto eliminará TODOS los horarios disponibles');
    console.log('¿Estás seguro de que quieres continuar? (Ctrl+C para cancelar)');
    
    // Esperar 5 segundos para dar tiempo a cancelar
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Crear un endpoint temporal para limpiar los datos
    console.log('🗑️  Eliminando horarios...');
    
    // Por ahora, vamos a crear un script que puedas ejecutar manualmente
    console.log('\n📝 Para limpiar la base de datos, ejecuta este comando en MongoDB:');
    console.log('db.availableslots.deleteMany({})');
    console.log('\nO si prefieres, puedes usar MongoDB Compass y eliminar la colección completa.');
    
    console.log('\n✅ Instrucciones de limpieza mostradas');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar la función
cleanAvailableSlots()
  .then(() => {
    console.log('🎯 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 