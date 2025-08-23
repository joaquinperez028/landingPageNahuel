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

console.log('🔍 Configuración de base de datos:');
console.log(`   - URI: ${MONGODB_URI.substring(0, 20)}...`);
console.log(`   - Base de datos: ${DB_NAME}`);

// Configuración de horarios - PERÍODO DE PRUEBA
const START_YEAR = 2025;
const START_MONTH = 8; // Septiembre (0-indexed)
const END_MONTH = 9; // Octubre (0-indexed)
const SATURDAY = 6; // 0 = domingo, 6 = sábado
const START_HOUR = 10; // 10:00
const END_HOUR = 15; // 15:00 (exclusivo, o sea hasta 14:00)

async function generateAPIStyleSaturdaySlots() {
  console.log('🧪 Iniciando generación estilo API de turnos de sábados...');
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
          // SOLUCIÓN FINAL: Usar exactamente la misma lógica que la API corregida
          // 1. Construir fecha como string YYYY-MM-DD
          const year = saturdayDate.getFullYear();
          const month = saturdayDate.getMonth();
          const day = saturdayDate.getDate();
          
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          // 2. Crear fecha como local usando los componentes (igual que la API)
          const localScheduleDate = new Date(year, month, day);
          
          console.log(`  📅 String de fecha: ${dateString}`);
          console.log(`  📅 Fecha local construida: ${localScheduleDate.toISOString()}`);
          console.log(`  📅 Componentes: año=${year}, mes=${month + 1}, día=${day}`);
          console.log(`  📅 Fecha local mostrada: ${localScheduleDate.toLocaleDateString('es-ES')}`);
          
          // Verificar si ya existe
          const existingSchedule = await advisoryCollection.findOne({
            date: localScheduleDate,
            time: timeSlot
          });
          
          if (existingSchedule) {
            console.log(`  ⏰ ${timeSlot} - Ya existe, saltando...`);
            continue;
          }
          
          // Crear en AdvisorySchedule con fecha local
          const scheduleData = {
            date: localScheduleDate,
            time: timeSlot,
            isAvailable: true,
            isBooked: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const newSchedule = await advisoryCollection.insertOne(scheduleData);
          console.log(`  ✅ ${timeSlot} - Creado en AdvisorySchedule (ID: ${newSchedule.insertedId})`);
          
          // Crear en AvailableSlot con fecha en formato DD/MM/YYYY
          // Usar los componentes originales para evitar offset
          const dayStr = day.toString().padStart(2, '0');
          const monthStr = (month + 1).toString().padStart(2, '0');
          const yearStr = year.toString();
          const dateForAvailableSlot = `${dayStr}/${monthStr}/${yearStr}`;
          
          console.log(`  📅 Fecha para AvailableSlot: ${dateForAvailableSlot}`);
          
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
    
    console.log('\n🎉 Generación estilo API completada!');
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
  generateAPIStyleSaturdaySlots()
    .then(() => {
      console.log('✅ Script estilo API completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script estilo API falló:', error);
      process.exit(1);
    });
}

module.exports = { generateAPIStyleSaturdaySlots }; 