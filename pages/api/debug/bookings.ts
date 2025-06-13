import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

/**
 * API temporal para debuggear reservas
 * GET: Mostrar todas las reservas existentes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Debuggeando reservas existentes...');

    // Obtener todas las reservas activas
    const allBookings = await Booking.find({
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ startDate: 1 });

    console.log(`📊 Total de reservas activas: ${allBookings.length}`);

    // Formatear las reservas para mostrar información útil
    const formattedBookings = allBookings.map(booking => ({
      id: booking._id,
      userEmail: booking.userEmail,
      type: booking.type,
      serviceType: booking.serviceType,
      startDate: booking.startDate,
      endDate: booking.endDate,
      duration: booking.duration,
      status: booking.status,
      createdAt: booking.createdAt,
      // Formatear fechas para lectura fácil
      startDateFormatted: booking.startDate.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Montevideo'
      }),
      endDateFormatted: booking.endDate.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Montevideo'
      })
    }));

    // Agrupar por fecha para análisis
    const bookingsByDate = formattedBookings.reduce((acc, booking) => {
      const dateKey = booking.startDate.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(booking);
      return acc;
    }, {} as Record<string, any[]>);

    return res.status(200).json({
      totalBookings: allBookings.length,
      bookings: formattedBookings,
      bookingsByDate,
      message: 'Datos de debugging de reservas'
    });

  } catch (error) {
    console.error('❌ Error al debuggear reservas:', error);
    return res.status(500).json({ error: 'Error al obtener datos de debugging' });
  }
} 