import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { uploadImageToMux } from '@/lib/mux';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import formidable from 'formidable';
import fs from 'fs';

// Configuración para permitir archivos
export const config = {
  api: {
    bodyParser: false, // Desactivar body parser para manejar archivos
  },
};

interface UploadResponse {
  success: boolean;
  message?: string;
  imageUrl?: string;
  assetId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método no permitido' 
    });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ 
        success: false, 
        error: 'No autorizado. Debes iniciar sesión.' 
      });
    }

    await dbConnect();

    // Verificar que el usuario sea admin
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Permisos insuficientes. Solo los administradores pueden subir imágenes.' 
      });
    }

    // Parsear el archivo usando formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB máximo
      allowEmptyFiles: false,
      multiples: false
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No se encontró ningún archivo'
      });
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!validTypes.includes(file.mimetype || '')) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WEBP'
      });
    }

    // Leer el archivo
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Subir a Mux
    const assetId = await uploadImageToMux(fileBuffer, file.originalFilename || 'report-image');
    
    // Limpiar archivo temporal
    fs.unlinkSync(file.filepath);

    // Generar URL de la imagen usando el asset ID
    const imageUrl = `https://image.mux.com/${assetId}/thumbnail.jpg?width=800&height=600&fit_mode=crop&time=0`;

    console.log('✅ Imagen subida exitosamente a Mux:', {
      assetId,
      imageUrl,
      originalName: file.originalFilename
    });

    return res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente a Mux',
      imageUrl,
      assetId
    });

  } catch (error) {
    console.error('❌ Error subiendo imagen a Mux:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al subir la imagen a Mux'
    });
  }
} 