/**
 * API para actualizar precios actuales de alertas activas
 * Consulta precios en tiempo real y actualiza MongoDB
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Alert from '@/models/Alert';

interface UpdatePricesResponse {
  success?: boolean;
  updated?: number;
  error?: string;
  message?: string;
  alerts?: any[];
}

// Función para obtener precio actual de una acción
async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  try {
    // Usar la misma API de stock-price que ya existe
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stock-price?symbol=${symbol}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.price;
    }
    
    return null;
  } catch (error) {
    console.error(`Error obteniendo precio para ${symbol}:`, error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdatePricesResponse>
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

    // Obtener información del usuario
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener todas las alertas activas del usuario
    const activeAlerts = await Alert.find({
      createdBy: user._id,
      status: 'ACTIVE',
      tipo: 'TraderCall' // Por ahora solo TraderCall
    });

    let updatedCount = 0;
    const updatedAlerts = [];

    // Actualizar precios para cada alerta activa
    for (const alert of activeAlerts) {
      const currentPrice = await fetchCurrentPrice(alert.symbol);
      
      if (currentPrice && currentPrice !== alert.currentPrice) {
        // Actualizar precio actual
        alert.currentPrice = currentPrice;
        
        // El profit se calcula automáticamente por el middleware pre('save')
        await alert.save();
        
        updatedCount++;
        
        // Formatear para respuesta
        updatedAlerts.push({
          id: alert._id.toString(),
          symbol: alert.symbol,
          action: alert.action,
          entryPrice: `$${alert.entryPrice.toFixed(2)}`,
          currentPrice: `$${alert.currentPrice.toFixed(2)}`,
          stopLoss: `$${alert.stopLoss.toFixed(2)}`,
          takeProfit: `$${alert.takeProfit.toFixed(2)}`,
          profit: `${alert.profit >= 0 ? '+' : ''}${alert.profit.toFixed(1)}%`,
          status: alert.status,
          date: alert.date.toISOString().split('T')[0],
          analysis: alert.analysis,
          priceChange: currentPrice - alert.entryPrice
        });
      }
    }

    console.log(`Precios actualizados: ${updatedCount} de ${activeAlerts.length} alertas`);

    return res.status(200).json({
      success: true,
      updated: updatedCount,
      alerts: updatedAlerts,
      message: `Se actualizaron ${updatedCount} alertas`
    });

  } catch (error) {
    console.error('Error al actualizar precios:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron actualizar los precios'
    });
  }
} 