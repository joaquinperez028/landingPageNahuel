import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import TrainingSchedule from '@/models/TrainingSchedule';
import AdvisorySchedule from '@/models/AdvisorySchedule';
import { z } from 'zod';

// Cache en memoria para optimizar rendimiento
const cache = new Map<string, { data: any; timestamp: number; }>();
const CACHE_DURATION = 60000; // 1 minuto en milisegundos

// Schema de validación optimizado
const generateTurnosSchema = z.object({
  type: z.enum(['training', 'advisory']).optional(),
  advisoryType: z.enum(['ConsultorioFinanciero', 'CuentaAsesorada']).optional(),
  days: z.string().transform(val => parseInt(val) || 15).pipe(z.number().min(1).max(30)).optional().default("15"),
  maxSlotsPerDay: z.string().transform(val => parseInt(val) || 6).pipe(z.number().min(1).max(12)).optional().default("6"),
  useCache: z.string().transform(val => val !== 'false').optional().default("true")
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
 * API optimizada para generar turnos dinámicos con caché y queries eficientes
 * GET: Genera turnos disponibles para los próximos días (OPTIMIZADO)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  
  // Headers optimizados para caché selectivo
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60'); // Cache 30s en cliente, 60s en CDN
  
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Validar parámetros de forma optimizada
    const validationResult = generateTurnosSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Parámetros inválidos',
        details: validationResult.error.errors 
      });
    }

    const { type, advisoryType, days, maxSlotsPerDay, useCache } = validationResult.data;
    
    // Generar clave de caché única
    const cacheKey = `turnos_${type || 'all'}_${advisoryType || 'all'}_${days}_${maxSlotsPerDay}`;
    
    // Verificar caché si está habilitado
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        const responseTime = Date.now() - startTime;
        return res.status(200).json({
          ...cached.data,
          cached: true,
          responseTime: `${responseTime}ms`,
          source: 'memory_cache'
        });
      }
    }

    // **OPTIMIZACIÓN 1: Una sola query para obtener todos los schedules**
    const [trainingSchedules, advisorySchedules] = await Promise.all([
      !type || type === 'training' ? 
        TrainingSchedule.find({ activo: true }, 'dayOfWeek hour minute duration').lean() : 
        Promise.resolve([]),
      !type || type === 'advisory' ? 
        AdvisorySchedule.find(
          advisoryType ? { activo: true, type: advisoryType } : { activo: true },
          'dayOfWeek hour minute duration price type'
        ).lean() :
        Promise.resolve([])
    ]);

    // **OPTIMIZACIÓN 2: Una sola query para obtener todas las reservas relevantes**
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    
    const existingBookings = await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      startDate: { 
        $gte: today,
        $lte: endDate 
      },
      ...(advisoryType && { serviceType: advisoryType })
    }, 'startDate endDate serviceType').lean();

    // **OPTIMIZACIÓN 3: Pre-procesar reservas por fecha para acceso O(1)**
    const bookingsByDate = new Map<string, any[]>();
    existingBookings.forEach(booking => {
      const dateKey = new Date(booking.startDate).toDateString();
      if (!bookingsByDate.has(dateKey)) {
        bookingsByDate.set(dateKey, []);
      }
      bookingsByDate.get(dateKey)!.push(booking);
    });

    // **OPTIMIZACIÓN 4: Generar turnos de forma eficiente**
    const turnos: TurnoData[] = [];
    const datePromises: Promise<TurnoData | null>[] = [];

    for (let i = 1; i <= days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      
      // Skip weekends unless there are schedules
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const hasWeekendSchedule = 
          trainingSchedules.some(ts => ts.dayOfWeek === dayOfWeek) ||
          advisorySchedules.some(as => as.dayOfWeek === dayOfWeek);
        if (!hasWeekendSchedule) continue;
      }

      // Procesar fecha de forma asíncrona (pero sin await para paralelizar)
      datePromises.push(
        processDateSlots(
          targetDate,
          type,
          advisoryType,
          trainingSchedules,
          advisorySchedules,
          bookingsByDate.get(targetDate.toDateString()) || [],
          maxSlotsPerDay
        )
      );
    }

    // **OPTIMIZACIÓN 5: Esperar todas las fechas en paralelo**
    const results = await Promise.all(datePromises);
    
    // Filtrar resultados válidos
    results.forEach(result => {
      if (result && result.horarios.length > 0) {
        turnos.push(result);
      }
    });

    // Limitar número total de días
    const finalTurnos = turnos.slice(0, 15);

    const responseData = {
      turnos: finalTurnos,
      generatedAt: new Date().toISOString(),
      timestamp: Date.now(),
      type: type || 'all',
      advisoryType: advisoryType || 'all',
      totalDaysWithSlots: finalTurnos.length,
      responseTime: `${Date.now() - startTime}ms`,
      cached: false,
      source: 'database'
    };

    // **OPTIMIZACIÓN 6: Guardar en caché para próximas requests**
    if (useCache) {
      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });
      
      // Limpiar caché viejo (garbage collection)
      if (cache.size > 50) {
        const now = Date.now();
        const keysToDelete: string[] = [];
        
        cache.forEach((value, key) => {
          if (now - value.timestamp > CACHE_DURATION * 2) {
            keysToDelete.push(key);
          }
        });
        
        keysToDelete.forEach(key => {
          cache.delete(key);
        });
      }
    }

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Error al generar turnos:', error);
    return res.status(500).json({ 
      error: 'Error al generar turnos',
      responseTime: `${Date.now() - startTime}ms`
    });
  }
}

/**
 * Procesa slots disponibles para una fecha específica de forma optimizada
 */
async function processDateSlots(
  targetDate: Date,
  type: string | undefined,
  advisoryType: string | undefined,
  trainingSchedules: any[],
  advisorySchedules: any[],
  dayBookings: any[],
  maxSlotsPerDay: number
): Promise<TurnoData | null> {
  const dayOfWeek = targetDate.getDay();
  const dateKey = formatDateForDisplay(targetDate);

  // **OPTIMIZACIÓN: Procesar solo el tipo solicitado**
  if (type === 'advisory' || !type) {
    const availableSlots = getAdvisorySlotsOptimized(
      dayOfWeek,
      advisorySchedules,
      dayBookings,
      advisoryType
    );

    if (availableSlots.length > 0) {
      const limitedSlots = availableSlots.slice(0, maxSlotsPerDay);
      const price = advisorySchedules.find(as => 
        as.dayOfWeek === dayOfWeek && (!advisoryType || as.type === advisoryType)
      )?.price;

      return {
        fecha: dateKey,
        horarios: limitedSlots,
        disponibles: limitedSlots.length,
        type: 'advisory',
        advisoryType: advisoryType as any,
        price
      };
    }
  }

  if (type === 'training' || !type) {
    const availableSlots = getTrainingSlotsOptimized(
      dayOfWeek,
      trainingSchedules,
      dayBookings
    );

    if (availableSlots.length > 0) {
      const limitedSlots = availableSlots.slice(0, maxSlotsPerDay);
      
      return {
        fecha: dateKey,
        horarios: limitedSlots,
        disponibles: limitedSlots.length,
        type: 'training'
      };
    }
  }

  return null;
}

/**
 * Obtiene slots de asesorías de forma optimizada
 */
function getAdvisorySlotsOptimized(
  dayOfWeek: number,
  advisorySchedules: any[],
  dayBookings: any[],
  advisoryType?: string
): string[] {
  // Filtrar schedules para este día
  const daySchedules = advisorySchedules.filter(schedule => 
    schedule.dayOfWeek === dayOfWeek && 
    (!advisoryType || schedule.type === advisoryType)
  );

  if (daySchedules.length === 0) return [];

  // Generar slots disponibles
  const availableSlots: string[] = [];
  
  daySchedules.forEach(schedule => {
    const slotTime = `${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;
    
    // Verificar si el slot está ocupado
    const isOccupied = dayBookings.some(booking => {
      const bookingHour = new Date(booking.startDate).getHours();
      const bookingMinute = new Date(booking.startDate).getMinutes();
      const bookingTime = `${bookingHour.toString().padStart(2, '0')}:${bookingMinute.toString().padStart(2, '0')}`;
      return bookingTime === slotTime;
    });

    if (!isOccupied && !availableSlots.includes(slotTime)) {
      availableSlots.push(slotTime);
    }
  });

  return availableSlots.sort();
}

/**
 * Obtiene slots de entrenamientos de forma optimizada
 */
function getTrainingSlotsOptimized(
  dayOfWeek: number,
  trainingSchedules: any[],
  dayBookings: any[]
): string[] {
  // Filtrar schedules para este día
  const daySchedules = trainingSchedules.filter(schedule => 
    schedule.dayOfWeek === dayOfWeek
  );

  if (daySchedules.length === 0) return [];

  // Generar slots disponibles
  const availableSlots: string[] = [];
  
  daySchedules.forEach(schedule => {
    const slotTime = `${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;
    
    // Verificar si el slot está ocupado
    const isOccupied = dayBookings.some(booking => {
      const bookingHour = new Date(booking.startDate).getHours();
      const bookingMinute = new Date(booking.startDate).getMinutes();
      const bookingTime = `${bookingHour.toString().padStart(2, '0')}:${bookingMinute.toString().padStart(2, '0')}`;
      return bookingTime === slotTime;
    });

    if (!isOccupied && !availableSlots.includes(slotTime)) {
      availableSlots.push(slotTime);
    }
  });

  return availableSlots.sort();
}

/**
 * Formatea fecha para mostrar al usuario
 */
function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
} 