/**
 * API para cerrar posiciones de alertas de trading
 * Solo los administradores pueden cerrar posiciones
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Alert from '@/models/Alert';

interface ClosePositionRequest {
  alertId: string;
  currentPrice: number;
  reason?: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MANUAL';
}

interface ClosePositionResponse {
  success?: boolean;
  message?: string;
  error?: string;
  alert?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClosePositionResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Conectar a la base de datos
    await dbConnect();

    // Obtener información del usuario y verificar que sea admin
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // NUEVA RESTRICCIÓN: Solo administradores pueden cerrar posiciones
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Permisos insuficientes. Solo los administradores pueden cerrar posiciones.' 
      });
    }

    // Validar datos de entrada
    const { alertId, currentPrice, reason = 'MANUAL' }: ClosePositionRequest = req.body;

    if (!alertId || !currentPrice) {
      return res.status(400).json({ error: 'alertId y currentPrice son requeridos' });
    }

    if (currentPrice <= 0) {
      return res.status(400).json({ error: 'El precio actual debe ser mayor a 0' });
    }

    // Buscar la alerta
    const alert = await Alert.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    if (alert.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'La alerta ya no está activa' });
    }

    // Calcular profit final
    let finalProfit = 0;
    if (alert.action === 'BUY') {
      finalProfit = ((currentPrice - alert.entryPrice) / alert.entryPrice) * 100;
    } else { // SELL
      finalProfit = ((alert.entryPrice - currentPrice) / alert.entryPrice) * 100;
    }

    // Actualizar la alerta para cerrarla
    const updatedAlert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: 'CLOSED',
        currentPrice: currentPrice,
        exitPrice: currentPrice,
        exitDate: new Date(),
        exitReason: reason,
        profit: finalProfit
      },
      { new: true }
    );

    console.log('✅ Posición cerrada por usuario:', user.name || user.email, alertId);

    // Formatear la respuesta para el frontend - con validación de números
    const alertResponse = {
      id: updatedAlert._id.toString(),
      symbol: updatedAlert.symbol,
      action: updatedAlert.action,
      entryPrice: `$${Number(updatedAlert.entryPrice || 0).toFixed(2)}`,
      exitPrice: `$${Number(updatedAlert.exitPrice || 0).toFixed(2)}`,
      stopLoss: `$${Number(updatedAlert.stopLoss || 0).toFixed(2)}`,
      takeProfit: `$${Number(updatedAlert.takeProfit || 0).toFixed(2)}`,
      profit: `${Number(updatedAlert.profit || 0) >= 0 ? '+' : ''}${Number(updatedAlert.profit || 0).toFixed(1)}%`,
      status: updatedAlert.status,
      date: updatedAlert.date ? updatedAlert.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      exitDate: updatedAlert.exitDate ? updatedAlert.exitDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      exitReason: updatedAlert.exitReason,
      analysis: updatedAlert.analysis || ''
    };

    // TODO: Enviar notificación a todos los suscriptores (opcional)

    return res.status(200).json({
      success: true,
      message: 'Posición cerrada exitosamente',
      alert: alertResponse
    });

  } catch (error) {
    console.error('Error al cerrar posición:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo cerrar la posición'
    });
  }
} 