import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import { z } from 'zod';

// Schema de validación para crear lecciones
const createLessonSchema = z.object({
  titulo: z.string().min(1, 'Título es requerido'),
  descripcion: z.string().min(1, 'Descripción es requerida'),
  modulo: z.number().min(1).max(10),
  numeroLeccion: z.number().min(1),
  duracionEstimada: z.number().min(0).default(0),
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
        uploadDate: z.string()
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
  })).default([]),
  objetivos: z.array(z.string()).default([]),
  recursos: z.array(z.object({
    titulo: z.string(),
    url: z.string(),
    tipo: z.enum(['enlace', 'descarga', 'referencia'])
  })).default([]),
  tipoEntrenamiento: z.enum(['SwingTrading', 'DowJones']),
  dificultad: z.enum(['Básico', 'Intermedio', 'Avanzado']).default('Básico'),
  esGratuita: z.boolean().default(false),
  requiereSuscripcion: z.boolean().default(true),
  orden: z.number(),
  activa: z.boolean().default(true)
});

/**
 * API para gestionar lecciones
 * GET: Obtener todas las lecciones (filtros disponibles)
 * POST: Crear nueva lección (solo admin)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      console.log('📚 Obteniendo lecciones');
      
      const { 
        tipo, 
        modulo, 
        activa, 
        gratuita, 
        page = '1', 
        limit = '20',
        search 
      } = req.query;

      // Construir filtros
      const filtros: any = {};
      
      if (tipo && ['SwingTrading', 'DowJones'].includes(tipo as string)) {
        filtros.tipoEntrenamiento = tipo;
      }
      
      if (modulo) {
        filtros.modulo = parseInt(modulo as string);
      }
      
      if (activa !== undefined) {
        filtros.activa = activa === 'true';
      }
      
      if (gratuita !== undefined) {
        filtros.esGratuita = gratuita === 'true';
      }

      if (search) {
        filtros.$or = [
          { titulo: { $regex: search, $options: 'i' } },
          { descripcion: { $regex: search, $options: 'i' } }
        ];
      }

      // Paginación
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Obtener lecciones
      const lecciones = await Lesson.find(filtros)
        .sort({ modulo: 1, orden: 1, numeroLeccion: 1 })
        .skip(skip)
        .limit(limitNum);

      // Contar total para paginación
      const total = await Lesson.countDocuments(filtros);

      console.log(`✅ Encontradas ${lecciones.length} lecciones`);

      return res.status(200).json({
        success: true,
        data: {
          lecciones,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });

    } catch (error) {
      console.error('❌ Error al obtener lecciones:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error al obtener las lecciones' 
      });
    }
  }

  if (req.method === 'POST') {
    // Verificar acceso de administrador
    const adminCheck = await verifyAdminAccess({ req, res } as any);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    try {
      console.log('📚 Creando nueva lección');

      // Validar datos de entrada
      const datosValidados = createLessonSchema.parse(req.body);

      // Verificar que no exista una lección con el mismo número en el módulo
      const leccionExistente = await Lesson.findOne({
        tipoEntrenamiento: datosValidados.tipoEntrenamiento,
        modulo: datosValidados.modulo,
        numeroLeccion: datosValidados.numeroLeccion
      });

      if (leccionExistente) {
        return res.status(409).json({
          success: false,
          error: `Ya existe una lección ${datosValidados.numeroLeccion} en el módulo ${datosValidados.modulo}`
        });
      }

      // Crear la lección
      const nuevaLeccion = new Lesson({
        ...datosValidados,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estadisticas: {
          visualizaciones: 0,
          completados: 0,
          tiempoPromedioVisualizacion: 0
        }
      });

      await nuevaLeccion.save();

      console.log('✅ Lección creada exitosamente:', nuevaLeccion.titulo);

      return res.status(201).json({
        success: true,
        data: nuevaLeccion,
        message: 'Lección creada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error al crear lección:', error);
      
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

  // Método no permitido
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({
    success: false,
    error: `Método ${req.method} no permitido`
  });
} 