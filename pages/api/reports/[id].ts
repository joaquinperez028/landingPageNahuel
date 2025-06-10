import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import Report from '../../../models/Report';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: `Método ${req.method} no permitido` 
    });
  }

  try {
    await connectDB();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de informe requerido'
      });
    }

    // Buscar informe por ID y solo si está publicado
    const report = await Report.findOne({ 
      _id: id, 
      status: 'published' 
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    // Incrementar vistas
    await Report.updateOne(
      { _id: id },
      { $inc: { views: 1 } }
    );

    return res.status(200).json({
      success: true,
      data: { report }
    });

  } catch (error) {
    console.error('Error al obtener informe:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
} 