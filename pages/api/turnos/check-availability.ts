import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { z } from 'zod';

// Cache para verificación de disponibilidad
const availabilityCache = new Map<string, { available: boolean; timestamp: number; }>();
const CACHE_DURATION = 30000; // 30 segundos

// Schema de validación
const checkAvailabilitySchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$|^\w{3} \d{1,2} \w{3}$/), // YYYY-MM-DD o "Lun 15 Ene"
  horario: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  serviceType: z.string().optional().default('ConsultorioFinanciero')
});

/**
 * API optimizada para verificar disponibilidad de turnos específicos
 * POST: Verifica si un horario específico está disponible
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Headers para cache controlado
  res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30');
  
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const startTime = Date.now();
    
    // Validar entrada
    const validationResult = checkAvailabilitySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Parámetros inválidos',
        details: validationResult.error.errors 
      });
    }

    const { fecha, horario, serviceType } = validationResult.data;

    // Generar clave de caché
    const cacheKey = `${fecha}_${horario}_${serviceType}`;
    
    // Verificar caché
    const cached = availabilityCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return res.status(200).json({
        available: cached.available,
        fecha,
        horario,
        serviceType,
        cached: true,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Parsear fecha
    const targetDate = parseDateString(fecha);
    if (!targetDate) {
      return res.status(400).json({ error: 'Formato de fecha inválido' });
    }

    // Parsear horario
    const [hour, minute] = horario.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return res.status(400).json({ error: 'Formato de horario inválido' });
    }

    // Crear fecha/hora específica
    const requestedDateTime = new Date(targetDate);
    requestedDateTime.setHours(hour, minute, 0, 0);

    // **OPTIMIZACIÓN: Query específica y eficiente**
    const existingBooking = await Booking.findOne({
      serviceType,
      status: { $in: ['pending', 'confirmed'] },
      startDate: requestedDateTime
    }, '_id').lean();

    const isAvailable = !existingBooking;

    // **OPTIMIZACIÓN: Guardar en caché**
    availabilityCache.set(cacheKey, {
      available: isAvailable,
      timestamp: Date.now()
    });

    // Limpiar caché viejo
    if (availabilityCache.size > 100) {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      availabilityCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION * 2) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => {
        availabilityCache.delete(key);
      });
    }

    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      available: isAvailable,
      fecha,
      horario,
      serviceType,
      cached: false,
      responseTime: `${responseTime}ms`,
      requestedDateTime: requestedDateTime.toISOString()
    });

  } catch (error) {
    console.error('❌ Error al verificar disponibilidad:', error);
    return res.status(500).json({ 
      error: 'Error al verificar disponibilidad',
      responseTime: `${Date.now() - Date.now()}ms`
    });
  }
}

/**
 * Parsea diferentes formatos de fecha
 */
function parseDateString(dateStr: string): Date | null {
  try {
    // Formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr);
    }

    // Formato "Lun 15 Ene" (formato español)
    if (/^\w{3} \d{1,2} \w{3}$/.test(dateStr)) {
      return parseSpanishDate(dateStr);
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Parsea fecha en formato español "Lun 15 Ene"
 */
function parseSpanishDate(dateStr: string): Date | null {
  const monthMap: { [key: string]: number } = {
    'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
  };

  const parts = dateStr.split(' ');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[1]);
  const month = monthMap[parts[2]];
  const year = new Date().getFullYear();

  if (isNaN(day) || month === undefined) return null;

  const date = new Date(year, month, day);
  
  // Si la fecha es anterior a hoy, asumimos que es del próximo año
  if (date < new Date()) {
    date.setFullYear(year + 1);
  }

  return date;
} 