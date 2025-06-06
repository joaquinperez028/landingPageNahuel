import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB máximo
      filter: ({ mimetype }) => {
        return Boolean(mimetype && mimetype.includes('image'));
      },
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;

    if (!file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    // Leer el archivo y convertirlo a base64
    const fileBuffer = fs.readFileSync(file.filepath);
    const mimeType = file.mimetype || 'image/jpeg';
    const base64Data = fileBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Limpiar archivo temporal
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      message: 'Avatar subido exitosamente',
      avatarUrl: dataUrl
    });

  } catch (error) {
    console.error('Error al subir avatar:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 