import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

// Modelo temporal para comentarios (podrías crear un modelo separado)
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Report'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  userImage: String,
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  replyTo: {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    userName: String,
    comment: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    // Verificar que el usuario existe y tiene permisos
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo suscriptores y admins pueden comentar
    if (user.role !== 'admin' && user.role !== 'suscriptor') {
      return res.status(403).json({ 
        message: 'Solo los suscriptores pueden comentar en los informes' 
      });
    }

    if (req.method === 'GET') {
      // Obtener comentarios de un informe
      const { reportId } = req.query;

      if (!reportId) {
        return res.status(400).json({ message: 'ID del informe requerido' });
      }

      console.log('💬 Obteniendo comentarios para informe:', reportId);

      const comments = await Comment.find({ reportId })
        .sort({ timestamp: 1 }) // Más antiguos primero
        .lean();

      console.log('✅ Comentarios obtenidos:', comments.length);

      return res.status(200).json({
        success: true,
        comments
      });

    } else if (req.method === 'POST') {
      // Crear nuevo comentario
      const { reportId, comment, replyTo } = req.body;

      if (!reportId || !comment?.trim()) {
        return res.status(400).json({ message: 'Informe ID y comentario son requeridos' });
      }

      if (comment.length > 500) {
        return res.status(400).json({ message: 'El comentario no puede exceder 500 caracteres' });
      }

      console.log('💬 Creando comentario para informe:', reportId);

      const newComment = new Comment({
        reportId,
        userId: user._id,
        userName: user.name || session.user.name,
        userImage: user.image || session.user.image,
        comment: comment.trim(),
        replyTo: replyTo || undefined
      });

      const savedComment = await newComment.save();

      console.log('✅ Comentario creado exitosamente:', savedComment._id);

      return res.status(201).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        comment: savedComment
      });

    } else {
      return res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('❌ Error en comentarios:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 