import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';
import dbConnect from '../../../lib/mongodb';
import Report from '../../../models/Report';
import User from '../../../models/User';
import { getCloudinaryImageUrl, CloudinaryUploadResult } from '../../../lib/cloudinary';
import { createReportNotification } from '../../../lib/notificationUtils';

// Definir interface para las imágenes procesadas
interface ProcessedImage {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  caption: string;
  order: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    // Verificar que el usuario existe y es admin
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Solo los administradores pueden crear informes' 
      });
    }

    const { 
      title, 
      content, 
      type, 
      category,
      coverImage, 
      images 
    } = req.body;

    // Validar datos requeridos
    if (!title || !content) {
      return res.status(400).json({ 
        message: 'Título y contenido son requeridos' 
      });
    }

    console.log('📝 Creando nuevo informe:', {
      title,
      type,
      category,
      hasCoverImage: !!coverImage,
      imagesCount: images?.length || 0,
      author: user.email
    });

    // Procesar imagen de portada
    let processedCoverImage: ProcessedImage | null = null;
    if (coverImage && coverImage.public_id) {
      processedCoverImage = {
        public_id: coverImage.public_id,
        url: coverImage.secure_url || coverImage.url,
        secure_url: coverImage.secure_url || coverImage.url,
        width: coverImage.width,
        height: coverImage.height,
        format: coverImage.format,
        bytes: coverImage.bytes,
        caption: coverImage.caption || '',
        order: 0
      };

      console.log('🖼️ Imagen de portada procesada:', processedCoverImage.public_id);
    }

    // Procesar imágenes adicionales
    let processedImages: ProcessedImage[] = [];
    if (images && Array.isArray(images)) {
      processedImages = images.map((img: any, index: number): ProcessedImage => ({
        public_id: img.public_id,
        url: img.secure_url || img.url,
        secure_url: img.secure_url || img.url,
        width: img.width,
        height: img.height,
        format: img.format,
        bytes: img.bytes,
        caption: img.caption || '',
        order: index + 1
      }));

      console.log('📸 Imágenes adicionales procesadas:', processedImages.length);
    }

    // Crear el informe
    const newReport = new Report({
      title,
      content,
      author: user._id,
      type: type || 'text',
      category: category || 'general',
      coverImage: processedCoverImage,
      images: processedImages,
      isPublished: true,
      publishedAt: new Date()
    });

    const savedReport = await newReport.save();

    console.log('✅ Informe creado exitosamente:', savedReport._id);

    // 📰 NUEVA FUNCIONALIDAD: Crear notificación automática
    try {
      await createReportNotification(savedReport);
      console.log('✅ Notificación automática enviada para informe:', savedReport._id);
    } catch (notificationError) {
      console.error('❌ Error al enviar notificación automática:', notificationError);
      // No fallar la creación del informe si la notificación falla
    }

    // Poblar datos del autor para la respuesta
    await savedReport.populate('author', 'name email');

    // Generar URLs optimizadas para Cloudinary
    const responseData = {
      ...savedReport.toJSON(),
      // URL de imagen de portada optimizada
      imageUrl: processedCoverImage ? 
        getCloudinaryImageUrl(processedCoverImage.public_id, {
          width: 800,
          height: 600,
          crop: 'fill',
          format: 'webp'
        }) : null,
      // URLs de imágenes adicionales optimizadas
      optimizedImages: processedImages.map((img: ProcessedImage) => ({
        ...img,
        optimizedUrl: getCloudinaryImageUrl(img.public_id, {
          width: 800,
          height: 600,
          crop: 'fill',
          format: 'webp'
        })
      }))
    };

    return res.status(201).json({
      success: true,
      message: 'Informe creado exitosamente',
      data: {
        report: responseData
      }
    });

  } catch (error) {
    console.error('❌ Error creando informe:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 