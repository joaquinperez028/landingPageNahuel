import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';

/**
 * API para obtener precios de acciones desde Google Finance
 * GET: Obtener precio actual de una acción
 * POST: Obtener precios de múltiples acciones
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ NUEVO: Verificar autenticación para uso del frontend
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (req.method === 'GET') {
      return await getSingleStockPrice(req, res);
    } else if (req.method === 'POST') {
      return await getMultipleStockPrices(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error: any) {
    console.error('❌ Error en API de Google Finance:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

/**
 * ✅ NUEVO: Obtener precio de una sola acción
 */
async function getSingleStockPrice(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { symbol } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ 
        error: 'Símbolo de acción requerido',
        example: '/api/market-data/google-finance?symbol=AAPL'
      });
    }

    console.log(`🔍 Obteniendo precio para ${symbol} desde Google Finance...`);
    
    const price = await fetchGoogleFinancePrice(symbol);
    
    if (price) {
      return res.status(200).json({
        success: true,
        symbol: symbol.toUpperCase(),
        price,
        source: 'Google Finance',
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(404).json({
        error: 'No se pudo obtener precio para esta acción',
        symbol: symbol.toUpperCase(),
        suggestions: [
          'Verificar que el símbolo sea correcto',
          'La acción puede no estar disponible en Google Finance',
          'Intentar más tarde'
        ]
      });
    }

  } catch (error: any) {
    console.error('❌ Error obteniendo precio individual:', error);
    return res.status(500).json({
      error: 'Error al obtener precio de la acción',
      details: error.message
    });
  }
}

/**
 * ✅ NUEVO: Obtener precios de múltiples acciones
 */
async function getMultipleStockPrices(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ 
        error: 'Array de símbolos requerido',
        example: { symbols: ['AAPL', 'GOOGL', 'MSFT'] }
      });
    }

    if (symbols.length > 10) {
      return res.status(400).json({ 
        error: 'Máximo 10 símbolos por request',
        received: symbols.length,
        maxAllowed: 10
      });
    }

    console.log(`🔍 Obteniendo precios para ${symbols.length} acciones desde Google Finance...`);
    
    const results = [];
    const errors = [];

    // ✅ NUEVO: Procesar símbolos en paralelo con límite de concurrencia
    const batchSize = 3; // Máximo 3 requests simultáneos para evitar rate limiting
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (symbol) => {
        try {
          const price = await fetchGoogleFinancePrice(symbol);
          if (price) {
            return { symbol: symbol.toUpperCase(), price, success: true };
          } else {
            return { symbol: symbol.toUpperCase(), price: null, success: false, error: 'Precio no disponible' };
          }
        } catch (error: any) {
          return { symbol: symbol.toUpperCase(), price: null, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // ✅ NUEVO: Pausa entre lotes para evitar rate limiting
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    console.log(`✅ Precios obtenidos: ${successfulResults.length}/${symbols.length}`);

    return res.status(200).json({
      success: true,
      summary: {
        total: symbols.length,
        successful: successfulResults.length,
        failed: failedResults.length
      },
      prices: successfulResults,
      errors: failedResults,
      source: 'Google Finance',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo precios múltiples:', error);
    return res.status(500).json({
      error: 'Error al obtener precios de las acciones',
      details: error.message
    });
  }
}

/**
 * ✅ NUEVO: Función principal para obtener precio desde Google Finance
 */
async function fetchGoogleFinancePrice(symbol: string): Promise<number | null> {
  try {
    const googleFinanceUrl = `https://www.google.com/finance/quote/${symbol}`;
    
    const response = await fetch(googleFinanceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Finance responded with status: ${response.status}`);
    }

    const html = await response.text();
    
    // ✅ NUEVO: Múltiples patrones para extraer precio
    const pricePatterns = [
      /"price":\s*"([^"]+)"/,           // Patrón principal
      /"currentPrice":\s*"([^"]+)"/,     // Precio actual alternativo
      /"lastPrice":\s*"([^"]+)"/,        // Último precio
      /(\d+\.?\d*)\s*USD/,               // Formato USD
      /(\d+\.?\d*)\s*EUR/,               // Formato EUR
      /(\d+\.?\d*)\s*ARS/,               // Formato ARS
      /(\d+\.?\d*)\s*CLP/                // Formato CLP
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const price = parseFloat(match[1].replace(/[,]/g, ''));
        if (!isNaN(price) && price > 0) {
          console.log(`✅ Precio extraído para ${symbol}: $${price} (patrón: ${pattern.source})`);
          return price;
        }
      }
    }

    // ✅ NUEVO: Si no se encuentra con patrones, buscar en el DOM
    const domPriceMatch = html.match(/<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/span>/i);
    if (domPriceMatch) {
      const price = parseFloat(domPriceMatch[1].replace(/[^\d.-]/g, ''));
      if (!isNaN(price) && price > 0) {
        console.log(`✅ Precio extraído del DOM para ${symbol}: $${price}`);
        return price;
      }
    }

    console.log(`⚠️ No se pudo extraer precio para ${symbol} desde Google Finance`);
    return null;

  } catch (error: any) {
    console.error(`❌ Error obteniendo precio desde Google Finance para ${symbol}:`, error.message);
    return null;
  }
} 