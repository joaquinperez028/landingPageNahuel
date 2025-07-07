import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para obtener los entrenamientos del usuario
 * GET: Obtener lista de entrenamientos asignados al usuario
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`
    });
  }

  await connectDB();

  try {
    console.log('👤 Obteniendo entrenamientos del usuario');

    // Verificar sesión
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Buscar usuario en la base de datos
    const usuario = await User.findOne({ email: session.user.email });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
        data: {
          entrenamientos: [],
          tiposDisponibles: []
        }
      });
    }

    // Obtener entrenamientos activos
    const entrenamientosActivos = [];
    const tiposDisponibles = [];

    for (const entrenamiento of usuario.entrenamientos) {
      if (entrenamiento.activo) {
        entrenamientosActivos.push({
          tipo: entrenamiento.tipo,
          fechaInscripcion: entrenamiento.fechaInscripcion,
          progreso: entrenamiento.progreso,
          fechaCompletado: entrenamiento.fechaCompletado,
          precio: entrenamiento.precio
        });
        tiposDisponibles.push(entrenamiento.tipo);
      }
    }

    console.log(`✅ Usuario ${usuario.email} tiene ${entrenamientosActivos.length} entrenamientos`);

    return res.status(200).json({
      success: true,
      data: {
        entrenamientos: entrenamientosActivos,
        tiposDisponibles: tiposDisponibles
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener entrenamientos del usuario:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
} 