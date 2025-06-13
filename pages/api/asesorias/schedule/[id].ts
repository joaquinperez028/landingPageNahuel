import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import AdvisorySchedule from '@/models/AdvisorySchedule';
import { z } from 'zod';

// Schema de validación para actualizar horarios de asesoría
const updateAdvisoryScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  duration: z.number().min(30).max(180),
  type: z.enum(['ConsultorioFinanciero', 'CuentaAsesorada']),
  price: z.number().min(0),
  maxBookingsPerDay: z.number().min(1).max(10),
  activo: z.boolean()
});

/**
 * API para operaciones individuales de horarios de asesorías
 * PUT: Actualizar horario específico
 * DELETE: Eliminar horario específico
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de horario requerido' });
  }

  // Verificar permisos de admin para todas las operaciones
  const adminCheck = await verifyAdminAccess({ req, res } as any);
  if (!adminCheck.isAdmin) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  if (req.method === 'PUT') {
    try {
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

      // Verificar que no haya conflictos con otros horarios
      const conflictingSchedule = await AdvisorySchedule.findOne({
        _id: { $ne: id },
        dayOfWeek: updateData.dayOfWeek,
        hour: updateData.hour,
        minute: updateData.minute,
        type: updateData.type,
        activo: true
      });

      if (conflictingSchedule) {
        return res.status(409).json({ 
          error: `Ya existe un horario activo para ${updateData.type} en ese día y hora` 
        });
      }

      // Actualizar el horario
      const updatedSchedule = await AdvisorySchedule.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedSchedule) {
        return res.status(404).json({ error: 'Horario de asesoría no encontrado' });
      }

      console.log('✅ Horario de asesoría actualizado exitosamente:', updatedSchedule._id);
      return res.status(200).json({ schedule: updatedSchedule });

    } catch (error) {
      console.error('❌ Error al actualizar horario de asesoría:', error);
      return res.status(500).json({ error: 'Error al actualizar el horario de asesoría' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('🗑️ Eliminando horario de asesoría:', id);

      const deletedSchedule = await AdvisorySchedule.findByIdAndDelete(id);

      if (!deletedSchedule) {
        return res.status(404).json({ error: 'Horario de asesoría no encontrado' });
      }

      console.log('✅ Horario de asesoría eliminado exitosamente:', id);
      return res.status(200).json({ 
        message: 'Horario de asesoría eliminado exitosamente',
        schedule: deletedSchedule 
      });

    } catch (error) {
      console.error('❌ Error al eliminar horario de asesoría:', error);
      return res.status(500).json({ error: 'Error al eliminar el horario de asesoría' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 