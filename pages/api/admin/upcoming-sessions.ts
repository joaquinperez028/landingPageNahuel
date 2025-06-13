import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { z } from 'zod';

// Schema de validación para consultar sesiones próximas
const upcomingSessionsSchema = z.object({
  days: z.string().transform(val => parseInt(val) || 30).pipe(z.number().min(1).max(90)).optional().default("30"),
  status: z.enum(['all', 'confirmed', 'pending']).optional().default('all')
});

/**
 * API para obtener sesiones próximas (asesorías y entrenamientos)
 * GET: Retorna todas las sesiones programadas ordenadas por proximidad
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar permisos de admin
    const adminCheck = await verifyAdminAccess({ req, res } as any);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await dbConnect();

    // Validar parámetros de consulta
    const validationResult = upcomingSessionsSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Parámetros inválidos',
        details: validationResult.error.errors 
      });
    }

    const { days, status } = validationResult.data;

    console.log('📅 Obteniendo sesiones próximas para admin...');

    // Calcular fechas límite
    const now = new Date();
    const futureLimit = new Date(now);
    futureLimit.setDate(now.getDate() + days);

    console.log('🔍 Rango de fechas:', {
      desde: now.toISOString(),
      hasta: futureLimit.toISOString()
    });

    // Construir filtro para la consulta
    const filter: any = {
      startDate: { 
        $gte: now,
        $lte: futureLimit 
      }
    };

    // Filtrar por estado si se especifica
    if (status !== 'all') {
      filter.status = status;
    } else {
      // Por defecto, excluir canceladas
      filter.status = { $in: ['confirmed', 'pending'] };
    }

    console.log('🔍 Filtro de consulta:', filter);

    // Obtener reservas SIN populate para evitar errores
    const bookings = await Booking.find(filter)
      .sort({ startDate: 1 })
      .lean();

    console.log(`📊 Encontradas ${bookings.length} sesiones próximas en BD`);

    if (bookings.length > 0) {
      console.log('📋 Primeras 3 reservas encontradas:');
      bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`  ${index + 1}. ID: ${booking._id}`);
        console.log(`     Usuario: ${booking.userName} (${booking.userEmail})`);
        console.log(`     Tipo: ${booking.type} - ${booking.serviceType}`);
        console.log(`     Fecha: ${booking.startDate}`);
        console.log(`     Estado: ${booking.status}`);
      });
    }

    // Transformar datos para el frontend
    const sessions = bookings.map((booking: any) => {
      // Calcular días hasta la sesión
      const sessionDate = new Date(booking.startDate);
      const diffTime = sessionDate.getTime() - now.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Determinar nombre del servicio
      let serviceName = '';
      switch (booking.serviceType) {
        case 'ConsultorioFinanciero':
          serviceName = 'Consultorio Financiero';
          break;
        case 'CuentaAsesorada':
          serviceName = 'Cuenta Asesorada';
          break;
        case 'TradingFundamentals':
          serviceName = 'Trading Fundamentals';
          break;
        case 'AdvancedStrategies':
          serviceName = 'Estrategias Avanzadas';
          break;
        case 'DowJones':
          serviceName = 'Dow Jones - Estrategias Avanzadas';
          break;
        default:
          serviceName = booking.serviceType || 'Servicio';
      }

      return {
        _id: booking._id,
        type: booking.type,
        serviceType: booking.serviceType,
        serviceName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        duration: booking.duration || 60,
        price: booking.price || 0,
        status: booking.status,
        user: {
          name: booking.userName || 'Usuario sin nombre',
          email: booking.userEmail || 'Sin email',
          image: null // No tenemos imagen en el booking directo
        },
        meetingLink: booking.meetingLink || null,
        notes: booking.notes || null,
        daysUntil: Math.max(0, daysUntil)
      };
    });

    // Ordenar por proximidad (primero los más próximos)
    sessions.sort((a, b) => {
      // Primero por días hasta la sesión
      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil;
      }
      // Luego por hora del día
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Estadísticas adicionales
    const stats = {
      total: sessions.length,
      today: sessions.filter(s => s.daysUntil === 0).length,
      tomorrow: sessions.filter(s => s.daysUntil === 1).length,
      thisWeek: sessions.filter(s => s.daysUntil <= 7).length,
      byType: {
        advisory: sessions.filter(s => s.type === 'advisory').length,
        training: sessions.filter(s => s.type === 'training').length
      },
      byStatus: {
        confirmed: sessions.filter(s => s.status === 'confirmed').length,
        pending: sessions.filter(s => s.status === 'pending').length
      },
      withMeetingLink: sessions.filter(s => s.meetingLink).length
    };

    console.log('✅ Estadísticas de sesiones:', stats);

    return res.status(200).json({ 
      sessions,
      stats,
      meta: {
        daysRange: days,
        statusFilter: status,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener sesiones próximas:', error);
    return res.status(500).json({ 
      error: 'Error al obtener sesiones próximas',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 