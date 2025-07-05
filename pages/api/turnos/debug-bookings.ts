import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Booking from '../../../models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Modo debug original
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
          createdAt: booking.createdAt,
          hasGoogleEventId: !!booking.googleEventId,
          googleEventId: booking.googleEventId || 'NULL'
        };
      });

      // Filtrar solo las de Consultorio Financiero
      const consultorioBookings = bookingsInfo.filter(b => b.serviceType === 'ConsultorioFinanciero');
      
      // Filtrar solo las activas (pending o confirmed)
      const activeBookings = bookingsInfo.filter(b => ['pending', 'confirmed'].includes(b.status));

      // Filtrar reservas fantasma (sin googleEventId)
      const ghostBookings = consultorioBookings.filter(b => !b.hasGoogleEventId);

      console.log('📊 Resumen:');
      console.log(`  - Total reservas: ${allBookings.length}`);
      console.log(`  - Consultorio Financiero: ${consultorioBookings.length}`);
      console.log(`  - Activas (pending/confirmed): ${activeBookings.length}`);
      console.log(`  - Reservas fantasma Consultorio: ${ghostBookings.length}`);

      return res.status(200).json({
        success: true,
        total: allBookings.length,
        consultorioFinanciero: consultorioBookings.length,
        active: activeBookings.length,
        ghostBookings: ghostBookings.length,
        bookings: bookingsInfo,
        consultorioBookings,
        activeBookings,
        ghostBookingsDetails: ghostBookings,
        debug: {
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    }

    if (req.method === 'POST') {
      // Funcionalidad de limpieza
      const { action, confirm } = req.body;

      if (action === 'cleanup-ghost' && confirm === 'DELETE_GHOST_BOOKINGS_NOW') {
        console.log('🧹 EJECUTANDO LIMPIEZA DE RESERVAS FANTASMA...');

        // Buscar reservas fantasma de Consultorio Financiero
        const ghostBookings = await Booking.find({
          $or: [
            { googleEventId: { $exists: false } },
            { googleEventId: null },
            { googleEventId: '' }
          ],
          serviceType: 'ConsultorioFinanciero',
          status: { $in: ['pending', 'confirmed'] }
        }).sort({ createdAt: -1 });

        console.log(`🎯 Reservas fantasma encontradas: ${ghostBookings.length}`);

        // Log detallado de lo que se va a eliminar
        ghostBookings.forEach((booking, index) => {
          console.log(`${index + 1}. ${booking.userEmail} - ${booking.startDate.toLocaleString('es-UY')} - ID: ${booking._id}`);
        });

        if (ghostBookings.length === 0) {
          return res.status(200).json({
            success: true,
            message: 'No se encontraron reservas fantasma para eliminar',
            deletedCount: 0
          });
        }

        // ELIMINAR RESERVAS FANTASMA
        const deleteResult = await Booking.deleteMany({
          _id: { $in: ghostBookings.map(b => b._id) }
        });

        console.log(`✅ LIMPIEZA COMPLETADA: ${deleteResult.deletedCount} reservas fantasma eliminadas`);

        return res.status(200).json({
          success: true,
          message: `Limpieza exitosa: ${deleteResult.deletedCount} reservas fantasma eliminadas`,
          deletedCount: deleteResult.deletedCount,
          deletedBookings: ghostBookings.map(booking => ({
            id: booking._id,
            userEmail: booking.userEmail,
            startDate: booking.startDate.toISOString(),
            startDateFormatted: booking.startDate.toLocaleString('es-UY')
          }))
        });
      }

      return res.status(400).json({ 
        error: 'Acción no válida',
        availableActions: {
          cleanup: 'POST con {action: "cleanup-ghost", confirm: "DELETE_GHOST_BOOKINGS_NOW"}'
        }
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('❌ Error al consultar/limpiar reservas:', error);
    return res.status(500).json({ 
      error: 'Error al consultar/limpiar reservas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 