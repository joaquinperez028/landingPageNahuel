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

interface AdvancedTradingPageProps {
  training: TrainingData;
  program: ProgramModule[];
  testimonials: Testimonial[];
}

const AdvancedTradingStrategiesPage: React.FC<AdvancedTradingPageProps> = ({ 
  training,
  program, 
  testimonials
}) => {
  const { data: session } = useSession();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    experienciaTrading: '',
    objetivos: '',
    nivelExperiencia: 'avanzado',
    consulta: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        nombre: session.user.name || '',
        email: session.user.email || ''
      }));
    }
  }, [session]);

  const handleEnroll = () => {
    if (!session) {
      toast.error('Debes iniciar sesión primero para inscribirte');
      signIn('google');
      return;
    }
    setShowEnrollForm(true);
  };

  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnrolling(true);

    try {
      const response = await fetch('/api/entrenamientos/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo: 'DowJones',
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Solicitud enviada exitosamente! Te contactaremos pronto.');
        setShowEnrollForm(false);
        setFormData({
          nombre: session?.user?.name || '',
          email: session?.user?.email || '',
          telefono: '',
          experienciaTrading: '',
          objetivos: '',
          nivelExperiencia: 'avanzado',
          consulta: ''
        });
      } else {
        toast.error(data.error || 'Error al enviar solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar solicitud');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <>
      <Head>
        <title>{training.nombre} - Entrenamiento Profesional | Nahuel Lozano</title>
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
                  <span className={styles.heroSubtitle}>Técnicas Institucionales de Alto Nivel</span>
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
                    <span>{training.contenido.lecciones} lecciones de nivel experto con casos reales</span>
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
                <div className={styles.heroActions}>
                  <button 
                    onClick={handleEnroll}
                    className={styles.enrollButton}
                  >
                    <Users size={20} />
                    Inscribirme Ahora
                  </button>
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
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>¿Cuáles son tus objetivos con este entrenamiento avanzado?</label>
                  <textarea
                    value={formData.objetivos}
                    onChange={(e) => setFormData({...formData, objetivos: e.target.value})}
                    placeholder="Describe qué esperas lograr con este programa profesional..."
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Experiencia previa en trading</label>
                  <textarea
                    value={formData.experienciaTrading}
                    onChange={(e) => setFormData({...formData, experienciaTrading: e.target.value})}
                    placeholder="Cuéntanos sobre tu experiencia en trading (años, estrategias, resultados)..."
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Consulta adicional (opcional)</label>
                  <textarea
                    value={formData.consulta}
                    onChange={(e) => setFormData({...formData, consulta: e.target.value})}
                    placeholder="¿Tienes alguna pregunta específica sobre el programa?"
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
              Resultados de Nivel Profesional
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

        {/* Programa Detallado */}
        <section className={styles.programSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Programa Avanzado
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {training.contenido.modulos} módulos especializados con {training.contenido.lecciones} lecciones de nivel profesional
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
                Testimonios de Traders Profesionales
              </motion.h2>
              <motion.p 
                className={styles.sectionDescription}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Resultados reales de traders que alcanzaron el nivel profesional
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
                            (e.target as HTMLImageElement).src = generateCircularAvatarDataURL(testimonial.name, '#8b5cf6', '#ffffff', 80);
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
                ¿Listo para el Siguiente Nivel?
              </h2>
              <p className={styles.ctaDescription}>
                Únete a los {training.metricas.estudiantesActivos}+ traders profesionales que ya dominan 
                estas estrategias institucionales.
              </p>
              <div className={styles.ctaPrice}>
                <span className={styles.ctaPriceAmount}>${training.precio} USD</span>
                <span className={styles.ctaPriceDescription}>
                  Programa completo • Acceso de por vida • Mentoring incluido
                </span>
              </div>
              <button 
                onClick={handleEnroll}
                className={styles.ctaButton}
              >
                <Users size={20} />
                Comenzar Ahora
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
    const response = await fetch(`${baseUrl}/api/entrenamientos/DowJones`);
    
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
          tipo: 'DowJones',
          nombre: 'Dow Jones - Estrategias Avanzadas',
          descripcion: 'Técnicas institucionales y estrategias avanzadas de trading profesional',
          precio: 997,
          duracion: 60,
          metricas: {
            rentabilidad: '180%',
            estudiantesActivos: '320',
            entrenamientosRealizados: '80',
            satisfaccion: '4.9'
          },
          contenido: {
            modulos: 16,
            lecciones: 120,
            certificacion: true,
            nivelAcceso: 'Avanzado'
          }
        },
        program: [],
        testimonials: []
      }
    };
  }
};

export default AdvancedTradingStrategiesPage; 