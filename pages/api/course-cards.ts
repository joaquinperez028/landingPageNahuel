import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import CourseCard, { ICourseCard } from '@/models/CourseCard';
import { verifyAdminAPI } from '@/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return await getCourseCards(req, res);
    case 'POST':
      return await createCourseCard(req, res);
    case 'PUT':
      return await updateCourseCard(req, res);
    case 'DELETE':
      return await deleteCourseCard(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET - Obtener tarjetas de cursos
async function getCourseCards(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { destacados, activos } = req.query;
    
    let filter: any = {};
    
    if (destacados === 'true') {
      filter.destacado = true;
    }
    
    if (activos === 'true') {
      filter.activo = true;
    }

    const courseCards = await CourseCard.find(filter)
      .sort({ orden: 1, fechaCreacion: -1 })
      .lean();

    return res.status(200).json(courseCards);
  } catch (error) {
    console.error('Error al obtener tarjetas de cursos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// POST - Crear nueva tarjeta de curso (solo admin)
async function createCourseCard(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isAdmin = await verifyAdminAPI(req, res);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const {
      titulo,
      descripcion,
      precio,
      urlDestino,
      imagen,
      destacado,
      activo,
      orden,
      categoria
    } = req.body;

    // Validaciones
    if (!titulo || !descripcion || !precio || !urlDestino) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios: titulo, descripcion, precio, urlDestino' 
      });
    }

    // Validar URL
    if (!/^https?:\/\/.+/.test(urlDestino)) {
      return res.status(400).json({ 
        error: 'La URL destino debe ser una URL válida' 
      });
    }

    const courseCard = new CourseCard({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      precio: precio.trim(),
      urlDestino: urlDestino.trim(),
      imagen: imagen?.trim() || null,
      destacado: destacado || false,
      activo: activo !== false, // Por defecto true
      orden: orden || 0,
      categoria: categoria?.trim() || null
    });

    await courseCard.save();

    return res.status(201).json(courseCard);
  } catch (error) {
    console.error('Error al crear tarjeta de curso:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// PUT - Actualizar tarjeta de curso (solo admin)
async function updateCourseCard(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isAdmin = await verifyAdminAPI(req, res);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de tarjeta requerido' });
    }

    // Validar URL si se proporciona
    if (updateData.urlDestino && !/^https?:\/\/.+/.test(updateData.urlDestino)) {
      return res.status(400).json({ 
        error: 'La URL destino debe ser una URL válida' 
      });
    }

    const courseCard = await CourseCard.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        fechaActualizacion: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!courseCard) {
      return res.status(404).json({ error: 'Tarjeta de curso no encontrada' });
    }

    return res.status(200).json(courseCard);
  } catch (error) {
    console.error('Error al actualizar tarjeta de curso:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// DELETE - Eliminar tarjeta de curso (solo admin)
async function deleteCourseCard(req: NextApiRequest, res: NextApiResponse) {
  try {
    const isAdmin = await verifyAdminAPI(req, res);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID de tarjeta requerido' });
    }

    const courseCard = await CourseCard.findByIdAndDelete(id);

    if (!courseCard) {
      return res.status(404).json({ error: 'Tarjeta de curso no encontrada' });
    }

    return res.status(200).json({ message: 'Tarjeta de curso eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tarjeta de curso:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 