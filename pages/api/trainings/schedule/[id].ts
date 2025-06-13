import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import TrainingSchedule from '@/models/TrainingSchedule';
import { z } from 'zod';

// Schema de validación para actualizar horarios
const updateScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  duration: z.number().min(30).max(480),
  type: z.string().min(1),
  activo: z.boolean()
});

/**
 * API para operaciones individuales de horarios de entrenamiento
 * PUT: Actualizar horario específico
 * DELETE: Eliminar horario específico
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de horario requerido' });
  }

  if (req.method === 'PUT') {
    try {
      console.log('📝 Actualizando horario:', id);

      // Validar datos de entrada
      const validationResult = updateScheduleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      const updateData = validationResult.data;

      // Verificar que no haya conflictos con otros horarios
      const conflictingSchedule = await TrainingSchedule.findOne({
        _id: { $ne: id },
        dayOfWeek: updateData.dayOfWeek,
        hour: updateData.hour,
        minute: updateData.minute,
        activo: true
      });

      if (conflictingSchedule) {
        return res.status(409).json({ 
          error: 'Ya existe un horario activo en ese día y hora' 
        });
      }

      // Actualizar el horario
      const updatedSchedule = await TrainingSchedule.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedSchedule) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }

      console.log('✅ Horario actualizado exitosamente:', updatedSchedule._id);
      return res.status(200).json({ schedule: updatedSchedule });

    } catch (error) {
      console.error('❌ Error al actualizar horario:', error);
      return res.status(500).json({ error: 'Error al actualizar el horario' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('🗑️ Eliminando horario:', id);

      const deletedSchedule = await TrainingSchedule.findByIdAndDelete(id);

      if (!deletedSchedule) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }

      console.log('✅ Horario eliminado exitosamente:', id);
      return res.status(200).json({ message: 'Horario eliminado exitosamente' });

    } catch (error) {
      console.error('❌ Error al eliminar horario:', error);
      return res.status(500).json({ error: 'Error al eliminar el horario' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

export default requireAdmin(handler); 