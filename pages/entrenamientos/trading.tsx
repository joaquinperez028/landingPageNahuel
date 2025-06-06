import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
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

interface TradingPageProps {
  metrics: {
    totalStudents: string;
    completionRate: string;
    averageRating: string;
    jobSuccess: string;
  };
  testimonials: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
    image: string;
    results: string;
  }>;
  program: Array<{
    module: number;
    title: string;
    duration: string;
    lessons: number;
    topics: string[];
    description: string;
  }>;
  upcomingTrainings: Array<{
    id: string;
    date: string;
    time: string;
    spots: number;
    type: string;
  }>;
}

const TradingFundamentalsPage: React.FC<TradingPageProps> = ({ 
  metrics, 
  testimonials, 
  program, 
  upcomingTrainings 
}) => {
  const { data: session } = useSession();
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);

  const handleEnroll = () => {
    if (!session) {
      alert('Debes iniciar sesión primero para inscribirte');
      signIn('google');
    } else {
      if (selectedTraining) {
        // Aquí iría la lógica de inscripción
        window.location.href = `/payment/training-fundamentals?date=${selectedTraining}`;
      } else {
        alert('Por favor selecciona una fecha de entrenamiento');
      }
    }
  };

  const handleTrainingSelect = (trainingId: string) => {
    setSelectedTraining(trainingId);
  };

  return (
    <>
      <Head>
        <title>Trading Fundamentals - Entrenamiento Completo | Nahuel Lozano</title>
        <meta name="description" content="Aprende los fundamentos del trading profesional. Programa completo desde cero hasta nivel intermedio con análisis técnico, fundamental y gestión de riesgo." />
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
                  Trading Fundamentals
                  <span className={styles.heroSubtitle}>Domina los Fundamentos del Trading Profesional</span>
                </h1>
                <p className={styles.heroDescription}>
                  Programa completo diseñado para llevarte desde cero hasta convertirte en un trader 
                  competente. Aprende análisis técnico, fundamental, gestión de riesgo y psicología 
                  del trading con metodología step-by-step y casos reales.
                </p>
                <div className={styles.heroFeatures}>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>85 lecciones estructuradas progresivamente</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Metodología probada con 850+ estudiantes</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Soporte personalizado y comunidad privada</span>
                  </div>
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

        {/* Números con Datos Actualizables */}
        <section className={styles.metricsSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Números con Datos Actualizables
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
                <h3 className={styles.metricNumber}>{metrics.totalStudents}</h3>
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
                <h3 className={styles.metricNumber}>{metrics.completionRate}</h3>
                <p className={styles.metricLabel}>Tasa de Completación</p>
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
                <h3 className={styles.metricNumber}>{metrics.averageRating}</h3>
                <p className={styles.metricLabel}>Puntuación Promedio</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className={styles.metricIcon}>
                  <TrendingUp size={40} />
                </div>
                <h3 className={styles.metricNumber}>{metrics.jobSuccess}</h3>
                <p className={styles.metricLabel}>Éxito de Estrategias</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className={styles.testimonialsSection}>
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
              Descubre las experiencias de estudiantes que han transformado su trading
            </motion.p>
            
            <motion.div 
              className={styles.carouselContainer}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Carousel 
                items={testimonials.map((testimonial, index) => (
                  <div key={index} className={styles.testimonialCard}>
                    <div className={styles.testimonialHeader}>
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className={styles.testimonialImage}
                      />
                      <div className={styles.testimonialInfo}>
                        <h4 className={styles.testimonialName}>{testimonial.name}</h4>
                        <p className={styles.testimonialRole}>{testimonial.role}</p>
                        <div className={styles.testimonialRating}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              fill={i < testimonial.rating ? "#fbbf24" : "none"}
                              stroke={i < testimonial.rating ? "#fbbf24" : "#d1d5db"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={styles.testimonialContent}>
                      <Quote size={24} className={styles.quoteIcon} />
                      <p className={styles.testimonialText}>{testimonial.content}</p>
                      <div className={styles.testimonialResults}>
                        <strong>Resultado: </strong>{testimonial.results}
                      </div>
                    </div>
                  </div>
                ))}
                autoplay={true}
                interval={6000}
                showDots={true}
                showArrows={true}
                itemsPerView={1}
              />
            </motion.div>
          </div>
        </section>

        {/* Programa/Roadmap del Entrenamiento */}
        <section className={styles.programSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Programa del Entrenamiento
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Roadmap estructurado para tu formación como trader profesional
            </motion.p>
            
            <div className={styles.programTimeline}>
              {program.map((module, index) => (
                <motion.div 
                  key={module.module}
                  className={styles.programModule}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className={styles.moduleNumber}>
                    Módulo {module.module}
                  </div>
                  <div className={styles.moduleContent}>
                    <h3 className={styles.moduleTitle}>{module.title}</h3>
                    <div className={styles.moduleInfo}>
                      <span><Clock size={16} /> {module.duration}</span>
                      <span><BookOpen size={16} /> {module.lessons} lecciones</span>
                    </div>
                    <p className={styles.moduleDescription}>{module.description}</p>
                    <div className={styles.moduleTopics}>
                      <h4>Contenido principal:</h4>
                      <ul>
                        {module.topics.map((topic, idx) => (
                          <li key={idx}>
                            <CheckCircle size={14} />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Próximos Entrenamientos */}
        <section className={styles.upcomingSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Próximos Entrenamientos
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Selecciona la fecha que mejor se adapte a tu disponibilidad
            </motion.p>
            
            <div className={styles.trainingGrid}>
              {upcomingTrainings.map((training, index) => (
                <motion.div 
                  key={training.id}
                  className={`${styles.trainingOption} ${selectedTraining === training.id ? styles.selected : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleTrainingSelect(training.id)}
                >
                  <div className={styles.trainingDate}>
                    <Calendar size={24} />
                    <div>
                      <h4>{training.date}</h4>
                      <p>{training.time}</p>
                    </div>
                  </div>
                  <div className={styles.trainingDetails}>
                    <span className={styles.trainingType}>{training.type}</span>
                    <span className={styles.trainingSpots}>
                      {training.spots} cupos disponibles
                    </span>
                  </div>
                  {selectedTraining === training.id && (
                    <div className={styles.selectedBadge}>
                      <CheckCircle size={20} />
                      Seleccionado
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Botón Inscribirse */}
        <section className={styles.enrollSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.enrollCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.enrollContent}>
                <h2 className={styles.enrollTitle}>
                  ¿Listo para Comenzar tu Formación?
                </h2>
                <p className={styles.enrollDescription}>
                  Únete a más de 850 estudiantes que ya dominan los fundamentos del trading profesional
                </p>
                <div className={styles.enrollPrice}>
                  <span className={styles.priceLabel}>Precio del programa:</span>
                  <span className={styles.price}>$299 USD</span>
                </div>
                <button 
                  className={styles.enrollButton}
                  onClick={handleEnroll}
                >
                  {session ? 'Inscribirme Ahora' : 'Iniciar Sesión e Inscribirme'}
                  <ArrowRight size={20} />
                </button>
                <p className={styles.enrollNote}>
                  {!session && 'Si no tienes cuenta activa, la tenés que hacer primero antes de continuar'}
                  {session && selectedTraining && 'Haz clic para proceder al pago'}
                  {session && !selectedTraining && 'Selecciona una fecha arriba para continuar'}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const metrics = {
    totalStudents: '850+',
    completionRate: '92%',
    averageRating: '4.8/5',
    jobSuccess: '89%'
  };

  const testimonials = [
    {
      name: 'Carlos Mendoza',
      role: 'Ingeniero convertido en Trader',
      content: 'El programa de Trading Fundamentals me dio las bases sólidas que necesitaba. En 6 meses pasé de no entender nada a tener mi primera estrategia rentable.',
      rating: 5,
      image: '/testimonials/carlos-mendoza.jpg',
      results: '45% de rentabilidad en su primer año'
    },
    {
      name: 'María González',
      role: 'Emprendedora y Trader',
      content: 'La metodología step-by-step es increíble. Nahuel explica conceptos complejos de manera simple. Ahora trading es mi segunda fuente de ingresos.',
      rating: 5,
      image: '/testimonials/maria-gonzalez.jpg',
      results: 'Genera $2,500 USD mensuales extras'
    },
    {
      name: 'Roberto Silva',
      role: 'Trader Profesional',
      content: 'Había probado otros cursos antes pero ninguno tan completo. La gestión de riesgo que enseña Nahuel me salvó de grandes pérdidas.',
      rating: 5,
      image: '/testimonials/roberto-silva.jpg',
      results: 'Redujo drawdown del 35% al 8%'
    }
  ];

  const program = [
    {
      module: 1,
      title: 'Fundamentos y Conceptos Básicos',
      duration: '6 horas',
      lessons: 12,
      description: 'Introducción al mundo del trading, terminología esencial y funcionamiento de los mercados financieros.',
      topics: [
        'Qué es el trading y tipos de mercados',
        'Brokers, spreads y comisiones',
        'Horarios de mercado y sesiones',
        'Tipos de órdenes y ejecución'
      ]
    },
    {
      module: 2,
      title: 'Análisis Técnico Fundamental',
      duration: '10 horas',
      lessons: 20,
      description: 'Domina la lectura de gráficos, patrones de precios e indicadores técnicos esenciales.',
      topics: [
        'Tipos de gráficos y timeframes',
        'Soporte, resistencia y tendencias',
        'Patrones de precios clásicos',
        'Indicadores técnicos principales'
      ]
    },
    {
      module: 3,
      title: 'Análisis Fundamental',
      duration: '8 horas',
      lessons: 16,
      description: 'Aprende a evaluar el valor intrínseco de activos usando datos económicos y financieros.',
      topics: [
        'Estados financieros y ratios',
        'Indicadores macroeconómicos',
        'Calendario económico',
        'Análisis sectorial y comparativo'
      ]
    },
    {
      module: 4,
      title: 'Gestión de Riesgo y Capital',
      duration: '8 horas',
      lessons: 16,
      description: 'Técnicas profesionales para proteger tu capital y maximizar el crecimiento.',
      topics: [
        'Position sizing y money management',
        'Stop loss y take profit efectivos',
        'Cálculo de riesgo-beneficio',
        'Diversificación de portafolio'
      ]
    },
    {
      module: 5,
      title: 'Psicología del Trading',
      duration: '6 horas',
      lessons: 15,
      description: 'Desarrolla la mentalidad correcta y controla las emociones en el trading.',
      topics: [
        'Psicología de mercados',
        'Control emocional y disciplina',
        'Sesgos cognitivos comunes',
        'Desarrollo de rutinas de trading'
      ]
    },
    {
      module: 6,
      title: 'Estrategias y Plan de Trading',
      duration: '6 horas',
      lessons: 12,
      description: 'Construye y backtestea estrategias personalizadas según tu perfil.',
      topics: [
        'Diseño de estrategias personalizadas',
        'Backtesting y optimización',
        'Plan de trading personal',
        'Evaluación y mejora continua'
      ]
    }
  ];

  const upcomingTrainings = [
    {
      id: 'feb-2024-1',
      date: '15 de Febrero, 2024',
      time: '19:00 - 22:00 GMT-3',
      spots: 12,
      type: 'Sesión Intensiva'
    },
    {
      id: 'feb-2024-2',
      date: '28 de Febrero, 2024',
      time: '19:00 - 22:00 GMT-3',
      spots: 8,
      type: 'Sesión Intensiva'
    },
    {
      id: 'mar-2024-1',
      date: '15 de Marzo, 2024',
      time: '19:00 - 22:00 GMT-3',
      spots: 15,
      type: 'Sesión Intensiva'
    },
    {
      id: 'mar-2024-2',
      date: '30 de Marzo, 2024',
      time: '10:00 - 13:00 GMT-3',
      spots: 20,
      type: 'Sesión de Fin de Semana'
    }
  ];
  
  return {
    props: {
      metrics,
      testimonials,
      program,
      upcomingTrainings
    }
  };
};

export default TradingFundamentalsPage; 