import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/googleAuth';
import dbConnect from '../../../../lib/mongodb';
import Report from '../../../../models/Report';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID del informe requerido' });
    }

    console.log('👁️ Incrementando vista para informe:', id);

    // Buscar el informe y incrementar el contador de vistas
    const report = await Report.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Informe no encontrado' });
    }

    console.log('✅ Vista incrementada para informe:', id, 'Nuevo total:', report.views);

    return res.status(200).json({
      success: true,
      data: {
        views: report.views
      }
    });

  } catch (error) {
    console.error('Error al incrementar vista:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
} 