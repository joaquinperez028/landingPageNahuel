const mongoose = require('mongoose');
require('dotenv').config();

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

// Función principal para generar los turnos
async function generateConsultorioSlots() {
  try {
    console.log('🚀 Iniciando generación de turnos para Consultorio Financiero...');
    
    // Fecha de inicio: 1 de noviembre de 2025
    const startDate = new Date('2025-11-01');
    console.log(`📅 Fecha de inicio: ${startDate.toLocaleDateString('es-ES')}`);
    
    // Generar fechas de sábados
    const saturdayDates = generateSaturdayDates(startDate, 52); // 52 sábados (1 año)
    console.log(`📅 Generadas ${saturdayDates.length} fechas de sábados`);
    
    // Generar horarios
    const timeSlots = generateTimeSlots();
    console.log(`🕐 Horarios generados: ${timeSlots.join(', ')}`);
    
    // Configuración del servicio
    const serviceConfig = {
      serviceType: 'ConsultorioFinanciero',
      price: 150, // Precio en USD
      duration: 60 // Duración en minutos
    };
    
    console.log(`💰 Configuración: $${serviceConfig.price} USD por ${serviceConfig.duration} minutos`);
    
    // Generar todos los slots
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
    
    // Verificar si ya existen slots para estas fechas
    const existingSlots = await AvailableSlot.find({
      serviceType: serviceConfig.serviceType,
      date: { $in: saturdayDates }
    });
    
    if (existingSlots.length > 0) {
      console.log(`⚠️ Encontrados ${existingSlots.length} slots existentes para estas fechas`);
      console.log('¿Deseas eliminar los slots existentes y crear nuevos? (y/n)');
      
      // En un script automático, asumimos que sí
      console.log('🗑️ Eliminando slots existentes...');
      await AvailableSlot.deleteMany({
        serviceType: serviceConfig.serviceType,
        date: { $in: saturdayDates }
      });
      console.log('✅ Slots existentes eliminados');
    }
    
    // Crear los nuevos slots
    console.log('➕ Creando nuevos slots...');
    const createdSlots = await AvailableSlot.insertMany(slotsToCreate);
    
    console.log(`✅ Creados ${createdSlots.length} slots exitosamente`);
    
    // Mostrar resumen
    console.log('\n📋 RESUMEN:');
    console.log(`📅 Fechas: ${saturdayDates[0]} - ${saturdayDates[saturdayDates.length - 1]}`);
    console.log(`🕐 Horarios: ${timeSlots.join(', ')}`);
    console.log(`💰 Precio: $${serviceConfig.price} USD`);
    console.log(`⏱️ Duración: ${serviceConfig.duration} minutos`);
    console.log(`📊 Total slots: ${createdSlots.length}`);
    
    // Mostrar algunos ejemplos
    console.log('\n📝 EJEMPLOS DE SLOTS CREADOS:');
    const examples = createdSlots.slice(0, 6);
    examples.forEach(slot => {
      console.log(`   ${slot.date} ${slot.time} - $${slot.price} USD`);
    });
    
    console.log('\n🎉 ¡Generación de turnos completada exitosamente!');
    
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
    generateConsultorioSlots();
  });
}

module.exports = { generateConsultorioSlots }; 