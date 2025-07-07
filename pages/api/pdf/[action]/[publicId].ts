import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';

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

    const { action, publicId } = req.query;
    const { fileName } = req.query;

    if (typeof action !== 'string' || typeof publicId !== 'string') {
      console.log('❌ Parámetros inválidos:', { action, publicId });
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    // Decodificar el publicId que puede contener carpetas
    const decodedPublicId = decodeURIComponent(publicId);
    
    console.log('📄 Procesando solicitud de PDF:', {
      action,
      originalPublicId: publicId,
      decodedPublicId,
      fileName,
      user: session.user.email
    });

    // Verificar que tenemos la variable de entorno de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error('❌ Variable CLOUDINARY_CLOUD_NAME no configurada');
      return res.status(500).json({ error: 'Configuración de Cloudinary incompleta' });
    }

    // Construir URL de Cloudinary
    const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${decodedPublicId}`;
    
    console.log('🔗 URL de Cloudinary construida:', cloudinaryUrl);

    // Hacer petición a Cloudinary para obtener el archivo
    const response = await fetch(cloudinaryUrl);
    
    if (!response.ok) {
      console.error('❌ Error obteniendo archivo de Cloudinary:', {
        status: response.status,
        statusText: response.statusText,
        url: cloudinaryUrl
      });
      return res.status(404).json({ 
        error: 'Archivo no encontrado',
        details: `Status: ${response.status} - ${response.statusText}`
      });
    }

    // Obtener el buffer del archivo
    const buffer = await response.arrayBuffer();
    
    console.log('✅ Archivo obtenido exitosamente:', {
      size: buffer.byteLength,
      type: response.headers.get('content-type')
    });
    
    // Asegurarse de que el fileName tenga extensión .pdf
    let finalFileName = fileName as string || `documento-${decodedPublicId.split('/').pop()}`;
    if (finalFileName && !finalFileName.toLowerCase().endsWith('.pdf')) {
      finalFileName += '.pdf';
    }
    
    // Configurar headers CORS para permitir iframe desde el mismo dominio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Configurar headers según la acción
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Length', buffer.byteLength);
    
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
    } else {
      console.log('❌ Acción no válida:', action);
      return res.status(400).json({ error: 'Acción no válida. Usar "view" o "download"' });
    }

    // Enviar el archivo
    res.send(Buffer.from(buffer));
    
    console.log('✅ PDF enviado exitosamente');

  } catch (error) {
    console.error('❌ Error al procesar PDF:', error);
    
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