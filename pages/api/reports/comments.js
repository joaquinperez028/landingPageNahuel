import dbConnect from '../../../lib/mongodb';
import ReportComment from '../../../models/ReportComment';
import User from '../../../models/User';
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

      // Verificar permisos del usuario
      const user = await User.findOne({ email: session.user.email });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }

      // NUEVA RESTRICCIÓN: Solo suscriptores y administradores pueden comentar
      if (user.role !== 'suscriptor' && user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          error: 'Solo los suscriptores y administradores pueden comentar en los reportes.' 
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

      console.log('🔍 Usuario autorizado para comentar:', {
        name: user.name,
        email: user.email,
        role: user.role
      });

      // Determinar el tipo de usuario basado en su rol
      const userType = user.role;

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

      console.log('💾 Datos del comentario a guardar:', {
        reportId: newCommentData.reportId,
        userName: newCommentData.userName,
        userEmail: newCommentData.userEmail,
        userType: newCommentData.userType,
        hasImage: !!newCommentData.userImage
      });

      const newComment = new ReportComment(newCommentData);
      await newComment.save();

      console.log('✅ Comentario guardado correctamente por', userType);

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