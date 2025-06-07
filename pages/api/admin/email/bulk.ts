import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminAPI } from '@/lib/adminAuth';
import { sendBulkEmails, createEmailTemplate } from '@/lib/smtp';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * API para envío masivo de emails
 * POST: Enviar email a grupo de usuarios seleccionado
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📧 [API] Bulk Email - método:', req.method);
  
  await connectDB();

  // Verificar autenticación y permisos de admin
  const adminCheck = await verifyAdminAPI(req, res);
  if (!adminCheck.isAdmin) {
    return res.status(401).json({ error: adminCheck.error || 'No autorizado' });
  }

  console.log(`✅ [API] Admin verificado para envío masivo: ${adminCheck.user?.email}`);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { subject, message, recipients } = req.body;

    // Validar datos de entrada
    if (!subject || !message || !recipients) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: subject, message, recipients' 
      });
    }

    console.log(`📧 Iniciando envío masivo con filtro: ${recipients}`);

    // Obtener emails según el filtro seleccionado
    let userQuery: any = {};
    
    switch (recipients) {
      case 'suscriptores':
        userQuery = { role: 'suscriptor' };
        break;
      case 'admins':
        userQuery = { role: 'admin' };
        break;
      case 'all':
      default:
        userQuery = {}; // Todos los usuarios
        break;
    }

    // Obtener usuarios que coincidan con el filtro
    const users = await User.find(userQuery)
      .select('email name')
      .where('email').ne(null).ne('');

    if (users.length === 0) {
      return res.status(400).json({
        error: 'No se encontraron usuarios para el filtro seleccionado'
      });
    }

    console.log(`📊 Usuarios encontrados: ${users.length}`);

    // Preparar lista de emails
    const emailList = users.map(user => user.email).filter(Boolean);

    // Crear HTML del email usando la plantilla
    const emailHTML = createEmailTemplate({
      title: subject,
      content: message.replace(/\n/g, '<br>'), // Convertir saltos de línea a HTML
      buttonText: 'Visitar Plataforma',
      buttonUrl: 'https://lozanonahuel.vercel.app'
    });

    // Enviar emails masivos
    const results = await sendBulkEmails({
      recipients: emailList,
      subject,
      html: emailHTML,
      from: process.env.ADMIN_EMAIL
    });

    console.log(`📧 Envío completado: ${results.sent}/${emailList.length} exitosos`);

    // Responder con resultados
    return res.status(200).json({
      success: true,
      sentCount: results.sent,
      failedCount: results.failed,
      totalRecipients: emailList.length,
      errors: results.errors.length > 0 ? results.errors.slice(0, 5) : [], // Máximo 5 errores
      message: `Email enviado exitosamente a ${results.sent} de ${emailList.length} usuarios`
    });

  } catch (error) {
    console.error('💥 Error en envío masivo:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al enviar emails',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 