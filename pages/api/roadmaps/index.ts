import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Roadmap from '../../../models/Roadmap';
import { verifyAdminAccess } from '../../../lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ 
          success: false, 
          error: `Método ${req.method} no permitido` 
        });
    }
  } catch (error) {
    console.error('Error en /api/roadmaps:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
}

/**
 * GET /api/roadmaps
 * Obtiene todos los roadmaps con filtros opcionales
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      tipo, 
      activo, 
      search,
      limit = '20',
      page = '1'
    } = req.query;

    // Construir filtros
    const filtros: any = {};
    
    if (tipo && tipo !== 'all') {
      filtros.tipoEntrenamiento = tipo;
    }
    
    if (activo && activo !== 'all') {
      filtros.activo = activo === 'true';
    }
    
    if (search) {
      filtros.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginación
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    // Consulta con paginación y ordenamiento
    const [roadmaps, total] = await Promise.all([
      Roadmap.find(filtros)
        .sort({ orden: 1, createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean(),
      Roadmap.countDocuments(filtros)
    ]);

    // Calcular estadísticas generales
    const estadisticas = {
      totalRoadmaps: total,
      totalPorTipo: await Roadmap.aggregate([
        { $match: filtros },
        { $group: { _id: '$tipoEntrenamiento', count: { $sum: 1 } } }
      ]),
      totalModulos: roadmaps.reduce((acc, roadmap) => acc + roadmap.modulos.length, 0),
      totalLecciones: roadmaps.reduce((acc, roadmap) => acc + roadmap.metadatos.totalLecciones, 0)
    };

    return res.status(200).json({
      success: true,
      data: {
        roadmaps,
        paginacion: {
          total,
          pagina: pageNum,
          limite: limitNum,
          totalPaginas: Math.ceil(total / limitNum)
        },
        estadisticas
      }
    });

  } catch (error) {
    console.error('Error obteniendo roadmaps:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener roadmaps'
    });
  }
}

/**
 * POST /api/roadmaps
 * Crea un nuevo roadmap (solo administradores)
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar permisos de administrador
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    const adminCheck = await verifyAdminAccess({ req, res } as any);
    if (!adminCheck.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
    }

    const {
      nombre,
      descripcion,
      tipoEntrenamiento,
      modulos = [],
      activo = true,
      orden
    } = req.body;

    // Validaciones básicas
    if (!nombre || !descripcion || !tipoEntrenamiento) {
      return res.status(400).json({
        success: false,
        error: 'Campos obligatorios: nombre, descripcion, tipoEntrenamiento'
      });
    }

    // Verificar que no exista un roadmap con el mismo nombre
    const existeNombre = await Roadmap.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } 
    });
    
    if (existeNombre) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un roadmap con ese nombre'
      });
    }

    // Si no se especifica orden, usar el siguiente disponible
    let ordenFinal = orden;
    if (!ordenFinal) {
      const ultimoOrden = await Roadmap.findOne({}, {}, { sort: { orden: -1 } });
      ordenFinal = ultimoOrden ? ultimoOrden.orden + 1 : 1;
    }

    // Crear nuevo roadmap
    const nuevoRoadmap = new Roadmap({
      nombre,
      descripcion,
      tipoEntrenamiento,
      modulos,
      activo,
      orden: ordenFinal,
      metadatos: {
        autor: session.user.email,
        version: '1.0'
      }
    });

    // Validar prerequisitos si hay módulos
    if (modulos.length > 0) {
      const erroresPrerequisitos = nuevoRoadmap.validarPrerequisitos();
      if (erroresPrerequisitos.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Errores en prerequisitos',
          detalles: erroresPrerequisitos
        });
      }
    }

    await nuevoRoadmap.save();

    return res.status(201).json({
      success: true,
      data: {
        roadmap: nuevoRoadmap,
        mensaje: 'Roadmap creado exitosamente'
      }
    });

  } catch (error) {
    console.error('Error creando roadmap:', error);
    
    if (error instanceof Error) {
      // Errores específicos de MongoDB
      if (error.message.includes('duplicate key')) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un roadmap con ese nombre'
        });
      }
      
      if (error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Error de validación en los datos'
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Error al crear roadmap'
    });
  }
} 