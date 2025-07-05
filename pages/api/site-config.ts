import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';
import Training from '@/models/Training';
import { verifyAdminAPI } from '@/lib/adminAuth';

/**
 * API para manejar la configuración del sitio web
 * GET: Obtiene la configuración actual
 * PUT: Actualiza la configuración (solo administradores)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      let config = await SiteConfig.findOne().populate('cursos.destacados');
      
      // Si no existe configuración, crear una por defecto
      if (!config) {
        config = new SiteConfig({
          heroVideo: {
            youtubeId: 'dQw4w9WgXcQ',
            title: 'Video de Presentación',
            description: 'Conoce más sobre nuestros servicios de trading',
            autoplay: true,
            muted: true,
            loop: true
          },
          servicios: {
            orden: 1,
            visible: true
          },
          cursos: {
            orden: 2,
            visible: true,
            destacados: []
          }
        });
        await config.save();
      }

      res.status(200).json(config);
    } catch (error) {
      console.error('Error al obtener configuración del sitio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'PUT') {
    try {
      const adminVerification = await verifyAdminAPI(req, res);
      
      if (!adminVerification.isAdmin) {
        return res.status(adminVerification.error === 'No autorizado' ? 401 : 403)
          .json({ error: adminVerification.error });
      }

      const updateData = req.body;
      
      let config = await SiteConfig.findOne();
      
      if (!config) {
        config = new SiteConfig(updateData);
      } else {
        Object.assign(config, updateData);
      }

      await config.save();
      await config.populate('cursos.destacados');

      res.status(200).json(config);
    } catch (error) {
      console.error('Error al actualizar configuración del sitio:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 