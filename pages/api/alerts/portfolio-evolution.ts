/**
 * API para obtener la evolución del portfolio basada en P&L real de alertas
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Alert from '@/models/Alert';

interface PortfolioEvolutionResponse {
  success?: boolean;
  data?: Array<{
    date: string;
    value: number;
    profit: number;
    alertsCount: number;
  }>;
  stats?: {
    totalProfit: number;
    totalAlerts: number;
    winRate: number;
    avgProfit: number;
  };
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PortfolioEvolutionResponse>
) {
  if (req.method !== 'GET') {
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

    // Extraer parámetros de query
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string);

    // Calcular fecha de inicio
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysNum * 24 * 60 * 60 * 1000);

    // Obtener todas las alertas en el rango de fechas
    const alerts = await Alert.find({
      $or: [
        { createdAt: { $gte: startDate, $lte: endDate } },
        { exitDate: { $gte: startDate, $lte: endDate } }
      ]
    }).sort({ createdAt: 1 }).lean();

    // Crear mapa de datos por día
    const dailyData = new Map<string, {
      date: string;
      value: number;
      profit: number;
      alertsCount: number;
    }>();

    // Inicializar todos los días en el rango
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyData.set(dateKey, {
        date: dateKey,
        value: 10000, // Portfolio inicial base
        profit: 0,
        alertsCount: 0
      });
    }

    // Calcular evolución acumulativa
    let cumulativeProfit = 0;
    let baseValue = 10000;

    // Procesar alertas por día
    const alertsByDay = new Map<string, any[]>();
    
    alerts.forEach(alert => {
      const alertDate = new Date(alert.createdAt);
      const dateKey = alertDate.toISOString().split('T')[0];
      
      if (!alertsByDay.has(dateKey)) {
        alertsByDay.set(dateKey, []);
      }
      alertsByDay.get(dateKey)!.push(alert);
    });

    // Procesar datos día por día
    const sortedDates = Array.from(dailyData.keys()).sort();
    
    for (const dateKey of sortedDates) {
      const dayAlerts = alertsByDay.get(dateKey) || [];
      const dayData = dailyData.get(dateKey)!;
      
      // Calcular profit del día
      const dayProfit = dayAlerts.reduce((sum, alert) => {
        return sum + (Number(alert.profit) || 0);
      }, 0);
      
      // Acumular profit
      cumulativeProfit += dayProfit;
      
      // Calcular valor del portfolio (base + profit acumulado)
      const portfolioValue = baseValue + (baseValue * (cumulativeProfit / 100));
      
      dayData.value = portfolioValue;
      dayData.profit = cumulativeProfit;
      dayData.alertsCount = dayAlerts.length;
    }

    // Convertir a array y ordenar
    const evolutionData = Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calcular estadísticas generales
    const allAlerts = await Alert.find({}).lean();
    const totalAlerts = allAlerts.length;
    const winningAlerts = allAlerts.filter(alert => (alert.profit || 0) > 0);
    const winRate = totalAlerts > 0 ? (winningAlerts.length / totalAlerts) * 100 : 0;
    const totalProfit = allAlerts.reduce((sum, alert) => sum + (alert.profit || 0), 0);
    const avgProfit = totalAlerts > 0 ? totalProfit / totalAlerts : 0;

    const stats = {
      totalProfit: Number(totalProfit.toFixed(2)),
      totalAlerts,
      winRate: Number(winRate.toFixed(1)),
      avgProfit: Number(avgProfit.toFixed(2))
    };

    return res.status(200).json({
      success: true,
      data: evolutionData,
      stats,
      message: `Evolución del portfolio calculada para ${daysNum} días`
    });

  } catch (error) {
    console.error('Error al calcular evolución del portfolio:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo calcular la evolución del portfolio'
    });
  }
} 