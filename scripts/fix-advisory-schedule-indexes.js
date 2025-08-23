const mongoose = require('mongoose');

async function fixAdvisoryScheduleIndexes() {
  try {
    console.log('🔧 Conectando a MongoDB...');
    
    // Conectar a MongoDB usando la misma configuración que la app
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Conectado a MongoDB');
    
    // Obtener la colección directamente
    const db = mongoose.connection.db;
    const collection = db.collection('advisoryschedules');
    
    console.log('📋 Obteniendo índices actuales...');
    const indexes = await collection.indexes();
    
    console.log('📊 Índices encontrados:');
    indexes.forEach((index, i) => {
      console.log(`  ${i + 1}. ${index.name}:`, JSON.stringify(index.key, null, 2));
    });
    
    // Buscar y eliminar el índice problemático
    const problematicIndexName = 'dayOfWeek_1_hour_1_minute_1_type_1';
    
    console.log(`\n🔍 Buscando índice problemático: ${problematicIndexName}`);
    
    const hasProblematicIndex = indexes.some(index => index.name === problematicIndexName);
    
    if (hasProblematicIndex) {
      console.log(`❌ Encontrado índice problemático: ${problematicIndexName}`);
      console.log('🗑️ Eliminando índice obsoleto...');
      
      try {
        await collection.dropIndex(problematicIndexName);
        console.log('✅ Índice problemático eliminado exitosamente');
      } catch (dropError) {
        console.error('❌ Error al eliminar índice:', dropError.message);
      }
    } else {
      console.log('✅ No se encontró el índice problemático');
    }
    
    // Verificar los índices correctos para AdvisorySchedule
    console.log('\n🔍 Verificando índices necesarios...');
    
    // Índice compuesto para fecha + hora (debe ser único)
    const hasDateTimeIndex = indexes.some(index => 
      index.name === 'date_1_time_1' || 
      (index.key.date === 1 && index.key.time === 1)
    );
    
    if (!hasDateTimeIndex) {
      console.log('🔨 Creando índice único para date + time...');
      try {
        await collection.createIndex(
          { date: 1, time: 1 }, 
          { unique: true, name: 'date_1_time_1' }
        );
        console.log('✅ Índice único date + time creado');
      } catch (createError) {
        console.error('❌ Error al crear índice:', createError.message);
      }
    } else {
      console.log('✅ Índice date + time ya existe');
    }
    
    // Índice para consultas por disponibilidad
    const hasAvailabilityIndex = indexes.some(index => 
      index.name === 'date_1_isAvailable_1_isBooked_1' ||
      (index.key.date === 1 && index.key.isAvailable === 1 && index.key.isBooked === 1)
    );
    
    if (!hasAvailabilityIndex) {
      console.log('🔨 Creando índice para consultas de disponibilidad...');
      try {
        await collection.createIndex(
          { date: 1, isAvailable: 1, isBooked: 1 }, 
          { name: 'date_1_isAvailable_1_isBooked_1' }
        );
        console.log('✅ Índice de disponibilidad creado');
      } catch (createError) {
        console.error('❌ Error al crear índice:', createError.message);
      }
    } else {
      console.log('✅ Índice de disponibilidad ya existe');
    }
    
    console.log('\n📋 Índices finales:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`  ${i + 1}. ${index.name}:`, JSON.stringify(index.key, null, 2));
    });
    
    console.log('\n✅ Limpieza de índices completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
fixAdvisoryScheduleIndexes(); 