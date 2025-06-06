import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

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
    const session = await getSession({ req });
    
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

    // Crear directorio de uploads si no existe
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'avatar';
    const extension = path.extname(originalName);
    const fileName = `${session.user.email.replace('@', '_at_')}_${timestamp}${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Mover archivo
    fs.copyFileSync(file.filepath, filePath);
    fs.unlinkSync(file.filepath); // Limpiar archivo temporal

    const avatarUrl = `/uploads/avatars/${fileName}`;

    return res.status(200).json({
      message: 'Avatar subido exitosamente',
      avatarUrl
    });

  } catch (error) {
    console.error('Error al subir avatar:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 