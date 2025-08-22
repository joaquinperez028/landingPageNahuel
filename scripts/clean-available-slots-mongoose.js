const mongoose = require('mongoose');

// Importar el modelo
const AvailableSlot = require('../models/AvailableSlot');

// Configuración de conexión (igual que en la app)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nahuel:nahuel123@cluster0.mongodb.net/landing-page-nahuel';

async function cleanAvailableSlots() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Contar documentos antes de limpiar
    const countBefore = await AvailableSlot.countDocuments();
    console.log(`📊 Documentos encontrados antes de limpiar: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log('ℹ️ No hay documentos para limpiar');
      return;
    }
    
    // Mostrar algunos ejemplos de los datos que se van a eliminar
    const sampleDocs = await AvailableSlot.find({}).limit(5).lean();
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
    const result = await AvailableSlot.deleteMany({});
    
    console.log(`🗑️  Eliminados ${result.deletedCount} documentos`);
    
    // Verificar que se eliminaron todos
    const countAfter = await AvailableSlot.countDocuments();
    console.log(`📊 Documentos restantes después de limpiar: ${countAfter}`);
    
    if (countAfter === 0) {
      console.log('✅ Base de datos limpiada completamente');
    } else {
      console.log('⚠️  Algunos documentos no se eliminaron');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await mongoose.disconnect();
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