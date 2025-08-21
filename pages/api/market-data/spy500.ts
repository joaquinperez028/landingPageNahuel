import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint para obtener datos del SPY500
 * GET /api/market-data/spy500
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('📊 Obteniendo datos del SPY500...');

    // Calcular el inicio del año
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    
    // Intentar obtener datos reales de una API externa
    let spyData;
    
    try {
      // Aquí podrías integrar con APIs como Alpha Vantage, Yahoo Finance, etc.
      // Por ahora, generamos datos simulados realistas
      
      // Simular datos basados en el rendimiento típico del SPY500
      const currentPrice = 478.50 + (Math.random() - 0.5) * 20; // Precio base con variación
      const yearStartPrice = 415.26; // Precio típico de inicio de año
      const yearChange = currentPrice - yearStartPrice;
      const yearChangePercent = (yearChange / yearStartPrice) * 100;
      
      spyData = {
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        yearStartPrice,
        yearChange: parseFloat(yearChange.toFixed(2)),
        yearChangePercent: parseFloat(yearChangePercent.toFixed(2)),
        lastUpdate: new Date().toISOString(),
        volume: generateVolume(),
        marketCap: '$43.2T',
        dayChange: parseFloat(((Math.random() - 0.5) * 4).toFixed(2)), // Variación diaria
        dayChangePercent: parseFloat(((Math.random() - 0.5) * 0.8).toFixed(2)),
        weekHigh: parseFloat((currentPrice * 1.03).toFixed(2)),
        weekLow: parseFloat((currentPrice * 0.97).toFixed(2)),
        yearHigh: parseFloat((Math.max(currentPrice, yearStartPrice) * 1.15).toFixed(2)),
        yearLow: parseFloat((Math.min(currentPrice, yearStartPrice) * 0.85).toFixed(2))
      };

      console.log('✅ Datos del SPY500 generados:', {
        currentPrice: spyData.currentPrice,
        yearChange: spyData.yearChangePercent + '%',
        lastUpdate: spyData.lastUpdate
      });

    } catch (apiError) {
      console.log('⚠️ Error al obtener datos de API externa, usando datos simulados:', apiError);
      
      // Datos de fallback más realistas
      spyData = {
        currentPrice: 478.50,
        yearStartPrice: 415.26,
        yearChange: 63.24,
        yearChangePercent: 15.23,
        lastUpdate: new Date().toISOString(),
        volume: '67.8M',
        marketCap: '$43.2T',
        dayChange: 2.45,
        dayChangePercent: 0.51,
        weekHigh: 485.30,
        weekLow: 472.10,
        yearHigh: 495.80,
        yearLow: 398.90
      };
    }

    // Agregar metadatos adicionales
    const enrichedData = {
      ...spyData,
      marketStatus: getMarketStatus(),
      nextMarketOpen: getNextMarketOpen(),
      sector: 'Index Fund',
      description: 'SPDR S&P 500 ETF Trust',
      ticker: 'SPY',
      exchange: 'NYSE Arca',
              currency: 'ARS',
      dataProvider: 'Simulado', // Cambiar cuando integres API real
      refreshRate: '5 minutos'
    };

    // Cache headers para optimizar
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutos
    
    return res.status(200).json(enrichedData);

  } catch (error) {
    console.error('❌ Error al obtener datos del SPY500:', error);
    
    return res.status(500).json({
      error: 'Error al obtener datos del SPY500',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

/**
 * Genera un volumen de trading simulado realista
 */
function generateVolume(): string {
  const baseVolume = 60; // Millones como base
  const variation = Math.random() * 40; // Variación de 0-40M
  const volume = baseVolume + variation;
  
  return `${volume.toFixed(1)}M`;
}

/**
 * Determina el estado actual del mercado
 */
function getMarketStatus(): string {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  
  // Fines de semana
  if (currentDay === 0 || currentDay === 6) {
    return 'Cerrado - Fin de semana';
  }
  
  // Horario de mercado: 9:30 AM - 4:00 PM EST (ajustar según timezone)
  if (currentHour >= 9 && currentHour < 16) {
    return 'Abierto';
  } else if (currentHour >= 16 && currentHour < 20) {
    return 'After Hours';
  } else if (currentHour >= 4 && currentHour < 9) {
    return 'Pre-Market';
  } else {
    return 'Cerrado';
  }
}

/**
 * Calcula la próxima apertura del mercado
 */
function getNextMarketOpen(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 30, 0, 0);
  
  // Si es fin de semana, calcular el próximo lunes
  if (tomorrow.getDay() === 0) { // Domingo
    tomorrow.setDate(tomorrow.getDate() + 1);
  } else if (tomorrow.getDay() === 6) { // Sábado
    tomorrow.setDate(tomorrow.getDate() + 2);
  }
  
  return tomorrow.toISOString();
}

/**
 * Función auxiliar para simular llamadas a API externa
 * En producción, reemplazar con llamadas reales a APIs como:
 * - Alpha Vantage
 * - Yahoo Finance
 * - IEX Cloud
 * - Polygon.io
 */
async function fetchRealSPY500Data() {
  // Ejemplo de implementación con Alpha Vantage
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!API_KEY) {
    throw new Error('API Key no configurada');
  }
  
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`Error en API: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Procesar y formatear datos según la estructura esperada
  // ... lógica de procesamiento
  
  return data;
} 