const axios = require('axios');
require('dotenv').config();

async function initializeSiteConfig() {
  try {
    console.log('🔧 Inicializando configuración del sitio...');

    // URL base de la API
    const baseURL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Obtener configuración actual
    let response;
    try {
      response = await axios.get(`${baseURL}/api/site-config`);
      console.log('📝 Configuración existente encontrada');
    } catch (error) {
      console.log('📝 No se encontró configuración existente, creando nueva...');
    }

    // Datos de configuración inicial
    const configData = {
      heroVideo: {
        youtubeId: 'dQw4w9WgXcQ',
        title: 'Video Principal',
        description: 'Video principal del landing page',
        autoplay: true,
        muted: true,
        loop: true
      },
      learningVideo: {
        youtubeId: 'dQw4w9WgXcQ',
        title: 'Video de Aprendizaje',
        description: 'Video de aprendizaje',
        autoplay: false,
        muted: true,
        loop: false
      },
      serviciosVideos: {
        alertas: {
          youtubeId: 'dQw4w9WgXcQ',
          title: 'Video de Alertas',
          description: 'Video promocional de alertas',
          autoplay: false,
          muted: true,
          loop: false
        },
        entrenamientos: {
          youtubeId: 'dQw4w9WgXcQ',
          title: 'Video de Entrenamientos',
          description: 'Video promocional de entrenamientos',
          autoplay: false,
          muted: true,
          loop: false
        },
        asesorias: {
          youtubeId: 'dQw4w9WgXcQ',
          title: 'Video de Asesorías',
          description: 'Video promocional de asesorías',
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
          {
            id: 'estudiantes',
            number: '500+',
            label: 'Estudiantes Activos',
            color: '#ffffff',
            order: 1
          },
          {
            id: 'rentabilidad',
            number: '85%',
            label: 'Rentabilidad Promedio',
            color: '#ffffff',
            order: 2
          }
        ]
      },
      servicios: {
        orden: 1,
        visible: true
      },
      cursos: {
        orden: 2,
        visible: true,
        destacados: []
      },
      // Nueva sección para fechas de inicio de entrenamientos
      trainingStartDates: {
        swingTrading: {
          startDate: new Date('2024-10-11T13:00:00.000Z').toISOString(),
          startTime: '13:00',
          enabled: true
        },
        dowJones: {
          startDate: new Date('2024-11-01T14:00:00.000Z').toISOString(),
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

    // Si hay configuración existente, mantener los datos existentes y solo agregar los nuevos campos
    if (response && response.data.success) {
      const existingConfig = response.data.data;
      configData.trainingStartDates = {
        swingTrading: {
          startDate: new Date('2024-10-11T13:00:00.000Z').toISOString(),
          startTime: '13:00',
          enabled: true
        },
        dowJones: {
          startDate: new Date('2024-11-01T14:00:00.000Z').toISOString(),
          startTime: '14:00',
          enabled: true
        }
      };
      
      // Combinar configuración existente con nuevos campos
      Object.assign(configData, existingConfig);
    }

    // Guardar configuración
    const saveResponse = await axios.put(`${baseURL}/api/site-config`, configData);
    
    if (saveResponse.data.success) {
      console.log('✅ Configuración del sitio inicializada correctamente');
      console.log('📊 Configuración actual:');
      console.log('- Swing Trading:', {
        fecha: new Date(configData.trainingStartDates.swingTrading.startDate).toLocaleDateString('es-ES'),
        hora: configData.trainingStartDates.swingTrading.startTime,
        habilitado: configData.trainingStartDates.swingTrading.enabled
      });
      console.log('- Dow Jones:', {
        fecha: new Date(configData.trainingStartDates.dowJones.startDate).toLocaleDateString('es-ES'),
        hora: configData.trainingStartDates.dowJones.startTime,
        habilitado: configData.trainingStartDates.dowJones.enabled
      });
    } else {
      console.error('❌ Error al guardar la configuración:', saveResponse.data);
    }

  } catch (error) {
    console.error('❌ Error al inicializar la configuración:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar el script
initializeSiteConfig();
