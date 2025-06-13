import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import Training from '@/models/Training';
import { z } from 'zod';

// Schema de validación para actualizar horarios
const updateTrainingScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  hour: z.number().min(0).max(23).optional(),
  minute: z.number().min(0).max(59).optional(),
  duration: z.number().min(60).max(240).optional(),
  price: z.number().min(0).optional(),
  maxBookingsPerDay: z.number().min(1).max(5).optional(),
  activo: z.boolean().optional()
});

/**
 * API para gestionar horarios específicos de entrenamientos
 * GET: Obtener horario específico
 * PUT: Actualizar horario (solo admin)
 * DELETE: Eliminar horario (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de horario requerido' });
  }

  if (req.method === 'GET') {
    try {
      console.log('🔍 Buscando horario de entrenamiento:', id);

      // Buscar el entrenamiento que contiene este horario
      const training = await Training.findOne({
        'horarios._id': id,
        activo: true
      });

      if (!training) {
        return res.status(404).json({ error: 'Horario de entrenamiento no encontrado' });
      }

      const schedule = training.horarios.id(id);
      if (!schedule) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }

      const scheduleData = {
        _id: schedule._id,
        dayOfWeek: schedule.dia,
        hour: Math.floor(parseInt(schedule.hora.split(':')[0])),
        minute: parseInt(schedule.hora.split(':')[1]) || 0,
        duration: training.duracion,
        type: training.tipo,
        price: training.precio,
        cuposDisponibles: schedule.cuposDisponibles,
        activo: schedule.activo,
        trainingId: training._id,
        trainingName: training.nombre
      };

      console.log('✅ Horario encontrado');
      return res.status(200).json({ schedule: scheduleData });

    } catch (error) {
      console.error('❌ Error al obtener horario:', error);
      return res.status(500).json({ error: 'Error al obtener el horario' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Verificar permisos de admin
      const adminCheck = await verifyAdminAccess({ req, res } as any);
      if (!adminCheck.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      console.log('📝 Actualizando horario de entrenamiento:', id);

      // Validar datos de entrada
      const validationResult = updateTrainingScheduleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      const updateData = validationResult.data;

      // Buscar el entrenamiento
      const training = await Training.findOne({
        'horarios._id': id,
        activo: true
      });

      if (!training) {
        return res.status(404).json({ error: 'Horario de entrenamiento no encontrado' });
      }

      const schedule = training.horarios.id(id);
      if (!schedule) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }

      // Actualizar campos del horario
      if (updateData.dayOfWeek !== undefined) {
        schedule.dia = updateData.dayOfWeek;
      }
      
      if (updateData.hour !== undefined || updateData.minute !== undefined) {
        const hour = updateData.hour !== undefined ? updateData.hour : parseInt(schedule.hora.split(':')[0]);
        const minute = updateData.minute !== undefined ? updateData.minute : (parseInt(schedule.hora.split(':')[1]) || 0);
        schedule.hora = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }

      if (updateData.maxBookingsPerDay !== undefined) {
        schedule.cuposDisponibles = updateData.maxBookingsPerDay;
      }

      if (updateData.activo !== undefined) {
        schedule.activo = updateData.activo;
      }

      // Actualizar campos del entrenamiento
      if (updateData.duration !== undefined) {
        training.duracion = updateData.duration;
      }

      if (updateData.price !== undefined) {
        training.precio = updateData.price;
      }

      await training.save();

      const updatedScheduleData = {
        _id: schedule._id,
        dayOfWeek: schedule.dia,
        hour: Math.floor(parseInt(schedule.hora.split(':')[0])),
        minute: parseInt(schedule.hora.split(':')[1]) || 0,
        duration: training.duracion,
        type: training.tipo,
        price: training.precio,
        cuposDisponibles: schedule.cuposDisponibles,
        activo: schedule.activo,
        trainingId: training._id,
        trainingName: training.nombre
      };

      console.log('✅ Horario actualizado exitosamente');
      return res.status(200).json({ schedule: updatedScheduleData });

    } catch (error) {
      console.error('❌ Error al actualizar horario:', error);
      return res.status(500).json({ error: 'Error al actualizar el horario' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar permisos de admin
      const adminCheck = await verifyAdminAccess({ req, res } as any);
      if (!adminCheck.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      console.log('🗑️ Eliminando horario de entrenamiento:', id);

      // Buscar el entrenamiento
      const training = await Training.findOne({
        'horarios._id': id,
        activo: true
      });

      if (!training) {
        return res.status(404).json({ error: 'Horario de entrenamiento no encontrado' });
      }

      // Eliminar el horario
      training.horarios.id(id).remove();
      await training.save();

      console.log('✅ Horario eliminado exitosamente');
      return res.status(200).json({ message: 'Horario eliminado exitosamente' });

    } catch (error) {
      console.error('❌ Error al eliminar horario:', error);
      return res.status(500).json({ error: 'Error al eliminar el horario' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 