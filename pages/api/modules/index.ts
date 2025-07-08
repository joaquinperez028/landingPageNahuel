import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Module from '@/models/Module';
import { verifyAdminAccess } from '@/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({ 
        success: false, 
        error: `Método ${req.method} no permitido` 
      });
  }
}

// GET /api/modules - Obtener módulos con filtros opcionales
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { roadmapId, tipoEntrenamiento, activo, search, page = 1, limit = 20 } = req.query;

    // Construir filtros
    const filters: any = {};
    
    if (roadmapId) filters.roadmapId = roadmapId;
    if (tipoEntrenamiento) filters.tipoEntrenamiento = tipoEntrenamiento;
    if (activo !== undefined) filters.activo = activo === 'true';
    
    // Búsqueda por texto
    if (search) {
      filters.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginación
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Obtener módulos
    const modules = await Module.find(filters)
      .sort({ orden: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('prerequisito', 'nombre slug');

    // Contar total para paginación
    const total = await Module.countDocuments(filters);

    return res.status(200).json({
      success: true,
      data: {
        modules,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener módulos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener módulos'
    });
  }
}

// POST /api/modules - Crear nuevo módulo
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar que sea administrador
    const verification = await verifyAdminAccess({ req, res } as any);
    if (!verification.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores pueden crear módulos.'
      });
    }

    const {
      nombre,
      descripcion,
      roadmapId,
      tipoEntrenamiento,
      duracion,
      lecciones,
      temas = [],
      dificultad,
      prerequisito,
      orden,
      activo = true
    } = req.body;

    // Validaciones básicas
    if (!nombre || !descripcion || !roadmapId || !tipoEntrenamiento || !duracion || !lecciones || !dificultad || !orden) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios: nombre, descripcion, roadmapId, tipoEntrenamiento, duracion, lecciones, dificultad, orden'
      });
    }

    // Validar que el orden no esté duplicado en el mismo roadmap
    const existingModule = await Module.findOne({ roadmapId, orden });
    if (existingModule) {
      return res.status(400).json({
        success: false,
        error: `Ya existe un módulo con orden ${orden} en este roadmap`
      });
    }

    // Crear el módulo
    const newModule = new Module({
      nombre,
      descripcion,
      roadmapId,
      tipoEntrenamiento,
      duracion,
      lecciones,
      temas: temas.filter((tema: any) => tema.titulo?.trim()),
      dificultad,
      prerequisito: prerequisito || null,
      orden,
      activo,
      metadatos: {
        autor: verification.session?.user?.email || verification.user?.email || 'admin',
        version: '1.0',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    });

    const savedModule = await newModule.save();

    return res.status(201).json({
      success: true,
      data: savedModule,
      message: 'Módulo creado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al crear módulo:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        details: validationErrors
      });
    }

    // Manejar error de slug duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un módulo con un nombre similar. Intenta con un nombre diferente.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear módulo'
    });
  }
} 