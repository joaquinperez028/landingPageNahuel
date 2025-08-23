const fetch = require('node-fetch');

async function testSyncAdvisory() {
  try {
    console.log('🧪 Probando sincronización de horarios de asesorías...');
    
    // Primero, crear algunos horarios de prueba
    console.log('\n📝 Creando horarios de prueba...');
    
    const testSchedules = [
      { date: '2024-12-20', time: '14:00' },
      { date: '2024-12-20', time: '15:00' },
      { date: '2024-12-20', time: '16:00' },
      { date: '2024-12-21', time: '14:00' },
      { date: '2024-12-21', time: '15:00' }
    ];

    for (const schedule of testSchedules) {
      try {
        const response = await fetch('http://localhost:3000/api/asesorias/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...schedule,
            isAvailable: true,
            isBooked: false
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Horario creado: ${schedule.date} ${schedule.time}`);
        } else {
          const error = await response.json();
          if (response.status === 409) {
            console.log(`ℹ️ Horario ya existe: ${schedule.date} ${schedule.time}`);
          } else {
            console.log(`❌ Error creando horario: ${schedule.date} ${schedule.time} - ${error.error}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error de red: ${schedule.date} ${schedule.time}`, error.message);
      }
    }

    // Esperar un momento para que se procesen
    console.log('\n⏳ Esperando 2 segundos para procesamiento...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar que los horarios se crearon en AdvisorySchedule
    console.log('\n🔍 Verificando horarios en AdvisorySchedule...');
    const advisoryResponse = await fetch('http://localhost:3000/api/asesorias/schedule');
    if (advisoryResponse.ok) {
      const advisoryData = await advisoryResponse.json();
      console.log(`📊 Horarios en AdvisorySchedule: ${advisoryData.schedules.length}`);
      
      // Filtrar solo los horarios de prueba
      const testDates = ['2024-12-20', '2024-12-21'];
      const testSchedulesFound = advisoryData.schedules.filter(s => 
        testDates.includes(s.date.split('T')[0])
      );
      console.log(`🎯 Horarios de prueba encontrados: ${testSchedulesFound.length}`);
    }

    // Verificar que los horarios aparecen en AvailableSlot
    console.log('\n🔍 Verificando horarios en AvailableSlot...');
    const availableResponse = await fetch('http://localhost:3000/api/turnos/available-slots?serviceType=ConsultorioFinanciero&limit=50');
    if (availableResponse.ok) {
      const availableData = await availableResponse.json();
      console.log(`📊 Días con turnos en AvailableSlot: ${availableData.turnos.length}`);
      
      // Buscar fechas de prueba
      const testDatesFormatted = ['20/12/2024', '21/12/2024'];
      const testDatesFound = availableData.turnos.filter(t => 
        testDatesFormatted.includes(t.fecha)
      );
      console.log(`🎯 Fechas de prueba encontradas: ${testDatesFound.length}`);
      
      if (testDatesFound.length > 0) {
        console.log('📅 Fechas encontradas:');
        testDatesFound.forEach(t => {
          console.log(`  - ${t.fecha}: ${t.horarios.join(', ')} (${t.disponibles} disponibles)`);
        });
      }
    }

    console.log('\n✅ Prueba completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testSyncAdvisory(); 