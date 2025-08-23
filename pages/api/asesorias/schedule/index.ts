import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAPI } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import AdvisorySchedule from '@/models/AdvisorySchedule';
import { z } from 'zod';

// Schema de validación para crear horarios de asesoría
const createAdvisoryScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Formato YYYY-MM-DD
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):00$/), // Solo formato HH:00
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
      console.log('📝 [API] Iniciando POST para crear horario de asesoría');
      console.log('📝 [API] Body recibido:', req.body);
      
      // Verificar permisos de admin
      console.log('🔍 [API] Verificando permisos de admin...');
      const adminCheck = await verifyAdminAPI(req, res);
      console.log('🔍 [API] Resultado de verificación:', adminCheck);
      
      if (!adminCheck.isAdmin) {
        console.log('❌ [API] Acceso denegado - Usuario no es admin');
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      console.log('✅ [API] Permisos de admin confirmados');
      console.log('📝 [API] Creando nuevo horario de asesoría');

      // Validar datos de entrada
      console.log('🔍 [API] Validando datos de entrada...');
      const validationResult = createAdvisoryScheduleSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.log('❌ [API] Validación fallida:', validationResult.error.errors);
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      console.log('✅ [API] Validación exitosa');
      const scheduleData = validationResult.data;
      console.log('📝 [API] Datos validados:', scheduleData);
      
      // Convertir la fecha string a Date
      const scheduleDate = new Date(scheduleData.date);
      scheduleDate.setHours(0, 0, 0, 0);
      console.log('📅 [API] Fecha convertida:', scheduleDate);

      // Verificar que no haya conflictos con horarios existentes
      console.log('🔍 [API] Verificando conflictos...');
      const conflictingSchedule = await AdvisorySchedule.findOne({
        date: scheduleDate,
        time: scheduleData.time
      });

      if (conflictingSchedule) {
        console.log('⚠️ [API] Horario ya existe:', conflictingSchedule._id);
        return res.status(409).json({ 
          error: `Ya existe un horario para ${scheduleData.date} a las ${scheduleData.time}` 
        });
      }

      console.log('✅ [API] No hay conflictos, procediendo a crear...');

      // Crear el nuevo horario
      const newSchedule = await AdvisorySchedule.create({
        ...scheduleData,
        date: scheduleDate
      });

      console.log('✅ [API] Horario de asesoría creado exitosamente:', newSchedule._id);
      return res.status(201).json({ schedule: newSchedule });

    } catch (error) {
      console.error('❌ [API] Error al crear horario de asesoría:', error);
      return res.status(500).json({ error: 'Error al crear el horario de asesoría' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 