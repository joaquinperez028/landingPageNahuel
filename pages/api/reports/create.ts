import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { getMuxImageUrl } from '@/lib/mux';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Report from '../../../models/Report';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: `Método ${req.method} no permitido` 
    });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado. Debes iniciar sesión.' 
      });
    }

    await connectDB();

    // Verificar que el usuario sea admin
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // NUEVA RESTRICCIÓN: Solo administradores pueden crear reportes
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Permisos insuficientes. Solo los administradores pueden crear reportes.' 
      });
    }

    const {
      title,
      type,
      content,
      summary,
      videoMuxId,
      pdfUrl,
      imageMuxId, // Asset ID de imagen de portada en Mux
      images = [], // Array de imágenes adicionales
      status = 'published',
      tags = [],
      isFeature = false,
      author = user.name || 'Administrador'
    } = req.body;

    // Validaciones
    if (!title || !type || !content || !summary) {
      return res.status(400).json({
        success: false,
        message: 'Título, tipo, contenido y resumen son campos requeridos'
      });
    }

    // Procesar imagen de portada si existe
    let imageUrl = '';
    if (imageMuxId) {
      imageUrl = getMuxImageUrl(imageMuxId, {
        width: 800,
        height: 600,
        fit_mode: 'crop'
      });
    }

    // Procesar imágenes adicionales
    const processedImages = images.map((img: any, index: number) => ({
      assetId: img.assetId,
      url: getMuxImageUrl(img.assetId, {
        width: 800,
        height: 600,
        fit_mode: 'crop'
      }),
      caption: img.caption || '',
      order: img.order || index
    }));

    // Crear nuevo informe
    const newReport = new Report({
      title: title.trim(),
      type,
      content,
      summary: summary.trim(),
      videoMuxId,
      pdfUrl,
      imageUrl,
      imageMuxId,
      images: processedImages,
      author,
      authorId: user._id.toString(),
      status,
      tags: Array.isArray(tags) ? tags : [],
      isFeature,
    });

    // Calcular tiempo de lectura
    newReport.calculateReadTime();

    await newReport.save();

    console.log('✅ Informe creado exitosamente:', {
      id: newReport._id,
      title: newReport.title,
      hasImages: processedImages.length > 0,
      hasCoverImage: !!imageMuxId
    });

    return res.status(201).json({
      success: true,
      message: 'Informe creado exitosamente',
      data: {
        ...newReport.toObject(),
        id: newReport._id.toString()
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