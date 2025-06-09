/**
 * API para crear nuevas alertas de trading
 * Todos los usuarios autenticados pueden crear alertas
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

interface AlertRequest {
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  analysis: string;
  date: string;
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
    const session = await getSession({ req });
    
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
    const { symbol, action, entryPrice, stopLoss, takeProfit, analysis, date }: AlertRequest = req.body;

    if (!symbol || !action || !entryPrice || !stopLoss || !takeProfit) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!['BUY', 'SELL'].includes(action)) {
      return res.status(400).json({ error: 'Acción debe ser BUY o SELL' });
    }

    if (entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
      return res.status(400).json({ error: 'Los precios deben ser mayores a 0' });
    }

    // Crear la nueva alerta
    const newAlert = {
      id: Date.now(),
      symbol: symbol.toUpperCase(),
      action,
      entryPrice: `$${entryPrice.toFixed(2)}`,
      currentPrice: `$${entryPrice.toFixed(2)}`, // Precio inicial igual al de entrada
      stopLoss: `$${stopLoss.toFixed(2)}`,
      takeProfit: `$${takeProfit.toFixed(2)}`,
      profit: '+0.0%', // Inicial en 0%
      status: 'ACTIVE',
      date: date || new Date().toISOString().split('T')[0],
      analysis: analysis || '',
      createdBy: user._id,
      createdAt: new Date()
    };

    // Aquí podrías guardar la alerta en una colección separada de MongoDB
    // Por ahora, simulamos la creación exitosa

         // TODO: Implementar modelo Alert y guardarlo en MongoDB
     // const Alert = require('@/models/Alert');
     // const savedAlert = await Alert.create(newAlert);

     console.log('Nueva alerta creada por usuario:', user.name || user.email, newAlert);

     // Enviar notificación a todos los suscriptores (opcional)
     // TODO: Implementar sistema de notificaciones

    return res.status(201).json({
      success: true,
      message: 'Alerta creada exitosamente',
      alert: newAlert
    });

  } catch (error) {
    console.error('Error al crear alerta:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo crear la alerta'
    });
  }
} 