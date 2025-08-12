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
import ClassCalendar from '@/components/ClassCalendar';
import SwingTradingFAQ from '@/components/SwingTradingFAQ';
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
  Quote,
  Loader,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import styles from '@/styles/SwingTrading.module.css';

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

interface RoadmapModule {
  id: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  lecciones: number;
  temas: Array<{
    titulo: string;
    descripcion?: string;
  }>;
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
  prerequisito?: number;
  orden: number;
  activo: boolean;
}

interface TrainingDate {
  id: string;
  date: Date;
  time: string;
  title: string;
  isActive: boolean;
  createdBy: string;
}

interface DayTradingPageProps {
  training: TrainingData;
  program: ProgramModule[];
  testimonials: Testimonial[];
  roadmap: RoadmapModule[];
  trainingDates: TrainingDate[];
}

const DayTradingPage: React.FC<DayTradingPageProps> = ({ 
  training, 
  program, 
  testimonials, 
  roadmap, 
  trainingDates 
}) => {
  const { data: session } = useSession();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleEnrollment = async () => {
    if (!session) {
      signIn('google');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/entrenamientos/inscribir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'DayTrading',
          nombre: training.nombre,
          precio: training.precio
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error('Error creando checkout:', data.error);
        toast.error('Error al procesar el pago. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <>
      <Head>
        <title>Day Trading - Estrategias Avanzadas | Nahuel Lozano</title>
        <meta name="description" content="Domina el Day Trading con estrategias profesionales. Aprende técnicas avanzadas de trading intradía y maximiza tus ganancias." />
        <meta name="keywords" content="day trading, trading intradía, estrategias trading, curso trading, scalping" />
        <meta property="og:title" content="Day Trading - Estrategias Avanzadas" />
        <meta property="og:description" content="Domina el Day Trading con estrategias profesionales y técnicas avanzadas." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lozanonahuel.vercel.app/entrenamientos/day-trading" />
        <link rel="canonical" href="https://lozanonahuel.vercel.app/entrenamientos/day-trading" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.heroContent}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.heroText}>
                <motion.h1 
                  className={styles.heroTitle}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Day Trading
                  <span className={styles.heroSubtitle}>Estrategias Avanzadas</span>
                </motion.h1>
                
                <motion.p 
                  className={styles.heroDescription}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {training.descripcion || "Domina el arte del Day Trading con estrategias profesionales. Aprende técnicas avanzadas de trading intradía, gestión de riesgo y psicología del trader para maximizar tus ganancias en los mercados financieros."}
                </motion.p>

                <motion.div 
                  className={styles.heroFeatures}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>{training.contenido?.modulos || 12} Módulos Completos</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>{training.contenido?.lecciones || 85} Lecciones en Video</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Acceso de por Vida</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Certificación Incluida</span>
                  </div>
                </motion.div>

                <motion.div 
                  className={styles.heroActions}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <button 
                    onClick={handleEnrollment}
                    className={styles.ctaButton}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={20} className={styles.spinner} />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Inscribirme Ahora
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  
                  <div className={styles.priceInfo}>
                    <span className={styles.price}>${training.precio?.toLocaleString() || '997'}</span>
                    <span className={styles.priceLabel}>Pago único</span>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className={styles.heroVisual}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className={styles.videoContainer}>
                  <div className={styles.videoPlaceholder}>
                    <PlayCircle size={80} />
                    <span>Video Promocional</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className={styles.metricsSection}>
          <div className={styles.container}>
            <div className={styles.metricsGrid}>
              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <TrendingUp size={40} className={styles.metricIcon} />
                <h3 className={styles.metricNumber}>{training.metricas?.rentabilidad || '+250%'}</h3>
                <p className={styles.metricLabel}>Rentabilidad Promedio</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Users size={40} className={styles.metricIcon} />
                <h3 className={styles.metricNumber}>{training.metricas?.estudiantesActivos || '500'}+</h3>
                <p className={styles.metricLabel}>Estudiantes Activos</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Award size={40} className={styles.metricIcon} />
                <h3 className={styles.metricNumber}>{training.metricas?.entrenamientosRealizados || '150'}+</h3>
                <p className={styles.metricLabel}>Entrenamientos Realizados</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Star size={40} className={styles.metricIcon} />
                <h3 className={styles.metricNumber}>{training.metricas?.satisfaccion || '4.9'}/5</h3>
                <p className={styles.metricLabel}>Satisfacción</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Program Section */}
        <section className={styles.programSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Programa de Estudios</h2>
              <p className={styles.sectionDescription}>
                Curriculum completo diseñado para llevarte desde principiante hasta trader profesional
              </p>
            </motion.div>

            <div className={styles.programGrid}>
              {program.map((module, index) => (
                <motion.div 
                  key={module.module}
                  className={styles.programCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.programHeader}>
                    <span className={styles.moduleNumber}>Módulo {module.module}</span>
                    <span className={styles.moduleDuration}>{module.duration}</span>
                  </div>
                  
                  <h3 className={styles.programTitle}>{module.title}</h3>
                  <p className={styles.programDescription}>{module.description}</p>
                  
                  <div className={styles.programMeta}>
                    <span className={styles.programLessons}>
                      <BookOpen size={16} />
                      {module.lessons} lecciones
                    </span>
                  </div>

                  <ul className={styles.programTopics}>
                    {module.topics.slice(0, 3).map((topic, topicIndex) => (
                      <li key={topicIndex}>{topic}</li>
                    ))}
                    {module.topics.length > 3 && (
                      <li className={styles.moreTopics}>+{module.topics.length - 3} temas más</li>
                    )}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className={styles.roadmapSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Hoja de Ruta del Aprendizaje</h2>
              <p className={styles.sectionDescription}>
                Sigue este camino estructurado para dominar el Day Trading paso a paso
              </p>
            </motion.div>

            <TrainingRoadmap 
              modules={roadmap} 
            />
          </div>
        </section>

        {/* Calendar Section */}
        <section className={styles.calendarSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Próximas Clases en Vivo</h2>
              <p className={styles.sectionDescription}>
                Únete a nuestras sesiones en vivo para resolver dudas y practicar en tiempo real
              </p>
            </motion.div>

            <ClassCalendar 
              events={trainingDates}
            />
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={styles.testimonialsSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Lo que dicen nuestros estudiantes</h2>
              <p className={styles.sectionDescription}>
                Resultados reales de traders que transformaron su futuro financiero
              </p>
            </motion.div>

            <div className={styles.testimonialCarousel}>
              <button 
                onClick={prevTestimonial}
                className={styles.testimonialArrow}
                aria-label="Testimonio anterior"
              >
                <ChevronLeft size={24} />
              </button>

              <motion.div 
                className={styles.testimonialCard}
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.testimonialContent}>
                  <Quote size={40} className={styles.quoteIcon} />
                  <p className={styles.testimonialText}>
                    {testimonials[currentTestimonial]?.content}
                  </p>
                  
                  <div className={styles.testimonialAuthor}>
                    <img 
                      src={testimonials[currentTestimonial]?.image || generateCircularAvatarDataURL(testimonials[currentTestimonial]?.name || 'Usuario')}
                      alt={testimonials[currentTestimonial]?.name}
                      className={styles.authorImage}
                    />
                    <div className={styles.authorInfo}>
                      <h4 className={styles.authorName}>{testimonials[currentTestimonial]?.name}</h4>
                      <p className={styles.authorRole}>{testimonials[currentTestimonial]?.role}</p>
                      <div className={styles.testimonialRating}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < (testimonials[currentTestimonial]?.rating || 5) ? styles.starFilled : styles.starEmpty}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.testimonialResults}>
                    <span className={styles.resultsLabel}>Resultado:</span>
                    <span className={styles.resultsValue}>{testimonials[currentTestimonial]?.results}</span>
                  </div>
                </div>
              </motion.div>

              <button 
                onClick={nextTestimonial}
                className={styles.testimonialArrow}
                aria-label="Siguiente testimonio"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className={styles.testimonialIndicators}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`${styles.testimonialIndicator} ${
                    index === currentTestimonial ? styles.testimonialIndicatorActive : ''
                  }`}
                  aria-label={`Ver testimonio ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
              <p className={styles.sectionDescription}>
                Resolvemos las dudas más comunes sobre el programa de Day Trading
              </p>
            </motion.div>

            <SwingTradingFAQ />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className={styles.finalCtaSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.ctaContent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.ctaTitle}>
                ¿Listo para dominar el Day Trading?
              </h2>
              <p className={styles.ctaDescription}>
                Únete a cientos de traders exitosos y transforma tu futuro financiero
              </p>
              
              <div className={styles.ctaActions}>
                <button 
                  onClick={handleEnrollment}
                  className={styles.ctaButton}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader size={20} className={styles.spinner} />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Comenzar Ahora
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
                
                <div className={styles.ctaPriceInfo}>
                  <span className={styles.ctaPrice}>${training.precio?.toLocaleString() || '997'}</span>
                  <span className={styles.ctaPriceLabel}>Inversión única - Acceso de por vida</span>
                </div>
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
  try {
    // Obtener datos del entrenamiento desde la API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/entrenamientos/DayTrading`);
    
    if (!response.ok) {
      throw new Error('Error fetching training data');
    }
    
    const data = await response.json();
    
    // Obtener roadmap
    const roadmapResponse = await fetch(`${baseUrl}/api/roadmaps/tipo/DayTrading`);
    let roadmap = [];
    if (roadmapResponse.ok) {
      const roadmapData = await roadmapResponse.json();
      roadmap = roadmapData.data || [];
    }

    // Obtener fechas de entrenamientos
    const datesResponse = await fetch(`${baseUrl}/api/training-dates/DayTrading`);
    let trainingDates = [];
    if (datesResponse.ok) {
      const datesData = await datesResponse.json();
      trainingDates = datesData.data || [];
    }
    
    return {
      props: {
        training: data.data.training,
        program: data.data.program,
        testimonials: data.data.testimonials,
        roadmap,
        trainingDates
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Datos de fallback en caso de error
    return {
      props: {
        training: {
          tipo: 'DayTrading',
          nombre: 'Day Trading - Estrategias Avanzadas',
          descripcion: 'Domina el arte del Day Trading con estrategias profesionales y técnicas avanzadas de trading intradía.',
          precio: 997,
          duracion: 45,
          metricas: {
            rentabilidad: '250%',
            estudiantesActivos: '500',
            entrenamientosRealizados: '150',
            satisfaccion: '4.9'
          },
          contenido: {
            modulos: 12,
            lecciones: 85,
            certificacion: true,
            nivelAcceso: 'Avanzado'
          }
        },
        program: [
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
            title: "Gestión de Riesgo",
            duration: "3 horas",
            lessons: 10,
            topics: ["Position sizing", "Stop loss", "Risk/reward ratio", "Drawdown management"],
            description: "Protege tu capital con estrategias profesionales de gestión de riesgo"
          }
        ],
        testimonials: [
          {
            name: "Carlos Mendoza",
            role: "Day Trader Profesional",
            content: "Gracias al programa de Day Trading pude dejar mi trabajo y dedicarme completamente al trading. Los resultados han sido increíbles.",
            rating: 5,
            image: "",
            results: "+180% en 6 meses"
          }
        ],
        roadmap: [],
        trainingDates: []
      }
    };
  }
};

export default DayTradingPage;
