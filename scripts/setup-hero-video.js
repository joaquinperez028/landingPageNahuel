const fetch = require('node-fetch');

async function setupHeroVideo() {
  try {
    console.log('🎬 Configurando video de prueba para el hero...');
    
    const baseUrl = 'http://localhost:3000';
    
    // Video de prueba - Swing Trading
    const videoConfig = {
      heroVideo: {
        youtubeId: 'dQw4w9WgXcQ', // Video de prueba
        title: 'Swing Trading - Introducción',
        description: 'Video promocional del programa de Swing Trading',
        autoplay: false,
        muted: true,
        loop: false
      }
    };
    
    const response = await fetch(`${baseUrl}/api/site-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoConfig)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Video configurado exitosamente:');
      console.log('   - ID: dQw4w9WgXcQ');
      console.log('   - Título: Swing Trading - Introducción');
      console.log('   - URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    } else {
      console.log('❌ Error al configurar video:', response.status);
      const error = await response.text();
      console.log('   Error:', error);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('💡 Asegúrate de que el servidor esté corriendo (npm run dev)');
  }
}

setupHeroVideo(); 