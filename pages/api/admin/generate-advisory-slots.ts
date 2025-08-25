import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAPI } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import AvailableSlot from '@/models/AvailableSlot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar permisos de admin
    const adminCheck = await verifyAdminAPI(req, res);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await dbConnect();
    console.log('🔧 Generando horarios de asesoría...');

    const { days = 30 } = req.body;

    // Generar horarios para los próximos días especificados
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    console.log(`📅 Generando horarios desde ${startDate.toLocaleDateString()} hasta ${endDate.toLocaleDateString()}`);

    const slotsCreated = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Solo generar horarios para días de semana (lunes a viernes)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 1 = lunes, 5 = viernes
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Horarios de asesoría: 9:00, 11:00, 14:00, 16:00, 18:00
        const advisoryTimes = ['09:00', '11:00', '14:00', '16:00', '18:00'];
        
        for (const time of advisoryTimes) {
          const slotData = {
            date: dateStr,
            time: time,
            serviceType: 'ConsultorioFinanciero',
            available: true,
            reservedBy: null,
            reservedAt: null,
            bookingId: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Verificar si ya existe
          const existingSlot = await AvailableSlot.findOne({
            date: dateStr,
            time: time,
            serviceType: 'ConsultorioFinanciero'
          });

          if (!existingSlot) {
            await AvailableSlot.create(slotData);
            slotsCreated.push(`${dateStr} ${time}`);
            console.log(`✅ Creado: ${dateStr} ${time}`);
          } else {
            console.log(`⏭️ Ya existe: ${dateStr} ${time}`);
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Verificar total de slots disponibles
    const totalSlots = await AvailableSlot.countDocuments({
      serviceType: 'ConsultorioFinanciero',
      available: true
    });

    console.log(`🎉 Proceso completado! Total de slots creados: ${slotsCreated.length}`);

    return res.status(200).json({
      success: true,
      message: 'Horarios de asesoría generados exitosamente',
      slotsCreated: slotsCreated.length,
      totalSlotsAvailable: totalSlots,
      dateRange: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      },
      slots: slotsCreated.slice(0, 10) // Mostrar solo los primeros 10
    });

  } catch (error) {
    console.error('❌ Error generando horarios:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
