import dbConnect from '../../../lib/mongodb';
import ChatMessage from '../../../models/ChatMessage';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/googleAuth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { chatType = 'trader-call' } = req.query;
      
      // Obtener los últimos 50 mensajes del chat
      const messages = await ChatMessage.find({ chatType })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      // Invertir el orden para mostrar del más antiguo al más reciente
      const sortedMessages = messages.reverse();

      res.status(200).json({ 
        success: true, 
        messages: sortedMessages 
      });
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
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
          error: 'Debes estar logueado para enviar mensajes' 
        });
      }

      const { message, chatType = 'trader-call', replyTo } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'El mensaje no puede estar vacío' 
        });
      }

      if (message.length > 200) {
        return res.status(400).json({ 
          success: false, 
          error: 'El mensaje no puede tener más de 200 caracteres' 
        });
      }

      // Determinar el tipo de usuario (simplificado - todos iguales)
      const userType = 'normal';
      const messageType = 'normal';

      // Crear el nuevo mensaje
      const newMessageData = {
        userName: session.user.name,
        userEmail: session.user.email,
        userType,
        message: message.trim(),
        chatType,
        type: messageType,
        timestamp: new Date()
      };

      // Si hay una respuesta, agregar la referencia
      if (replyTo) {
        newMessageData.replyTo = {
          messageId: replyTo.messageId,
          userName: replyTo.userName,
          message: replyTo.message
        };
      }

      const newMessage = new ChatMessage(newMessageData);

      await newMessage.save();

      res.status(201).json({ 
        success: true, 
        message: newMessage 
      });
    } catch (error) {
      console.error('Error guardando mensaje:', error);
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