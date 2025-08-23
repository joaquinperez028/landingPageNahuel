const { MongoClient } = require('mongodb');
require('dotenv').config();

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
const DB_NAME = process.env.MONGODB_URI ? process.env.MONGODB_URI.split('/').pop().split('?')[0] : 'test';

// Configuración de horarios
const START_YEAR = 2025;
const START_MONTH = 8; // Septiembre (0-indexed)
const END_YEAR = 2027;
const SATURDAY = 6; // 0 = domingo, 6 = sábado
const START_HOUR = 10; // 10:00
const END_HOUR = 15; // 15:00 (exclusivo, o sea hasta 14:00)

async function generateSaturdaySlots() {
  console.log('🚀 Iniciando generación de turnos de sábados...');
  console.log(`📅 Período: Septiembre ${START_YEAR} - Diciembre ${END_YEAR}`);
  console.log(`⏰ Horarios: ${START_HOUR}:00 - ${END_HOUR}:00 (sábados)`);
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const advisoryCollection = db.collection('advisoryschedules');
    const availableCollection = db.collection('availableslots');
    
    // Generar todas las fechas de sábados en el rango
    const saturdayDates = [];
    const currentDate = new Date(START_YEAR, START_MONTH, 1);
    const endDate = new Date(END_YEAR, 11, 31); // 31 de diciembre 2027
    
    console.log('📅 Generando fechas de sábados...');
    
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
    
    console.log(`📅 Encontrados ${saturdayDates.length} sábados en el rango`);
    
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
    
    console.log('\n🎉 Generación completada!');
    console.log(`📊 Resumen:`);
    console.log(`   - Total de sábados: ${saturdayDates.length}`);
    console.log(`   - Horarios por sábado: ${timeSlots.length}`);
    console.log(`   - Total de turnos creados: ${totalCreated}`);
    console.log(`   - Total de errores: ${totalErrors}`);
    console.log(`   - Turnos por sábado: ${timeSlots.join(', ')}`);
    
    // Mostrar algunas fechas de ejemplo
    console.log('\n📅 Ejemplos de fechas generadas:');
    saturdayDates.slice(0, 5).forEach(date => {
      console.log(`   - ${date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`);
    });
    
    if (saturdayDates.length > 5) {
      console.log(`   ... y ${saturdayDates.length - 5} sábados más`);
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
  generateSaturdaySlots()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script falló:', error);
      process.exit(1);
    });
}

module.exports = { generateSaturdaySlots }; 