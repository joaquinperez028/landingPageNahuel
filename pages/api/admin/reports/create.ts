import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
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
    const session = await getServerSession(req, res, authOptions);
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
      readTime, // Agregar campo de tiempo de lectura
      videoMuxId,
      pdfUrl,
      imageUrl,
      coverImage, // Agregar imagen de portada
      images, // Agregar imágenes adicionales
      status = 'published',
      tags = [],
      isFeature = false,
      articles = [] // Nuevo campo para artículos
    } = req.body;

    // Validaciones
    if (!title || !type || !content || !summary) {
      return res.status(400).json({
        success: false,
        message: 'Título, tipo, contenido y resumen son campos requeridos'
      });
    }

    // Validar tiempo de lectura
    if (!readTime || isNaN(parseInt(readTime))) {
      return res.status(400).json({
        success: false,
        message: 'Tiempo de lectura es requerido y debe ser un número válido'
      });
    }

    // Validar artículos si se proporcionan
    if (articles && Array.isArray(articles)) {
      if (articles.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Un informe no puede tener más de 10 artículos'
        });
      }

      // Validar cada artículo
      for (const article of articles) {
        if (!article.title || !article.content || !article.order) {
          return res.status(400).json({
            success: false,
            message: 'Cada artículo debe tener título, contenido y orden'
          });
        }
        if (article.order < 1 || article.order > 10) {
          return res.status(400).json({
            success: false,
            message: 'El orden de los artículos debe estar entre 1 y 10'
          });
        }
      }
    }

    // Crear nuevo informe
    const newReport = new Report({
      title: title.trim(),
      type,
      content,
      summary: summary.trim(),
      readTime: parseInt(readTime), // Usar el tiempo de lectura enviado por el usuario
      videoMuxId,
      pdfUrl,
      imageUrl,
      coverImage: coverImage || null, // Incluir imagen de portada
      images: images || [], // Incluir imágenes adicionales
      author: user.name || user.email,
      authorId: user._id.toString(),
      status,
      tags: Array.isArray(tags) ? tags : [],
      isFeature,
      articles: articles || [] // Incluir artículos en el informe
    });

    // Calcular tiempo de lectura total usando el valor del usuario + artículos
    let totalReadTime = parseInt(readTime);
    if (articles && articles.length > 0) {
      articles.forEach((article: any) => {
        // Usar el tiempo de lectura calculado del artículo
        article.readTime = Math.ceil(article.content.length / 1000);
        totalReadTime += article.readTime;
      });
    }

    await newReport.save();

    return res.status(201).json({
      success: true,
      message: 'Informe creado exitosamente',
      data: { 
        report: newReport,
        totalReadTime
      }
    });

  } catch (error) {
    console.error('Error al crear informe:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
} 