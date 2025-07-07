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
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { action, publicId } = req.query;
    const { fileName } = req.query;

    if (typeof action !== 'string' || typeof publicId !== 'string') {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    // Construir URL de Cloudinary
    const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;

    // Hacer petición a Cloudinary para obtener el archivo
    const response = await fetch(cloudinaryUrl);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Obtener el buffer del archivo
    const buffer = await response.arrayBuffer();
    
    // Asegurarse de que el fileName tenga extensión .pdf
    let finalFileName = fileName as string || `documento-${publicId}`;
    if (finalFileName && !finalFileName.toLowerCase().endsWith('.pdf')) {
      finalFileName += '.pdf';
    }
    
    // Configurar headers según la acción
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Length', buffer.byteLength);
    
    if (action === 'download') {
      // Para descarga: forzar descarga con nombre específico
      res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"`);
    } else if (action === 'view') {
      // Para visualización: abrir en navegador
      res.setHeader('Content-Disposition', 'inline');
    } else {
      return res.status(400).json({ error: 'Acción no válida' });
    }

    // Enviar el archivo
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Error al obtener PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 