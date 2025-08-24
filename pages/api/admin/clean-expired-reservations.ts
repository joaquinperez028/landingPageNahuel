import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import AdvisoryDate from '@/models/AdvisoryDate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await dbConnect();

    console.log('🧹 Iniciando limpieza de reservas temporales expiradas...');

    // Buscar fechas con reservas temporales expiradas
    const expiredReservations = await AdvisoryDate.find({
      isBooked: true,
      confirmedBooking: { $ne: true }, // No confirmadas por pago
      tempReservationExpiresAt: { $lt: new Date() } // Expiraron
    });

    console.log(`📊 Encontradas ${expiredReservations.length} reservas temporales expiradas`);

    let cleanedCount = 0;
    for (const reservation of expiredReservations) {
      try {
        reservation.isBooked = false;
        reservation.tempReservationTimestamp = undefined;
        reservation.tempReservationExpiresAt = undefined;
        await reservation.save();
        cleanedCount++;
        
        console.log(`✅ Reserva temporal liberada: ${reservation._id} - ${reservation.date} ${reservation.time}`);
      } catch (error) {
        console.error(`❌ Error liberando reserva ${reservation._id}:`, error);
      }
    }

    console.log(`✅ Limpieza completada: ${cleanedCount} reservas liberadas`);

    return res.status(200).json({
      success: true,
      message: `Limpieza completada: ${cleanedCount} reservas temporales liberadas`,
      cleanedCount,
      totalExpired: expiredReservations.length
    });

  } catch (error) {
    console.error('❌ Error en limpieza de reservas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
