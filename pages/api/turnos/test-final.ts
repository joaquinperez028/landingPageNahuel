import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Booking from '../../../models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectToDatabase();

    console.log('🧪 [TEST-FINAL] Iniciando verificación completa del sistema...');

    // 1. Obtener TODAS las reservas
    const allBookings = await Booking.find({}).lean();
    console.log(`📊 Total de reservas en la base de datos: ${allBookings.length}`);

    // 2. Filtrar reservas de Consultorio Financiero
    const consultorioBookings = allBookings.filter(booking => 
      booking.serviceType === 'ConsultorioFinanciero' && 
      ['pending', 'confirmed'].includes(booking.status)
    );
    console.log(`🏥 Reservas activas de Consultorio Financiero: ${consultorioBookings.length}`);

    // 3. Agrupar por fecha
    const bookingsByDate: {[key: string]: any[]} = {};
    consultorioBookings.forEach(booking => {
      const bookingDate = new Date(booking.startDate);
      const dateKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}-${bookingDate.getDate()}`;
      
      if (!bookingsByDate[dateKey]) {
        bookingsByDate[dateKey] = [];
      }
      bookingsByDate[dateKey].push({
        userEmail: booking.userEmail,
        startDate: booking.startDate,
        status: booking.status,
        formattedDate: bookingDate.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    });

    // 4. Verificar fechas específicas mencionadas por el usuario
    const problematicDates = ['Lun 16 Jun', 'Mar 17 Jun', 'Lun 23 Jun'];
    const currentYear = new Date().getFullYear();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const dateAnalysis = problematicDates.map(dateStr => {
      const dateParts = dateStr.split(' ');
      const day = parseInt(dateParts[1]);
      const monthName = dateParts[2];
      const monthIndex = monthNames.indexOf(monthName);
      
      const targetDate = new Date(currentYear, monthIndex, day);
      if (targetDate < new Date()) {
        targetDate.setFullYear(currentYear + 1);
      }

      // Buscar reservas para esta fecha específica
      const reservasEnFecha = consultorioBookings.filter(booking => {
        const bookingDate = new Date(booking.startDate);
        return bookingDate.getFullYear() === targetDate.getFullYear() &&
               bookingDate.getMonth() === targetDate.getMonth() &&
               bookingDate.getDate() === targetDate.getDate();
      });

      return {
        fechaOriginal: dateStr,
        fechaParsed: targetDate.toISOString(),
        reservasEncontradas: reservasEnFecha.length,
        detalles: reservasEnFecha.map(booking => ({
          usuario: booking.userEmail,
          hora: new Date(booking.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          status: booking.status
        }))
      };
    });

    // 5. Simular llamada a generate API
    console.log('🔄 Simulando llamada a /api/turnos/generate...');
    
    const response = {
      totalBookings: allBookings.length,
      consultorioBookings: consultorioBookings.length,
      bookingsByDate,
      dateAnalysis,
      systemStatus: 'OK',
      timestamp: new Date().toISOString(),
      message: consultorioBookings.length > 0 
        ? `Sistema funcionando - ${consultorioBookings.length} reservas activas encontradas`
        : 'Sistema funcionando - No hay reservas activas'
    };

    console.log('✅ [TEST-FINAL] Verificación completada');
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ [TEST-FINAL] Error:', error);
    return res.status(500).json({ error: 'Error en la verificación' });
  }
} 