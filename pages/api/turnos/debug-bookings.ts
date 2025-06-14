import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Booking from '../../../models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    console.log('🔍 Debugging: Consultando todas las reservas...');

    // Buscar TODAS las reservas
    const allBookings = await Booking.find({}).sort({ startDate: 1 });
    
    console.log(`📋 Total de reservas encontradas: ${allBookings.length}`);

    const bookingsInfo = allBookings.map((booking, index) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      
      return {
        index: index + 1,
        id: booking._id,
        userEmail: booking.userEmail,
        type: booking.type,
        serviceType: booking.serviceType,
        status: booking.status,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateLocal: startDate.toLocaleString('es-UY'),
        endDateLocal: endDate.toLocaleString('es-UY'),
        price: booking.price,
        createdAt: booking.createdAt
      };
    });

    // Filtrar solo las de Consultorio Financiero
    const consultorioBookings = bookingsInfo.filter(b => b.serviceType === 'ConsultorioFinanciero');
    
    // Filtrar solo las activas (pending o confirmed)
    const activeBookings = bookingsInfo.filter(b => ['pending', 'confirmed'].includes(b.status));

    console.log('📊 Resumen:');
    console.log(`  - Total reservas: ${allBookings.length}`);
    console.log(`  - Consultorio Financiero: ${consultorioBookings.length}`);
    console.log(`  - Activas (pending/confirmed): ${activeBookings.length}`);

    return res.status(200).json({
      success: true,
      total: allBookings.length,
      consultorioFinanciero: consultorioBookings.length,
      active: activeBookings.length,
      bookings: bookingsInfo,
      consultorioBookings,
      activeBookings,
      debug: {
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });

  } catch (error) {
    console.error('❌ Error al consultar reservas:', error);
    return res.status(500).json({ 
      error: 'Error al consultar reservas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 