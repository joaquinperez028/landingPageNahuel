import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import TrainingSchedule from '@/models/TrainingSchedule';
import AdvisorySchedule from '@/models/AdvisorySchedule';
import { z } from 'zod';

// Schema de validación
const generateTurnosSchema = z.object({
  type: z.enum(['training', 'advisory']).optional(),
  advisoryType: z.enum(['ConsultorioFinanciero', 'CuentaAsesorada']).optional(),
  days: z.string().transform(val => parseInt(val) || 30).pipe(z.number().min(1).max(60)).optional().default("30"),
  maxSlotsPerDay: z.string().transform(val => parseInt(val) || 6).pipe(z.number().min(1).max(20)).optional().default("6")
});

interface TurnoData {
  fecha: string;
  horarios: string[];
  disponibles: number;
  type?: 'training' | 'advisory';
  advisoryType?: 'ConsultorioFinanciero' | 'CuentaAsesorada';
  price?: number;
}

/**
 * API para generar turnos dinámicos
 * GET: Genera turnos disponibles para los próximos días
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar headers para evitar caché en Vercel
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔄 Generando turnos dinámicos...');

    // Validar parámetros
    const validationResult = generateTurnosSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Parámetros inválidos',
        details: validationResult.error.errors 
      });
    }

    const { type, advisoryType, days, maxSlotsPerDay } = validationResult.data;
    const turnos: TurnoData[] = [];
    const today = new Date();

    // Obtener horarios configurados según el tipo
    let trainingSchedules: any[] = [];
    let advisorySchedules: any[] = [];

    if (!type || type === 'training') {
      trainingSchedules = await TrainingSchedule.find({ activo: true });
    }

    if (!type || type === 'advisory') {
      const advisoryFilter: any = { activo: true };
      if (advisoryType) {
        advisoryFilter.type = advisoryType;
      }
      advisorySchedules = await AdvisorySchedule.find(advisoryFilter);
    }

    // Generar turnos para los próximos días
    for (let i = 1; i <= days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      
      // Saltar fines de semana si no hay horarios configurados
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const hasWeekendSchedule = 
          trainingSchedules.some(ts => ts.dayOfWeek === dayOfWeek) ||
          advisorySchedules.some(as => as.dayOfWeek === dayOfWeek);
        if (!hasWeekendSchedule) continue;
      }

      // Obtener slots disponibles para entrenamientos
      if (!type || type === 'training') {
        const trainingSlots = await getAvailableSlotsForDate(
          targetDate, 
          'training', 
          trainingSchedules,
          []
        );

        if (trainingSlots.length > 0) {
          const limitedSlots = trainingSlots.slice(0, maxSlotsPerDay);
          
          turnos.push({
            fecha: formatDateForDisplay(targetDate),
            horarios: limitedSlots,
            disponibles: limitedSlots.length,
            type: 'training'
          });
        }
      }

      // Obtener slots disponibles para asesorías
      if (!type || type === 'advisory') {
        const advisorySlots = await getAvailableSlotsForDate(
          targetDate, 
          'advisory', 
          trainingSchedules,
          advisorySchedules,
          advisoryType
        );

        console.log(`📊 Fecha ${formatDateForDisplay(targetDate)}: ${advisorySlots.length} slots disponibles`);
        
        // CRÍTICO: SOLO agregar días que tengan turnos realmente disponibles
        if (advisorySlots.length > 0) {
          const limitedSlots = advisorySlots.slice(0, maxSlotsPerDay);
          
          // DOBLE VERIFICACIÓN: Asegurar que los slots no estén vacíos
          if (limitedSlots.length > 0) {
            // Obtener precio de la asesoría
            const daySchedules = advisorySchedules.filter(as => as.dayOfWeek === dayOfWeek);
            const price = daySchedules.length > 0 ? daySchedules[0].price : undefined;
            
            console.log(`✅ AGREGANDO día ${formatDateForDisplay(targetDate)} con ${limitedSlots.length} turnos: [${limitedSlots.join(', ')}]`);
            
            turnos.push({
              fecha: formatDateForDisplay(targetDate),
              horarios: limitedSlots,
              disponibles: limitedSlots.length,
              type: 'advisory',
              advisoryType: advisoryType,
              price: price
            });
          } else {
            console.log(`🚫 Día ${formatDateForDisplay(targetDate)} excluido - limitedSlots vacío`);
          }
        } else {
          console.log(`🚫 Día ${formatDateForDisplay(targetDate)} EXCLUIDO - sin turnos disponibles (advisorySlots.length = 0)`);
        }
      }

      // Limitar número total de días con turnos
      if (turnos.length >= 15) break;
    }

    console.log(`✅ Generados ${turnos.length} días con turnos disponibles`);

    // Headers agresivos de no-cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Timestamp', Date.now().toString());

    return res.status(200).json({ 
      turnos,
      generatedAt: new Date().toISOString(),
      timestamp: Date.now(),
      type: type || 'all',
      advisoryType: advisoryType || 'all',
      cacheBreaker: Math.random().toString(36).substring(7),
      totalDaysWithSlots: turnos.length,
      debug: {
        requestTime: new Date().toISOString(),
        totalBookingsFound: 'check logs'
      }
    });

  } catch (error) {
    console.error('❌ Error al generar turnos:', error);
    return res.status(500).json({ error: 'Error al generar turnos' });
  }
}

/**
 * Obtiene slots disponibles para una fecha específica
 */
async function getAvailableSlotsForDate(
  targetDate: Date, 
  type: 'training' | 'advisory',
  trainingSchedules: any[] = [],
  advisorySchedules: any[] = [],
  advisoryType?: 'ConsultorioFinanciero' | 'CuentaAsesorada'
): Promise<string[]> {
  const dayOfWeek = targetDate.getDay();

  // Obtener reservas existentes para esta fecha
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  console.log(`🔍 Buscando reservas existentes para ${targetDate.toDateString()}`);
  console.log(`📅 Rango: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`);

  // Buscar TODAS las reservas primero para debugging
  const allBookings = await Booking.find({});
  console.log(`🗂️ TOTAL de reservas en la base de datos: ${allBookings.length}`);
  
  if (allBookings.length > 0) {
    console.log('📋 Todas las reservas:');
    allBookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.userEmail} - ${booking.startDate.toISOString()} - Status: ${booking.status} - Tipo: ${booking.type}/${booking.serviceType}`);
    });
  }

  // BUSCAR TODAS LAS RESERVAS DE CONSULTORIO FINANCIERO
  const existingBookings = await Booking.find({
    serviceType: 'ConsultorioFinanciero',
    status: { $in: ['pending', 'confirmed'] }
  }).lean();
  
  // Filtrar las del día específico
  const bookingsForDay = existingBookings.filter(booking => {
    const bookingDate = new Date(booking.startDate);
    return bookingDate.getFullYear() === targetDate.getFullYear() &&
           bookingDate.getMonth() === targetDate.getMonth() &&
           bookingDate.getDate() === targetDate.getDate();
  });

  console.log(`📋 Total reservas de Consultorio Financiero: ${existingBookings.length}`);
  console.log(`📋 Reservas para el día ${targetDate.toDateString()}: ${bookingsForDay.length}`);
  
  bookingsForDay.forEach((booking, index) => {
    console.log(`  ${index + 1}. ${booking.userEmail} - ${new Date(booking.startDate).toISOString()} - Status: ${booking.status}`);
  });

  // También buscar reservas de Consultorio Financiero específicamente
  const consultorioBookings = await Booking.find({
    status: { $in: ['pending', 'confirmed'] },
    serviceType: 'ConsultorioFinanciero'
  });
  
  console.log(`🏥 Reservas de Consultorio Financiero en total: ${consultorioBookings.length}`);
  consultorioBookings.forEach((booking, index) => {
    console.log(`  ${index + 1}. ${booking.userEmail} - ${booking.startDate.toISOString()} - Status: ${booking.status}`);
  });

  if (type === 'training') {
    // Para entrenamientos, usar la lógica existente
    const trainingSlots = trainingSchedules
      .filter(training => training.dayOfWeek === dayOfWeek)
      .map(training => {
        const hour = training.hour.toString().padStart(2, '0');
        const minute = training.minute.toString().padStart(2, '0');
        return `${hour}:${minute}`;
      })
      .filter(slot => {
        // Verificar que no haya conflicto con reservas existentes
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotStart = new Date(targetDate);
        slotStart.setHours(slotHour, slotMinute, 0, 0);
        
        // Encontrar la duración del entrenamiento
        const training = trainingSchedules.find(t => 
          t.dayOfWeek === dayOfWeek && 
          t.hour === slotHour && 
          t.minute === slotMinute
        );
        const duration = training ? training.duration : 180; // Default 3 horas
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);
        
        const hasConflict = existingBookings.some(booking => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          
          // Verificar si hay solapamiento entre el slot y la reserva existente
          return (
            (slotStart >= bookingStart && slotStart < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotStart <= bookingStart && slotEnd >= bookingEnd)
          );
        });
        
        if (hasConflict) {
          console.log(`🚫 Slot de entrenamiento ${slot} excluido por conflicto con reserva existente`);
        }
        
        return !hasConflict;
      });

    return trainingSlots;
  }

  if (type === 'advisory') {
    // Para asesorías, usar horarios específicos de asesorías
    let relevantSchedules = advisorySchedules.filter(advisory => advisory.dayOfWeek === dayOfWeek);
    
    if (advisoryType) {
      relevantSchedules = relevantSchedules.filter(advisory => advisory.type === advisoryType);
    }

    console.log(`📋 Horarios configurados para ${advisoryType} en día ${dayOfWeek}: ${relevantSchedules.length}`);
    relevantSchedules.forEach(schedule => {
      console.log(`  - ${schedule.hour}:${schedule.minute.toString().padStart(2, '0')} (maxBookingsPerDay: ${schedule.maxBookingsPerDay || 'sin límite'})`);
    });

    // VERIFICACIÓN CRÍTICA: Verificar límite de reservas por día
    console.log(`📊 Reservas existentes para el día: ${bookingsForDay.length}`);
    
    // Si hay horarios con límite por día, verificar ese límite primero
    const hasMaxBookingsPerDay = relevantSchedules.some(schedule => schedule.maxBookingsPerDay && schedule.maxBookingsPerDay > 0);
    
    if (hasMaxBookingsPerDay) {
      const maxBookingsAllowed = Math.min(...relevantSchedules.filter(s => s.maxBookingsPerDay).map(s => s.maxBookingsPerDay));
      console.log(`🚨 LÍMITE DE RESERVAS POR DÍA DETECTADO: ${maxBookingsAllowed} máximo`);
      console.log(`📊 Reservas actuales para este día: ${bookingsForDay.length}`);
      
      if (bookingsForDay.length >= maxBookingsAllowed) {
        console.log(`🚫 DÍA COMPLETO - Se alcanzó el límite de ${maxBookingsAllowed} reservas por día`);
        console.log(`📋 Reservas existentes:`);
        bookingsForDay.forEach((booking, index) => {
          console.log(`  ${index + 1}. ${booking.userEmail} - ${new Date(booking.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
        });
        return []; // NO HAY SLOTS DISPONIBLES
      }
    }

    const advisorySlots = relevantSchedules
      .map(advisory => {
        const hour = advisory.hour.toString().padStart(2, '0');
        const minute = advisory.minute.toString().padStart(2, '0');
        return `${hour}:${minute}`;
      })
      .filter(slot => {
        // VERIFICACIÓN ADICIONAL: Verificar que no haya conflicto con reservas existentes por hora específica
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotStart = new Date(targetDate);
        slotStart.setHours(slotHour, slotMinute, 0, 0);
        
        console.log(`🔍 Verificando slot ${slot} para fecha ${targetDate.toDateString()}`);
        console.log(`📅 Slot datetime: ${slotStart.toISOString()}`);
        
        // BUSCAR CONFLICTOS EXACTOS POR HORA
        const conflictingBookings = bookingsForDay.filter(booking => {
          const bookingStart = new Date(booking.startDate);
          
          // COMPARACIÓN EXACTA: mismo año, mes, día, hora y minuto
          const exactMatch = (
            bookingStart.getFullYear() === slotStart.getFullYear() &&
            bookingStart.getMonth() === slotStart.getMonth() &&
            bookingStart.getDate() === slotStart.getDate() &&
            bookingStart.getHours() === slotStart.getHours() &&
            bookingStart.getMinutes() === slotStart.getMinutes()
          );

          if (exactMatch) {
            console.log(`🚫 CONFLICTO EXACTO ENCONTRADO para slot ${slot}:`);
            console.log(`  Slot solicitado: ${slotStart.toISOString()}`);
            console.log(`  Reserva existente: ${bookingStart.toISOString()}`);
            console.log(`  Usuario: ${booking.userEmail}`);
            console.log(`  Status: ${booking.status}`);
            console.log(`  Tipo: ${booking.serviceType}`);
          }

          return exactMatch;
        });
        
        const hasConflict = conflictingBookings.length > 0;
        
        if (hasConflict) {
          console.log(`🚫 SLOT ${slot} EXCLUIDO - ${conflictingBookings.length} conflicto(s) encontrado(s)`);
        } else {
          console.log(`✅ SLOT ${slot} DISPONIBLE - sin conflictos por hora`);
        }
        
        return !hasConflict;
      });

    console.log(`📊 Resultado final para ${targetDate.toDateString()}: ${advisorySlots.length} slots disponibles de ${relevantSchedules.length} configurados`);
    console.log(`📋 Slots disponibles: [${advisorySlots.join(', ')}]`);

    return advisorySlots;
  }

  return [];
}

/**
 * Formatea una fecha para mostrar
 */
function formatDateForDisplay(date: Date): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  return `${dayName} ${day} ${month}`;
} 