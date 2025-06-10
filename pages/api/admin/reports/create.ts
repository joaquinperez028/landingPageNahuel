import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import connectDB from '../../../../lib/mongodb';
import Report from '../../../../models/Report';
import User from '../../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: `Método ${req.method} no permitido` 
    });
  }

  try {
    await connectDB();

    // Verificar autenticación básica (simplificada por ahora)
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ 
        success: false, 
        message: 'Debes estar autenticado' 
      });
    }

    // Buscar el usuario para obtener su información
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

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
      isFeature = false
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
      author: user.name || user.email,
      authorId: user._id.toString(),
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
      data: { report: newReport }
    });

  } catch (error) {
    console.error('Error al crear informe:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
} 