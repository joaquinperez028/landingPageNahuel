import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import Report from '../../../models/Report';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: `Método ${req.method} no permitido` 
    });
  }

  try {
    await connectDB();

    const {
      title,
      type,
      content,
      summary,
      videoMuxId,
      pdfUrl,
      imageUrl,
      status = 'published',
      tags = [],
      isFeature = false,
      author = 'Usuario'
    } = req.body;

    // Validaciones
    if (!title || !type || !content || !summary) {
      return res.status(400).json({
        success: false,
        message: 'Título, tipo, contenido y resumen son campos requeridos'
      });
    }

    // Crear nuevo informe
    const newReport = new Report({
      title: title.trim(),
      type,
      content,
      summary: summary.trim(),
      videoMuxId,
      pdfUrl,
      imageUrl,
      author,
      authorId: 'temp-id',
      status,
      tags: Array.isArray(tags) ? tags : [],
      isFeature,
    });

    // Calcular tiempo de lectura
    newReport.calculateReadTime();

    await newReport.save();

    return res.status(201).json({
      success: true,
      message: 'Informe creado exitosamente',
      data: newReport
    });

  } catch (error) {
    console.error('Error al crear informe:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
} 