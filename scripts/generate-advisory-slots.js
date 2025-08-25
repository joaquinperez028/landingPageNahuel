const { MongoClient } = require('mongodb');
require('dotenv').config();

async function generateAdvisorySlots() {
  console.log('🔧 Generando horarios de asesoría...\n');

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    const advisoryScheduleCollection = db.collection('advisoryschedules');
    const availableSlotCollection = db.collection('availableslots');

    // Generar horarios para los próximos 30 días
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    console.log(`📅 Generando horarios desde ${startDate.toLocaleDateString()} hasta ${endDate.toLocaleDateString()}`);

    const slotsCreated = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Solo generar horarios para días de semana (lunes a viernes)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 1 = lunes, 5 = viernes
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Horarios de asesoría: 9:00, 11:00, 14:00, 16:00, 18:00
        const advisoryTimes = ['09:00', '11:00', '14:00', '16:00', '18:00'];
        
        for (const time of advisoryTimes) {
          const slotData = {
            date: dateStr,
            time: time,
            serviceType: 'ConsultorioFinanciero',
            available: true,
            reservedBy: null,
            reservedAt: null,
            bookingId: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Verificar si ya existe
          const existingSlot = await availableSlotCollection.findOne({
            date: dateStr,
            time: time,
            serviceType: 'ConsultorioFinanciero'
          });

          if (!existingSlot) {
            await availableSlotCollection.insertOne(slotData);
            slotsCreated.push(`${dateStr} ${time}`);
            console.log(`✅ Creado: ${dateStr} ${time}`);
          } else {
            console.log(`⏭️ Ya existe: ${dateStr} ${time}`);
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`\n🎉 Proceso completado!`);
    console.log(`📊 Total de slots creados: ${slotsCreated.length}`);
    
    if (slotsCreated.length > 0) {
      console.log('\n📋 Slots creados:');
      slotsCreated.slice(0, 10).forEach(slot => console.log(`  - ${slot}`));
      if (slotsCreated.length > 10) {
        console.log(`  ... y ${slotsCreated.length - 10} más`);
      }
    }

    // Verificar total de slots disponibles
    const totalSlots = await availableSlotCollection.countDocuments({
      serviceType: 'ConsultorioFinanciero',
      available: true
    });
    
    console.log(`\n📈 Total de slots disponibles en la base de datos: ${totalSlots}`);

    await client.close();
    console.log('\n✅ Conexión cerrada');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateAdvisorySlots();
