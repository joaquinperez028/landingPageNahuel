import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import TrainingSchedule from '@/models/TrainingSchedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    // Obtener todos los horarios
    try {
      const schedules = await TrainingSchedule.find({});
      return res.status(200).json({ schedules });
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener los horarios' });
    }
  }

  if (req.method === 'POST') {
    // Crear un nuevo horario
    try {
      const { dayOfWeek, hour, minute, duration, type, activo } = req.body;
      const newSchedule = await TrainingSchedule.create({
        dayOfWeek, hour, minute, duration, type, activo
      });
      return res.status(201).json({ schedule: newSchedule });
    } catch (error) {
      return res.status(400).json({ error: 'Error al crear el horario' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
} 