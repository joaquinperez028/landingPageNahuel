import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Training from '@/models/Training';
import { generateCircularAvatarDataURL } from '@/lib/utils';

/**
 * API endpoint para obtener información de entrenamientos por tipo
 * GET /api/entrenamientos/[tipo]
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();
    
    const { tipo } = req.query;

    if (!tipo || !['SwingTrading', 'DowJones', 'DayTrading'].includes(tipo as string)) {
      return res.status(400).json({ error: 'Tipo de entrenamiento inválido' });
    }

    console.log('📚 Obteniendo información del entrenamiento:', tipo);

    // Buscar el entrenamiento por tipo
    let training = await Training.findOne({ tipo });

    if (!training) {
      // Crear datos por defecto si no existe
      const defaultData = {
            SwingTrading: {
      tipo: 'SwingTrading',
          nombre: 'Trading Fundamentals',
          descripcion: 'Programa completo de trading desde cero hasta nivel intermedio con metodología step-by-step',
          videoMux: 'trading-fundamentals-intro',
          precio: 10,
          duracion: 40,
          metricas: {
            rentabilidad: 120,
            estudiantesActivos: 850,
            entrenamientosRealizados: 150,
            satisfaccion: 4.8
          },
          contenido: {
            modulos: 12,
            lecciones: 85,
            certificacion: true,
            nivelAcceso: 'Básico a Intermedio'
          },
          solicitudes: [],
          horarios: [],
          activo: true
        },
        DowJones: {
          tipo: 'DowJones',
          nombre: 'Dow Jones - Estrategias Avanzadas',
          descripcion: 'Técnicas institucionales y estrategias avanzadas de trading profesional para traders experimentados',
          videoMux: 'dow-jones-intro',
          precio: 20,
          duracion: 60,
          metricas: {
            rentabilidad: 180,
            estudiantesActivos: 320,
            entrenamientosRealizados: 80,
            satisfaccion: 4.9
          },
          contenido: {
            modulos: 16,
            lecciones: 120,
            certificacion: true,
            nivelAcceso: 'Avanzado'
          },
          solicitudes: [],
          horarios: [],
          activo: true
        },
        DayTrading: {
          tipo: 'DayTrading',
          nombre: 'Day Trading - Estrategias Avanzadas',
          descripcion: 'Domina el arte del Day Trading con estrategias profesionales y técnicas avanzadas de trading intradía.',
          videoMux: 'day-trading-intro',
          precio: 997,
          duracion: 45,
          metricas: {
            rentabilidad: 250,
            estudiantesActivos: 500,
            entrenamientosRealizados: 150,
            satisfaccion: 4.9
          },
          contenido: {
            modulos: 12,
            lecciones: 85,
            certificacion: true,
            nivelAcceso: 'Avanzado'
          },
          solicitudes: [],
          horarios: [],
          activo: true
        }
      };

      training = new Training(defaultData[tipo as keyof typeof defaultData]);
      await training.save();
    }

    // Preparar datos para el frontend (sin solicitudes sensibles)
    const trainingData = {
      tipo: training.tipo,
      nombre: training.nombre,
      descripcion: training.descripcion,
      videoMux: training.videoMux,
      precio: training.precio,
      duracion: training.duracion,
      metricas: {
        rentabilidad: `${training.metricas.rentabilidad}%`,
        estudiantesActivos: training.metricas.estudiantesActivos.toLocaleString(),
        entrenamientosRealizados: training.metricas.entrenamientosRealizados.toString(),
        satisfaccion: training.metricas.satisfaccion.toFixed(1)
      },
      contenido: training.contenido,
      horarios: training.horarios.filter((h: any) => h.activo),
      activo: training.activo
    };

    // Generar programa de ejemplo basado en el tipo
    const programaEjemplo = {
      SwingTrading: [
        {
          module: 1,
          title: "Fundamentos del Trading",
          duration: "3 horas",
          lessons: 8,
          topics: ["Conceptos básicos", "Tipos de mercados", "Análisis fundamental", "Psicología del trader"],
          description: "Introducción completa al mundo del trading profesional"
        },
        {
          module: 2,
          title: "Análisis Técnico",
          duration: "4 horas",
          lessons: 12,
          topics: ["Gráficos y patrones", "Indicadores técnicos", "Soportes y resistencias", "Tendencias"],
          description: "Domina las herramientas de análisis técnico más efectivas"
        },
        {
          module: 3,
          title: "Gestión de Riesgo",
          duration: "3 horas",
          lessons: 10,
          topics: ["Money management", "Stop loss", "Take profit", "Sizing de posiciones"],
          description: "Aprende a proteger tu capital y maximizar ganancias"
        }
      ],
      DowJones: [
        {
          module: 1,
          title: "Estrategias Institucionales",
          duration: "5 horas",
          lessons: 15,
          topics: ["Order flow", "Market microstructure", "Algoritmos institucionales", "Dark pools"],
          description: "Técnicas utilizadas por los grandes fondos de inversión"
        },
        {
          module: 2,
          title: "Trading Algorítmico",
          duration: "4 horas",
          lessons: 12,
          topics: ["Automatización", "Backtesting", "Optimización", "Ejecución algorítmica"],
          description: "Desarrolla y optimiza sistemas de trading automatizados"
        },
        {
          module: 3,
          title: "Análisis Cuantitativo",
          duration: "4 horas",
          lessons: 14,
          topics: ["Modelos matemáticos", "Estadística avanzada", "Machine learning", "Risk modeling"],
          description: "Análisis cuantitativo avanzado para decisiones profesionales"
        }
      ],
      DayTrading: [
        {
          module: 1,
          title: "Fundamentos del Day Trading",
          duration: "4 horas",
          lessons: 12,
          topics: ["Conceptos básicos", "Mercados y horarios", "Plataformas de trading", "Tipos de órdenes"],
          description: "Establece las bases sólidas para tu carrera como day trader"
        },
        {
          module: 2,
          title: "Análisis Técnico Avanzado",
          duration: "5 horas",
          lessons: 15,
          topics: ["Patrones de velas", "Soportes y resistencias", "Indicadores técnicos", "Volume profile"],
          description: "Domina las herramientas de análisis técnico más efectivas"
        },
        {
          module: 3,
          title: "Estrategias de Scalping",
          duration: "4 horas",
          lessons: 13,
          topics: ["Scalping básico", "M1 y M5 timeframes", "Order flow", "High frequency trading"],
          description: "Técnicas de scalping para ganancias rápidas y consistentes"
        },
        {
          module: 4,
          title: "Gestión de Riesgo",
          duration: "3 horas",
          lessons: 10,
          topics: ["Position sizing", "Stop loss dinámico", "Risk/reward ratio", "Drawdown management"],
          description: "Protege tu capital con estrategias profesionales de gestión de riesgo"
        },
        {
          module: 5,
          title: "Psicología del Day Trading",
          duration: "3 horas",
          lessons: 8,
          topics: ["Control emocional", "Disciplina", "FOMO y revenge trading", "Mindset ganador"],
          description: "Desarrolla la mentalidad correcta para ser un trader exitoso"
        }
      ]
    };

    // Generar testimonios de ejemplo
    const testimoniosEjemplo = {
      SwingTrading: [
        {
          name: "Carlos Mendoza",
          role: "Trader Independiente",
          content: "El programa me dio las bases sólidas que necesitaba. En 6 meses pasé de novato a trader consistente.",
          rating: 5,
          image: generateCircularAvatarDataURL("Carlos Mendoza", "#3b82f6", "#ffffff", 80),
          results: "+85% rentabilidad anual"
        },
        {
          name: "Ana García",
          role: "Inversora",
          content: "Metodología clara y práctica. Los conceptos se explican de forma muy entendible.",
          rating: 5,
          image: generateCircularAvatarDataURL("Ana García", "#10b981", "#ffffff", 80),
          results: "Portfolio diversificado exitoso"
        }
      ],
      DowJones: [
        {
          name: "Roberto Silva",
          role: "Trader Profesional",
          content: "Las estrategias institucionales revolucionaron mi trading. Resultados excepcionales.",
          rating: 5,
          image: generateCircularAvatarDataURL("Roberto Silva", "#8b5cf6", "#ffffff", 80),
          results: "+240% rentabilidad anual"
        },
        {
          name: "María López",
          role: "Fund Manager",
          content: "Técnicas de nivel institucional que realmente funcionan en mercados reales.",
          rating: 5,
          image: generateCircularAvatarDataURL("María López", "#f59e0b", "#ffffff", 80),
          results: "Gestión de $2M+ exitosa"
        }
      ],
      DayTrading: [
        {
          name: "Diego Ramírez",
          role: "Day Trader Profesional",
          content: "El programa me enseñó a ser consistente en el day trading. Ahora genero ingresos diarios estables.",
          rating: 5,
          image: generateCircularAvatarDataURL("Diego Ramírez", "#ef4444", "#ffffff", 80),
          results: "+180% en 6 meses"
        },
        {
          name: "Sofía Torres",
          role: "Trader Independiente",
          content: "Las estrategias de scalping cambiaron mi vida. Pude dejar mi trabajo y vivir del trading.",
          rating: 5,
          image: generateCircularAvatarDataURL("Sofía Torres", "#06b6d4", "#ffffff", 80),
          results: "$5,000 USD/mes"
        },
        {
          name: "Andrés Vega",
          role: "Ex-Ingeniero",
          content: "La gestión de riesgo que enseñan es increíble. Nunca más tuve pérdidas devastadoras.",
          rating: 5,
          image: generateCircularAvatarDataURL("Andrés Vega", "#84cc16", "#ffffff", 80),
          results: "Drawdown máximo 5%"
        }
      ]
    };

    console.log('✅ Información del entrenamiento obtenida:', tipo);

    return res.status(200).json({
      success: true,
      data: {
        training: trainingData,
        program: programaEjemplo[tipo as keyof typeof programaEjemplo] || [],
        testimonials: testimoniosEjemplo[tipo as keyof typeof testimoniosEjemplo] || []
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo información del entrenamiento:', error);
    return res.status(500).json({ 
      error: 'Error obteniendo información del entrenamiento',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 