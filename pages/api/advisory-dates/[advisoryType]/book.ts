import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import AdvisoryDate from '@/models/AdvisoryDate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    
    const { advisoryType } = req.query;

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ 
        success: false, 
        error: `Método ${req.method} no permitido` 
      });
    }

    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    const { advisoryDateId } = req.body;

    if (!advisoryDateId) {
      return res.status(400).json({
        success: false,
        error: 'ID de fecha de asesoría requerido'
      });
    }

    // Buscar la fecha de asesoría
    const advisoryDate = await AdvisoryDate.findById(advisoryDateId);

    if (!advisoryDate) {
      return res.status(404).json({
        success: false,
        error: 'Fecha de asesoría no encontrada'
      });
    }

    // Verificar que no esté ya reservada
    if (advisoryDate.isBooked) {
      return res.status(409).json({
        success: false,
        error: 'Esta fecha ya está reservada'
      });
    }

    // Marcar como reservada
    advisoryDate.isBooked = true;
    advisoryDate.updatedAt = new Date();
    await advisoryDate.save();

    return res.status(200).json({
      success: true,
      data: advisoryDate,
      message: 'Fecha de asesoría reservada exitosamente'
    });

  } catch (error) {
    console.error('Error reservando fecha de asesoría:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
}
