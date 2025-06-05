// Configuración para MUX Video Streaming
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID || 'development_token_id';
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET || 'development_token_secret';

if ((!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) && process.env.NODE_ENV === 'production') {
  throw new Error(
    'Por favor define las variables de entorno MUX_TOKEN_ID y MUX_TOKEN_SECRET en producción'
  );
}

interface MuxAsset {
  id: string;
  status: string;
  playback_ids?: Array<{
    id: string;
    policy: string;
  }>;
}

interface MuxUploadResponse {
  data: MuxAsset;
}

/**
 * Crea un asset en MUX desde una URL de video
 * @param videoUrl URL del video a procesar
 * @returns Promise con el playback ID
 */
export async function createMuxAsset(videoUrl: string): Promise<string> {
  console.log('🎥 Creando asset en MUX para:', videoUrl);
  
  try {
    const response = await fetch('https://api.mux.com/video/v1/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        input: videoUrl,
        playback_policy: ['public'],
        mp4_support: 'standard'
      })
    });

    if (!response.ok) {
      throw new Error(`Error en MUX API: ${response.status}`);
    }

    const data: MuxUploadResponse = await response.json();
    const playbackId = data.data.playback_ids?.[0]?.id;

    if (!playbackId) {
      throw new Error('No se pudo obtener el playback ID de MUX');
    }

    console.log('✅ Asset creado en MUX con playback ID:', playbackId);
    return playbackId;
    
  } catch (error) {
    console.error('❌ Error creando asset en MUX:', error);
    throw error;
  }
}

/**
 * Obtiene información de un asset de MUX
 * @param assetId ID del asset en MUX
 * @returns Promise con la información del asset
 */
export async function getMuxAsset(assetId: string): Promise<MuxAsset> {
  try {
    const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo asset de MUX: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
    
  } catch (error) {
    console.error('❌ Error obteniendo asset de MUX:', error);
    throw error;
  }
}

/**
 * Valida si un playback ID es válido
 * @param playbackId Playback ID a validar
 * @returns boolean
 */
export function isValidPlaybackId(playbackId: string): boolean {
  return typeof playbackId === 'string' && playbackId.length > 0;
} 