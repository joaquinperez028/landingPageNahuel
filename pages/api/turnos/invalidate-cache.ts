import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API para invalidar el caché de turnos disponibles
 * Se llama después de crear/cancelar reservas para mantener sincronización
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permitir solo POST desde el servidor
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧹 Invalidando caché de turnos...');
    
    // Acceder al caché desde el módulo generate
    const generateModule = await import('./generate');
    
    // Limpiar todo el caché
    if (generateModule.cache) {
      generateModule.cache.clear();
      console.log('✅ Caché de turnos invalidado exitosamente');
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Caché invalidado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al invalidar caché:', error);
    return res.status(500).json({ 
      error: 'Error al invalidar caché',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 