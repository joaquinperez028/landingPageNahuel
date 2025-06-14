import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import AdvisorySchedule from '../../../models/AdvisorySchedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    console.log('🔍 [DEBUG-SCHEDULES] Verificando horarios configurados...');

    // Obtener todos los horarios de asesorías
    const allSchedules = await AdvisorySchedule.find({}).lean();
    console.log(`📅 Total de horarios configurados: ${allSchedules.length}`);

    // Filtrar por Consultorio Financiero
    const consultorioSchedules = allSchedules.filter(schedule => 
      schedule.type === 'ConsultorioFinanciero' && schedule.activo
    );
    console.log(`🏥 Horarios activos de Consultorio Financiero: ${consultorioSchedules.length}`);

    // Agrupar por día de la semana
    const schedulesByDay: {[key: number]: any[]} = {};
    consultorioSchedules.forEach(schedule => {
      if (!schedulesByDay[schedule.dayOfWeek]) {
        schedulesByDay[schedule.dayOfWeek] = [];
      }
      schedulesByDay[schedule.dayOfWeek].push({
        hour: schedule.hour,
        minute: schedule.minute,
        duration: schedule.duration,
        price: schedule.price,
        timeSlot: `${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`
      });
    });

    // Mapear días de la semana
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    const formattedSchedules = Object.keys(schedulesByDay).map(dayNum => {
      const dayIndex = parseInt(dayNum);
      return {
        dayOfWeek: dayIndex,
        dayName: dayNames[dayIndex],
        slots: schedulesByDay[dayIndex].sort((a, b) => {
          if (a.hour !== b.hour) return a.hour - b.hour;
          return a.minute - b.minute;
        })
      };
    });

    // Verificar días específicos problemáticos
    const problematicDays = [
      { name: 'Lunes', dayOfWeek: 1 },
      { name: 'Martes', dayOfWeek: 2 }
    ];

    const dayAnalysis = problematicDays.map(day => {
      const daySchedules = schedulesByDay[day.dayOfWeek] || [];
      return {
        dayName: day.name,
        dayOfWeek: day.dayOfWeek,
        totalSlots: daySchedules.length,
        slots: daySchedules,
        hasSlots: daySchedules.length > 0
      };
    });

    const response = {
      totalSchedules: allSchedules.length,
      consultorioSchedules: consultorioSchedules.length,
      schedulesByDay: formattedSchedules,
      dayAnalysis,
      rawSchedules: consultorioSchedules,
      systemStatus: 'OK',
      timestamp: new Date().toISOString(),
      message: consultorioSchedules.length > 0 
        ? `${consultorioSchedules.length} horarios configurados para Consultorio Financiero`
        : 'No hay horarios configurados para Consultorio Financiero'
    };

    console.log('✅ [DEBUG-SCHEDULES] Verificación completada');
    console.log(`📊 Resumen: ${consultorioSchedules.length} horarios activos encontrados`);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ [DEBUG-SCHEDULES] Error:', error);
    return res.status(500).json({ error: 'Error al verificar horarios' });
  }
} 