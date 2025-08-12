const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Función para obtener la configuración actual
async function getCurrentConfig() {
  try {
    const SiteConfig = mongoose.model('SiteConfig');
    const config = await SiteConfig.findOne();
    
    if (config) {
      console.log('\n📋 Configuración actual de videos:');
      
      // Videos principales
      console.log('\n🎬 VIDEOS PRINCIPALES:');
      console.log('📺 Video Principal (Hero):');
      console.log(`   ID: ${config.heroVideo?.youtubeId || 'No configurado'}`);
      console.log(`   Título: ${config.heroVideo?.title || 'No configurado'}`);
      console.log(`   Autoplay: ${config.heroVideo?.autoplay ? '✅ Sí' : '❌ No'}`);
      console.log(`   Muted: ${config.heroVideo?.muted ? '✅ Sí' : '❌ No'}`);
      console.log(`   Loop: ${config.heroVideo?.loop ? '✅ Sí' : '❌ No'}`);
      
      console.log('\n📚 Video de Aprendizaje:');
      console.log(`   ID: ${config.learningVideo?.youtubeId || 'No configurado'}`);
      console.log(`   Título: ${config.learningVideo?.title || 'No configurado'}`);
      console.log(`   Autoplay: ${config.learningVideo?.autoplay ? '✅ Sí' : '❌ No'}`);
      console.log(`   Muted: ${config.learningVideo?.muted ? '✅ Sí' : '❌ No'}`);
      console.log(`   Loop: ${config.learningVideo?.loop ? '✅ Sí' : '❌ No'}`);
      
      // Videos de servicios
      console.log('\n🔔 VIDEOS DE SERVICIOS:');
      console.log('📊 Video de Alertas:');
      console.log(`   ID: ${config.serviciosVideos?.alertas?.youtubeId || 'No configurado'}`);
      console.log(`   Título: ${config.serviciosVideos?.alertas?.title || 'No configurado'}`);
      console.log(`   Autoplay: ${config.serviciosVideos?.alertas?.autoplay ? '✅ Sí' : '❌ No'}`);
      console.log(`   Muted: ${config.serviciosVideos?.alertas?.muted ? '✅ Sí' : '❌ No'}`);
      console.log(`   Loop: ${config.serviciosVideos?.alertas?.loop ? '✅ Sí' : '❌ No'}`);
      
      console.log('\n📖 Video de Entrenamientos:');
      console.log(`   ID: ${config.serviciosVideos?.entrenamientos?.youtubeId || 'No configurado'}`);
      console.log(`   Título: ${config.serviciosVideos?.entrenamientos?.title || 'No configurado'}`);
      console.log(`   Autoplay: ${config.serviciosVideos?.entrenamientos?.autoplay ? '✅ Sí' : '❌ No'}`);
      console.log(`   Muted: ${config.serviciosVideos?.entrenamientos?.muted ? '✅ Sí' : '❌ No'}`);
      console.log(`   Loop: ${config.serviciosVideos?.entrenamientos?.loop ? '✅ Sí' : '❌ No'}`);
      
      console.log('\n💬 Video de Asesorías:');
      console.log(`   ID: ${config.serviciosVideos?.asesorias?.youtubeId || 'No configurado'}`);
      console.log(`   Título: ${config.serviciosVideos?.asesorias?.title || 'No configurado'}`);
      console.log(`   Autoplay: ${config.serviciosVideos?.asesorias?.autoplay ? '✅ Sí' : '❌ No'}`);
      console.log(`   Muted: ${config.serviciosVideos?.asesorias?.muted ? '✅ Sí' : '❌ No'}`);
      console.log(`   Loop: ${config.serviciosVideos?.asesorias?.loop ? '✅ Sí' : '❌ No'}`);
      
      return config;
    } else {
      console.log('❌ No se encontró configuración en la base de datos');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    return null;
  }
}

// Función para actualizar la configuración de videos
async function updateVideoConfig(updates) {
  try {
    const SiteConfig = mongoose.model('SiteConfig');
    
    // Obtener configuración actual o crear nueva
    let config = await SiteConfig.findOne();
    
    if (!config) {
      console.log('🆕 Creando nueva configuración...');
      config = new SiteConfig();
    }
    
    // Actualizar configuración
    if (updates.heroVideo) {
      config.heroVideo = { ...config.heroVideo, ...updates.heroVideo };
    }
    
    if (updates.learningVideo) {
      config.learningVideo = { ...config.learningVideo, ...updates.learningVideo };
    }
    
    if (updates.serviciosVideos) {
      if (updates.serviciosVideos.alertas) {
        config.serviciosVideos.alertas = { ...config.serviciosVideos.alertas, ...updates.serviciosVideos.alertas };
      }
      if (updates.serviciosVideos.entrenamientos) {
        config.serviciosVideos.entrenamientos = { ...config.serviciosVideos.entrenamientos, ...updates.serviciosVideos.entrenamientos };
      }
      if (updates.serviciosVideos.asesorias) {
        config.serviciosVideos.asesorias = { ...config.serviciosVideos.asesorias, ...updates.serviciosVideos.asesorias };
      }
    }
    
    await config.save();
    console.log('✅ Configuración actualizada exitosamente');
    
    return config;
  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
    return null;
  }
}

// Función para extraer YouTube ID de una URL
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url; // Si no coincide con ningún patrón, asumir que ya es un ID
}

// Función para configurar un video específico
async function setVideo(videoType, url, options = {}) {
  const youtubeId = extractYouTubeId(url);
  console.log(`🎬 Configurando ${videoType} con ID: ${youtubeId}`);
  
  const defaultOptions = {
    autoplay: false,
    muted: true,
    loop: false
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  let updates = {};
  
  switch (videoType) {
    case 'hero':
      updates = {
        heroVideo: {
          youtubeId,
          title: options.title || 'Video de Presentación',
          description: options.description || 'Conoce más sobre nuestros servicios de trading',
          ...finalOptions
        }
      };
      break;
      
    case 'learning':
      updates = {
        learningVideo: {
          youtubeId,
          title: options.title || 'Cursos de Inversión',
          description: options.description || 'Aprende a invertir desde cero con nuestros cursos especializados',
          ...finalOptions
        }
      };
      break;
      
    case 'alertas':
      updates = {
        serviciosVideos: {
          alertas: {
            youtubeId,
            title: options.title || 'Video de Alertas',
            description: options.description || 'Descubre cómo funcionan nuestras alertas de trading',
            ...finalOptions
          }
        }
      };
      break;
      
    case 'entrenamientos':
      updates = {
        serviciosVideos: {
          entrenamientos: {
            youtubeId,
            title: options.title || 'Video de Entrenamientos',
            description: options.description || 'Conoce nuestros programas de formación especializados',
            ...finalOptions
          }
        }
      };
      break;
      
    case 'asesorias':
      updates = {
        serviciosVideos: {
          asesorias: {
            youtubeId,
            title: options.title || 'Video de Asesorías',
            description: options.description || 'Asesorías personalizadas para optimizar tu portafolio',
            ...finalOptions
          }
        }
      };
      break;
      
    default:
      console.log('❌ Tipo de video no válido');
      return;
  }
  
  await updateVideoConfig(updates);
  await getCurrentConfig();
}

// Función principal
async function main() {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'get':
      await getCurrentConfig();
      break;
      
    case 'set-hero':
      const heroUrl = process.argv[3];
      if (!heroUrl) {
        console.log('❌ Uso: node test-video-config.js set-hero <URL_DE_YOUTUBE>');
        process.exit(1);
      }
      await setVideo('hero', heroUrl, { autoplay: true, muted: true, loop: true });
      break;
      
    case 'set-learning':
      const learningUrl = process.argv[3];
      if (!learningUrl) {
        console.log('❌ Uso: node test-video-config.js set-learning <URL_DE_YOUTUBE>');
        process.exit(1);
      }
      await setVideo('learning', learningUrl);
      break;
      
    case 'set-alertas':
      const alertasUrl = process.argv[3];
      if (!alertasUrl) {
        console.log('❌ Uso: node test-video-config.js set-alertas <URL_DE_YOUTUBE>');
        process.exit(1);
      }
      await setVideo('alertas', alertasUrl);
      break;
      
    case 'set-entrenamientos':
      const entrenamientosUrl = process.argv[3];
      if (!entrenamientosUrl) {
        console.log('❌ Uso: node test-video-config.js set-entrenamientos <URL_DE_YOUTUBE>');
        process.exit(1);
      }
      await setVideo('entrenamientos', entrenamientosUrl);
      break;
      
    case 'set-asesorias':
      const asesoriasUrl = process.argv[3];
      if (!asesoriasUrl) {
        console.log('❌ Uso: node test-video-config.js set-asesorias <URL_DE_YOUTUBE>');
        process.exit(1);
      }
      await setVideo('asesorias', asesoriasUrl);
      break;
      
    case 'set-all':
      const allUrl = process.argv[3];
      if (!allUrl) {
        console.log('❌ Uso: node test-video-config.js set-all <URL_DE_YOUTUBE>');
        process.exit(1);
      }
      console.log('🔄 Configurando todos los videos con la misma URL...');
      await setVideo('hero', allUrl, { autoplay: true, muted: true, loop: true });
      await setVideo('learning', allUrl);
      await setVideo('alertas', allUrl);
      await setVideo('entrenamientos', allUrl);
      await setVideo('asesorias', allUrl);
      break;
      
    case 'test':
      console.log('🧪 Probando configuración...');
      const config = await getCurrentConfig();
      
      if (config) {
        console.log('\n🔗 URLs de prueba:');
        if (config.heroVideo?.youtubeId) {
          console.log(`🎬 Video Principal: https://www.youtube.com/watch?v=${config.heroVideo.youtubeId}`);
        }
        if (config.learningVideo?.youtubeId) {
          console.log(`📚 Video de Aprendizaje: https://www.youtube.com/watch?v=${config.learningVideo.youtubeId}`);
        }
        if (config.serviciosVideos?.alertas?.youtubeId) {
          console.log(`🔔 Video de Alertas: https://www.youtube.com/watch?v=${config.serviciosVideos.alertas.youtubeId}`);
        }
        if (config.serviciosVideos?.entrenamientos?.youtubeId) {
          console.log(`📖 Video de Entrenamientos: https://www.youtube.com/watch?v=${config.serviciosVideos.entrenamientos.youtubeId}`);
        }
        if (config.serviciosVideos?.asesorias?.youtubeId) {
          console.log(`💬 Video de Asesorías: https://www.youtube.com/watch?v=${config.serviciosVideos.asesorias.youtubeId}`);
        }
      }
      break;
      
    case 'reset':
      console.log('🔄 Restableciendo todos los videos a configuración por defecto...');
      await updateVideoConfig({
        heroVideo: {
          youtubeId: '',
          title: 'Video de Presentación',
          description: 'Conoce más sobre nuestros servicios de trading',
          autoplay: true,
          muted: true,
          loop: true
        },
        learningVideo: {
          youtubeId: '',
          title: 'Cursos de Inversión',
          description: 'Aprende a invertir desde cero con nuestros cursos especializados',
          autoplay: false,
          muted: true,
          loop: false
        },
        serviciosVideos: {
          alertas: {
            youtubeId: '',
            title: 'Video de Alertas',
            description: 'Descubre cómo funcionan nuestras alertas de trading',
            autoplay: false,
            muted: true,
            loop: false
          },
          entrenamientos: {
            youtubeId: '',
            title: 'Video de Entrenamientos',
            description: 'Conoce nuestros programas de formación especializados',
            autoplay: false,
            muted: true,
            loop: false
          },
          asesorias: {
            youtubeId: '',
            title: 'Video de Asesorías',
            description: 'Asesorías personalizadas para optimizar tu portafolio',
            autoplay: false,
            muted: true,
            loop: false
          }
        }
      });
      await getCurrentConfig();
      break;
      
    default:
      console.log(`
🎬 Script de Configuración Completa de Videos

Uso:
  node test-video-config.js get                    - Ver configuración actual
  node test-video-config.js set-hero <URL>         - Configurar video principal
  node test-video-config.js set-learning <URL>     - Configurar video de aprendizaje
  node test-video-config.js set-alertas <URL>      - Configurar video de alertas
  node test-video-config.js set-entrenamientos <URL> - Configurar video de entrenamientos
  node test-video-config.js set-asesorias <URL>    - Configurar video de asesorías
  node test-video-config.js set-all <URL>          - Configurar todos los videos
  node test-video-config.js reset                  - Restablecer configuración por defecto
  node test-video-config.js test                   - Probar configuración

Ejemplos:
  node test-video-config.js set-hero https://www.youtube.com/watch?v=dQw4w9WgXcQ
  node test-video-config.js set-learning https://youtu.be/dQw4w9WgXcQ
  node test-video-config.js set-alertas https://www.youtube.com/watch?v=dQw4w9WgXcQ
  node test-video-config.js set-all https://www.youtube.com/watch?v=dQw4w9WgXcQ
  node test-video-config.js get
      `);
      break;
  }
  
  await mongoose.disconnect();
  console.log('\n👋 Desconectado de MongoDB');
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
  process.exit(1);
});

// Ejecutar script
main().catch(console.error); 