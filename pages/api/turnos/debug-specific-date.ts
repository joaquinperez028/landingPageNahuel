import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Booking from '../../../models/Booking';
import AdvisorySchedule from '../../../models/AdvisorySchedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    console.log('🔍 [DEBUG-SPECIFIC] Debuggeando Lun 14 Jul específicamente...');

    // Parsear "Lun 14 Jul" como lo hace el sistema
    const fechaStr = "Lun 14 Jul";
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dateParts = fechaStr.split(' ');
    const day = parseInt(dateParts[1]); // 14
    const monthName = dateParts[2]; // Jul
    const monthIndex = monthNames.indexOf(monthName); // 6 (Julio)
    
    const currentYear = new Date().getFullYear(); // 2025
    const targetDate = new Date(currentYear, monthIndex, day); // 2025-07-14
    
    // Si la fecha es anterior a hoy, asumir que es del próximo año
    if (targetDate < new Date()) {
      targetDate.setFullYear(currentYear + 1);
    }

    console.log(`📅 Fecha parseada: ${targetDate.toISOString()}`);
    console.log(`📅 Fecha local: ${targetDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    console.log(`📅 Día de la semana: ${targetDate.getDay()} (0=Dom, 1=Lun, 2=Mar...)`);

    // Buscar TODAS las reservas de Consultorio Financiero
    const allConsultorioBookings = await Booking.find({
      serviceType: 'ConsultorioFinanciero',
      status: { $in: ['pending', 'confirmed'] }
    }).lean();

    console.log(`📋 Total reservas de Consultorio Financiero: ${allConsultorioBookings.length}`);

    // Filtrar reservas para esta fecha específica
    const bookingsForThisDate = allConsultorioBookings.filter(booking => {
      const bookingDate = new Date(booking.startDate);
      const sameDate = (
        bookingDate.getFullYear() === targetDate.getFullYear() &&
        bookingDate.getMonth() === targetDate.getMonth() &&
        bookingDate.getDate() === targetDate.getDate()
      );
      
      if (sameDate) {
        console.log(`🎯 RESERVA ENCONTRADA para ${fechaStr}:`);
        console.log(`  Usuario: ${booking.userEmail}`);
        console.log(`  Fecha reserva: ${bookingDate.toISOString()}`);
        console.log(`  Fecha local: ${bookingDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
        console.log(`  Hora: ${bookingDate.getHours()}:${bookingDate.getMinutes().toString().padStart(2, '0')}`);
        console.log(`  Status: ${booking.status}`);
      }
      
      return sameDate;
    });

    console.log(`📊 Reservas encontradas para ${fechaStr}: ${bookingsForThisDate.length}`);

    // Obtener horarios configurados para este día
    const dayOfWeek = targetDate.getDay();
    const schedulesForDay = await AdvisorySchedule.find({
      type: 'ConsultorioFinanciero',
      dayOfWeek: dayOfWeek,
      activo: true
    }).lean();

    console.log(`⚙️ Horarios configurados para día ${dayOfWeek}: ${schedulesForDay.length}`);
    
    const configuredSlots = schedulesForDay.map(schedule => {
      const timeSlot = `${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;
      console.log(`  - Slot configurado: ${timeSlot}`);
      return timeSlot;
    });

    // Simular el proceso de filtrado
    const availableSlots = configuredSlots.filter(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotStart = new Date(targetDate);
      slotStart.setHours(slotHour, slotMinute, 0, 0);
      
      console.log(`🔍 Verificando slot ${slot}:`);
      console.log(`  Slot datetime: ${slotStart.toISOString()}`);
      
      // Buscar conflictos exactos
      const conflicts = bookingsForThisDate.filter(booking => {
        const bookingStart = new Date(booking.startDate);
        const exactMatch = (
          bookingStart.getFullYear() === slotStart.getFullYear() &&
          bookingStart.getMonth() === slotStart.getMonth() &&
          bookingStart.getDate() === slotStart.getDate() &&
          bookingStart.getHours() === slotStart.getHours() &&
          bookingStart.getMinutes() === slotStart.getMinutes()
        );
        
        if (exactMatch) {
          console.log(`  ❌ CONFLICTO EXACTO con reserva de ${booking.userEmail}`);
        } else {
          console.log(`  ✅ Sin conflicto exacto`);
          console.log(`    Reserva: ${bookingStart.getHours()}:${bookingStart.getMinutes().toString().padStart(2, '0')}`);
          console.log(`    Slot:    ${slotStart.getHours()}:${slotStart.getMinutes().toString().padStart(2, '0')}`);
        }
        
        return exactMatch;
      });
      
      const isAvailable = conflicts.length === 0;
      console.log(`  Resultado: ${isAvailable ? '✅ DISPONIBLE' : '❌ OCUPADO'} (${conflicts.length} conflictos)`);
      
      return isAvailable;
    });

    const response = {
      fechaAnalizada: fechaStr,
      fechaParsed: targetDate.toISOString(),
      dayOfWeek: dayOfWeek,
      totalReservasConsultorio: allConsultorioBookings.length,
      reservasParaEstaFecha: bookingsForThisDate.length,
      detallesReservas: bookingsForThisDate.map(booking => ({
        usuario: booking.userEmail,
        fechaReserva: booking.startDate,
        hora: `${new Date(booking.startDate).getHours()}:${new Date(booking.startDate).getMinutes().toString().padStart(2, '0')}`,
        status: booking.status
      })),
      horariosConfigurados: configuredSlots,
      slotsDisponibles: availableSlots,
      problemaDiagnosticado: availableSlots.length > 0 && bookingsForThisDate.length > 0 
        ? 'HAY RESERVAS PERO SLOTS SIGUEN DISPONIBLES - PROBLEMA CONFIRMADO'
        : 'Sistema funcionando correctamente',
      timestamp: new Date().toISOString()
    };

    console.log('🏁 [DEBUG-SPECIFIC] Análisis completado');
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ [DEBUG-SPECIFIC] Error:', error);
    return res.status(500).json({ error: 'Error en el análisis específico' });
  }
} 