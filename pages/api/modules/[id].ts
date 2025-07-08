import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Module from '@/models/Module';
import { verifyAdminAccess } from '@/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'ID del módulo requerido'
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'PUT':
      return handlePut(req, res, id);
    case 'DELETE':
      return handleDelete(req, res, id);
    default:
      return res.status(405).json({
        success: false,
        error: `Método ${req.method} no permitido`
      });
  }
}

// GET /api/modules/[id] - Obtener módulo específico
async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const module = await Module.findById(id)
      .populate('prerequisito', 'nombre slug')
      .populate('leccionesRelacionadas');

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Módulo no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: module
    });

  } catch (error) {
    console.error('Error al obtener módulo:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener módulo'
    });
  }
}

// PUT /api/modules/[id] - Actualizar módulo
async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Verificar que sea administrador
    const verification = await verifyAdminAccess({ req, res } as any);
    if (!verification.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores pueden editar módulos.'
      });
    }

    const {
      nombre,
      descripcion,
      duracion,
      lecciones,
      temas = [],
      dificultad,
      prerequisito,
      orden,
      activo
    } = req.body;

    // Verificar que el módulo existe
    const existingModule = await Module.findById(id);
    if (!existingModule) {
      return res.status(404).json({
        success: false,
        error: 'Módulo no encontrado'
      });
    }

    // Validar orden único si se cambió
    if (orden && orden !== existingModule.orden) {
      const duplicateOrder = await Module.findOne({
        roadmapId: existingModule.roadmapId,
        orden,
        _id: { $ne: id }
      });

      if (duplicateOrder) {
        return res.status(400).json({
          success: false,
          error: `Ya existe un módulo con orden ${orden} en este roadmap`
        });
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      'metadatos.fechaActualizacion': new Date()
    };

    if (nombre) updateData.nombre = nombre;
    if (descripcion) updateData.descripcion = descripcion;
    if (duracion) updateData.duracion = duracion;
    if (lecciones) updateData.lecciones = lecciones;
    if (temas) updateData.temas = temas.filter((tema: any) => tema.titulo?.trim());
    if (dificultad) updateData.dificultad = dificultad;
    if (prerequisito !== undefined) updateData.prerequisito = prerequisito || null;
    if (orden) updateData.orden = orden;
    if (activo !== undefined) updateData.activo = activo;

    // Actualizar módulo
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('prerequisito', 'nombre slug');

    return res.status(200).json({
      success: true,
      data: updatedModule,
      message: 'Módulo actualizado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al actualizar módulo:', error);

    // Manejar errores de validación
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
        error: 'Ya existe un módulo con un nombre similar.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar módulo'
    });
  }
}

// DELETE /api/modules/[id] - Eliminar módulo
async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Verificar que sea administrador
    const verification = await verifyAdminAccess({ req, res } as any);
    if (!verification.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores pueden eliminar módulos.'
      });
    }

    // Verificar que el módulo existe
    const existingModule = await Module.findById(id);
    if (!existingModule) {
      return res.status(404).json({
        success: false,
        error: 'Módulo no encontrado'
      });
    }

    // Verificar si hay otros módulos que dependen de este como prerequisito
    const dependentModules = await Module.find({ prerequisito: id });
    if (dependentModules.length > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar el módulo porque ${dependentModules.length} módulo(s) lo tienen como prerequisito`,
        details: dependentModules.map(m => m.nombre)
      });
    }

    // TODO: Verificar si hay lecciones asociadas y manejar según sea necesario
    // const associatedLessons = await Lesson.find({ moduleId: id });
    // if (associatedLessons.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     error: `No se puede eliminar el módulo porque tiene ${associatedLessons.length} lección(es) asociada(s)`
    //   });
    // }

    // Eliminar módulo
    await Module.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Módulo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar módulo:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar módulo'
    });
  }
} 