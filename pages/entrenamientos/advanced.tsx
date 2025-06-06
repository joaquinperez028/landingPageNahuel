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

interface AdvancedTradingPageProps {
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

const AdvancedTradingStrategiesPage: React.FC<AdvancedTradingPageProps> = ({ 
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
        window.location.href = `/payment/training-advanced?date=${selectedTraining}`;
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
        <title>Dow Jones - Entrenamiento Profesional | Nahuel Lozano</title>
        <meta name="description" content="Programa avanzado de trading para expertos. Trading algorítmico, análisis cuantitativo, estrategias institucionales y técnicas de alto nivel profesional." />
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
                  Dow Jones
                  <span className={styles.heroSubtitle}>Técnicas Institucionales de Alto Nivel</span>
                </h1>
                <p className={styles.heroDescription}>
                  Programa exclusivo para traders experimentados que buscan dominar las estrategias 
                  más sofisticadas del mercado. Aprende trading algorítmico, análisis cuantitativo, 
                  técnicas institucionales y gestión avanzada de portafolios con metodología de nivel profesional.
                </p>
                <div className={styles.heroFeatures}>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>120 lecciones de nivel experto con casos reales</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Estrategias utilizadas por fondos institucionales</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Mentoring personalizado y acceso a comunidad elite</span>
                  </div>
                </div>
              </div>
              <div className={styles.heroVideo}>
                <div className={styles.videoContainer}>
                  {/* Placeholder de video explicativo */}
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.placeholderIcon}>🚀</div>
                    <h3 className={styles.placeholderTitle}>Video del Programa Avanzado</h3>
                    <p className={styles.placeholderText}>
                      Descubre las técnicas más sofisticadas del trading profesional institucional
                    </p>
                    <div className={styles.placeholderFeatures}>
                      <span>⚡ Trading Algorítmico</span>
                      <span>📊 Análisis Cuantitativo</span>
                      <span>🏛️ Estrategias Institucionales</span>
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
                <p className={styles.metricLabel}>Traders Profesionales</p>
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
                <p className={styles.metricLabel}>Precisión Algorítmica</p>
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
              Testimonios de Traders Profesionales
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Experiencias de traders que ahora dominan estrategias institucionales
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
              Programa del Entrenamiento Avanzado
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Roadmap estructurado para tu desarrollo como trader institucional
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
              Próximos Entrenamientos Avanzados
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Selecciona la fecha que mejor se adapte a tu agenda profesional
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
                  ¿Listo para el Nivel Profesional?
                </h2>
                <p className={styles.enrollDescription}>
                  Únete a más de 350 traders profesionales que dominan estrategias institucionales avanzadas
                </p>
                <div className={styles.enrollPrice}>
                  <span className={styles.priceLabel}>Precio del programa avanzado:</span>
                  <span className={styles.price}>$599 USD</span>
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
    totalStudents: '350+',
    completionRate: '96%',
    averageRating: '4.9/5',
    jobSuccess: '94%'
  };

  const testimonials = [
    {
      name: 'Andrés Rodriguez',
      role: 'Quant Developer & Trader',
      content: 'El programa avanzado llevó mi trading a otro nivel. Las técnicas algorítmicas que enseña Nahuel son las que usan los hedge funds. Ahora automatizo estrategias con 94% de precisión.',
      rating: 5,
      image: '/testimonials/andres-rodriguez.jpg',
      results: 'Algoritmos con 94% de precisión y ROI del 180%'
    },
    {
      name: 'Lucía Fernández',
      role: 'Portfolio Manager Institucional',
      content: 'Las estrategias institucionales son increíbles. Aprendí técnicas que jamás imaginé. El análisis cuantitativo me permitió optimizar portafolios de $2M con drawdowns mínimos.',
      rating: 5,
      image: '/testimonials/lucia-fernandez.jpg',
      results: 'Gestiona portafolios de $2M con drawdown <3%'
    },
    {
      name: 'Diego Morales',
      role: 'Prop Trader & Fund Manager',
      content: 'Después del programa avanzado conseguí trabajo en un prop trading firm. Las técnicas de backtesting avanzado y gestión de riesgo institucional fueron clave para mi éxito profesional.',
      rating: 5,
      image: '/testimonials/diego-morales.jpg',
      results: 'Contratado en firm con salario de $120K/año'
    }
  ];

  const program = [
    {
      module: 1,
      title: 'Trading Algorítmico y Automatización',
      duration: '12 horas',
      lessons: 25,
      description: 'Desarrollo e implementación de algoritmos de trading automatizados con Python y plataformas profesionales.',
      topics: [
        'Programación de algoritmos en Python/MQL5',
        'APIs de brokers y conexión a mercados',
        'Estrategias de alta frecuencia (HFT)',
        'Machine Learning aplicado al trading'
      ]
    },
    {
      module: 2,
      title: 'Análisis Cuantitativo Avanzado',
      duration: '10 horas',
      lessons: 20,
      description: 'Modelos matemáticos y estadísticos sofisticados para optimización y evaluación de estrategias.',
      topics: [
        'Modelos estadísticos y regresiones',
        'Monte Carlo y simulaciones',
        'Teoría de portafolios moderna',
        'Optimización de parámetros avanzada'
      ]
    },
    {
      module: 3,
      title: 'Estrategias Institucionales',
      duration: '14 horas',
      lessons: 28,
      description: 'Técnicas y metodologías utilizadas por fondos de inversión, hedge funds e instituciones financieras.',
      topics: [
        'Arbitraje y market making',
        'Long/Short equity strategies',
        'Pairs trading y statistical arbitrage',
        'Risk parity y factor investing'
      ]
    },
    {
      module: 4,
      title: 'Backtesting y Validación Rigurosa',
      duration: '8 horas',
      lessons: 16,
      description: 'Metodologías profesionales para validación histórica y evaluación robusta de estrategias.',
      topics: [
        'Backtesting libre de sesgos',
        'Walk-forward analysis',
        'Out-of-sample testing',
        'Stress testing y robustez'
      ]
    },
    {
      module: 5,
      title: 'Gestión Avanzada de Portafolios',
      duration: '10 horas',
      lessons: 20,
      description: 'Optimización y construcción de portafolios institucionales con técnicas de vanguardia.',
      topics: [
        'Mean-variance optimization',
        'Black-Litterman model',
        'Risk budgeting avanzado',
        'Alternative risk premia'
      ]
    },
    {
      module: 6,
      title: 'Instrumentos Derivados Complejos',
      duration: '16 horas',
      lessons: 32,
      description: 'Estrategias sofisticadas con opciones, futuros y productos estructurados para instituciones.',
      topics: [
        'Volatility trading y surface modeling',
        'Exotic options y structured products',
        'Delta hedging y gamma scalping',
        'Multi-asset derivatives strategies'
      ]
    }
  ];

  const upcomingTrainings = [
    {
      id: 'feb-adv-2024-1',
      date: '20 de Febrero, 2024',
      time: '18:00 - 21:00 GMT-3',
      spots: 8,
      type: 'Masterclass Intensiva'
    },
    {
      id: 'mar-adv-2024-1',
      date: '10 de Marzo, 2024',
      time: '18:00 - 21:00 GMT-3',
      spots: 6,
      type: 'Masterclass Intensiva'
    },
    {
      id: 'mar-adv-2024-2',
      date: '25 de Marzo, 2024',
      time: '09:00 - 12:00 GMT-3',
      spots: 10,
      type: 'Workshop de Fin de Semana'
    },
    {
      id: 'abr-adv-2024-1',
      date: '15 de Abril, 2024',
      time: '18:00 - 21:00 GMT-3',
      spots: 12,
      type: 'Masterclass Intensiva'
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

export default AdvancedTradingStrategiesPage; 