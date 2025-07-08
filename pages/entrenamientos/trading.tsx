import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { toast } from 'react-hot-toast';
import { generateCircularAvatarDataURL } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import TrainingRoadmap from '@/components/TrainingRoadmap';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Target,
  Award,
  PlayCircle,
  Calendar,
  User,
  Quote
} from 'lucide-react';
import styles from '@/styles/TradingFundamentals.module.css';
import { convertToNewRoadmapStructure } from '@/utils/roadmapAdapter';

interface TrainingData {
  tipo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  metricas: {
    rentabilidad: string;
    estudiantesActivos: string;
    entrenamientosRealizados: string;
    satisfaccion: string;
  };
  contenido: {
    modulos: number;
    lecciones: number;
    certificacion: boolean;
    nivelAcceso: string;
  };
}

interface ProgramModule {
  module: number;
  title: string;
  duration: string;
  lessons: number;
  topics: string[];
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  results: string;
}

interface TradingPageProps {
  training: TrainingData;
  program: ProgramModule[];
  testimonials: Testimonial[];
}

const TradingFundamentalsPage: React.FC<TradingPageProps> = ({ 
  training,
  program, 
  testimonials
}) => {
  const { data: session } = useSession();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    experienciaTrading: '',
    objetivos: '',
    nivelExperiencia: 'principiante',
    consulta: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        nombre: session.user.name || '',
        email: session.user.email || ''
      }));
      
      // Verificar si el usuario ya está inscrito
      checkEnrollmentStatus();
    }
  }, [session]);

  const checkEnrollmentStatus = async () => {
    if (!session?.user?.email) return;
    
    setCheckingEnrollment(true);
    try {
      const response = await fetch('/api/user/entrenamientos');
      if (response.ok) {
        const data = await response.json();
        const hasTrading = data.data.tiposDisponibles.includes('TradingFundamentals');
        setIsEnrolled(hasTrading);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnroll = () => {
    if (!session) {
      toast.error('Debes iniciar sesión primero para inscribirte');
      signIn('google');
      return;
    }
    
    if (isEnrolled) {
      // Si ya está inscrito, ir directamente a las lecciones
      window.location.href = '/entrenamientos/TradingFundamentals/lecciones';
      return;
    }
    
    setShowEnrollForm(true);
  };

  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnrolling(true);

    try {
      const response = await fetch('/api/entrenamientos/inscribir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo: 'TradingFundamentals',
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || '¡Inscripción exitosa! Redirigiendo a las lecciones...');
        setShowEnrollForm(false);
        
        // Resetear formulario
        setFormData({
          nombre: session?.user?.name || '',
          email: session?.user?.email || '',
          telefono: '',
          experienciaTrading: '',
          objetivos: '',
          nivelExperiencia: 'principiante',
          consulta: ''
        });

        // Redirigir a las lecciones después de 2 segundos
        setTimeout(() => {
          window.location.href = data.data.redirectUrl;
        }, 2000);
      } else {
        if (response.status === 409) {
          // Ya está inscrito
          toast.success('Ya tienes acceso a este entrenamiento. Redirigiendo a las lecciones...');
          setTimeout(() => {
            window.location.href = '/entrenamientos/TradingFundamentals/lecciones';
          }, 1500);
        } else {
          toast.error(data.error || 'Error al procesar inscripción');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar inscripción. Inténtalo nuevamente.');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Roadmap específico para Trading Fundamentals
  const tradingFundamentalsRoadmap = [
    {
      id: 1,
      title: "Introducción al Trading",
      description: "Fundamentos básicos del trading y configuración del entorno de trabajo",
      duration: "3 horas",
      lessons: 8,
      topics: [
        "¿Qué es el trading y cómo funciona?",
        "Diferencias entre inversión y trading",
        "Tipos de mercados financieros",
        "Configuración de plataformas",
        "Terminología básica",
        "Horarios de mercado globales",
        "Primeros pasos con capital demo",
        "Mentalidad del trader principiante"
      ],
      completed: true,
      difficulty: "Básico" as const
    },
    {
      id: 2,
      title: "Análisis Técnico Básico",
      description: "Herramientas fundamentales para leer gráficos y patrones de precios",
      duration: "5 horas",
      lessons: 12,
      topics: [
        "Tipos de gráficos (velas, líneas, barras)",
        "Timeframes y su importancia",
        "Soportes y resistencias básicos",
        "Tendencias alcistas, bajistas y laterales",
        "Volumen y su interpretación",
        "Patrones de velas japonesas",
        "Líneas de tendencia",
        "Fibonacci básico"
      ],
      completed: true,
      difficulty: "Básico" as const,
      prerequisite: 1
    },
    {
      id: 3,
      title: "Indicadores Técnicos",
      description: "Dominio de los indicadores más efectivos para tomar decisiones",
      duration: "4 horas",
      lessons: 10,
      topics: [
        "Medias móviles (SMA, EMA)",
        "RSI y interpretación de sobrecompra/sobreventa",
        "MACD y divergencias",
        "Bandas de Bollinger",
        "Estocástico",
        "ATR para volatilidad",
        "Combinación de indicadores",
        "Evitar el análisis paralítico"
      ],
      completed: false,
      difficulty: "Básico" as const,
      prerequisite: 2
    },
    {
      id: 4,
      title: "Gestión de Riesgo",
      description: "Técnicas esenciales para proteger tu capital y maximizar ganancias",
      duration: "4 horas",
      lessons: 9,
      topics: [
        "Regla del 1-2% por operación",
        "Cálculo de posición (position sizing)",
        "Stop Loss: colocación y tipos",
        "Take Profit y ratios R:R",
        "Trailing stops",
        "Diversificación de activos",
        "Money management avanzado",
        "Gestión emocional del riesgo"
      ],
      completed: false,
      difficulty: "Intermedio" as const,
      prerequisite: 3
    },
    {
      id: 5,
      title: "Estrategias de Trading",
      description: "Estrategias probadas para diferentes condiciones de mercado",
      duration: "5 horas",
      lessons: 13,
      topics: [
        "Estrategia de seguimiento de tendencia",
        "Trading en rangos y soportes/resistencias",
        "Breakouts y rupturas",
        "Pullbacks y retrocesos",
        "Scalping básico",
        "Swing trading",
        "Trading de noticias",
        "Adaptación a diferentes sesiones"
      ],
      completed: false,
      difficulty: "Intermedio" as const,
      prerequisite: 4
    },
    {
      id: 6,
      title: "Psicología del Trading",
      description: "Control emocional y disciplina mental para el éxito sostenido",
      duration: "3 horas",
      lessons: 8,
      topics: [
        "Emociones en el trading (miedo, codicia)",
        "Disciplina y paciencia",
        "Manejo de rachas perdedoras",
        "Overtrading y revenge trading",
        "Rutinas diarias del trader",
        "Journaling y autoevaluación",
        "Mentalidad de crecimiento",
        "Mantener la objetividad"
      ],
      completed: false,
      difficulty: "Intermedio" as const,
      prerequisite: 5
    },
    {
      id: 7,
      title: "Análisis Fundamental",
      description: "Comprensión de factores económicos que mueven los mercados",
      duration: "4 horas",
      lessons: 10,
      topics: [
        "Calendarios económicos",
        "Indicadores macroeconómicos clave",
        "Noticias de alto impacto",
        "Correlaciones entre activos",
        "Análisis sectorial básico",
        "Eventos geopolíticos",
        "Estacionalidad en mercados",
        "Combinando análisis técnico y fundamental"
      ],
      completed: false,
      difficulty: "Intermedio" as const,
      prerequisite: 6
    },
    {
      id: 8,
      title: "Backtesting y Optimización",
      description: "Validación de estrategias y mejora continua del sistema de trading",
      duration: "3 horas",
      lessons: 7,
      topics: [
        "Conceptos de backtesting",
        "Herramientas para backtest",
        "Métricas de rendimiento",
        "Optimización de parámetros",
        "Evitar el curve fitting",
        "Paper trading estructurado",
        "Evaluación de sistemas"
      ],
      completed: false,
      difficulty: "Intermedio" as const,
      prerequisite: 7
    },
    {
      id: 9,
      title: "Trading en Vivo - Práctica",
      description: "Aplicación práctica de todo lo aprendido en mercados reales",
      duration: "6 horas",
      lessons: 15,
      topics: [
        "Preparación pre-mercado",
        "Análisis de múltiples timeframes",
        "Identificación de setups",
        "Ejecución disciplinada",
        "Gestión de posiciones abiertas",
        "Análisis post-mercado",
        "Registro detallado de operaciones",
        "Ajustes y mejoras continuas"
      ],
      completed: false,
      difficulty: "Avanzado" as const,
      prerequisite: 8
    },
    {
      id: 10,
      title: "Plan de Trader Profesional",
      description: "Construcción de un plan integral para el crecimiento como trader",
      duration: "4 horas",
      lessons: 9,
      topics: [
        "Definición de objetivos SMART",
        "Plan de trading personalizado",
        "Escalamiento de capital",
        "Diversificación de estrategias",
        "Educación continua",
        "Networking en trading",
        "Consideraciones fiscales",
        "Transición a trader profesional"
      ],
      completed: false,
      difficulty: "Avanzado" as const,
      prerequisite: 9
    }
  ];

  // Simular progreso del usuario
  const currentModule = 3; // Módulo actual
  const completedModules = [1, 2]; // Módulos completados

  const handleModuleClick = (moduleId: number) => {
    console.log(`Accediendo al módulo ${moduleId}`);
    // Aquí se implementaría la navegación al módulo específico
  };

  return (
    <>
      <Head>
        <title>{training.nombre} - Entrenamiento Completo | Nahuel Lozano</title>
        <meta name="description" content={training.descripcion} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section con Video Explicativo */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.heroContent}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>
                  {training.nombre}
                  <span className={styles.heroSubtitle}>Domina los Fundamentos del Trading Profesional</span>
                </h1>
                <p className={styles.heroDescription}>
                  {training.descripcion}
                </p>
                <div className={styles.heroPricing}>
                  <div className={styles.priceCard}>
                    <span className={styles.priceAmount}>${training.precio} USD</span>
                    <span className={styles.priceDescription}>Programa completo de {training.duracion} horas</span>
                    <span className={styles.priceIncludes}>
                      {training.contenido.lecciones} lecciones • {training.contenido.modulos} módulos
                    </span>
                  </div>
                </div>
                <div className={styles.heroFeatures}>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>{training.contenido.lecciones} lecciones estructuradas progresivamente</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Metodología probada con {training.metricas.estudiantesActivos}+ estudiantes</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Soporte personalizado y comunidad privada</span>
                  </div>
                </div>
                <div className={styles.heroActions}>
                  <button 
                    onClick={handleEnroll}
                    className={styles.enrollButton}
                    disabled={checkingEnrollment}
                  >
                    <Users size={20} />
                    {checkingEnrollment 
                      ? 'Verificando...' 
                      : isEnrolled 
                        ? 'Ir a las Lecciones' 
                        : 'Inscribirme Ahora'
                    }
                  </button>
                </div>
              </div>
              <div className={styles.heroVideo}>
                <div className={styles.videoContainer}>
                  {/* Placeholder de video explicativo */}
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.placeholderIcon}>🎓</div>
                    <h3 className={styles.placeholderTitle}>Video Explicativo del Entrenamiento</h3>
                    <p className={styles.placeholderText}>
                      Descubre en detalle qué aprenderás en nuestro programa de Trading Fundamentals
                    </p>
                    <div className={styles.placeholderFeatures}>
                      <span>📊 Análisis Técnico Completo</span>
                      <span>📈 Estrategias Fundamentales</span>
                      <span>🎯 Gestión de Riesgo</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Formulario de Inscripción Modal */}
        {showEnrollForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
              <div className={styles.modalHeader}>
                <h3>Inscripción a {training.nombre}</h3>
                <button 
                  onClick={() => setShowEnrollForm(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitEnrollment} className={styles.enrollForm}>
                <div className={styles.formGroup}>
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Nivel de experiencia en trading</label>
                  <select
                    value={formData.nivelExperiencia}
                    onChange={(e) => setFormData({...formData, nivelExperiencia: e.target.value})}
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>¿Cuáles son tus objetivos con el trading?</label>
                  <textarea
                    value={formData.objetivos}
                    onChange={(e) => setFormData({...formData, objetivos: e.target.value})}
                    placeholder="Describe qué esperas lograr con este entrenamiento..."
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Experiencia previa (opcional)</label>
                  <textarea
                    value={formData.experienciaTrading}
                    onChange={(e) => setFormData({...formData, experienciaTrading: e.target.value})}
                    placeholder="Cuéntanos sobre tu experiencia previa en trading..."
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Consulta adicional (opcional)</label>
                  <textarea
                    value={formData.consulta}
                    onChange={(e) => setFormData({...formData, consulta: e.target.value})}
                    placeholder="¿Tienes alguna pregunta específica?"
                  />
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setShowEnrollForm(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isEnrolling}
                    className={styles.submitButton}
                  >
                    {isEnrolling ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Números con Datos Actualizables */}
        <section className={styles.metricsSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Números que Respaldan la Calidad
            </motion.h2>
            
            <div className={styles.metricsGrid}>
              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className={styles.metricIcon}>
                  <Users size={40} />
                </div>
                <h3 className={styles.metricNumber}>{training.metricas.estudiantesActivos}</h3>
                <p className={styles.metricLabel}>Estudiantes Formados</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.metricIcon}>
                  <Target size={40} />
                </div>
                <h3 className={styles.metricNumber}>{training.metricas.rentabilidad}</h3>
                <p className={styles.metricLabel}>Rentabilidad Promedio</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className={styles.metricIcon}>
                  <Star size={40} />
                </div>
                <h3 className={styles.metricNumber}>{training.metricas.satisfaccion}/5</h3>
                <p className={styles.metricLabel}>Satisfacción Promedio</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className={styles.metricIcon}>
                  <Award size={40} />
                </div>
                <h3 className={styles.metricNumber}>{training.metricas.entrenamientosRealizados}</h3>
                <p className={styles.metricLabel}>Entrenamientos Realizados</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Roadmap de Aprendizaje */}
        <section className={styles.roadmapSection}>
          <div className={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <TrainingRoadmap
                modules={convertToNewRoadmapStructure(tradingFundamentalsRoadmap)}
                onModuleClick={handleModuleClick}
                title="Roadmap de Trading Fundamentals"
                description="Progresión estructurada desde principiante hasta trader competente"
              />
            </motion.div>
          </div>
        </section>

        {/* Programa Detallado */}
        <section className={styles.programSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Programa Completo
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {training.contenido.modulos} módulos progresivos con {training.contenido.lecciones} lecciones prácticas
            </motion.p>
            
            <div className={styles.programGrid}>
              {program.map((module, index) => (
                <motion.div 
                  key={module.module}
                  className={styles.moduleCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.moduleHeader}>
                    <div className={styles.moduleNumber}>
                      <BookOpen size={24} />
                      <span>Módulo {module.module}</span>
                    </div>
                    <div className={styles.moduleMeta}>
                      <span className={styles.moduleDuration}>
                        <Clock size={16} />
                        {module.duration}
                      </span>
                      <span className={styles.moduleLessons}>
                        {module.lessons} lecciones
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.moduleContent}>
                    <h3 className={styles.moduleTitle}>{module.title}</h3>
                    <p className={styles.moduleDescription}>{module.description}</p>
                    
                    <div className={styles.moduleTopics}>
                      <h4>Temas principales:</h4>
                      <ul>
                        {module.topics.map((topic, topicIndex) => (
                          <li key={topicIndex}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        {testimonials && testimonials.length > 0 && (
          <section className={styles.testimoniosSection}>
            <div className={styles.container}>
              <motion.h2 
                className={styles.sectionTitle}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Testimonios de Estudiantes
              </motion.h2>
              <motion.p 
                className={styles.sectionDescription}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Resultados reales de estudiantes que transformaron su trading
              </motion.p>
              
              <div className={styles.testimoniosCarousel}>
                <Carousel 
                  items={testimonials.map((testimonial, index) => (
                    <div key={index} className={styles.testimonioCard}>
                      <div className={styles.testimonioHeader}>
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className={styles.testimonioFoto}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = generateCircularAvatarDataURL(testimonial.name, '#3b82f6', '#ffffff', 80);
                          }}
                        />
                        <div className={styles.testimonioInfo}>
                          <h4 className={styles.testimonioNombre}>{testimonial.name}</h4>
                          <span className={styles.testimonioRole}>{testimonial.role}</span>
                          <div className={styles.testimonioRating}>
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} size={16} fill="currentColor" />
                            ))}
                          </div>
                          <span className={styles.testimonioResultado}>{testimonial.results}</span>
                        </div>
                      </div>
                      <p className={styles.testimonioComentario}>"{testimonial.content}"</p>
                    </div>
                  ))}
                  autoplay={true}
                  showDots={true}
                  className={styles.testimoniosCarouselWrapper}
                />
              </div>
            </div>
          </section>
        )}

        {/* Call to Action Final */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.ctaContent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.ctaTitle}>
                ¿Listo para Transformar tu Trading?
              </h2>
              <p className={styles.ctaDescription}>
                Únete a los {training.metricas.estudiantesActivos}+ estudiantes que ya están aplicando 
                estas estrategias exitosamente.
              </p>
              <div className={styles.ctaPrice}>
                <span className={styles.ctaPriceAmount}>${training.precio} USD</span>
                <span className={styles.ctaPriceDescription}>
                  Programa completo • Acceso de por vida • Certificación incluida
                </span>
              </div>
              <button 
                onClick={handleEnroll}
                className={styles.ctaButton}
                disabled={checkingEnrollment}
              >
                <Users size={20} />
                {checkingEnrollment 
                  ? 'Verificando...' 
                  : isEnrolled 
                    ? 'Ir a las Lecciones' 
                    : 'Comenzar Ahora'
                }
                <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Obtener datos del entrenamiento desde la API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/entrenamientos/TradingFundamentals`);
    
    if (!response.ok) {
      throw new Error('Error fetching training data');
    }
    
    const data = await response.json();
    
    return {
      props: {
        training: data.data.training,
        program: data.data.program,
        testimonials: data.data.testimonials
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Datos de fallback en caso de error
    return {
      props: {
        training: {
          tipo: 'TradingFundamentals',
          nombre: 'Trading Fundamentals',
          descripcion: 'Programa completo de trading desde cero hasta nivel intermedio',
          precio: 497,
          duracion: 40,
          metricas: {
            rentabilidad: '120%',
            estudiantesActivos: '850',
            entrenamientosRealizados: '150',
            satisfaccion: '4.8'
          },
          contenido: {
            modulos: 12,
            lecciones: 85,
            certificacion: true,
            nivelAcceso: 'Básico a Intermedio'
          }
        },
        program: [],
        testimonials: []
      }
    };
  }
};

export default TradingFundamentalsPage; 