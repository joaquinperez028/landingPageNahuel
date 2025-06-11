/**
 * API para crear nuevas alertas de trading
 * Todos los usuarios autenticados pueden crear alertas
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Alert from '@/models/Alert';

interface AlertRequest {
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  analysis: string;
  date: string;
  tipo?: 'TraderCall' | 'SmartMoney' | 'CashFlow';
}

interface AlertResponse {
  success?: boolean;
  alert?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AlertResponse>
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

    // Obtener información del usuario (ya no verificamos si es admin)
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar datos de entrada
    const { symbol, action, entryPrice, stopLoss, takeProfit, analysis, date, tipo = 'TraderCall' }: AlertRequest = req.body;

    if (!symbol || !action || !entryPrice || !stopLoss || !takeProfit) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!['BUY', 'SELL'].includes(action)) {
      return res.status(400).json({ error: 'Acción debe ser BUY o SELL' });
    }

    if (entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
      return res.status(400).json({ error: 'Los precios deben ser mayores a 0' });
    }

    // Crear la nueva alerta en MongoDB
    const newAlert = await Alert.create({
      symbol: symbol.toUpperCase(),
      action,
      entryPrice,
      currentPrice: entryPrice, // Precio inicial igual al de entrada
      stopLoss,
      takeProfit,
      status: 'ACTIVE',
      profit: 0, // Inicial en 0%
      date: date ? new Date(date) : new Date(),
      analysis: analysis || '',
      createdBy: user._id,
      tipo // Recibido desde el frontend
    });

    console.log('Nueva alerta creada por usuario:', user.name || user.email, newAlert._id);

    // Formatear la respuesta para el frontend
    const alertResponse = {
      id: newAlert._id.toString(),
      symbol: newAlert.symbol,
      action: newAlert.action,
      entryPrice: `$${newAlert.entryPrice.toFixed(2)}`,
      currentPrice: `$${newAlert.currentPrice.toFixed(2)}`,
      stopLoss: `$${newAlert.stopLoss.toFixed(2)}`,
      takeProfit: `$${newAlert.takeProfit.toFixed(2)}`,
      profit: `${newAlert.profit >= 0 ? '+' : ''}${newAlert.profit.toFixed(1)}%`,
      status: newAlert.status,
      date: newAlert.date.toISOString().split('T')[0],
      analysis: newAlert.analysis
    };

    // TODO: Enviar notificación a todos los suscriptores (opcional)

    return res.status(201).json({
      success: true,
      message: 'Alerta creada exitosamente',
      alert: alertResponse
    });

  } catch (error) {
    console.error('Error al crear alerta:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo crear la alerta'
    });
  }
} 