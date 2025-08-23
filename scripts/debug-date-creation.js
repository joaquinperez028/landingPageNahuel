const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

// Extraer el nombre de la base de datos de la URI
let DB_NAME;
try {
  const uri = new URL(MONGODB_URI);
  DB_NAME = uri.pathname.substring(1).split('?')[0] || 'test';
} catch (error) {
  console.error('❌ Error al parsear MONGODB_URI:', error.message);
  process.exit(1);
}

console.log('🔍 DIAGNÓSTICO COMPLETO DE CREACIÓN DE FECHAS');
console.log('===============================================');
console.log(`📅 Zona horaria del sistema: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
console.log(`📅 Offset actual: ${new Date().getTimezoneOffset()} minutos`);
console.log(`📅 Hora actual local: ${new Date().toLocaleString('es-AR')}`);
console.log(`📅 Hora actual UTC: ${new Date().toISOString()}`);
console.log('');

async function debugDateCreation() {
  console.log('🧪 Iniciando diagnóstico de creación de fechas...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const advisoryCollection = db.collection('advisoryschedules');
    const availableCollection = db.collection('availableslots');
    
    // Limpiar colecciones para el test
    console.log('\n🧹 Limpiando colecciones para test limpio...');
    await advisoryCollection.deleteMany({});
    await availableCollection.deleteMany({});
    console.log('✅ Colecciones limpiadas');
    
    // Test con una fecha específica: 25 de octubre de 2025 (sábado)
    const testYear = 2025;
    const testMonth = 9; // Octubre (0-indexed)
    const testDay = 25;
    
    console.log('\n📅 TEST CON FECHA ESPECÍFICA: 25 de octubre de 2025 (sábado)');
    console.log('===============================================================');
    
    // MÉTODO 1: new Date(year, month, day) - Método actual
    console.log('\n🔍 MÉTODO 1: new Date(year, month, day)');
    console.log('----------------------------------------');
    const date1 = new Date(testYear, testMonth, testDay);
    console.log(`   - Componentes: año=${testYear}, mes=${testMonth + 1}, día=${testDay}`);
    console.log(`   - Fecha creada: ${date1}`);
    console.log(`   - Fecha ISO: ${date1.toISOString()}`);
    console.log(`   - Fecha local AR: ${date1.toLocaleString('es-AR')}`);
    console.log(`   - getTime(): ${date1.getTime()}`);
    console.log(`   - getUTCDate(): ${date1.getUTCDate()}`);
    console.log(`   - getDate(): ${date1.getDate()}`);
    
    // MÉTODO 2: new Date(Date.UTC(year, month, day))
    console.log('\n🔍 MÉTODO 2: new Date(Date.UTC(year, month, day))');
    console.log('------------------------------------------------');
    const date2 = new Date(Date.UTC(testYear, testMonth, testDay));
    console.log(`   - Componentes: año=${testYear}, mes=${testMonth + 1}, día=${testDay}`);
    console.log(`   - Fecha creada: ${date2}`);
    console.log(`   - Fecha ISO: ${date2.toISOString()}`);
    console.log(`   - Fecha local AR: ${date2.toLocaleString('es-AR')}`);
    console.log(`   - getTime(): ${date2.getTime()}`);
    console.log(`   - getUTCDate(): ${date2.getUTCDate()}`);
    console.log(`   - getDate(): ${date2.getDate()}`);
    
    // MÉTODO 3: new Date('YYYY-MM-DD')
    console.log('\n🔍 MÉTODO 3: new Date("YYYY-MM-DD")');
    console.log('-------------------------------------');
    const dateString = `${testYear}-${String(testMonth + 1).padStart(2, '0')}-${String(testDay).padStart(2, '0')}`;
    const date3 = new Date(dateString);
    console.log(`   - String: "${dateString}"`);
    console.log(`   - Fecha creada: ${date3}`);
    console.log(`   - Fecha ISO: ${date3.toISOString()}`);
    console.log(`   - Fecha local AR: ${date3.toLocaleString('es-AR')}`);
    console.log(`   - getTime(): ${date3.getTime()}`);
    console.log(`   - getUTCDate(): ${date3.getUTCDate()}`);
    console.log(`   - getDate(): ${date3.getDate()}`);
    
    // MÉTODO 4: new Date('YYYY-MM-DDTHH:MM:SS')
    console.log('\n🔍 MÉTODO 4: new Date("YYYY-MM-DDTHH:MM:SS")');
    console.log('-----------------------------------------------');
    const dateStringWithTime = `${dateString}T00:00:00`;
    const date4 = new Date(dateStringWithTime);
    console.log(`   - String: "${dateStringWithTime}"`);
    console.log(`   - Fecha creada: ${date4}`);
    console.log(`   - Fecha ISO: ${date4.toISOString()}`);
    console.log(`   - Fecha local AR: ${date4.toLocaleString('es-AR')}`);
    console.log(`   - getTime(): ${date4.getTime()}`);
    console.log(`   - getUTCDate(): ${date4.getUTCDate()}`);
    console.log(`   - getDate(): ${date4.getDate()}`);
    
    // MÉTODO 5: new Date('YYYY-MM-DDTHH:MM:SS.000Z')
    console.log('\n🔍 MÉTODO 5: new Date("YYYY-MM-DDTHH:MM:SS.000Z")');
    console.log('------------------------------------------------');
    const dateStringWithUTC = `${dateString}T00:00:00.000Z`;
    const date5 = new Date(dateStringWithUTC);
    console.log(`   - String: "${dateStringWithUTC}"`);
    console.log(`   - Fecha creada: ${date5}`);
    console.log(`   - Fecha ISO: ${date5.toISOString()}`);
    console.log(`   - Fecha local AR: ${date5.toLocaleString('es-AR')}`);
    console.log(`   - getTime(): ${date5.getTime()}`);
    console.log(`   - getUTCDate(): ${date5.getUTCDate()}`);
    console.log(`   - getDate(): ${date5.getDate()}`);
    
    // MÉTODO 6: Crear fecha en UTC y convertir a local
    console.log('\n🔍 MÉTODO 6: Crear en UTC y convertir a local');
    console.log('-----------------------------------------------');
    const utcDate = new Date(Date.UTC(testYear, testMonth, testDay, 0, 0, 0, 0));
    const localDate = new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000));
    console.log(`   - UTC Date: ${utcDate.toISOString()}`);
    console.log(`   - Local Date: ${localDate.toISOString()}`);
    console.log(`   - Fecha local AR: ${localDate.toLocaleString('es-AR')}`);
    console.log(`   - getDate(): ${localDate.getDate()}`);
    
    // MÉTODO 7: Usar setUTCHours para forzar hora local
    console.log('\n🔍 MÉTODO 7: setUTCHours para forzar hora local');
    console.log('------------------------------------------------');
    const date7 = new Date(testYear, testMonth, testDay);
    date7.setUTCHours(0, 0, 0, 0);
    console.log(`   - Fecha creada: ${date7}`);
    console.log(`   - Fecha ISO: ${date7.toISOString()}`);
    console.log(`   - Fecha local AR: ${date7.toLocaleString('es-AR')}`);
    console.log(`   - getDate(): ${date7.getDate()}`);
    
    console.log('\n📊 RESUMEN DE MÉTODOS:');
    console.log('========================');
    console.log(`Método 1 (new Date): ${date1.getDate()}/${date1.getMonth() + 1}/${date1.getFullYear()}`);
    console.log(`Método 2 (Date.UTC): ${date2.getDate()}/${date2.getMonth() + 1}/${date2.getFullYear()}`);
    console.log(`Método 3 (string): ${date3.getDate()}/${date3.getMonth() + 1}/${date3.getFullYear()}`);
    console.log(`Método 4 (string+time): ${date4.getDate()}/${date4.getMonth() + 1}/${date4.getFullYear()}`);
    console.log(`Método 5 (string+UTC): ${date5.getDate()}/${date5.getMonth() + 1}/${date5.getFullYear()}`);
    console.log(`Método 6 (UTC+offset): ${localDate.getDate()}/${localDate.getMonth() + 1}/${localDate.getFullYear()}`);
    console.log(`Método 7 (setUTCHours): ${date7.getDate()}/${date7.getMonth() + 1}/${date7.getFullYear()}`);
    
    console.log('\n💡 RECOMENDACIÓN:');
    console.log('==================');
    console.log('Basado en el análisis, el método que debería funcionar es:');
    console.log('Método 6: Crear en UTC y convertir a local usando timezone offset');
    
  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
if (require.main === module) {
  debugDateCreation()
    .then(() => {
      console.log('\n✅ Diagnóstico completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Diagnóstico falló:', error);
      process.exit(1);
    });
}

module.exports = { debugDateCreation }; 