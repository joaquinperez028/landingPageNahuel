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
  }
}, {
  timestamps: true
});

const AvailableSlot = mongoose.models.AvailableSlot || mongoose.model('AvailableSlot', availableSlotSchema);

// Función para verificar los turnos creados
async function verifyConsultorioSlots() {
  try {
    console.log('🔍 Verificando turnos del Consultorio Financiero...');
    
    // Obtener todos los slots del consultorio financiero
    const slots = await AvailableSlot.find({
      serviceType: 'ConsultorioFinanciero'
    }).sort({ date: 1, time: 1 });
    
    console.log(`📊 Total de slots encontrados: ${slots.length}`);
    
    if (slots.length === 0) {
      console.log('❌ No se encontraron slots para el Consultorio Financiero');
      return;
    }
    
    // Agrupar por fecha
    const slotsByDate = {};
    slots.forEach(slot => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push(slot);
    });
    
    const dates = Object.keys(slotsByDate).sort();
    
    console.log(`📅 Fechas con turnos: ${dates.length}`);
    console.log(`📅 Rango de fechas: ${dates[0]} - ${dates[dates.length - 1]}`);
    
    // Verificar configuración
    const firstSlot = slots[0];
    console.log(`💰 Precio por turno: $${firstSlot.price} USD`);
    console.log(`⏱️ Duración por turno: ${firstSlot.duration} minutos`);
    
    // Verificar horarios
    const times = [...new Set(slots.map(slot => slot.time))].sort();
    console.log(`🕐 Horarios disponibles: ${times.join(', ')}`);
    
    // Verificar que cada fecha tenga 3 turnos
    let validDates = 0;
    let invalidDates = 0;
    
    dates.forEach(date => {
      const dateSlots = slotsByDate[date];
      if (dateSlots.length === 3) {
        validDates++;
      } else {
        invalidDates++;
        console.log(`⚠️ Fecha ${date} tiene ${dateSlots.length} turnos en lugar de 3`);
      }
    });
    
    console.log(`✅ Fechas válidas (3 turnos): ${validDates}`);
    console.log(`❌ Fechas inválidas: ${invalidDates}`);
    
    // Mostrar algunos ejemplos
    console.log('\n📝 EJEMPLOS DE TURNOS:');
    const examples = slots.slice(0, 9);
    examples.forEach(slot => {
      console.log(`   ${slot.date} ${slot.time} - $${slot.price} USD (${slot.duration} min)`);
    });
    
    // Verificar que sean sábados
    console.log('\n📅 VERIFICANDO QUE SEAN SÁBADOS:');
    let saturdays = 0;
    let notSaturdays = 0;
    
    dates.forEach(date => {
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
    
    // Resumen final
    console.log('\n📋 RESUMEN FINAL:');
    console.log(`📊 Total slots: ${slots.length}`);
    console.log(`📅 Total fechas: ${dates.length}`);
    console.log(`✅ Fechas válidas: ${validDates}`);
    console.log(`✅ Sábados: ${saturdays}`);
    console.log(`💰 Precio: $${firstSlot.price} USD`);
    console.log(`⏱️ Duración: ${firstSlot.duration} minutos`);
    
    if (validDates === dates.length && saturdays === dates.length) {
      console.log('\n🎉 ¡Todos los turnos están correctamente configurados!');
    } else {
      console.log('\n⚠️ Hay algunos problemas en la configuración de turnos');
    }
    
  } catch (error) {
    console.error('❌ Error verificando turnos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
if (require.main === module) {
  connectDB().then(() => {
    verifyConsultorioSlots();
  });
}

module.exports = { verifyConsultorioSlots }; 