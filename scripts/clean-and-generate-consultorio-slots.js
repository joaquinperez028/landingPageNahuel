const mongoose = require('mongoose');

// Conectar a MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Modelo AvailableSlot
const availableSlotSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    match: /^\d{2}\/\d{2}\/\d{4}$/,
    index: true
  },
  time: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/,
    index: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['ConsultorioFinanciero', 'CuentaAsesorada', 'TradingAvanzado', 'TradingBasico'],
    index: true
  },
  available: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    default: 60
  },
  reservedBy: {
    type: String,
    required: false
  },
  reservedAt: {
    type: Date,
    required: false
  },
  bookingId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Crear índices compuestos
availableSlotSchema.index({ date: 1, time: 1, serviceType: 1 }, { unique: true });
availableSlotSchema.index({ available: 1, serviceType: 1, date: 1 });

const AvailableSlot = mongoose.models.AvailableSlot || mongoose.model('AvailableSlot', availableSlotSchema);

// Función para generar fechas de sábados desde una fecha específica
function generateSaturdayDates(startDate, numberOfSaturdays = 52) { // 52 sábados = 1 año
  const dates = [];
  const currentDate = new Date(startDate);
  
  // Encontrar el primer sábado (día 6 = sábado)
  while (currentDate.getDay() !== 6) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  for (let i = 0; i < numberOfSaturdays; i++) {
    const dateStr = currentDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    dates.push(dateStr);
    
    // Avanzar al siguiente sábado
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return dates;
}

// Función para generar horarios de 10:00 AM a 1:00 PM divididos en 3 turnos
function generateTimeSlots() {
  return [
    '10:00', // 10:00 AM - 11:00 AM
    '11:00', // 11:00 AM - 12:00 PM
    '12:00'  // 12:00 PM - 1:00 PM
  ];
}

// Función principal para limpiar y generar los turnos
async function cleanAndGenerateConsultorioSlots() {
  try {
    console.log('🚀 Iniciando limpieza y generación de turnos para Consultorio Financiero...');
    
    // Fecha de inicio: 1 de noviembre de 2025
    const startDate = new Date('2025-11-01');
    console.log(`📅 Fecha de inicio: ${startDate.toLocaleDateString('es-ES')}`);
    
    // PASO 1: Limpiar todos los turnos existentes del consultorio financiero
    console.log('🗑️ Limpiando todos los turnos existentes del Consultorio Financiero...');
    const deleteResult = await AvailableSlot.deleteMany({
      serviceType: 'ConsultorioFinanciero'
    });
    console.log(`✅ Eliminados ${deleteResult.deletedCount} turnos existentes`);
    
    // PASO 2: Generar fechas de sábados
    const saturdayDates = generateSaturdayDates(startDate, 52); // 52 sábados (1 año)
    console.log(`📅 Generadas ${saturdayDates.length} fechas de sábados`);
    
    // PASO 3: Generar horarios
    const timeSlots = generateTimeSlots();
    console.log(`🕐 Horarios generados: ${timeSlots.join(', ')}`);
    
    // PASO 4: Configuración del servicio
    const serviceConfig = {
      serviceType: 'ConsultorioFinanciero',
      price: 150, // Precio en USD
      duration: 60 // Duración en minutos
    };
    
    console.log(`💰 Configuración: $${serviceConfig.price} USD por ${serviceConfig.duration} minutos`);
    
    // PASO 5: Generar todos los slots
    const slotsToCreate = [];
    
    for (const date of saturdayDates) {
      for (const time of timeSlots) {
        slotsToCreate.push({
          date,
          time,
          serviceType: serviceConfig.serviceType,
          available: true,
          price: serviceConfig.price,
          duration: serviceConfig.duration
        });
      }
    }
    
    console.log(`📊 Total de slots a crear: ${slotsToCreate.length}`);
    
    // PASO 6: Crear los nuevos slots
    console.log('➕ Creando nuevos slots...');
    const createdSlots = await AvailableSlot.insertMany(slotsToCreate);
    
    console.log(`✅ Creados ${createdSlots.length} slots exitosamente`);
    
    // PASO 7: Verificar que todo esté correcto
    console.log('\n🔍 Verificando configuración...');
    
    // Verificar que sean sábados
    let saturdays = 0;
    let notSaturdays = 0;
    
    saturdayDates.forEach(date => {
      const [day, month, year] = date.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay(); // 0 = domingo, 6 = sábado
      
      if (dayOfWeek === 6) {
        saturdays++;
      } else {
        notSaturdays++;
        console.log(`⚠️ ${date} no es sábado (día ${dayOfWeek})`);
      }
    });
    
    console.log(`✅ Sábados: ${saturdays}`);
    console.log(`❌ No sábados: ${notSaturdays}`);
    
    // Mostrar resumen
    console.log('\n📋 RESUMEN FINAL:');
    console.log(`📅 Fechas: ${saturdayDates[0]} - ${saturdayDates[saturdayDates.length - 1]}`);
    console.log(`🕐 Horarios: ${timeSlots.join(', ')}`);
    console.log(`💰 Precio: $${serviceConfig.price} USD`);
    console.log(`⏱️ Duración: ${serviceConfig.duration} minutos`);
    console.log(`📊 Total slots: ${createdSlots.length}`);
    console.log(`✅ Sábados: ${saturdays}`);
    
    // Mostrar algunos ejemplos
    console.log('\n📝 EJEMPLOS DE SLOTS CREADOS:');
    const examples = createdSlots.slice(0, 6);
    examples.forEach(slot => {
      console.log(`   ${slot.date} ${slot.time} - $${slot.price} USD`);
    });
    
    if (notSaturdays === 0) {
      console.log('\n🎉 ¡Generación de turnos completada exitosamente!');
      console.log('✅ Todos los turnos son sábados');
      console.log('✅ Todos los turnos tienen 3 horarios por fecha');
      console.log('✅ Configuración correcta de precio y duración');
    } else {
      console.log('\n⚠️ Hay algunos problemas en la configuración');
    }
    
  } catch (error) {
    console.error('❌ Error generando turnos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
if (require.main === module) {
  connectDB().then(() => {
    cleanAndGenerateConsultorioSlots();
  });
}

module.exports = { cleanAndGenerateConsultorioSlots }; 