const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/landing-page-nahuel';

async function cleanAvailableSlots() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db();
    const collection = db.collection('availableslots');
    
    // Contar documentos antes de limpiar
    const countBefore = await collection.countDocuments();
    console.log(`📊 Documentos encontrados antes de limpiar: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log('ℹ️ No hay documentos para limpiar');
      return;
    }
    
    // Mostrar algunos ejemplos de los datos que se van a eliminar
    const sampleDocs = await collection.find({}).limit(5).toArray();
    console.log('📋 Ejemplos de datos que se van a eliminar:');
    sampleDocs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.date} ${doc.time} - ${doc.serviceType} (${doc.available ? 'Disponible' : 'Reservado'})`);
    });
    
    // Confirmar antes de eliminar
    console.log('\n⚠️  ADVERTENCIA: Esto eliminará TODOS los horarios disponibles');
    console.log('¿Estás seguro de que quieres continuar? (Ctrl+C para cancelar)');
    
    // Esperar 5 segundos para dar tiempo a cancelar
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Eliminar todos los documentos
    const result = await collection.deleteMany({});
    
    console.log(`🗑️  Eliminados ${result.deletedCount} documentos`);
    
    // Verificar que se eliminaron todos
    const countAfter = await collection.countDocuments();
    console.log(`📊 Documentos restantes después de limpiar: ${countAfter}`);
    
    if (countAfter === 0) {
      console.log('✅ Base de datos limpiada completamente');
    } else {
      console.log('⚠️  Algunos documentos no se eliminaron');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la función
cleanAvailableSlots()
  .then(() => {
    console.log('🎯 Limpieza completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 