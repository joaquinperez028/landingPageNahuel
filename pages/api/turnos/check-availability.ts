import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Booking from '../../../models/Booking';
import AdvisorySchedule from '../../../models/AdvisorySchedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    const { fecha, horario, tipo = 'advisory', servicioTipo = 'ConsultorioFinanciero' } = req.body;

    if (!fecha || !horario) {
      return res.status(400).json({ error: 'Fecha y horario son requeridos' });
    }

    console.log(`🔍 Verificando disponibilidad: ${fecha} ${horario} (${tipo}/${servicioTipo})`);

    // Parsear la fecha
    const [day, month, year] = fecha.split('/').map(Number);
    const targetDate = new Date(year, month - 1, day);
    
    // Parsear el horario
    const [hour, minute] = horario.split(':').map(Number);
    const slotStart = new Date(targetDate);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60000); // 60 minutos

    console.log(`📅 Verificando slot: ${slotStart.toISOString()} - ${slotEnd.toISOString()}`);

    // Buscar reservas existentes que puedan conflictuar
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      startDate: { $gte: startOfDay, $lte: endOfDay }
    });

    console.log(`📋 Reservas encontradas para el día: ${existingBookings.length}`);

    // Verificar conflictos
    const conflictingBookings = existingBookings.filter(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      // Verificar si hay solapamiento
      const hasOverlap = (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      );

      if (hasOverlap) {
        console.log(`🚫 Conflicto detectado con reserva de ${booking.userEmail}`);
        console.log(`  Reserva: ${bookingStart.toISOString()} - ${bookingEnd.toISOString()}`);
      }

      return hasOverlap;
    });

    const isAvailable = conflictingBookings.length === 0;

    console.log(`${isAvailable ? '✅' : '❌'} Turno ${fecha} ${horario} ${isAvailable ? 'disponible' : 'NO disponible'}`);

    return res.status(200).json({
      available: isAvailable,
      fecha,
      horario,
      conflicts: conflictingBookings.length,
      message: isAvailable 
        ? 'Turno disponible' 
        : `Turno no disponible - ${conflictingBookings.length} conflicto(s) encontrado(s)`
    });

  } catch (error) {
    console.error('❌ Error al verificar disponibilidad:', error);
    return res.status(500).json({ error: 'Error al verificar disponibilidad' });
  }
} 