import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAPI } from '@/lib/adminAuth';
import { createDefaultTemplates } from '@/lib/notificationUtils';
import dbConnect from '@/lib/mongodb';
import NotificationTemplate from '@/models/NotificationTemplate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar autenticación y permisos de administrador
    const session = await getServerSession(req, res, authOptions);
    const adminError = await verifyAdminAPI(session, res);
    
    if (adminError) {
      return res.status(401).json({ message: adminError });
    }

    await dbConnect();

    console.log('🚀 Iniciando configuración del sistema de notificaciones...');

    // Crear plantillas por defecto
    await createDefaultTemplates();

    // Verificar que las plantillas se crearon correctamente
    const templateCount = await NotificationTemplate.countDocuments();
    const templates = await NotificationTemplate.find({}).select('name description isActive');

    console.log(`✅ Sistema de notificaciones inicializado con ${templateCount} plantillas`);

    return res.status(200).json({
      message: 'Sistema de notificaciones inicializado exitosamente',
      data: {
        templatesCreated: templateCount,
        templates: templates.map(template => ({
          name: template.name,
          description: template.description,
          isActive: template.isActive
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error al inicializar sistema de notificaciones:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 