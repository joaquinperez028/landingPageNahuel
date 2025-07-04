import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Training from '@/models/Training';

/**
 * API para obtener los entrenamientos
 * GET: Obtiene todos los entrenamientos activos
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const entrenamientos = await Training.find({ activo: true }).sort({ createdAt: -1 });
      
      res.status(200).json(entrenamientos);
    } catch (error) {
      console.error('Error al obtener entrenamientos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 