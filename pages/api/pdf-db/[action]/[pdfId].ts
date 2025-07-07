import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '@/lib/mongodb';
import PDF from '@/models/PDF';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      console.log('❌ Usuario no autenticado para acceso a PDF');
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { action, pdfId } = req.query;
    const { fileName } = req.query;

    if (typeof action !== 'string' || typeof pdfId !== 'string') {
      console.log('❌ Parámetros inválidos:', { action, pdfId });
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    // Validar que la acción sea válida
    if (action !== 'view' && action !== 'download') {
      console.log('❌ Acción no válida:', action);
      return res.status(400).json({ error: 'Acción no válida. Usar "view" o "download"' });
    }

    // Validar que el pdfId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(pdfId)) {
      console.log('❌ ID de PDF inválido:', pdfId);
      return res.status(400).json({ error: 'ID de PDF inválido' });
    }
    
    console.log('📄 Procesando solicitud de PDF desde DB:', {
      action,
      pdfId,
      fileName,
      user: session.user.email
    });

    await connectDB();

    // Buscar el PDF en la base de datos
    const pdfDoc = await PDF.findById(pdfId);
    
    if (!pdfDoc) {
      console.error('❌ PDF no encontrado en base de datos:', pdfId);
      return res.status(404).json({ 
        error: 'PDF no encontrado',
        details: `No se encontró un PDF con ID: ${pdfId}`
      });
    }

    console.log('✅ PDF encontrado en base de datos:', {
      fileName: pdfDoc.fileName,
      originalName: pdfDoc.originalName,
      size: pdfDoc.fileSize,
      uploadedBy: pdfDoc.uploadedBy
    });
    
    // Usar el fileName del query si se proporciona, sino usar el original
    const finalFileName = (fileName as string) || pdfDoc.originalName;
    
    // Configurar headers CORS para permitir iframe desde el mismo dominio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Configurar headers del archivo
    res.setHeader('Content-Type', pdfDoc.mimeType || 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
    res.setHeader('Content-Length', pdfDoc.fileSize);
    
    // Evitar problemas de MIME-type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    if (action === 'download') {
      // Para descarga: forzar descarga con nombre específico
      res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"`);
      console.log('📥 Enviando PDF para descarga:', finalFileName);
    } else if (action === 'view') {
      // Para visualización: abrir en navegador
      res.setHeader('Content-Disposition', 'inline');
      console.log('👁️ Enviando PDF para visualización inline');
    }

    // Enviar el archivo desde la base de datos
    res.send(pdfDoc.data);
    
    console.log('✅ PDF enviado exitosamente desde base de datos');

  } catch (error) {
    console.error('❌ Error al procesar PDF desde DB:', error);
    
    // Proporcionar más información sobre el error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorDetails = {
      message: errorMessage,
      query: req.query,
      timestamp: new Date().toISOString()
    };
    
    console.error('📋 Detalles del error:', errorDetails);
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: errorMessage
    });
  }
} 