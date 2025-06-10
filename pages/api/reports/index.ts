import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import Report from '../../../models/Report';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: `Método ${req.method} no permitido` 
    });
  }

  try {
    await connectDB();

    // Obtener parámetros de consulta
    const { 
      page = '1', 
      limit = '10', 
      type = 'all',
      featured = 'false'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtro - solo informes publicados
    const filter: any = { status: 'published' };
    
    if (type !== 'all') {
      filter.type = type;
    }
    
    if (featured === 'true') {
      filter.isFeature = true;
    }

    // Ejecutar consulta
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-content') // No incluir contenido completo en el listado
        .lean(),
      Report.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener informes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
} 