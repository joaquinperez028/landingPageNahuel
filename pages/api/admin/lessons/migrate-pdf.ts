import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';

/**
 * Endpoint para migrar PDFs de lecciones al nuevo formato cloudinaryPdf
 * Solo accesible por administradores
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden ejecutar migraciones' });
    }

    console.log('🔄 Iniciando migración de PDFs de lecciones...');
    
    await connectDB();

    // Buscar todas las lecciones que tengan contenido de tipo PDF
    const lecciones = await Lesson.find({
      'contenido.type': 'pdf'
    });

    console.log(`📚 Encontradas ${lecciones.length} lecciones con contenido PDF`);

    let migrados = 0;
    let errores = 0;
    const detalles = [];

    for (const leccion of lecciones) {
      try {
        let actualizado = false;

        for (const contenido of leccion.contenido) {
          if (contenido.type === 'pdf') {
            // Verificar si ya tiene el formato nuevo
            if (!contenido.content.cloudinaryPdf && contenido.content.pdfUrl) {
              // Intentar extraer public_id de la URL de Cloudinary
              const pdfUrl = contenido.content.pdfUrl;
              
              // Si es una URL de Cloudinary, extraer el public_id
              if (pdfUrl.includes('res.cloudinary.com')) {
                const urlParts = pdfUrl.split('/upload/');
                if (urlParts.length > 1) {
                  const publicId = urlParts[1];
                  
                  // Crear el objeto cloudinaryPdf
                  contenido.content.cloudinaryPdf = {
                    publicId: publicId,
                    originalFileName: contenido.content.pdfTitle || 'documento.pdf'
                  };
                  
                  actualizado = true;
                  
                  console.log(`✅ Migrado PDF en lección "${leccion.titulo}": ${publicId}`);
                  detalles.push({
                    leccion: leccion.titulo,
                    contenido: contenido.title || 'Sin título',
                    publicId: publicId,
                    status: 'migrado'
                  });
                }
              } else if (pdfUrl.startsWith('/api/pdf/')) {
                // Si es una URL de nuestro endpoint, extraer el public_id
                const matches = pdfUrl.match(/\/api\/pdf\/(view|download)\/(.+?)(?:\?|$)/);
                if (matches && matches[2]) {
                  const publicId = decodeURIComponent(matches[2]);
                  
                  contenido.content.cloudinaryPdf = {
                    publicId: publicId,
                    originalFileName: contenido.content.pdfTitle || 'documento.pdf'
                  };
                  
                  actualizado = true;
                  
                  console.log(`✅ Migrado PDF de endpoint en lección "${leccion.titulo}": ${publicId}`);
                  detalles.push({
                    leccion: leccion.titulo,
                    contenido: contenido.title || 'Sin título',
                    publicId: publicId,
                    status: 'migrado'
                  });
                }
              } else {
                console.warn(`⚠️ No se pudo migrar PDF en lección "${leccion.titulo}": URL no reconocida`);
                detalles.push({
                  leccion: leccion.titulo,
                  contenido: contenido.title || 'Sin título',
                  url: pdfUrl,
                  status: 'no_migrado'
                });
              }
            } else if (contenido.content.cloudinaryPdf) {
              detalles.push({
                leccion: leccion.titulo,
                contenido: contenido.title || 'Sin título',
                publicId: contenido.content.cloudinaryPdf.publicId,
                status: 'ya_migrado'
              });
            }
          }
        }

        // Guardar si hubo cambios
        if (actualizado) {
          await leccion.save();
          migrados++;
        }

      } catch (error) {
        console.error(`❌ Error migrando lección ${leccion.titulo}:`, error);
        errores++;
        detalles.push({
          leccion: leccion.titulo,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    console.log(`✅ Migración completada: ${migrados} lecciones migradas, ${errores} errores`);

    return res.status(200).json({
      success: true,
      message: 'Migración de PDFs completada',
      data: {
        leccionesEncontradas: lecciones.length,
        migrados,
        errores,
        detalles
      }
    });

  } catch (error) {
    console.error('❌ Error en migración de PDFs:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 