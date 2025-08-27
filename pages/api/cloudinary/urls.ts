import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';

/**
 * ✅ NUEVO: API segura para generar URLs de Cloudinary
 * 
 * Esta API permite al frontend obtener URLs de Cloudinary sin exponer
 * la lógica interna o las credenciales
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ NUEVO: Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { action, publicId, options } = req.body;

    if (!action || !publicId) {
      return res.status(400).json({ 
        error: 'Acción y publicId requeridos',
        example: {
          action: 'image|pdf|download|view',
          publicId: 'folder/filename',
          options: { width: 800, quality: 'auto' }
        }
      });
    }

    // ✅ NUEVO: Validar que el publicId sea seguro
    if (!/^[a-zA-Z0-9_\-/]+$/.test(publicId)) {
      return res.status(400).json({ error: 'Public ID inválido' });
    }

    let url: string;

    switch (action) {
      case 'image':
        url = generateImageUrl(publicId, options);
        break;
      
      case 'pdf':
        url = generatePDFUrl(publicId, options);
        break;
      
      case 'download':
        url = generateDownloadUrl(publicId);
        break;
      
      case 'view':
        url = generateViewUrl(publicId);
        break;
      
      default:
        return res.status(400).json({ 
          error: 'Acción no válida',
          validActions: ['image', 'pdf', 'download', 'view']
        });
    }

    return res.status(200).json({
      success: true,
      url,
      publicId,
      action,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error en API de URLs de Cloudinary:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

/**
 * ✅ NUEVO: Generar URL de imagen optimizada
 */
function generateImageUrl(publicId: string, options: any = {}): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME no configurado');
  }

  let transformString = '';
  
  if (options.width) {
    transformString += `w_${options.width},`;
  }
  
  if (options.height) {
    transformString += `h_${options.height},`;
  }
  
  if (options.quality) {
    transformString += `q_${options.quality},`;
  }
  
  if (options.format) {
    transformString += `f_${options.format},`;
  }
  
  if (options.crop) {
    transformString += `c_${options.crop},`;
  }
  
  if (options.gravity) {
    transformString += `g_${options.gravity},`;
  }
  
  // Remover coma final si existe
  if (transformString.endsWith(',')) {
    transformString = transformString.slice(0, -1);
  }
  
  if (transformString) {
    transformString += '/';
  }
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
}

/**
 * ✅ NUEVO: Generar URL de PDF
 */
function generatePDFUrl(publicId: string, options: any = {}): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME no configurado');
  }
  
  let transformString = '';
  
  if (options.page) {
    transformString += `pg_${options.page},`;
  }
  
  if (options.density) {
    transformString += `d_${options.density},`;
  }
  
  if (options.quality) {
    transformString += `q_${options.quality},`;
  }
  
  // Remover coma final si existe
  if (transformString.endsWith(',')) {
    transformString = transformString.slice(0, -1);
  }
  
  if (transformString) {
    transformString += '/';
  }
  
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${transformString}${publicId}`;
}

/**
 * ✅ NUEVO: Generar URL de descarga
 */
function generateDownloadUrl(publicId: string): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME no configurado');
  }
  
  return `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment:false/${publicId}`;
}

/**
 * ✅ NUEVO: Generar URL de visualización
 */
function generateViewUrl(publicId: string): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME no configurado');
  }
  
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`;
} 