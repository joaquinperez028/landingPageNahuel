import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';
import formidable from 'formidable';
import fs from 'fs';
import { uploadFileToCloudinary } from '../../../lib/cloudinary';

// Configuración para permitir archivos
export const config = {
  api: {
    bodyParser: false, // Desactivar body parser para manejar archivos
  },
};

interface UploadPdfResponse {
  success: boolean;
  data?: {
    public_id: string;
    url: string;
    secure_url: string;
    format: string;
    bytes: number;
    pages?: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadPdfResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido'
    });
  }

  try {
    console.log('🔧 Verificando configuración de Cloudinary...');
    
    // Verificar variables de entorno
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Variables de Cloudinary faltantes:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret
      });
      return res.status(500).json({
        success: false,
        error: 'Configuración de Cloudinary incompleta'
      });
    }
    
    console.log('✅ Variables de Cloudinary configuradas correctamente');

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
        error: 'Solo los administradores pueden subir archivos PDF'
      });
    }

    console.log('📤 Iniciando upload de PDF para usuario:', session.user.email);

    // Configurar formidable para manejar archivos PDF
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max para PDFs
      keepExtensions: true,
      filter: ({ mimetype }) => {
        // Solo permitir PDFs
        return Boolean(mimetype && mimetype === 'application/pdf');
      }
    });

    // Procesar el archivo
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No se encontró archivo PDF'
      });
    }

    console.log('📁 Archivo PDF recibido:', {
      originalFilename: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size
    });

    // Validar tipo de archivo
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        error: 'Tipo de archivo no válido. Solo se permiten archivos PDF'
      });
    }

    // Leer el archivo como buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = file.originalFilename || `pdf_${Date.now()}`;

    console.log('📤 Subiendo PDF a Cloudinary...', {
      fileName,
      bufferSize: fileBuffer.length
    });

    // Subir a Cloudinary
    const uploadResult = await uploadFileToCloudinary(
      fileBuffer, 
      fileName,
      'nahuel-trading/lecciones/pdfs' // Carpeta específica para PDFs de lecciones
    );

    console.log('✅ PDF subido exitosamente:', {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
      size: uploadResult.bytes
    });

    // Limpiar archivo temporal
    fs.unlinkSync(file.filepath);

    // Responder con información del PDF
    return res.status(200).json({
      success: true,
      data: {
        public_id: uploadResult.public_id,
        url: uploadResult.url,
        secure_url: uploadResult.secure_url,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        pages: uploadResult.pages || undefined
      }
    });

  } catch (error) {
    console.error('❌ Error subiendo PDF:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
} 