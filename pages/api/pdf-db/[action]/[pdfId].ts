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
      user: session.user.email,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer
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
      mimeType: pdfDoc.mimeType,
      uploadedBy: pdfDoc.uploadedBy,
      dataType: typeof pdfDoc.data,
      dataLength: pdfDoc.data ? pdfDoc.data.length : 0
    });
    
    // Verificar que tenemos datos válidos
    if (!pdfDoc.data || pdfDoc.data.length === 0) {
      console.error('❌ PDF sin datos o datos vacíos:', pdfId);
      return res.status(500).json({ 
        error: 'PDF corrupto',
        details: 'El archivo PDF no contiene datos válidos'
      });
    }
    
    // Usar el fileName del query si se proporciona y es válido, sino usar el original
    let finalFileName = pdfDoc.originalName;
    
    if (fileName && typeof fileName === 'string' && fileName.trim() !== '' && fileName !== 'undefined') {
      finalFileName = fileName.trim();
    }
    
    // Fallback si no hay nombre válido
    if (!finalFileName || finalFileName === 'undefined') {
      finalFileName = pdfDoc.fileName || `documento_${pdfId}.pdf`;
    }
    
    // Asegurar que el archivo tenga extensión .pdf
    if (!finalFileName.toLowerCase().endsWith('.pdf')) {
      finalFileName += '.pdf';
    }
    
    console.log('📂 Nombre final del archivo:', finalFileName);
    
    // Configurar headers optimizados para visualización de PDF en iframe
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfDoc.fileSize);
    
    // Headers para permitir visualización en iframe
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    
    // Cache headers
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', `"${pdfId}"`);
    
    // Headers de seguridad
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    if (action === 'download') {
      // Para descarga: forzar descarga con nombre específico y encode correcto
      const encodedFileName = encodeURIComponent(finalFileName);
      res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"; filename*=UTF-8''${encodedFileName}`);
      console.log('📥 Enviando PDF para descarga:', finalFileName);
    } else if (action === 'view') {
      // Para visualización: abrir en navegador con nombre correcto
      const encodedFileName = encodeURIComponent(finalFileName);
      res.setHeader('Content-Disposition', `inline; filename="${finalFileName}"; filename*=UTF-8''${encodedFileName}`);
      console.log('👁️ Enviando PDF para visualización inline:', finalFileName);
    }

    // Verificar si es una solicitud de rango (para videos/PDFs grandes)
    const range = req.headers.range;
    if (range && action === 'view') {
      console.log('📊 Procesando solicitud de rango:', range);
      
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : pdfDoc.fileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${pdfDoc.fileSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunksize);
      
      // Enviar slice del buffer
      res.end(pdfDoc.data.slice(start, end + 1));
    } else {
      // Enviar archivo completo
      res.end(pdfDoc.data);
    }
    
    console.log('✅ PDF enviado exitosamente desde base de datos');

  } catch (error) {
    console.error('❌ Error al procesar PDF desde DB:', error);
    
    // Proporcionar más información sobre el error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : '';
    
    const errorDetails = {
      message: errorMessage,
      stack: errorStack,
      query: req.query,
      headers: req.headers,
      timestamp: new Date().toISOString()
    };
    
    console.error('📋 Detalles completos del error:', errorDetails);
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? errorMessage : 'Error interno'
    });
  }
} 