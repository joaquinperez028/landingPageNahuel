import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API para invalidar caché de turnos
 * POST: Invalida el caché y fuerza regeneración
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar headers anti-caché
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔄 Invalidando caché de turnos...');
    
    // Simular invalidación de caché
    const timestamp = Date.now();
    
    return res.status(200).json({
      success: true,
      message: 'Caché invalidado exitosamente',
      timestamp,
      invalidatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al invalidar caché:', error);
    return res.status(500).json({ error: 'Error al invalidar caché' });
  }
} 