import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import AdvisorySchedule from '@/models/AdvisorySchedule';
import { z } from 'zod';

// Schema de validación para actualizar horarios
const updateAdvisoryScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().min(30).max(180).optional(),
  isAvailable: z.boolean().optional(),
  isBooked: z.boolean().optional()
});

/**
 * API para gestionar horarios específicos de asesorías
 * PUT: Actualizar horario (solo admin)
 * DELETE: Eliminar horario (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de horario requerido' });
  }

  if (req.method === 'PUT') {
    try {
      // Verificar permisos de admin
      const adminCheck = await verifyAdminAccess({ req, res } as any);
      if (!adminCheck.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      console.log('📝 Actualizando horario de asesoría:', id);

      // Validar datos de entrada
      const validationResult = updateAdvisoryScheduleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos',
          details: validationResult.error.errors 
        });
      }

      const updateData = validationResult.data;
      
      // Si se está actualizando la fecha o hora, verificar conflictos
      if (updateData.date || updateData.time) {
        const currentSchedule = await AdvisorySchedule.findById(id);
        if (!currentSchedule) {
          return res.status(404).json({ error: 'Horario no encontrado' });
        }

        const newDate = updateData.date ? new Date(updateData.date) : currentSchedule.date;
        const newTime = updateData.time || currentSchedule.time;
        
        newDate.setHours(0, 0, 0, 0);

        // Verificar que no haya conflictos con otros horarios
        const conflictingSchedule = await AdvisorySchedule.findOne({
          _id: { $ne: id }, // Excluir el horario actual
          date: newDate,
          time: newTime
        });

        if (conflictingSchedule) {
          return res.status(409).json({ 
            error: `Ya existe otro horario para ${updateData.date || currentSchedule.date} a las ${newTime}` 
          });
        }

        // Actualizar la fecha si se proporcionó
        if (updateData.date) {
          updateData.date = newDate;
        }
      }

      // Actualizar el horario
      const updatedSchedule = await AdvisorySchedule.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedSchedule) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }

      console.log('✅ Horario de asesoría actualizado exitosamente');
      return res.status(200).json({ schedule: updatedSchedule });

    } catch (error) {
      console.error('❌ Error al actualizar horario de asesoría:', error);
      return res.status(500).json({ error: 'Error al actualizar el horario de asesoría' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verificar permisos de admin
      const adminCheck = await verifyAdminAccess({ req, res } as any);
      if (!adminCheck.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      console.log('🗑️ Eliminando horario de asesoría:', id);

      const deletedSchedule = await AdvisorySchedule.findByIdAndDelete(id);

      if (!deletedSchedule) {
        return res.status(404).json({ error: 'Horario no encontrado' });
      }

      console.log('✅ Horario de asesoría eliminado exitosamente');
      return res.status(200).json({ message: 'Horario eliminado exitosamente' });

    } catch (error) {
      console.error('❌ Error al eliminar horario de asesoría:', error);
      return res.status(500).json({ error: 'Error al eliminar el horario de asesoría' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 