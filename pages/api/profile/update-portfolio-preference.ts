import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para actualizar preferencia de rango de portfolio del usuario
 * POST: Actualizar preferencia de rango
 * GET: Obtener preferencia actual
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (req.method === 'POST') {
      return await updatePortfolioPreference(req, res, session.user);
    } else if (req.method === 'GET') {
      return await getPortfolioPreference(req, res, session.user);
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('❌ Error en API de preferencia de portfolio:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

/**
 * ✅ NUEVO: Actualizar preferencia de rango de portfolio
 */
async function updatePortfolioPreference(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const { portfolioTimeRange } = req.body;

    // ✅ NUEVO: Validar rango válido
    const validRanges = ['7d', '15d', '30d', '6m', '1a'];
    if (!portfolioTimeRange || !validRanges.includes(portfolioTimeRange)) {
      return res.status(400).json({ 
        error: 'Rango de portfolio inválido',
        validRanges,
        received: portfolioTimeRange
      });
    }

    // ✅ NUEVO: Buscar y actualizar usuario
    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      { 
        $set: { 
          portfolioTimeRange,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Preferencia de portfolio actualizada:', {
      user: user.email,
      oldPreference: user.portfolioTimeRange,
      newPreference: portfolioTimeRange,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Preferencia de portfolio actualizada correctamente',
      portfolioTimeRange,
      updatedAt: updatedUser.updatedAt
    });

  } catch (error: any) {
    console.error('❌ Error actualizando preferencia de portfolio:', error);
    return res.status(500).json({
      error: 'Error al actualizar preferencia de portfolio',
      details: error.message
    });
  }
}

/**
 * ✅ NUEVO: Obtener preferencia actual de rango de portfolio
 */
async function getPortfolioPreference(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    // ✅ NUEVO: Buscar usuario con su preferencia
    const userDoc = await User.findOne({ email: user.email }).select('portfolioTimeRange');
    
    if (!userDoc) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      success: true,
      portfolioTimeRange: userDoc.portfolioTimeRange || '30d', // Default a 30 días
      hasPreference: !!userDoc.portfolioTimeRange
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo preferencia de portfolio:', error);
    return res.status(500).json({
      error: 'Error al obtener preferencia de portfolio',
      details: error.message
    });
  }
} 