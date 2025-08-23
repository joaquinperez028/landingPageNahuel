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

async function testSingleSlot() {
  console.log('🧪 TEST: Insertar un solo turno y verificar qué se guarda');
  console.log('========================================================');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const advisoryCollection = db.collection('advisoryschedules');
    const availableCollection = db.collection('availableslots');
    
    // Limpiar colecciones
    console.log('\n🧹 Limpiando colecciones...');
    await advisoryCollection.deleteMany({});
    await availableCollection.deleteMany({});
    console.log('✅ Colecciones limpiadas');
    
    // Test con fecha específica: 25 de octubre de 2025 (sábado)
    const testYear = 2025;
    const testMonth = 9; // Octubre (0-indexed)
    const testDay = 25;
    const testTime = '10:00';
    
    console.log(`\n📅 CREANDO TURNO DE PRUEBA:`);
    console.log(`   - Fecha: ${testDay}/${testMonth + 1}/${testYear}`);
    console.log(`   - Hora: ${testTime}`);
    console.log(`   - Día de la semana: Sábado`);
    
    // MÉTODO CORRECTO: new Date(year, month, day)
    const scheduleDate = new Date(testYear, testMonth, testDay);
    
    console.log('\n🔍 ANÁLISIS DE LA FECHA ANTES DE GUARDAR:');
    console.log(`   - Fecha creada: ${scheduleDate}`);
    console.log(`   - Fecha ISO: ${scheduleDate.toISOString()}`);
    console.log(`   - Fecha local: ${scheduleDate.toLocaleDateString('es-AR')}`);
    console.log(`   - getDate(): ${scheduleDate.getDate()}`);
    console.log(`   - getMonth(): ${scheduleDate.getMonth() + 1}`);
    console.log(`   - getFullYear(): ${scheduleDate.getFullYear()}`);
    console.log(`   - getDay(): ${scheduleDate.getDay()} (0=domingo, 6=sábado)`);
    
    // Crear en AdvisorySchedule
    console.log('\n📝 INSERTANDO EN AdvisorySchedule...');
    const scheduleData = {
      date: scheduleDate,
      time: testTime,
      isAvailable: true,
      isBooked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newSchedule = await advisoryCollection.insertOne(scheduleData);
    console.log(`✅ Insertado en AdvisorySchedule con ID: ${newSchedule.insertedId}`);
    
    // Crear en AvailableSlot
    console.log('\n📝 INSERTANDO EN AvailableSlot...');
    const dayStr = testDay.toString().padStart(2, '0');
    const monthStr = (testMonth + 1).toString().padStart(2, '0');
    const yearStr = testYear.toString();
    const dateForAvailableSlot = `${dayStr}/${monthStr}/${yearStr}`;
    
    const availableSlotData = {
      date: dateForAvailableSlot,
      time: testTime,
      serviceType: 'ConsultorioFinanciero',
      available: true,
      price: 50000,
      duration: 60,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newAvailableSlot = await availableCollection.insertOne(availableSlotData);
    console.log(`✅ Insertado en AvailableSlot con ID: ${newAvailableSlot.insertedId}`);
    
    // VERIFICAR QUÉ SE GUARDÓ REALMENTE
    console.log('\n🔍 VERIFICANDO QUÉ SE GUARDÓ EN LA BASE DE DATOS:');
    console.log('==================================================');
    
    // Verificar AdvisorySchedule
    const savedSchedule = await advisoryCollection.findOne({ _id: newSchedule.insertedId });
    console.log('\n📋 AdvisorySchedule guardado:');
    console.log(`   - ID: ${savedSchedule._id}`);
    console.log(`   - Fecha guardada: ${savedSchedule.date}`);
    console.log(`   - Tipo de fecha: ${typeof savedSchedule.date}`);
    console.log(`   - Fecha ISO: ${savedSchedule.date.toISOString()}`);
    console.log(`   - Fecha local: ${savedSchedule.date.toLocaleDateString('es-AR')}`);
    console.log(`   - getDate(): ${savedSchedule.date.getDate()}`);
    console.log(`   - getMonth(): ${savedSchedule.date.getMonth() + 1}`);
    console.log(`   - getFullYear(): ${savedSchedule.date.getFullYear()}`);
    console.log(`   - getDay(): ${savedSchedule.date.getDay()}`);
    console.log(`   - Hora: ${savedSchedule.time}`);
    console.log(`   - Disponible: ${savedSchedule.isAvailable}`);
    
    // Verificar AvailableSlot
    const savedAvailableSlot = await availableCollection.findOne({ _id: newAvailableSlot.insertedId });
    console.log('\n📋 AvailableSlot guardado:');
    console.log(`   - ID: ${savedAvailableSlot._id}`);
    console.log(`   - Fecha: ${savedAvailableSlot.date}`);
    console.log(`   - Hora: ${savedAvailableSlot.time}`);
    console.log(`   - Tipo: ${savedAvailableSlot.serviceType}`);
    console.log(`   - Disponible: ${savedAvailableSlot.available}`);
    
    // CONSULTA PARA VER QUÉ DÍA APARECE EN LA INTERFAZ
    console.log('\n🔍 CONSULTA PARA INTERFAZ:');
    console.log('===========================');
    
    // Buscar por fecha específica
    const foundSchedules = await advisoryCollection.find({
      date: {
        $gte: new Date(testYear, testMonth, testDay, 0, 0, 0, 0),
        $lt: new Date(testYear, testMonth, testDay + 1, 0, 0, 0, 0)
      }
    }).toArray();
    
    console.log(`\n📊 Turnos encontrados para el ${testDay}/${testMonth + 1}/${testYear}:`);
    console.log(`   - Total encontrados: ${foundSchedules.length}`);
    
    foundSchedules.forEach((schedule, index) => {
      console.log(`   ${index + 1}. ID: ${schedule._id}`);
      console.log(`      Fecha: ${schedule.date}`);
      console.log(`      Fecha ISO: ${schedule.date.toISOString()}`);
      console.log(`      Fecha local: ${schedule.date.toLocaleDateString('es-AR')}`);
      console.log(`      getDate(): ${schedule.date.getDate()}`);
      console.log(`      Hora: ${schedule.time}`);
    });
    
    console.log('\n💡 CONCLUSIÓN:');
    console.log('==============');
    console.log('Si getDate() devuelve 25, pero en la interfaz aparece el 24,');
    console.log('el problema está en cómo se está interpretando la fecha en el frontend,');
    console.log('no en cómo se guarda en la base de datos.');
    
  } catch (error) {
    console.error('💥 Error durante el test:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
if (require.main === module) {
  testSingleSlot()
    .then(() => {
      console.log('\n✅ Test completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test falló:', error);
      process.exit(1);
    });
}

module.exports = { testSingleSlot }; 