import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import Alert from '@/models/Alert';
import User from '@/models/User';
import { sendEmail } from '@/lib/emailService';

/**
 * API para enviar email automático de confirmación al crear una alerta
 * POST: Enviar email de confirmación
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { alertId } = req.body;

    if (!alertId) {
      return res.status(400).json({ error: 'alertId es requerido' });
    }

    // ✅ NUEVO: Buscar la alerta
    const alert = await Alert.findById(alertId).populate('createdBy', 'email name');
    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    // ✅ NUEVO: Verificar que el usuario sea el creador de la alerta
    if (alert.createdBy.email !== session.user.email) {
      return res.status(403).json({ error: 'Solo puedes enviar emails para tus propias alertas' });
    }

    // ✅ NUEVO: Verificar que no se haya enviado ya el email de creación
    if (alert.emailsSent?.creation) {
      return res.status(400).json({ 
        error: 'Email de creación ya fue enviado para esta alerta',
        sentAt: alert.emailsSent.creation
      });
    }

    // ✅ NUEVO: Enviar email de confirmación
    await sendAlertCreationEmail(alert);

    // ✅ NUEVO: Marcar email como enviado
    alert.emailsSent.creation = true;
    await alert.save();

    console.log('✅ Email de confirmación de alerta enviado:', {
      alertId: alert._id,
      symbol: alert.symbol,
      user: session.user.email,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Email de confirmación enviado correctamente',
      alert: {
        id: alert._id,
        symbol: alert.symbol,
        tipo: alert.tipo,
        action: alert.action
      }
    });

  } catch (error: any) {
    console.error('❌ Error enviando email de confirmación de alerta:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

/**
 * ✅ NUEVO: Enviar email de confirmación de creación de alerta
 */
async function sendAlertCreationEmail(alert: any): Promise<void> {
  try {
    const userEmail = alert.createdBy.email;
    const userName = alert.createdBy.name || 'Usuario';
    
    const emailSubject = `✅ Alerta Creada - ${alert.symbol} - ${alert.tipo}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">✅ Alerta Creada Exitosamente</h2>
        
        <p>Hola ${userName},</p>
        
        <p>Tu alerta ha sido creada y está ahora activa en el sistema:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📊 Detalles de la Alerta</h3>
          <p><strong>Símbolo:</strong> ${alert.symbol}</p>
          <p><strong>Acción:</strong> ${alert.action}</p>
          <p><strong>Tipo:</strong> ${alert.tipo}</p>
          <p><strong>Rango de Entrada:</strong> $${alert.entryPriceRange.min} - $${alert.entryPriceRange.max}</p>
          <p><strong>Stop Loss:</strong> $${alert.stopLoss}</p>
          <p><strong>Take Profit:</strong> $${alert.takeProfit}</p>
          <p><strong>Precio Actual:</strong> $${alert.currentPrice}</p>
          <p><strong>Análisis:</strong> ${alert.analysis || 'Sin análisis adicional'}</p>
          <p><strong>Fecha de Creación:</strong> ${new Date(alert.createdAt).toLocaleString('es-ES')}</p>
        </div>
        
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h4 style="margin-top: 0; color: #1e40af;">📋 Próximos Pasos</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>La alerta se monitoreará automáticamente</li>
            <li>Recibirás notificaciones cuando se alcancen los niveles</li>
            <li>El precio final se fijará al cierre del mercado (17:30)</li>
            <li>Puedes hacer seguimiento desde tu dashboard</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin-top: 0; color: #92400e;">⚠️ Información Importante</h4>
          <p style="margin: 0;">
            <strong>Horario de Cierre:</strong> 17:30 (zona horaria del sistema)<br>
            <strong>Valor Final:</strong> Se fijará automáticamente al cierre del mercado<br>
            <strong>Feriados:</strong> Si no hay cierre, se usará el último precio disponible
          </p>
        </div>
        
        <p>Tu alerta está ahora activa y siendo monitoreada. Recibirás un email adicional al cierre del mercado con el precio final consolidado.</p>
        
        <p>Saludos,<br>Equipo de ${alert.tipo}</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          Este es un email automático. No respondas a este mensaje.
        </p>
      </div>
    `;
    
    await sendEmail({
      to: userEmail,
      subject: emailSubject,
      html: emailHtml
    });
    
    console.log(`✅ Email de confirmación de alerta enviado a ${userEmail}`);
    
  } catch (error: any) {
    console.error(`❌ Error enviando email de confirmación para ${alert.symbol}:`, error);
    throw error;
  }
} 