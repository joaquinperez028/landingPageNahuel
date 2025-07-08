import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  PlayCircle
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

const EntrenamientosPage: React.FC<EntrenamientosPageProps> = ({ trainings }) => {
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
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className={styles.benefitIcon}>
                  <Target size={40} />
                </div>
                <h3 className={styles.benefitTitle}>Metodología Probada</h3>
                <p className={styles.benefitDescription}>
                  Estrategias testadas en mercados reales con resultados medibles y documentados.
                </p>
              </motion.div>

              <motion.div 
                className={styles.benefitCard}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.benefitIcon}>
                  <Users size={40} />
                </div>
                <h3 className={styles.benefitTitle}>Soporte Personalizado</h3>
                <p className={styles.benefitDescription}>
                  Acompañamiento directo del instructor y comunidad activa de estudiantes.
                </p>
              </motion.div>

              <motion.div 
                className={styles.benefitCard}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className={styles.benefitIcon}>
                  <TrendingUp size={40} />
                </div>
                <h3 className={styles.benefitTitle}>Contenido Actualizado</h3>
                <p className={styles.benefitDescription}>
                  Material constantemente actualizado según las tendencias del mercado.
                </p>
              </motion.div>

              <motion.div 
                className={styles.benefitCard}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className={styles.benefitIcon}>
                  <Award size={40} />
                </div>
                <h3 className={styles.benefitTitle}>Certificación Incluida</h3>
                <p className={styles.benefitDescription}>
                  Obtén tu certificado de finalización para validar tus conocimientos adquiridos.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.ctaContent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.ctaTitle}>
                ¿Listo para Comenzar tu Transformación?
              </h2>
              <p className={styles.ctaDescription}>
                Únete a más de 1,200 estudiantes que ya están aplicando estas estrategias exitosamente.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/entrenamientos/trading" className={styles.ctaButton}>
                  <BookOpen size={20} />
                  Trading Fundamentals
                  <ArrowRight size={20} />
                </Link>
                <Link href="/entrenamientos/advanced" className={styles.ctaButton}>
                  <TrendingUp size={20} />
                  Dow Jones Avanzado
                  <ArrowRight size={20} />
                </Link>
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