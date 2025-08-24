const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Importar modelos
const AdvisorySchedule = require('../models/AdvisorySchedule');
const AdvisoryDate = require('../models/AdvisoryDate');

async function migrateAdvisoryDates() {
  try {
    console.log('🔄 Iniciando migración de fechas de asesoría...');
    
    // Obtener todas las fechas de AdvisorySchedule que estén disponibles
    const existingSchedules = await AdvisorySchedule.find({
      isAvailable: true,
      isBooked: false,
      date: { $gte: new Date() } // Solo fechas futuras
    }).sort({ date: 1 });
    
    console.log(`📅 Encontradas ${existingSchedules.length} fechas disponibles para migrar`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const schedule of existingSchedules) {
      try {
        // Verificar si ya existe una fecha para esta fecha y hora
        const existingDate = await AdvisoryDate.findOne({
          date: schedule.date,
          time: schedule.time,
          advisoryType: 'ConsultorioFinanciero'
        });
        
        if (existingDate) {
          console.log(`⏭️ Fecha ya existe: ${schedule.date.toISOString().split('T')[0]} ${schedule.time}`);
          skippedCount++;
          continue;
        }
        
        // Crear nueva fecha de asesoría
        const newAdvisoryDate = new AdvisoryDate({
          advisoryType: 'ConsultorioFinanciero',
          date: schedule.date,
          time: schedule.time,
          title: `Consultorio Financiero - ${schedule.time}hs`,
          description: 'Migrado desde sistema anterior',
          isActive: true,
          isBooked: schedule.isBooked,
          createdBy: 'migration@system.com',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newAdvisoryDate.save();
        createdCount++;
        
        console.log(`✅ Creada fecha: ${schedule.date.toISOString().split('T')[0]} ${schedule.time}`);
        
      } catch (error) {
        console.error(`❌ Error creando fecha ${schedule.date} ${schedule.time}:`, error.message);
      }
    }
    
    console.log('\n📊 Resumen de migración:');
    console.log(`✅ Fechas creadas: ${createdCount}`);
    console.log(`⏭️ Fechas omitidas: ${skippedCount}`);
    console.log(`📅 Total procesadas: ${existingSchedules.length}`);
    
    // Mostrar algunas fechas creadas como ejemplo
    const sampleDates = await AdvisoryDate.find({
      advisoryType: 'ConsultorioFinanciero'
    }).sort({ date: 1 }).limit(5);
    
    console.log('\n📋 Ejemplos de fechas creadas:');
    sampleDates.forEach(date => {
      console.log(`  - ${date.date.toISOString().split('T')[0]} ${date.time}hs: ${date.title}`);
    });
    
  } catch (error) {
    console.error('💥 Error en migración:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar migración
migrateAdvisoryDates();
