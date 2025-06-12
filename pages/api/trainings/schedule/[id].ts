import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import TrainingSchedule from '@/models/TrainingSchedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT') {
    // Editar un horario existente
    try {
      const { dayOfWeek, hour, minute, duration, type, activo } = req.body;
      const updated = await TrainingSchedule.findByIdAndUpdate(
        id,
        { dayOfWeek, hour, minute, duration, type, activo },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Horario no encontrado' });
      return res.status(200).json({ schedule: updated });
    } catch (error) {
      return res.status(400).json({ error: 'Error al actualizar el horario' });
    }
  }

  if (req.method === 'DELETE') {
    // Eliminar un horario
    try {
      const deleted = await TrainingSchedule.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Horario no encontrado' });
      return res.status(200).json({ message: 'Horario eliminado' });
    } catch (error) {
      return res.status(400).json({ error: 'Error al eliminar el horario' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 