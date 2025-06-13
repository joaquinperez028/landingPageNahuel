import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import AdvisorySchedule from '@/models/AdvisorySchedule';
import TrainingSchedule from '@/models/TrainingSchedule';

/**
 * API temporal para debugging - Ver qué datos tenemos en la BD
 * GET: Mostrar todas las colecciones relacionadas con reservas
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

    console.log('🔍 DEBUGGING - Revisando todas las colecciones...');

    // 1. Revisar colección Booking (reservas reales)
    const allBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10).lean();
    console.log(`📋 Bookings encontrados: ${allBookings.length}`);
    
    // 2. Revisar colección AdvisorySchedule (horarios configurados para asesorías)
    const advisorySchedules = await AdvisorySchedule.find({}).lean();
    console.log(`📅 AdvisorySchedules encontrados: ${advisorySchedules.length}`);
    
    // 3. Revisar colección TrainingSchedule (horarios configurados para entrenamientos)
    const trainingSchedules = await TrainingSchedule.find({}).lean();
    console.log(`🏋️ TrainingSchedules encontrados: ${trainingSchedules.length}`);

    // Calcular fechas para filtrar
    const now = new Date();
    const futureLimit = new Date(now);
    futureLimit.setDate(now.getDate() + 30);

    // 4. Revisar bookings próximos específicamente
    const upcomingBookings = await Booking.find({
      startDate: { 
        $gte: now,
        $lte: futureLimit 
      },
      status: { $in: ['confirmed', 'pending'] }
    }).sort({ startDate: 1 }).lean();

    console.log(`📊 Bookings próximos (30 días): ${upcomingBookings.length}`);

    const debugData = {
      collections: {
        bookings: {
          total: allBookings.length,
          upcoming: upcomingBookings.length,
          samples: allBookings.slice(0, 3).map(booking => ({
            _id: booking._id,
            userEmail: booking.userEmail,
            userName: booking.userName,
            type: booking.type,
            serviceType: booking.serviceType,
            startDate: booking.startDate,
            status: booking.status,
            createdAt: booking.createdAt
          }))
        },
        advisorySchedules: {
          total: advisorySchedules.length,
          samples: advisorySchedules.slice(0, 3).map(schedule => ({
            _id: schedule._id,
            dayOfWeek: schedule.dayOfWeek,
            hour: schedule.hour,
            minute: schedule.minute,
            type: schedule.type,
            active: schedule.activo
          }))
        },
        trainingSchedules: {
          total: trainingSchedules.length,
          samples: trainingSchedules.slice(0, 3).map(schedule => ({
            _id: schedule._id,
            dayOfWeek: schedule.dayOfWeek,
            hour: schedule.hour,
            minute: schedule.minute,
            duration: schedule.duration,
            active: schedule.activo
          }))
        }
      },
      filters: {
        dateRange: {
          from: now.toISOString(),
          to: futureLimit.toISOString()
        },
        statusFilter: ['confirmed', 'pending']
      },
      upcomingBookingsDetails: upcomingBookings.map(booking => ({
        _id: booking._id,
        userEmail: booking.userEmail,
        userName: booking.userName,
        type: booking.type,
        serviceType: booking.serviceType,
        startDate: booking.startDate,
        endDate: booking.endDate,
        duration: booking.duration,
        status: booking.status,
        meetingLink: booking.meetingLink ? 'YA TIENE LINK' : 'SIN LINK'
      }))
    };

    return res.status(200).json(debugData);

  } catch (error) {
    console.error('❌ Error en debugging:', error);
    return res.status(500).json({ 
      error: 'Error en debugging',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 