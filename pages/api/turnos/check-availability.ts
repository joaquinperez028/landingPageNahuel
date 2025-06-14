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

    // Parsear la fecha (formato: "Lun 16 Jun")
    let targetDate: Date;
    
    if (fecha.includes('/')) {
      // Formato: "16/06/2025"
      const [day, month, year] = fecha.split('/').map(Number);
      targetDate = new Date(year, month - 1, day);
    } else {
      // Formato: "Lun 16 Jun"
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dateParts = fecha.split(' ');
      const day = parseInt(dateParts[1]);
      const monthName = dateParts[2];
      const monthIndex = monthNames.indexOf(monthName);
      
      if (monthIndex === -1) {
        return res.status(400).json({ error: 'Formato de fecha inválido' });
      }
      
      const currentYear = new Date().getFullYear();
      targetDate = new Date(currentYear, monthIndex, day);
      
      // Si la fecha es anterior a hoy, asumir que es del próximo año
      if (targetDate < new Date()) {
        targetDate.setFullYear(currentYear + 1);
      }
    }
    
    console.log(`📅 Fecha parseada: ${targetDate.toISOString()}`);
    
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
      $and: [
        { status: { $in: ['pending', 'confirmed'] } },
        { serviceType: 'ConsultorioFinanciero' },
        { startDate: { $gte: startOfDay, $lt: endOfDay } }
      ]
    }).lean();

    console.log(`📋 Reservas encontradas para el día: ${existingBookings.length}`);

    // VERIFICACIÓN DIRECTA Y SIMPLE
    const conflictingBookings = existingBookings.filter(booking => {
      const bookingStart = new Date(booking.startDate);
      
      // COMPARACIÓN EXACTA: mismo día y misma hora
      const exactMatch = (
        bookingStart.getFullYear() === slotStart.getFullYear() &&
        bookingStart.getMonth() === slotStart.getMonth() &&
        bookingStart.getDate() === slotStart.getDate() &&
        bookingStart.getHours() === slotStart.getHours() &&
        bookingStart.getMinutes() === slotStart.getMinutes()
      );

      if (exactMatch) {
        console.log(`🚫 CONFLICTO EXACTO con reserva de ${booking.userEmail}`);
        console.log(`  Slot: ${slotStart.toISOString()}`);
        console.log(`  Reserva: ${bookingStart.toISOString()}`);
      }

      return exactMatch;
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