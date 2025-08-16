import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import connectDB from '../../../../../lib/mongodb';
import Report from '../../../../../models/Report';
import User from '../../../../../models/User';

interface Article {
  _id?: string;
  title: string;
  content: string;
  order: number;
  isPublished: boolean;
  readTime: number;
  createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'ID de informe requerido'
    });
  }

  try {
    await connectDB();

    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Debes estar autenticado'
      });
    }

    // Verificar que el usuario sea admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores pueden gestionar artículos'
      });
    }

    // Buscar el informe
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    switch (req.method) {
      case 'GET':
        // Obtener artículos del informe
        return res.status(200).json({
          success: true,
          data: {
            articles: report.articles || []
          }
        });

      case 'POST':
        // Agregar nuevo artículo
        const { title, content, order, isPublished = true } = req.body;

        if (!title || !content || !order) {
          return res.status(400).json({
            success: false,
            message: 'Título, contenido y orden son campos requeridos'
          });
        }

        if (order < 1 || order > 10) {
          return res.status(400).json({
            success: false,
            message: 'El orden debe estar entre 1 y 10'
          });
        }

        // Verificar límite de artículos
        if (report.articles && report.articles.length >= 10) {
          return res.status(400).json({
            success: false,
            message: 'El informe ya tiene el máximo de 10 artículos permitidos'
          });
        }

        // Verificar que el orden no esté duplicado
        const existingOrder = report.articles?.find((article: Article) => article.order === order);
        if (existingOrder) {
          return res.status(400).json({
            success: false,
            message: `Ya existe un artículo con el orden ${order}`
          });
        }

        const newArticle: Article = {
          title: title.trim(),
          content: content.trim(),
          order: parseInt(order),
          isPublished,
          readTime: Math.ceil(content.length / 1000),
          createdAt: new Date()
        };

        if (!report.articles) {
          report.articles = [];
        }

        report.articles.push(newArticle);
        await report.save();

        return res.status(201).json({
          success: true,
          message: 'Artículo agregado exitosamente',
          data: {
            article: newArticle
          }
        });

      case 'PUT':
        // Actualizar artículo existente
        const { articleId, updates } = req.body;

        if (!articleId || !updates) {
          return res.status(400).json({
            success: false,
            message: 'ID del artículo y actualizaciones son requeridos'
          });
        }

        const articleIndex = report.articles?.findIndex(
          (article: Article) => article._id?.toString() === articleId
        );

        if (articleIndex === -1 || articleIndex === undefined) {
          return res.status(404).json({
            success: false,
            message: 'Artículo no encontrado'
          });
        }

        // Actualizar campos permitidos
        const allowedUpdates = ['title', 'content', 'order', 'isPublished'];
        Object.keys(updates).forEach(key => {
          if (allowedUpdates.includes(key)) {
            (report.articles as any)[articleIndex][key] = updates[key];
          }
        });

        // Recalcular tiempo de lectura si el contenido cambió
        if (updates.content) {
          (report.articles as any)[articleIndex].readTime = Math.ceil(updates.content.length / 1000);
        }

        await report.save();

        return res.status(200).json({
          success: true,
          message: 'Artículo actualizado exitosamente',
          data: {
            article: report.articles[articleIndex]
          }
        });

      case 'DELETE':
        // Eliminar artículo
        const { articleId: deleteArticleId } = req.body;

        if (!deleteArticleId) {
          return res.status(400).json({
            success: false,
            message: 'ID del artículo es requerido'
          });
        }

        const deleteArticleIndex = report.articles?.findIndex(
          (article: Article) => article._id?.toString() === deleteArticleId
        );

        if (deleteArticleIndex === -1 || deleteArticleIndex === undefined) {
          return res.status(404).json({
            success: false,
            message: 'Artículo no encontrado'
          });
        }

        const deletedArticle = report.articles[deleteArticleIndex];
        report.articles.splice(deleteArticleIndex, 1);

        // Reordenar artículos restantes si es necesario
        report.articles.forEach((article: Article, index: number) => {
          if (article.order !== index + 1) {
            article.order = index + 1;
          }
        });

        await report.save();

        return res.status(200).json({
          success: true,
          message: 'Artículo eliminado exitosamente',
          data: {
            deletedArticle
          }
        });

      default:
        return res.status(405).json({
          success: false,
          message: `Método ${req.method} no permitido`
        });
    }

  } catch (error) {
    console.error('Error al gestionar artículos del informe:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
} 