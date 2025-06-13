import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import AdvisorySchedule from '@/models/AdvisorySchedule';
import { z } from 'zod';

// Schema de validación para crear horarios de asesoría
const createAdvisoryScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59).default(0),
  duration: z.number().min(30).max(180).default(60),
  type: z.enum(['ConsultorioFinanciero', 'CuentaAsesorada']),
  price: z.number().min(0),
  maxBookingsPerDay: z.number().min(1).max(10).default(3),
  activo: z.boolean().default(true)
});

/**
 * API para gestionar horarios de asesorías
 * GET: Obtener todos los horarios (público)
 * POST: Crear nuevo horario (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      console.log('📅 Obteniendo horarios de asesorías');
      
      const { type } = req.query;
      const filter: any = {};
      
      if (type && ['ConsultorioFinanciero', 'CuentaAsesorada'].includes(type as string)) {
        filter.type = type;
      }

      const schedules = await AdvisorySchedule.find(filter)
        .sort({ dayOfWeek: 1, hour: 1, minute: 1 });

      console.log(`✅ Encontrados ${schedules.length} horarios de asesoría configurados`);
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

      // Verificar que no haya conflictos con horarios existentes
      const conflictingSchedule = await AdvisorySchedule.findOne({
        dayOfWeek: scheduleData.dayOfWeek,
        hour: scheduleData.hour,
        minute: scheduleData.minute,
        type: scheduleData.type,
        activo: true
      });

      if (conflictingSchedule) {
        return res.status(409).json({ 
          error: `Ya existe un horario activo para ${scheduleData.type} en ese día y hora` 
        });
      }

      // Crear el nuevo horario
      const newSchedule = await AdvisorySchedule.create(scheduleData);

      console.log('✅ Horario de asesoría creado exitosamente:', newSchedule._id);
      return res.status(201).json({ schedule: newSchedule });

    } catch (error) {
      console.error('❌ Error al crear horario de asesoría:', error);
      return res.status(500).json({ error: 'Error al crear el horario de asesoría' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 