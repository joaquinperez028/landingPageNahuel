const axios = require('axios');
require('dotenv').config();

const configData = {
  heroVideo: {
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Video de Presentación',
    description: 'Conoce más sobre nuestros servicios de trading',
    autoplay: true,
    muted: true,
    loop: true
  },
  learningVideo: {
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Cursos de Inversión',
    description: 'Aprende a invertir desde cero con nuestros cursos especializados',
    autoplay: false,
    muted: true,
    loop: false
  },
  serviciosVideos: {
    alertas: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Video de Alertas',
      description: 'Descubre cómo funcionan nuestras alertas de trading',
      autoplay: false,
      muted: true,
      loop: false
    },
    entrenamientos: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Video de Entrenamientos',
      description: 'Conoce nuestros programas de formación especializados',
      autoplay: false,
      muted: true,
      loop: false
    },
    asesorias: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Video de Asesorías',
      description: 'Asesorías personalizadas para optimizar tu portafolio',
      autoplay: false,
      muted: true,
      loop: false
    }
  },
  statistics: {
    visible: true,
    backgroundColor: '#7c3aed',
    textColor: '#ffffff',
    stats: [
      { id: 'estudiantes', number: '+2900', label: 'Estudiantes', color: '#ffffff', order: 1 },
      { id: 'formaciones', number: '+15', label: 'Formaciones', color: '#ffffff', order: 2 },
      { id: 'horas', number: '+70', label: 'Horas de contenido', color: '#ffffff', order: 3 },
      { id: 'satisfaccion', number: '98%', label: 'Satisfacción', color: '#ffffff', order: 4 }
    ]
  },
  servicios: { orden: 1, visible: true },
  cursos: { orden: 2, visible: true, destacados: [] },
  trainingStartDates: {
    swingTrading: {
      startDate: new Date('2024-10-11T13:00:00.000Z'),
      startTime: '13:00',
      enabled: true
    },
    dowJones: {
      startDate: new Date('2024-11-01T14:00:00.000Z'),
      startTime: '14:00',
      enabled: true
    }
  },
  alertExamples: {
    traderCall: [],
    smartMoney: [],
    cashFlow: []
  },
  faqs: []
};

async function initializeSiteConfig() {
  try {
    console.log('🚀 Iniciando configuración del sitio...');
    
    // Obtener la configuración actual
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    try {
      const response = await axios.get(`${baseUrl}/api/site-config`);
      console.log('✅ Configuración existente encontrada');
      
      // Si existe, actualizar solo los campos faltantes
      const existingConfig = response.data;
      const updatedConfig = { ...existingConfig, ...configData };
      
      const updateResponse = await axios.put(`${baseUrl}/api/site-config`, updatedConfig, {
        headers: {
          'Content-Type': 'application/json',
          // Nota: En producción, necesitarías autenticación de admin
        }
      });
      
      console.log('✅ Configuración actualizada exitosamente');
      console.log('📋 Campos actualizados:', Object.keys(configData));
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('🆕 No existe configuración, creando nueva...');
        
        const createResponse = await axios.put(`${baseUrl}/api/site-config`, configData, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('✅ Configuración creada exitosamente');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Configuración del sitio completada');
    
  } catch (error) {
    console.error('❌ Error al inicializar configuración:', error.message);
    if (error.response) {
      console.error('📋 Respuesta del servidor:', error.response.data);
    }
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeSiteConfig();
}

module.exports = { initializeSiteConfig, configData };
