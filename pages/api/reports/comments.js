import dbConnect from '../../../lib/mongodb';
import ReportComment from '../../../models/ReportComment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { reportId } = req.query;
      
      if (!reportId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Se requiere reportId' 
        });
      }
      
      // Obtener los comentarios del informe
      const comments = await ReportComment.find({ 
        reportId,
        status: 'active'
      })
        .sort({ timestamp: -1 })
        .limit(100)
        .lean();

      // Invertir el orden para mostrar del más antiguo al más reciente
      const sortedComments = comments.reverse();

      res.status(200).json({ 
        success: true, 
        comments: sortedComments 
      });
    } catch (error) {
      console.error('Error obteniendo comentarios:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }

  else if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session) {
        return res.status(401).json({ 
          success: false, 
          error: 'Debes estar logueado para comentar' 
        });
      }

      const { reportId, comment, replyTo } = req.body;

      // Validaciones
      if (!reportId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Se requiere reportId' 
        });
      }

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'El comentario no puede estar vacío' 
        });
      }

      if (comment.length > 500) {
        return res.status(400).json({ 
          success: false, 
          error: 'El comentario no puede tener más de 500 caracteres' 
        });
      }

      // Debug: verificar qué datos de usuario tenemos
      console.log('🔍 Datos de sesión en comentarios:', {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        hasImage: !!session.user.image
      });

      // Determinar el tipo de usuario
      const userType = session.user.role || 'normal';

      // Crear el nuevo comentario
      const newCommentData = {
        reportId,
        userName: session.user.name,
        userEmail: session.user.email,
        userImage: session.user.image,
        userType,
        comment: comment.trim(),
        status: 'active',
        timestamp: new Date()
      };

      // Si hay una respuesta, agregar la referencia
      if (replyTo) {
        newCommentData.replyTo = {
          commentId: replyTo.commentId,
          userName: replyTo.userName,
          comment: replyTo.comment
        };
      }

      // Debug: verificar qué datos vamos a guardar
      console.log('💾 Datos del comentario a guardar:', {
        reportId: newCommentData.reportId,
        userName: newCommentData.userName,
        userEmail: newCommentData.userEmail,
        userImage: newCommentData.userImage,
        hasImage: !!newCommentData.userImage
      });

      const newComment = new ReportComment(newCommentData);
      await newComment.save();

      console.log('✅ Comentario guardado correctamente con imagen:', !!newComment.userImage);

      res.status(201).json({ 
        success: true, 
        comment: newComment 
      });
    } catch (error) {
      console.error('Error guardando comentario:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ 
      success: false, 
      error: `Método ${req.method} no permitido` 
    });
  }
} 