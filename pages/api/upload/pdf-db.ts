import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import PDF from '@/models/PDF';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Necesario para manejar archivos
    sizeLimit: '50mb', // Límite de 50MB para PDFs
  }
};

interface DatabasePdfResponse {
  success: boolean;
  data?: {
    pdfId: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadDate: Date;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DatabasePdfResponse>
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
    if (!session?.user) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado. Debes estar logueado.'
      });
    }

    // Verificar que el usuario sea admin (solo admins pueden subir PDFs)
    if (session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo administradores pueden subir PDFs'
      });
    }

    console.log('📤 Iniciando upload de PDF a base de datos por:', session.user.email);

    await connectDB();

    // Configurar formidable para procesar el archivo
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filter: ({ mimetype }) => {
        return mimetype === 'application/pdf';
      }
    });

    // Parsear el formulario
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
      // Limpiar archivo temporal
      fs.unlinkSync(file.filepath);
      return res.status(400).json({
        success: false,
        error: 'Tipo de archivo no válido. Solo se permiten archivos PDF'
      });
    }

    // Validar tamaño (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({
        success: false,
        error: 'Archivo demasiado grande. Máximo 50MB permitido'
      });
    }

    // Leer el archivo como buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    const originalName = file.originalFilename || `pdf_${Date.now()}.pdf`;
    const fileName = `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    console.log('💾 Guardando PDF en base de datos...', {
      fileName,
      originalName,
      bufferSize: fileBuffer.length
    });

    // Crear documento PDF en la base de datos
    const pdfDoc = new PDF({
      fileName,
      originalName,
      mimeType: file.mimetype,
      fileSize: file.size,
      data: fileBuffer,
      uploadedBy: session.user.email,
      metadata: {
        // Aquí podrías agregar más metadata del PDF si tienes una librería para extraerla
      }
    });

    // Guardar en la base de datos
    const savedPdf = await pdfDoc.save();

    console.log('✅ PDF guardado exitosamente en base de datos:', {
      pdfId: savedPdf._id.toString(),
      fileName: savedPdf.fileName,
      size: savedPdf.fileSize
    });

    // Limpiar archivo temporal
    fs.unlinkSync(file.filepath);

    // Responder con información del PDF
    return res.status(200).json({
      success: true,
      data: {
        pdfId: savedPdf._id.toString(),
        fileName: savedPdf.fileName,
        originalName: savedPdf.originalName,
        fileSize: savedPdf.fileSize,
        mimeType: savedPdf.mimeType,
        uploadDate: savedPdf.uploadDate
      }
    });

  } catch (error) {
    console.error('❌ Error subiendo PDF a base de datos:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
} 