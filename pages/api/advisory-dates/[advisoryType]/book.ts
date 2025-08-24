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

    const { advisoryType } = req.query;
    const { advisoryDateId } = req.body;

    if (!advisoryDateId) {
      return res.status(400).json({ error: 'ID de fecha de asesoría requerido' });
    }

    console.log('🔒 Intentando marcar fecha como reservada temporalmente:', {
      advisoryType,
      advisoryDateId
    });

    // Buscar la fecha de asesoría
    const advisoryDate = await AdvisoryDate.findById(advisoryDateId);
    
    if (!advisoryDate) {
      return res.status(404).json({ error: 'Fecha de asesoría no encontrada' });
    }

    if (advisoryDate.isBooked) {
      return res.status(400).json({ error: 'Esta fecha ya está reservada' });
    }

    // Marcar como reservada temporalmente con timestamp
    advisoryDate.isBooked = true;
    advisoryDate.tempReservationTimestamp = new Date();
    advisoryDate.tempReservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await advisoryDate.save();

    console.log('✅ Fecha marcada como reservada temporalmente:', {
      advisoryDateId: advisoryDate._id,
      expiresAt: advisoryDate.tempReservationExpiresAt
    });

    // Programar limpieza automática después de 15 minutos
    setTimeout(async () => {
      try {
        await dbConnect();
        const expiredDate = await AdvisoryDate.findById(advisoryDateId);
        
        if (expiredDate && expiredDate.tempReservationExpiresAt && 
            new Date() > expiredDate.tempReservationExpiresAt && 
            !expiredDate.confirmedBooking) {
          
          expiredDate.isBooked = false;
          expiredDate.tempReservationTimestamp = undefined;
          expiredDate.tempReservationExpiresAt = undefined;
          await expiredDate.save();
          
          console.log('🔄 Fecha liberada automáticamente por expiración:', advisoryDateId);
        }
      } catch (error) {
        console.error('❌ Error en limpieza automática:', error);
      }
    }, 15 * 60 * 1000); // 15 minutos

    return res.status(200).json({
      success: true,
      message: 'Fecha reservada temporalmente',
      expiresAt: advisoryDate.tempReservationExpiresAt
    });

  } catch (error) {
    console.error('❌ Error marcando fecha como reservada:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
