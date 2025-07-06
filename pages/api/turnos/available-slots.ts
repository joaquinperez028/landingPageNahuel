import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import AvailableSlot from '@/models/AvailableSlot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Método no permitido',
      message: 'Este endpoint solo acepta peticiones GET' 
    });
  }

  try {
    await dbConnect();

    const { 
      serviceType = 'ConsultorioFinanciero',
      days = '15',
      limit = '50'
    } = req.query;

    console.log(`🔍 Obteniendo horarios disponibles para: ${serviceType}`);
    
    const startTime = Date.now();

    // Obtener fecha actual en formato DD/MM/YYYY
    const today = new Date();
    const todayStr = today.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    console.log(`📅 Fecha actual: ${todayStr}`);

    // Obtener horarios disponibles - consulta simplificada
    const availableSlots = await AvailableSlot.find({
      serviceType,
      available: true
    })
    .sort({ date: 1, time: 1 })
    .limit(parseInt(limit as string))
    .lean();

    console.log(`📊 Encontrados ${availableSlots.length} horarios disponibles (antes de filtrar por fecha)`);

    // Filtrar fechas futuras en JavaScript (más confiable)
    const futureSlots = availableSlots.filter(slot => {
      try {
        // Convertir fecha DD/MM/YYYY a Date para comparación
        const [day, month, year] = slot.date.split('/').map(Number);
        const [hour, minute] = slot.time.split(':').map(Number);
        
        const slotDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();
        
        const isFuture = slotDate > now;
        
        if (!isFuture) {
          console.log(`⏭️ Saltando horario pasado: ${slot.date} ${slot.time}`);
        }
        
        return isFuture;
      } catch (error) {
        console.error(`❌ Error procesando fecha: ${slot.date} ${slot.time}`, error);
        return false;
      }
    });

    console.log(`📊 Horarios futuros: ${futureSlots.length}`);

    // Agrupar por fecha
    const turnosPorFecha = new Map<string, string[]>();
    
    futureSlots.forEach(slot => {
      if (!turnosPorFecha.has(slot.date)) {
        turnosPorFecha.set(slot.date, []);
      }
      turnosPorFecha.get(slot.date)!.push(slot.time);
    });

    // Convertir a formato esperado por el frontend
    const turnos = Array.from(turnosPorFecha.entries()).map(([fecha, horarios]) => ({
      fecha,
      horarios: horarios.sort(), // Ordenar horarios
      disponibles: horarios.length
    }));

    const responseTime = Date.now() - startTime;

    console.log(`✅ Respuesta generada en ${responseTime}ms - ${turnos.length} días con turnos`);

    res.status(200).json({
      success: true,
      turnos,
      total: futureSlots.length,
      dias: turnos.length,
      serviceType,
      source: 'database_direct',
      responseTime: `${responseTime}ms`,
      cached: false
    });

  } catch (error) {
    console.error('❌ Error al obtener horarios disponibles:', error);
    
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los horarios disponibles',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 