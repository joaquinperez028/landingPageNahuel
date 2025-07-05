import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';

/**
 * API de limpieza de base de datos con funciones administrativas
 * Incluye limpieza de reservas fantasma y mantenimiento general
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticación y rol de admin
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  await dbConnect();

  // Verificar que el usuario es admin
  const user = await User.findOne({ email: session.user.email });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'ghost-bookings':
        return await cleanupGhostBookings(req, res);
      case 'list-bookings':
        return await listBookingsForCleanup(req, res);
      case 'delete-booking':
        return await deleteSpecificBooking(req, res);
      default:
        return res.status(400).json({ message: 'Acción no especificada' });
    }
  } catch (error) {
    console.error('❌ Error en cleanup:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

/**
 * Limpia reservas fantasma (reservas sin eventos de Google Calendar)
 */
async function cleanupGhostBookings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { dryRun = true } = req.body;

  console.log('🧹 Iniciando limpieza de reservas fantasma...');

  // Buscar reservas problemáticas
  const problemBookings = await Booking.find({
    $or: [
      { googleEventId: { $exists: false } },
      { googleEventId: null },
      { googleEventId: '' }
    ],
    serviceType: 'ConsultorioFinanciero',
    status: { $in: ['pending', 'confirmed'] }
  }).sort({ createdAt: -1 });

  console.log(`📋 Encontradas ${problemBookings.length} reservas fantasma`);

  if (dryRun) {
    // Solo mostrar lo que se haría sin eliminar
    return res.status(200).json({
      message: 'Simulación de limpieza completada',
      ghostBookings: problemBookings.map(booking => ({
        id: booking._id,
        userEmail: booking.userEmail,
        startDate: booking.startDate,
        endDate: booking.endDate,
        serviceType: booking.serviceType,
        status: booking.status,
        createdAt: booking.createdAt,
        hasGoogleEventId: !!booking.googleEventId
      })),
      totalFound: problemBookings.length,
      dryRun: true
    });
  }

  // Realizar limpieza real
  const deleteResult = await Booking.deleteMany({
    _id: { $in: problemBookings.map(b => b._id) }
  });

  console.log(`✅ Eliminadas ${deleteResult.deletedCount} reservas fantasma`);

  return res.status(200).json({
    message: 'Limpieza de reservas fantasma completada',
    deletedCount: deleteResult.deletedCount,
    dryRun: false
  });
}

/**
 * Lista reservas con detalles para revisión manual
 */
async function listBookingsForCleanup(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { serviceType = 'ConsultorioFinanciero', limit = 50 } = req.query;

  const bookings = await Booking.find({
    serviceType,
    status: { $in: ['pending', 'confirmed'] }
  })
  .sort({ createdAt: -1 })
  .limit(parseInt(limit as string));

  const bookingsWithDetails = bookings.map(booking => ({
    id: booking._id,
    userEmail: booking.userEmail,
    userName: booking.userName,
    startDate: booking.startDate,
    endDate: booking.endDate,
    startDateFormatted: booking.startDate.toLocaleString('es-UY'),
    endDateFormatted: booking.endDate.toLocaleString('es-UY'),
    serviceType: booking.serviceType,
    status: booking.status,
    price: booking.price,
    hasGoogleEventId: !!booking.googleEventId,
    googleEventId: booking.googleEventId,
    createdAt: booking.createdAt,
    createdAtFormatted: booking.createdAt.toLocaleString('es-UY')
  }));

  return res.status(200).json({
    bookings: bookingsWithDetails,
    total: bookings.length,
    serviceType
  });
}

/**
 * Elimina una reserva específica por ID
 */
async function deleteSpecificBooking(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ message: 'ID de reserva requerido' });
  }

  console.log(`🗑️ Eliminando reserva específica: ${bookingId}`);

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: 'Reserva no encontrada' });
  }

  const deleteResult = await Booking.findByIdAndDelete(bookingId);

  console.log(`✅ Reserva eliminada: ${bookingId}`);

  return res.status(200).json({
    message: 'Reserva eliminada exitosamente',
    deletedBooking: {
      id: deleteResult._id,
      userEmail: deleteResult.userEmail,
      startDate: deleteResult.startDate,
      serviceType: deleteResult.serviceType
    }
  });
} 