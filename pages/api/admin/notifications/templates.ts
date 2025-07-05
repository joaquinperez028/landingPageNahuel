import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAPI } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import NotificationTemplate from '@/models/NotificationTemplate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticación y permisos de administrador
  const session = await getServerSession(req, res, authOptions);
  const adminError = await verifyAdminAPI(session, res);
  
  if (adminError) {
    return res.status(401).json({ message: adminError });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      return handleGetTemplates(req, res);
    case 'POST':
      return handleCreateTemplate(req, res, session);
    case 'PUT':
      return handleUpdateTemplate(req, res, session);
    case 'DELETE':
      return handleDeleteTemplate(req, res);
    default:
      return res.status(405).json({ message: 'Método no permitido' });
  }
}

async function handleGetTemplates(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = '1', limit = '10', type, search } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construir query
    let query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Obtener plantillas
    const templates = await NotificationTemplate.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    // Contar total
    const total = await NotificationTemplate.countDocuments(query);

    return res.status(200).json({
      templates,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener plantillas:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

async function handleCreateTemplate(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const {
      name,
      description,
      type,
      priority,
      titleTemplate,
      messageTemplate,
      icon,
      actionUrlTemplate,
      actionTextTemplate,
      targetUsers,
      variables
    } = req.body;

    // Validar campos requeridos
    if (!name || !description || !type || !titleTemplate || !messageTemplate) {
      return res.status(400).json({ 
        message: 'Campos requeridos: name, description, type, titleTemplate, messageTemplate' 
      });
    }

    // Verificar que el nombre no esté duplicado
    const existingTemplate = await NotificationTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({ 
        message: 'Ya existe una plantilla con ese nombre' 
      });
    }

    // Crear plantilla
    const template = await NotificationTemplate.create({
      name,
      description,
      type,
      priority: priority || 'media',
      titleTemplate,
      messageTemplate,
      icon: icon || '📢',
      actionUrlTemplate,
      actionTextTemplate,
      targetUsers: targetUsers || 'todos',
      variables: variables || [],
      isActive: true,
      createdBy: session.user.email
    });

    console.log(`✅ Plantilla creada: ${template.name} por ${session.user.email}`);

    return res.status(201).json({
      message: 'Plantilla creada exitosamente',
      template
    });

  } catch (error) {
    console.error('❌ Error al crear plantilla:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

async function handleUpdateTemplate(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID de plantilla requerido' });
    }

    // Verificar que la plantilla existe
    const template = await NotificationTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }

    // Verificar nombre duplicado si se está cambiando
    if (updateData.name && updateData.name !== template.name) {
      const existingTemplate = await NotificationTemplate.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      if (existingTemplate) {
        return res.status(400).json({ 
          message: 'Ya existe una plantilla con ese nombre' 
        });
      }
    }

    // Actualizar plantilla
    const updatedTemplate = await NotificationTemplate.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    console.log(`✅ Plantilla actualizada: ${updatedTemplate?.name} por ${session.user.email}`);

    return res.status(200).json({
      message: 'Plantilla actualizada exitosamente',
      template: updatedTemplate
    });

  } catch (error) {
    console.error('❌ Error al actualizar plantilla:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

async function handleDeleteTemplate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'ID de plantilla requerido' });
    }

    // Verificar que la plantilla existe
    const template = await NotificationTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }

    // Verificar que no es una plantilla del sistema
    if (template.createdBy === 'system') {
      return res.status(400).json({ 
        message: 'No se pueden eliminar plantillas del sistema' 
      });
    }

    // Eliminar plantilla
    await NotificationTemplate.findByIdAndDelete(id);

    console.log(`✅ Plantilla eliminada: ${template.name}`);

    return res.status(200).json({
      message: 'Plantilla eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar plantilla:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 