const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
const DB_NAME = process.env.MONGODB_URI ? process.env.MONGODB_URI.split('/').pop().split('?')[0] : 'test';

// Configuración de horarios - PERÍODO DE PRUEBA
const START_YEAR = 2025;
const START_MONTH = 8; // Septiembre (0-indexed)
const END_MONTH = 9; // Octubre (0-indexed)
const SATURDAY = 6; // 0 = domingo, 6 = sábado
const START_HOUR = 10; // 10:00
const END_HOUR = 15; // 15:00 (exclusivo, o sea hasta 14:00)

async function generateTestSaturdaySlots() {
  console.log('🧪 Iniciando generación de PRUEBA de turnos de sábados...');
  console.log(`📅 Período de PRUEBA: Septiembre ${START_YEAR} - Octubre ${START_YEAR}`);
  console.log(`⏰ Horarios: ${START_HOUR}:00 - ${END_HOUR}:00 (sábados)`);
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const advisoryCollection = db.collection('advisoryschedules');
    const availableCollection = db.collection('availableslots');
    
    // Generar fechas de sábados solo para el período de prueba
    const saturdayDates = [];
    const currentDate = new Date(START_YEAR, START_MONTH, 1);
    const endDate = new Date(START_YEAR, END_MONTH, 31);
    
    console.log('📅 Generando fechas de sábados para PRUEBA...');
    
    while (currentDate <= endDate) {
      // Avanzar al próximo sábado
      while (currentDate.getDay() !== SATURDAY) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      if (currentDate <= endDate) {
        saturdayDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 7); // Siguiente sábado
      }
    }
    
    console.log(`📅 Encontrados ${saturdayDates.length} sábados en el período de PRUEBA`);
    
    // Generar horarios para cada sábado
    const timeSlots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    console.log(`⏰ Horarios por sábado: ${timeSlots.join(', ')}`);
    
    let totalCreated = 0;
    let totalErrors = 0;
    
    // Crear turnos para cada sábado
    for (const saturdayDate of saturdayDates) {
      console.log(`\n📅 Procesando sábado: ${saturdayDate.toLocaleDateString('es-ES')}`);
      
      for (const timeSlot of timeSlots) {
        try {
          // Verificar si ya existe
          const existingSchedule = await advisoryCollection.findOne({
            date: saturdayDate,
            time: timeSlot
          });
          
          if (existingSchedule) {
            console.log(`  ⏰ ${timeSlot} - Ya existe, saltando...`);
            continue;
          }
          
          // Crear en AdvisorySchedule
          const scheduleData = {
            date: saturdayDate,
            time: timeSlot,
            isAvailable: true,
            isBooked: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const newSchedule = await advisoryCollection.insertOne(scheduleData);
          console.log(`  ✅ ${timeSlot} - Creado en AdvisorySchedule (ID: ${newSchedule.insertedId})`);
          
          // Crear en AvailableSlot
          const day = saturdayDate.getDate().toString().padStart(2, '0');
          const month = (saturdayDate.getMonth() + 1).toString().padStart(2, '0');
          const year = saturdayDate.getFullYear();
          const dateForAvailableSlot = `${day}/${month}/${year}`;
          
          const availableSlotData = {
            date: dateForAvailableSlot,
            time: timeSlot,
            serviceType: 'ConsultorioFinanciero',
            available: true,
            price: 50000, // Precio por defecto en ARS
            duration: 60, // Duración por defecto en minutos
            reservedBy: undefined,
            reservedAt: undefined,
            bookingId: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const newAvailableSlot = await availableCollection.insertOne(availableSlotData);
          console.log(`  ✅ ${timeSlot} - Creado en AvailableSlot (ID: ${newAvailableSlot.insertedId})`);
          
          totalCreated++;
          
        } catch (error) {
          console.error(`  ❌ ${timeSlot} - Error:`, error.message);
          totalErrors++;
        }
      }
    }
    
    console.log('\n🎉 Generación de PRUEBA completada!');
    console.log(`📊 Resumen:`);
    console.log(`   - Total de sábados: ${saturdayDates.length}`);
    console.log(`   - Horarios por sábado: ${timeSlots.length}`);
    console.log(`   - Total de turnos creados: ${totalCreated}`);
    console.log(`   - Total de errores: ${totalErrors}`);
    console.log(`   - Turnos por sábado: ${timeSlots.join(', ')}`);
    
    // Mostrar todas las fechas generadas
    console.log('\n📅 Fechas generadas en la PRUEBA:');
    saturdayDates.forEach(date => {
      console.log(`   - ${date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`);
    });
    
    if (totalCreated > 0) {
      console.log('\n💡 Para generar TODOS los sábados hasta 2027, ejecuta:');
      console.log('   node scripts/generate-saturday-slots.js');
    }
    
  } catch (error) {
    console.error('💥 Error general:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
if (require.main === module) {
  generateTestSaturdaySlots()
    .then(() => {
      console.log('✅ Script de PRUEBA completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script de PRUEBA falló:', error);
      process.exit(1);
    });
}

module.exports = { generateTestSaturdaySlots }; 