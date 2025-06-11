import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/googleAuth';
import dbConnect from '../../../../lib/mongodb';
import Report from '../../../../models/Report';
import User from '../../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Solo los administradores pueden ejecutar migraciones' 
      });
    }

    console.log('🔄 Iniciando migración de informes existentes...');

    // Buscar informes que no tienen el nuevo esquema de Cloudinary
    const informesAntiguos = await Report.find({
      $or: [
        { coverImage: { $exists: false } },
        { images: { $exists: false } },
        { isPublished: { $exists: false } }
      ]
    });

    console.log(`📊 Encontrados ${informesAntiguos.length} informes para migrar`);

    let migrados = 0;
    let errores = 0;

    for (const informe of informesAntiguos) {
      try {
        const updateData: any = {};

        // Agregar campos faltantes del nuevo esquema
        if (!informe.isPublished) {
          updateData.isPublished = true;
        }

        if (!informe.publishedAt) {
          updateData.publishedAt = informe.createdAt || new Date();
        }

        // Migrar imagen antigua a coverImage si existe
        if (informe.imageUrl && !informe.coverImage) {
          // Si el imageUrl es de Cloudinary, extraer el public_id
          if (informe.imageUrl.includes('cloudinary.com')) {
            try {
              const urlParts = informe.imageUrl.split('/');
              const publicIdWithExt = urlParts[urlParts.length - 1];
              const publicId = publicIdWithExt.split('.')[0];
              
              updateData.coverImage = {
                public_id: publicId,
                url: informe.imageUrl,
                secure_url: informe.imageUrl,
                width: 800,
                height: 600,
                format: 'jpg',
                bytes: 100000,
                caption: '',
                order: 0
              };
            } catch (error) {
              console.warn(`⚠️ No se pudo migrar imagen para informe ${informe._id}:`, error);
            }
          }
        }

        // Inicializar array de imágenes adicionales si no existe
        if (!informe.images) {
          updateData.images = [];
        }

        // Aplicar actualizaciones si hay cambios
        if (Object.keys(updateData).length > 0) {
          await Report.findByIdAndUpdate(informe._id, updateData);
          migrados++;
          console.log(`✅ Migrado informe: ${informe.title}`);
        }

      } catch (error) {
        console.error(`❌ Error migrando informe ${informe._id}:`, error);
        errores++;
      }
    }

    console.log(`🎉 Migración completada: ${migrados} exitosos, ${errores} errores`);

    return res.status(200).json({
      success: true,
      message: 'Migración completada exitosamente',
      data: {
        totalEncontrados: informesAntiguos.length,
        migrados,
        errores
      }
    });

  } catch (error) {
    console.error('❌ Error en migración de informes:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 