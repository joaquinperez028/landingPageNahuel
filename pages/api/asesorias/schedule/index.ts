import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import AdvisorySchedule from '@/models/AdvisorySchedule';
import { z } from 'zod';

// Schema de validación para crear horarios de asesoría
const createAdvisoryScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Formato YYYY-MM-DD
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // Formato HH:MM
  duration: z.number().min(30).max(180).default(60),
  isAvailable: z.boolean().default(true),
  isBooked: z.boolean().default(false)
});

/**
 * API para gestionar horarios de asesorías
 * GET: Obtener todos los horarios disponibles (público)
 * POST: Crear nuevo horario (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      console.log('📅 Obteniendo horarios de asesorías');
      
      const { date, available } = req.query;
      const filter: any = {};
      
      // Filtrar por fecha específica si se proporciona
      if (date && typeof date === 'string') {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        filter.date = {
          $gte: startDate,
          $lte: endDate
        };
      }
      
      // Filtrar solo horarios disponibles si se solicita
      if (available === 'true') {
        filter.isAvailable = true;
        filter.isBooked = false;
      }

      const schedules = await AdvisorySchedule.find(filter)
        .sort({ date: 1, time: 1 });

      console.log(`✅ Encontrados ${schedules.length} horarios de asesoría`);
      return res.status(200).json({ schedules });

    } catch (error) {
      console.error('❌ Error al obtener horarios de asesoría:', error);
      return res.status(500).json({ error: 'Error al obtener los horarios de asesoría' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Verificar permisos de admin
      const adminCheck = await verifyAdminAccess({ req, res } as any);
      if (!adminCheck.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      console.log('📝 Creando nuevo horario de asesoría');

      // Validar datos de entrada
      const validationResult = createAdvisoryScheduleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      const scheduleData = validationResult.data;
      
      // Convertir la fecha string a Date
      const scheduleDate = new Date(scheduleData.date);
      scheduleDate.setHours(0, 0, 0, 0);

      // Verificar que no haya conflictos con horarios existentes
      const conflictingSchedule = await AdvisorySchedule.findOne({
        date: scheduleDate,
        time: scheduleData.time
      });

      if (conflictingSchedule) {
        return res.status(409).json({ 
          error: `Ya existe un horario para ${scheduleData.date} a las ${scheduleData.time}` 
        });
      }

      // Crear el nuevo horario
      const newSchedule = await AdvisorySchedule.create({
        ...scheduleData,
        date: scheduleDate
      });

      console.log('✅ Horario de asesoría creado exitosamente:', newSchedule._id);
      return res.status(201).json({ schedule: newSchedule });

    } catch (error) {
      console.error('❌ Error al crear horario de asesoría:', error);
      return res.status(500).json({ error: 'Error al crear el horario de asesoría' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 