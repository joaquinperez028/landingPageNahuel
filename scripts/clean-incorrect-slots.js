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

async function cleanIncorrectSlots() {
  console.log('🧹 Iniciando limpieza de turnos incorrectos...');
  console.log(`📅 Limpiando turnos de septiembre y octubre 2025`);
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const advisoryCollection = db.collection('advisoryschedules');
    const availableCollection = db.collection('availableslots');
    
    // Fechas de septiembre y octubre 2025
    const startDate = new Date(2025, 8, 1); // 1 de septiembre 2025
    const endDate = new Date(2025, 9, 31); // 31 de octubre 2025
    
    console.log(`📅 Rango de fechas: ${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`);
    
    // Limpiar AdvisorySchedule
    console.log('\n🗑️ Limpiando AdvisorySchedule...');
    const advisoryResult = await advisoryCollection.deleteMany({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    console.log(`✅ Eliminados ${advisoryResult.deletedCount} registros de AdvisorySchedule`);
    
    // Limpiar AvailableSlot
    console.log('\n🗑️ Limpiando AvailableSlot...');
    const availableResult = await availableCollection.deleteMany({
      serviceType: 'ConsultorioFinanciero',
      $or: [
        { date: { $regex: '^0[6-9]/0[9-9]/2025$' } }, // 06-09/09/2025
        { date: { $regex: '^1[0-9]/0[9-9]/2025$' } }, // 10-19/09/2025
        { date: { $regex: '^2[0-9]/0[9-9]/2025$' } }, // 20-29/09/2025
        { date: { $regex: '^3[0-1]/0[9-9]/2025$' } }, // 30-31/09/2025
        { date: { $regex: '^0[1-9]/10/2025$' } },     // 01-09/10/2025
        { date: { $regex: '^1[0-9]/10/2025$' } },     // 10-19/10/2025
        { date: { $regex: '^2[0-9]/10/2025$' } },     // 20-29/10/2025
        { date: { $regex: '^3[0-1]/10/2025$' } }      // 30-31/10/2025
      ]
    });
    console.log(`✅ Eliminados ${availableResult.deletedCount} registros de AvailableSlot`);
    
    console.log('\n🎉 Limpieza completada!');
    console.log(`📊 Total eliminado:`);
    console.log(`   - AdvisorySchedule: ${advisoryResult.deletedCount} registros`);
    console.log(`   - AvailableSlot: ${availableResult.deletedCount} registros`);
    
    console.log('\n💡 Ahora puedes ejecutar el script corregido:');
    console.log('   node scripts/generate-saturday-slots-fixed.js');
    
  } catch (error) {
    console.error('💥 Error durante la limpieza:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
if (require.main === module) {
  cleanIncorrectSlots()
    .then(() => {
      console.log('✅ Script de limpieza completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script de limpieza falló:', error);
      process.exit(1);
    });
}

module.exports = { cleanIncorrectSlots }; 