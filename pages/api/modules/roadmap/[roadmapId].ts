import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Module from '@/models/Module';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`
    });
  }

  const { roadmapId } = req.query;

  if (!roadmapId || typeof roadmapId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'ID del roadmap requerido'
    });
  }

  try {
    // Obtener módulos del roadmap ordenados
    const modules = await Module.find({ roadmapId, activo: true })
      .sort({ orden: 1 })
      .populate('prerequisito', 'nombre slug orden');

    // Calcular estadísticas
    const totalLecciones = modules.reduce((acc, module) => acc + module.lecciones, 0);
    const totalHoras = modules.reduce((acc, module) => {
      // Intentar extraer número de horas de la duración (ej: "2 semanas" = 16 horas aprox)
      const hours = parseInt(module.duracion.split(' ')[0]);
      return acc + (isNaN(hours) ? 0 : hours * 8); // Asumiendo 8 horas por semana
    }, 0);

    return res.status(200).json({
      success: true,
      data: {
        modules,
        statistics: {
          totalModules: modules.length,
          totalLecciones,
          totalHoras,
          dificultades: {
            basico: modules.filter(m => m.dificultad === 'Básico').length,
            intermedio: modules.filter(m => m.dificultad === 'Intermedio').length,
            avanzado: modules.filter(m => m.dificultad === 'Avanzado').length
          }
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener módulos del roadmap:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener módulos del roadmap'
    });
  }
} 