import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Alert from '@/models/Alert';
import User from '@/models/User';

/**
 * API para que el administrador edite precios de alertas con auditoría completa
 * POST: Editar precio de una alerta
 * GET: Obtener historial de cambios de precio
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    // ✅ NUEVO: Verificar que sea administrador
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden editar precios.' });
    }

    if (req.method === 'POST') {
      return await editAlertPrice(req, res, session.user);
    } else if (req.method === 'GET') {
      return await getPriceChangeHistory(req, res);
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('❌ Error en API de edición de precios:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

/**
 * ✅ NUEVO: Editar precio de una alerta con auditoría completa
 */
async function editAlertPrice(req: NextApiRequest, res: NextApiResponse, adminUser: any) {
  try {
    const { alertId, newPrice, reason } = req.body;

    // ✅ NUEVO: Validación de datos de entrada
    if (!alertId || !newPrice) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        required: ['alertId', 'newPrice'],
        received: { alertId, newPrice, reason }
      });
    }

    if (typeof newPrice !== 'number' || newPrice <= 0) {
      return res.status(400).json({ 
        error: 'Precio debe ser un número positivo',
        received: newPrice
      });
    }

    // ✅ NUEVO: Buscar la alerta
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    // ✅ NUEVO: Verificar que la alerta esté activa
    if (alert.status !== 'ACTIVE') {
      return res.status(400).json({ 
        error: 'Solo se pueden editar precios de alertas activas',
        currentStatus: alert.status
      });
    }

    const oldPrice = alert.currentPrice;
    
    // ✅ NUEVO: Verificar que el precio realmente cambió
    if (oldPrice === newPrice) {
      return res.status(400).json({ 
        error: 'El nuevo precio es igual al actual',
        currentPrice: oldPrice,
        newPrice
      });
    }

    // ✅ NUEVO: Obtener información del cliente para auditoría
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    console.log('🔧 Editando precio de alerta:', {
      alertId,
      symbol: alert.symbol,
      oldPrice,
      newPrice,
      change: newPrice - oldPrice,
      changePercentage: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2) + '%',
      adminUser: adminUser.email,
      reason: reason || 'Sin motivo especificado',
      clientIP,
      userAgent
    });

    // ✅ NUEVO: Registrar cambio de precio usando el método del modelo
    alert.recordPriceChange(
      adminUser._id,
      newPrice,
      reason || 'Edición por administrador',
      clientIP.toString(),
      userAgent
    );

    // ✅ NUEVO: Guardar la alerta actualizada
    await alert.save();

    // ✅ NUEVO: Obtener la alerta actualizada con el historial
    const updatedAlert = await Alert.findById(alertId).populate('priceChangeHistory.changedBy', 'email name');

    console.log('✅ Precio de alerta editado exitosamente:', {
      alertId,
      symbol: alert.symbol,
      oldPrice,
      newPrice,
      adminUser: adminUser.email,
      timestamp: new Date().toISOString()
    });

    // ✅ NUEVO: Enviar notificación al usuario si es necesario
    try {
      await sendPriceChangeNotification(alert, oldPrice, newPrice, adminUser, reason);
    } catch (notificationError) {
      console.warn('⚠️ No se pudo enviar notificación de cambio de precio:', notificationError);
    }

    return res.status(200).json({
      success: true,
      message: 'Precio de alerta editado correctamente',
      alert: {
        id: updatedAlert._id,
        symbol: updatedAlert.symbol,
        oldPrice,
        newPrice,
        change: newPrice - oldPrice,
        changePercentage: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2) + '%',
        updatedAt: updatedAlert.updatedAt,
        priceChangeHistory: updatedAlert.priceChangeHistory
      },
      audit: {
        changedBy: adminUser.email,
        changedAt: new Date().toISOString(),
        reason: reason || 'Edición por administrador',
        clientIP: clientIP.toString(),
        userAgent
      }
    });

  } catch (error: any) {
    console.error('❌ Error editando precio de alerta:', error);
    return res.status(500).json({
      error: 'Error al editar precio de alerta',
      details: error.message
    });
  }
}

/**
 * ✅ NUEVO: Obtener historial de cambios de precio
 */
async function getPriceChangeHistory(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { alertId, limit = 10, page = 1 } = req.query;

    if (!alertId) {
      return res.status(400).json({ error: 'alertId es requerido' });
    }

    // ✅ NUEVO: Buscar la alerta con su historial
    const alert = await Alert.findById(alertId)
      .populate('priceChangeHistory.changedBy', 'email name')
      .select('symbol priceChangeHistory');

    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    // ✅ NUEVO: Paginar el historial
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedHistory = alert.priceChangeHistory
      .sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(startIndex, endIndex);

    const totalChanges = alert.priceChangeHistory.length;
    const totalPages = Math.ceil(totalChanges / Number(limit));

    return res.status(200).json({
      success: true,
      alert: {
        id: alert._id,
        symbol: alert.symbol
      },
      priceChangeHistory: paginatedHistory,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalChanges,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1
      }
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo historial de cambios:', error);
    return res.status(500).json({
      error: 'Error al obtener historial de cambios',
      details: error.message
    });
  }
}

/**
 * ✅ NUEVO: Enviar notificación al usuario sobre cambio de precio
 */
async function sendPriceChangeNotification(alert: any, oldPrice: number, newPrice: number, adminUser: any, reason?: string) {
  try {
    // ✅ NUEVO: Buscar información del usuario que creó la alerta
    const alertCreator = await User.findById(alert.createdBy).select('email name');
    if (!alertCreator) {
      console.warn('⚠️ No se pudo encontrar el creador de la alerta para notificación');
      return;
    }

    // ✅ NUEVO: Importar servicio de email
    const { sendEmail } = await import('@/lib/emailService');

    const emailSubject = `🔔 Cambio de Precio - ${alert.symbol} - ${alert.tipo}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">🔔 Cambio de Precio - ${alert.symbol}</h2>
        
        <p>Hola ${alertCreator.name || 'Usuario'},</p>
        
        <p>Un administrador ha modificado el precio de tu alerta:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📊 Detalles del Cambio</h3>
          <p><strong>Símbolo:</strong> ${alert.symbol}</p>
          <p><strong>Tipo:</strong> ${alert.tipo}</p>
          <p><strong>Acción:</strong> ${alert.action}</p>
          <p><strong>Precio Anterior:</strong> $${oldPrice}</p>
          <p><strong>Precio Nuevo:</strong> $${newPrice}</p>
          <p><strong>Cambio:</strong> $${newPrice - oldPrice} (${((newPrice - oldPrice) / oldPrice * 100).toFixed(2)}%)</p>
          <p><strong>Motivo:</strong> ${reason || 'Sin motivo especificado'}</p>
          <p><strong>Administrador:</strong> ${adminUser.email}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>
        
        <p>El cambio ha sido registrado y auditado. Tu alerta se mantiene activa con el nuevo precio.</p>
        
        <p>Saludos,<br>Equipo de ${alert.tipo}</p>
      </div>
    `;
    
    await sendEmail({
      to: alertCreator.email,
      subject: emailSubject,
      html: emailHtml
    });
    
    console.log(`✅ Notificación de cambio de precio enviada a ${alertCreator.email}`);
    
  } catch (error: any) {
    console.error('❌ Error enviando notificación de cambio de precio:', error);
    throw error;
  }
} 