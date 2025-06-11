import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';
import formidable from 'formidable';
import fs from 'fs';
import { uploadImageToCloudinary } from '../../../lib/cloudinary';

// Configuración para permitir archivos
export const config = {
  api: {
    bodyParser: false, // Desactivar body parser para manejar archivos
  },
};

interface UploadImageResponse {
  success: boolean;
  data?: {
    public_id: string;
    url: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadImageResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido'
    });
  }

  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Verificar que el usuario sea admin
    if (session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden subir imágenes'
      });
    }

    console.log('📤 Iniciando upload de imagen para usuario:', session.user.email);

    // Configurar formidable para manejar archivos
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      keepExtensions: true,
      filter: ({ mimetype }) => {
        // Solo permitir imágenes
        return Boolean(mimetype && mimetype.includes('image'));
      }
    });

    // Procesar el archivo
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No se encontró archivo de imagen'
      });
    }

    console.log('📁 Archivo recibido:', {
      originalFilename: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size
    });

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WEBP'
      });
    }

    // Leer el archivo como buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = file.originalFilename || `image_${Date.now()}`;

    console.log('📤 Subiendo imagen a Cloudinary...');

    // Subir a Cloudinary
    const uploadResult = await uploadImageToCloudinary(
      fileBuffer, 
      fileName,
      'nahuel-trading/reports' // Carpeta específica para reportes
    );

    console.log('✅ Imagen subida exitosamente:', uploadResult.public_id);

    // Limpiar archivo temporal
    fs.unlinkSync(file.filepath);

    // Responder con información de la imagen
    return res.status(200).json({
      success: true,
      data: {
        public_id: uploadResult.public_id,
        url: uploadResult.url,
        secure_url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      }
    });

  } catch (error) {
    console.error('❌ Error en upload de imagen:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
} 