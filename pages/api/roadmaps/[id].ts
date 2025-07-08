import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Roadmap, { type RoadmapDocument } from '../../../models/Roadmap';
import { verifyAdminAccess } from '../../../lib/adminAuth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    const { id } = req.query;

    // Validar que el ID sea válido
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        error: 'ID de roadmap inválido'
      });
    }

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, id as string);
      case 'PUT':
        return await handlePut(req, res, id as string);
      case 'DELETE':
        return await handleDelete(req, res, id as string);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ 
          success: false, 
          error: `Método ${req.method} no permitido` 
        });
    }
  } catch (error) {
    console.error('Error en /api/roadmaps/[id]:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
}

/**
 * GET /api/roadmaps/[id]
 * Obtiene un roadmap específico por ID
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const roadmap = await Roadmap.findById(id) as RoadmapDocument;

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: 'Roadmap no encontrado'
      });
    }

    // Calcular estadísticas adicionales
    const estadisticas = {
      totalModulos: roadmap.modulos.length,
      totalLecciones: roadmap.metadatos.totalLecciones,
      totalHoras: roadmap.metadatos.totalHoras,
      modulosPorDificultad: {
        basico: roadmap.modulos.filter(m => m.dificultad === 'Básico').length,
        intermedio: roadmap.modulos.filter(m => m.dificultad === 'Intermedio').length,
        avanzado: roadmap.modulos.filter(m => m.dificultad === 'Avanzado').length
      },
      totalTemas: roadmap.modulos.reduce((acc, modulo) => acc + modulo.temas.length, 0)
    };

    return res.status(200).json({
      success: true,
      data: {
        roadmap,
        estadisticas
      }
    });

  } catch (error) {
    console.error('Error obteniendo roadmap:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener roadmap'
    });
  }
}

/**
 * PUT /api/roadmaps/[id]
 * Actualiza un roadmap específico (solo administradores)
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
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
      modulos,
      activo,
      orden
    } = req.body;

    // Verificar que el roadmap existe
    const roadmapExistente = await Roadmap.findById(id);
    if (!roadmapExistente) {
      return res.status(404).json({
        success: false,
        error: 'Roadmap no encontrado'
      });
    }

    // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
    if (nombre && nombre !== roadmapExistente.nombre) {
      const existeNombre = await Roadmap.findOne({ 
        nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existeNombre) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe otro roadmap con ese nombre'
        });
      }
    }

    // Preparar datos de actualización
    const datosActualizacion: any = {};
    
    if (nombre) datosActualizacion.nombre = nombre;
    if (descripcion) datosActualizacion.descripcion = descripcion;
    if (tipoEntrenamiento) datosActualizacion.tipoEntrenamiento = tipoEntrenamiento;
    if (modulos) datosActualizacion.modulos = modulos;
    if (typeof activo === 'boolean') datosActualizacion.activo = activo;
    if (orden) datosActualizacion.orden = orden;

    // Actualizar metadatos
    datosActualizacion['metadatos.autor'] = session.user.email;

    // Si se están actualizando módulos, validar prerequisitos
    if (modulos && modulos.length > 0) {
      // Crear roadmap temporal para validar
      const roadmapTemporal = new Roadmap({
        ...roadmapExistente.toObject(),
        ...datosActualizacion
      });
      
      const erroresPrerequisitos = roadmapTemporal.validarPrerequisitos();
      if (erroresPrerequisitos.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Errores en prerequisitos',
          detalles: erroresPrerequisitos
        });
      }
    }

    // Actualizar roadmap
    const roadmapActualizado = await Roadmap.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: {
        roadmap: roadmapActualizado,
        mensaje: 'Roadmap actualizado exitosamente'
      }
    });

  } catch (error) {
    console.error('Error actualizando roadmap:', error);
    
    if (error instanceof Error) {
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
      error: 'Error al actualizar roadmap'
    });
  }
}

/**
 * DELETE /api/roadmaps/[id]
 * Elimina un roadmap específico (solo administradores)
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
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

    // Verificar que el roadmap existe
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: 'Roadmap no encontrado'
      });
    }

    // Eliminar roadmap
    await Roadmap.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      data: {
        mensaje: 'Roadmap eliminado exitosamente',
        roadmapEliminado: {
          id: roadmap._id,
          nombre: roadmap.nombre
        }
      }
    });

  } catch (error) {
    console.error('Error eliminando roadmap:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al eliminar roadmap'
    });
  }
} 