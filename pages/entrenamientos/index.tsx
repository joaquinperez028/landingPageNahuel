import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  Loader
} from 'lucide-react';
import styles from '@/styles/EntrenamientosIndex.module.css';

interface EntrenamientosPageProps {
  trainings: Array<{
    id: string;
    title: string;
    subtitle: string;
    description: string;
    level: string;
    duration: string;
    lessons: number;
    students: number;
    rating: number;
    price: string;
    features: string[];
    href: string;
    image: string;
    badge?: string;
  }>;
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

const EntrenamientosPage: React.FC<EntrenamientosPageProps> = ({ trainings }) => {
  // Estados para roadmaps dinámicos
  const [roadmapModules, setRoadmapModules] = useState<RoadmapModule[]>([]);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [roadmapError, setRoadmapError] = useState<string>('');

  // Cargar roadmaps dinámicos
  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoadingRoadmap(true);
      setRoadmapError('');
      
      // Intentar obtener roadmap general primero, si no existe obtener cualquier roadmap activo
      let response = await fetch('/api/roadmaps/tipo/General');
      let data = await response.json();
      
      if (!data.success || data.data.roadmaps.length === 0) {
        // Si no hay roadmap general, obtener todos los roadmaps
        response = await fetch('/api/roadmaps');
        data = await response.json();
      }
      
      if (data.success && data.data.roadmaps.length > 0) {
        // Tomar el primer roadmap activo
        const activeRoadmap = data.data.roadmaps.find((r: any) => r.activo) || data.data.roadmaps[0];
        setRoadmapModules(activeRoadmap.modulos || []);
      } else {
        setRoadmapError('No se encontraron roadmaps disponibles');
      }
    } catch (error) {
      console.error('Error al cargar roadmaps:', error);
      setRoadmapError('Error al cargar el roadmap de aprendizaje');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleModuleClick = (moduleId: number) => {
    console.log(`Accediendo al módulo ${moduleId}`);
    // Aquí se implementaría la navegación al módulo específico
  };

  return (
    <>
      <Head>
        <title>Entrenamientos - Formación Especializada en Trading | Nahuel Lozano</title>
        <meta name="description" content="Entrenamientos especializados en trading y mercados financieros. Desde fundamentos hasta estrategias avanzadas con Nahuel Lozano." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                <h1 className={styles.heroTitle}>
                  Entrenamientos
                  <span className={styles.heroSubtitle}>Formación Especializada en Trading</span>
                </h1>
                <p className={styles.heroDescription}>
                  Programas de formación diseñados para transformarte en un trader profesional. 
                  Desde los fundamentos hasta estrategias avanzadas, con contenido actualizado 
                  y metodología probada en los mercados.
                </p>
                <div className={styles.heroFeatures}>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Contenido 100% actualizado y práctico</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Metodología probada en mercados reales</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Soporte personalizado durante el aprendizaje</span>
                  </div>
                </div>
              </div>
              <div className={styles.heroStats}>
                <motion.div 
                  className={styles.statCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className={styles.statIcon}>
                    <Users size={32} />
                  </div>
                  <h3 className={styles.statNumber}>1,200+</h3>
                  <p className={styles.statLabel}>Estudiantes Formados</p>
                </motion.div>
                <motion.div 
                  className={styles.statCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className={styles.statIcon}>
                    <Award size={32} />
                  </div>
                  <h3 className={styles.statNumber}>95%</h3>
                  <p className={styles.statLabel}>Tasa de Satisfacción</p>
                </motion.div>
                <motion.div 
                  className={styles.statCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className={styles.statIcon}>
                    <Clock size={32} />
                  </div>
                  <h3 className={styles.statNumber}>100+</h3>
                  <p className={styles.statLabel}>Horas de Contenido</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className={styles.roadmapSection}>
          <div className={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {loadingRoadmap ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Loader size={48} className="spinning" style={{ margin: '0 auto 1rem', color: '#3b82f6' }} />
                  <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Cargando roadmap de aprendizaje...</p>
                </div>
              ) : roadmapError ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error al cargar roadmap</h3>
                  <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{roadmapError}</p>
                  <button 
                    onClick={fetchRoadmaps}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      background: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : roadmapModules.length > 0 ? (
                <TrainingRoadmap
                  modules={roadmapModules}
                  onModuleClick={handleModuleClick}
                  title="Roadmap de Aprendizaje"
                  description="Progresión estructurada diseñada para llevarte de principiante a trader avanzado"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                    Roadmap no disponible en este momento
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Entrenamientos Section */}
        <section className={styles.trainingsSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Nuestros Entrenamientos
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Programas estructurados para llevarte desde principiante hasta trader profesional
            </motion.p>
            
            <div className={styles.trainingsGrid}>
              {trainings.map((training, index) => (
                <motion.div 
                  key={training.id}
                  className={styles.trainingCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  {training.badge && (
                    <div className={styles.trainingBadge}>
                      {training.badge}
                    </div>
                  )}
                  
                  <div className={styles.trainingImageContainer}>
                    <img 
                      src={training.image} 
                      alt={training.title}
                      className={styles.trainingImage}
                    />
                    <div className={styles.trainingOverlay}>
                      <PlayCircle size={48} className={styles.playIcon} />
                    </div>
                  </div>
                  
                  <div className={styles.trainingContent}>
                    <div className={styles.trainingHeader}>
                      <h3 className={styles.trainingTitle}>{training.title}</h3>
                      <span className={styles.trainingLevel}>{training.level}</span>
                    </div>
                    
                    <p className={styles.trainingSubtitle}>{training.subtitle}</p>
                    <p className={styles.trainingDescription}>{training.description}</p>
                    
                    <div className={styles.trainingMeta}>
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{training.duration}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <BookOpen size={16} />
                        <span>{training.lessons} lecciones</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        <span>{training.students} estudiantes</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Star size={16} />
                        <span>{training.rating}/5</span>
                      </div>
                    </div>
                    
                    <div className={styles.trainingFeatures}>
                      {training.features.map((feature, idx) => (
                        <div key={idx} className={styles.feature}>
                          <CheckCircle size={14} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.trainingFooter}>
                      <div className={styles.trainingPrice}>
                        <span className={styles.priceLabel}>Precio:</span>
                        <span className={styles.priceValue}>{training.price}</span>
                      </div>
                      <Link href={training.href} className={styles.trainingCTA}>
                        Comenzar Ahora
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles.benefitsSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              ¿Por Qué Elegir Nuestros Entrenamientos?
            </motion.h2>
            
            <div className={styles.benefitsGrid}>
              <motion.div 
                className={styles.benefitCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className={styles.benefitIcon}>
                  <Target size={40} />
                </div>
                <h3 className={styles.benefitTitle}>Metodología Probada</h3>
                <p className={styles.benefitDescription}>
                  Estrategias y técnicas validadas en mercados reales con más de 10 años de experiencia
                </p>
              </motion.div>

              <motion.div 
                className={styles.benefitCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.benefitIcon}>
                  <BookOpen size={40} />
                </div>
                <h3 className={styles.benefitTitle}>Contenido Actualizado</h3>
                <p className={styles.benefitDescription}>
                  Material constantemente actualizado según las últimas tendencias y cambios del mercado
                </p>
              </motion.div>

              <motion.div 
                className={styles.benefitCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className={styles.benefitIcon}>
                  <Users size={40} />
                </div>
                <h3 className={styles.benefitTitle}>Soporte Personalizado</h3>
                <p className={styles.benefitDescription}>
                  Acompañamiento directo del instructor y acceso a comunidad privada de estudiantes
                </p>
              </motion.div>

              <motion.div 
                className={styles.benefitCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className={styles.benefitIcon}>
                  <Award size={40} />
                </div>
                <h3 className={styles.benefitTitle}>Certificación</h3>
                <p className={styles.benefitDescription}>
                  Obtén certificado de completación reconocido en la industria financiera
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.ctaCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>
                  ¿Listo para Transformar tu Trading?
                </h2>
                <p className={styles.ctaDescription}>
                  Únete a más de 1,200 estudiantes que ya han mejorado sus resultados con nuestros entrenamientos especializados
                </p>
                <div className={styles.ctaActions}>
                  <Link href="/entrenamientos/trading" className={styles.ctaButton}>
                    Comenzar Ahora
                    <ArrowRight size={20} />
                  </Link>
                  <Link href="/asesorias" className={styles.ctaButtonSecondary}>
                    Consultoría Personalizada
                  </Link>
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
  const trainings = [
    {
      id: 'trading-fundamentals',
      title: 'Trading Fundamentals',
      subtitle: 'Fundamentos del Trading Profesional',
      description: 'Programa completo desde cero hasta nivel intermedio. Aprende análisis técnico, fundamental, gestión de riesgo y psicología del trading con metodología step-by-step.',
      level: 'Principiante - Intermedio',
      duration: '40 horas',
      lessons: 85,
      students: 850,
      rating: 4.8,
      price: '$299 USD',
      features: [
        'Análisis técnico y fundamental',
        'Gestión de riesgo avanzada',
        'Psicología del trading',
        'Estrategias para diferentes mercados',
        'Acceso a comunidad privada',
        'Certificado de completación'
      ],
      href: '/entrenamientos/trading',
      image: '/entrenamientos/trading-fundamentals.jpg',
      badge: 'Más Popular'
    },
    {
      id: 'advanced-strategies',
      title: 'Dow Jones',
      subtitle: 'Estrategias Avanzadas de Trading',
      description: 'Programa especializado para traders con experiencia. Estrategias avanzadas, algoritmos, trading cuantitativo y técnicas institucionales para maximizar rendimientos.',
      level: 'Avanzado - Experto',
      duration: '60 horas',
      lessons: 120,
      students: 350,
      rating: 4.9,
      price: '$599 USD',
      features: [
        'Estrategias algorítmicas',
        'Trading cuantitativo',
        'Técnicas institucionales',
        'Backtesting avanzado',
        'Mentoría personalizada',
        'Acceso de por vida'
      ],
      href: '/entrenamientos/advanced',
      image: '/entrenamientos/advanced-strategies.jpg',
      badge: 'Nuevo'
    }
  ];

  return {
    props: {
      trainings
    }
  };
};

export default EntrenamientosPage; 