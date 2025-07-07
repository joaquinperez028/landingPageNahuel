import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import { z } from 'zod';

// Schema de validación para actualizar lecciones
const updateLessonSchema = z.object({
  titulo: z.string().min(1, 'Título es requerido').optional(),
  descripcion: z.string().min(1, 'Descripción es requerida').optional(),
  modulo: z.number().min(1).max(10).optional(),
  numeroLeccion: z.number().min(1).optional(),
  duracionEstimada: z.number().min(0).optional(),
  contenido: z.array(z.object({
    id: z.string(),
    type: z.enum(['youtube', 'pdf', 'image', 'text', 'html']),
    orden: z.number(),
    title: z.string().optional(),
    content: z.object({
      // YouTube
      youtubeId: z.string().optional(),
      youtubeTitle: z.string().optional(),
      youtubeDuration: z.string().optional(),
      
      // PDFs legacy
      pdfUrl: z.string().optional(),
      pdfTitle: z.string().optional(),
      pdfSize: z.string().optional(),
      
      // PDFs de Cloudinary (deprecado)
      pdfFile: z.object({
        public_id: z.string(),
        url: z.string(),
        secure_url: z.string(),
        format: z.string(),
        bytes: z.number(),
        pages: z.number().optional()
      }).optional(),
      
      cloudinaryPdf: z.object({
        publicId: z.string(),
        originalFileName: z.string().optional(),
        fileSize: z.number().optional()
      }).optional(),
      
      // PDFs almacenados en base de datos (nuevo)
      databasePdf: z.object({
        pdfId: z.string(),
        fileName: z.string(),
        originalName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        uploadDate: z.date()
      }).optional(),
      
      // Imágenes
      imageUrl: z.string().optional(),
      imageAlt: z.string().optional(),
      imageCaption: z.string().optional(),
      
      imageFile: z.object({
        public_id: z.string(),
        url: z.string(),
        secure_url: z.string(),
        width: z.number(),
        height: z.number(),
        format: z.string(),
        bytes: z.number()
      }).optional(),
      
      // Texto/HTML
      text: z.string().optional(),
      html: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional()
    })
  })).optional(),
  objetivos: z.array(z.string()).optional(),
  recursos: z.array(z.object({
    titulo: z.string(),
    url: z.string(),
    tipo: z.enum(['enlace', 'descarga', 'referencia'])
  })).optional(),
  tipoEntrenamiento: z.enum(['TradingFundamentals', 'DowJones']).optional(),
  dificultad: z.enum(['Básico', 'Intermedio', 'Avanzado']).optional(),
  esGratuita: z.boolean().optional(),
  requiereSuscripcion: z.boolean().optional(),
  orden: z.number().optional(),
  activa: z.boolean().optional()
});

/**
 * API para gestionar lecciones específicas por ID
 * GET: Obtener lección por ID
 * PUT: Actualizar lección (solo admin)
 * DELETE: Eliminar lección (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'ID de lección requerido'
    });
  }

  if (req.method === 'GET') {
    try {
      console.log('📚 Obteniendo lección por ID:', id);

      const leccion = await Lesson.findById(id);

      if (!leccion) {
        return res.status(404).json({
          success: false,
          error: 'Lección no encontrada'
        });
      }

      // Incrementar contador de visualizaciones
      await Lesson.findByIdAndUpdate(id, {
        $inc: { 'estadisticas.visualizaciones': 1 }
      });

      console.log('✅ Lección encontrada:', leccion.titulo);

      return res.status(200).json({
        success: true,
        data: leccion
      });

    } catch (error) {
      console.error('❌ Error al obtener lección:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener la lección'
      });
    }
  }

  if (req.method === 'PUT') {
    // Verificar acceso de administrador
    const adminCheck = await verifyAdminAccess({ req, res } as any);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    try {
      console.log('📚 Actualizando lección:', id);

      // Validar datos de entrada
      const datosValidados = updateLessonSchema.parse(req.body);

      // Verificar que la lección existe
      const leccionExistente = await Lesson.findById(id);
      if (!leccionExistente) {
        return res.status(404).json({
          success: false,
          error: 'Lección no encontrada'
        });
      }

      // Si se está cambiando el módulo o número de lección, verificar conflictos
      if (datosValidados.modulo && datosValidados.numeroLeccion) {
        const conflicto = await Lesson.findOne({
          _id: { $ne: id },
          tipoEntrenamiento: datosValidados.tipoEntrenamiento || leccionExistente.tipoEntrenamiento,
          modulo: datosValidados.modulo,
          numeroLeccion: datosValidados.numeroLeccion
        });

        if (conflicto) {
          return res.status(409).json({
            success: false,
            error: `Ya existe una lección ${datosValidados.numeroLeccion} en el módulo ${datosValidados.modulo}`
          });
        }
      }

      // Actualizar la lección
      const leccionActualizada = await Lesson.findByIdAndUpdate(
        id,
        {
          ...datosValidados,
          fechaActualizacion: new Date()
        },
        { new: true, runValidators: true }
      );

      console.log('✅ Lección actualizada exitosamente:', leccionActualizada?.titulo);

      return res.status(200).json({
        success: true,
        data: leccionActualizada,
        message: 'Lección actualizada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error al actualizar lección:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  if (req.method === 'DELETE') {
    // Verificar acceso de administrador
    const adminCheck = await verifyAdminAccess({ req, res } as any);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    try {
      console.log('📚 Eliminando lección:', id);

      // Verificar que la lección existe
      const leccion = await Lesson.findById(id);
      if (!leccion) {
        return res.status(404).json({
          success: false,
          error: 'Lección no encontrada'
        });
      }

      // Eliminar la lección
      await Lesson.findByIdAndDelete(id);

      console.log('✅ Lección eliminada exitosamente:', leccion.titulo);

      return res.status(200).json({
        success: true,
        message: 'Lección eliminada exitosamente',
        data: { titulo: leccion.titulo, id: leccion._id }
      });

    } catch (error) {
      console.error('❌ Error al eliminar lección:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Método no permitido
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({
    success: false,
    error: `Método ${req.method} no permitido`
  });
} 