import { NextApiRequest, NextApiResponse } from 'next';

interface StockResponse {
  price?: number;
  error?: string;
  marketStatus?: string;
  lastUpdate?: string;
  isSimulated?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StockResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { symbol } = req.query;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Símbolo de acción requerido' });
  }

  // Log para debugging
  console.log(`📈 Obteniendo precio para: ${symbol}`);
  console.log(`⏰ Hora actual: ${new Date().toLocaleString('es-ES', { timeZone: 'America/New_York' })} (EST)`);

  try {
    // Usar API gratuita de Yahoo Finance (alternativa sin API key)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener datos de Yahoo Finance');
    }

    const data = await response.json();

    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      const price = data.chart.result[0].meta.regularMarketPrice;
      const isMarketOpen = data.chart.result[0].meta.regularMarketTime || data.chart.result[0].meta.currentTradingPeriod;
      
      const marketStatus = getMarketStatus();
      console.log(`✅ Yahoo Finance - ${symbol}: $${price} (Market: ${marketStatus})`);
      return res.status(200).json({ 
        price: parseFloat(price.toFixed(2)),
        marketStatus,
        lastUpdate: new Date().toISOString(),
        isSimulated: false
      });
    } else {
      // Si Yahoo Finance falla, usar API alternativa (Alpha Vantage)
      const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
      
      if (alphaVantageKey) {
        const alphaResponse = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`
        );
        
        const alphaData = await alphaResponse.json();
        
        if (alphaData['Global Quote'] && alphaData['Global Quote']['05. price']) {
          const price = parseFloat(alphaData['Global Quote']['05. price']);
          const marketStatus = getMarketStatus();
          console.log(`✅ Alpha Vantage - ${symbol}: $${price} (Market: ${marketStatus})`);
          return res.status(200).json({ 
            price: parseFloat(price.toFixed(2)),
            marketStatus,
            lastUpdate: new Date().toISOString(),
            isSimulated: false
          });
        }
      }

      // Si ambas APIs fallan, devolver precio simulado
      const simulatedPrice = generateSimulatedPrice(symbol.toUpperCase());
      const marketStatus = getMarketStatus();
      console.log(`⚠️ Usando precio simulado para ${symbol}: $${simulatedPrice} (Market: ${marketStatus})`);
      return res.status(200).json({ 
        price: simulatedPrice,
        marketStatus,
        lastUpdate: new Date().toISOString(),
        isSimulated: true
      });
    }
  } catch (error) {
    console.error('Error al obtener precio de acción:', error);
    
    // En caso de error, generar precio simulado
    const simulatedPrice = generateSimulatedPrice(symbol.toUpperCase());
    const marketStatus = getMarketStatus();
    console.log(`❌ Error obteniendo precio real para ${symbol}, usando simulado: $${simulatedPrice} (Market: ${marketStatus})`);
    return res.status(200).json({ 
      price: simulatedPrice,
      marketStatus,
      lastUpdate: new Date().toISOString(),
      isSimulated: true
    });
  }
}

// Función para verificar si el mercado está abierto
function getMarketStatus(): string {
  const now = new Date();
  const estTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const hour = estTime.getHours();
  const minute = estTime.getMinutes();
  const dayOfWeek = estTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Mercado cerrado los fines de semana
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'CLOSED_WEEKEND';
  }
  
  // Mercado abierto de 9:30 AM a 4:00 PM EST
  const isMarketOpen = (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;
  
  if (isMarketOpen) {
    return 'OPEN';
  } else if (hour >= 16 && hour < 21) {
    return 'CLOSED_AFTER_HOURS';
  } else {
    return 'CLOSED_PRE_MARKET';
  }
}

// Función para generar precios simulados realistas como fallback
function generateSimulatedPrice(symbol: string): number {
  const basePrices: { [key: string]: number } = {
    'AAPL': 185,
    'TSLA': 248,
    'MSFT': 380,
    'GOOGL': 142,
    'AMZN': 155,
    'NVDA': 520,
    'META': 365,
    'AMD': 148,
    'NFLX': 485,
    'SPY': 478,
    'QQQ': 395
  };

  const basePrice = basePrices[symbol] || 100;
  
  // Agregar variación aleatoria de ±5%
  const variation = (Math.random() - 0.5) * 0.1; // -5% a +5%
  const price = basePrice * (1 + variation);
  
  return parseFloat(price.toFixed(2));
} 