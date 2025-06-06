import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import VideoPlayerMux from '../../components/VideoPlayerMux';
import styles from '../../styles/Entrenamientos.module.css';

interface AdvancedTrainingPageProps {
  user: any;
}

const modules = [
  {
    id: 1,
    title: 'Trading Algorítmico',
    duration: '8 horas',
    lessons: 20,
    description: 'Desarrollo e implementación de algoritmos de trading automatizados',
    completed: true
  },
  {
    id: 2,
    title: 'Análisis Cuantitativo',
    duration: '10 horas',
    lessons: 25,
    description: 'Modelos matemáticos y estadísticos para optimización de estrategias',
    completed: true
  },
  {
    id: 3,
    title: 'Trading Institucional',
    duration: '12 horas',
    lessons: 30,
    description: 'Técnicas y estrategias utilizadas por fondos de inversión e instituciones',
    completed: false
  },
  {
    id: 4,
    title: 'Backtesting Avanzado',
    duration: '6 horas',
    lessons: 15,
    description: 'Validación rigurosa de estrategias con datos históricos',
    completed: false
  },
  {
    id: 5,
    title: 'Gestión de Portafolios',
    duration: '8 horas',
    lessons: 20,
    description: 'Optimización y diversificación de carteras de inversión',
    completed: false
  },
  {
    id: 6,
    title: 'Derivados y Opciones',
    duration: '16 horas',
    lessons: 40,
    description: 'Estrategias complejas con instrumentos derivados',
    completed: false
  }
];

export default function AdvancedTradingPage({ user }: AdvancedTrainingPageProps) {
  const [activeModule, setActiveModule] = useState(1);

  return (
    <>
      <Head>
        <title>Entrenamiento Avanzado en Trading | Nahuel Lozano</title>
        <meta name="description" content="Programa avanzado de trading: algoritmos, análisis cuantitativo, estrategias institucionales y técnicas profesionales de alto nivel." />
      </Head>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>Entrenamiento Avanzado en Trading</h1>
                <p className={styles.heroSubtitle}>
                  Programa especializado para traders experimentados. Domina las estrategias 
                  más sofisticadas utilizadas por instituciones financieras y fondos de inversión. 
                  Incluye trading algorítmico, análisis cuantitativo y técnicas institucionales.
                </p>
                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>60+</span>
                    <span className={styles.statLabel}>Horas de contenido</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>150</span>
                    <span className={styles.statLabel}>Lecciones avanzadas</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>350+</span>
                    <span className={styles.statLabel}>Traders profesionales</span>
                  </div>
                </div>
                <div className={styles.heroActions}>
                  <Link href="/subscription" className="btn btn-primary btn-lg">
                    Comenzar Programa Avanzado
                  </Link>
                  <Link href="/entrenamientos" className="btn btn-outline btn-lg">
                    Ver Todos los Entrenamientos
                  </Link>
                </div>
              </div>
              <div className={styles.heroVideo}>
                <VideoPlayerMux 
                  playbackId="advanced-trading-intro"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className={styles.content}>
          <div className="container">
            <div className={styles.contentGrid}>
              {/* Sidebar with modules */}
              <div className={styles.sidebar}>
                <h3>Módulos Avanzados</h3>
                <div className={styles.modulesList}>
                  {modules.map((module) => (
                    <div 
                      key={module.id}
                      className={`${styles.moduleCard} ${activeModule === module.id ? styles.active : ''} ${module.completed ? styles.completed : ''}`}
                      onClick={() => setActiveModule(module.id)}
                    >
                      <div className={styles.moduleHeader}>
                        <h4>{module.title}</h4>
                        <span className={styles.moduleStatus}>
                          {module.completed ? '✓' : module.id <= 2 ? '▶' : '🔒'}
                        </span>
                      </div>
                      <div className={styles.moduleInfo}>
                        <span>{module.duration}</span>
                        <span>{module.lessons} lecciones</span>
                      </div>
                      <p className={styles.moduleDescription}>{module.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content area */}
              <div className={styles.mainContent}>
                <div className={styles.moduleDetails}>
                  {activeModule <= 2 ? (
                    <>
                      <h2>Módulo {activeModule}: {modules[activeModule - 1]?.title}</h2>
                      <div className={styles.videoPlayer}>
                        <VideoPlayerMux 
                          playbackId={`advanced-module-${activeModule}`}
                        />
                      </div>
                      <div className={styles.lessonInfo}>
                        <h3>Lección Avanzada 1: Introducción a {modules[activeModule - 1]?.title}</h3>
                        <p>
                          Esta lección avanzada te introduce a las técnicas más sofisticadas de {modules[activeModule - 1]?.title.toLowerCase()}. 
                          Aprenderás metodologías utilizadas por traders institucionales y fondos de inversión profesionales.
                        </p>
                        <div className={styles.lessonActions}>
                          <button className="btn btn-primary">Marcar como Completada</button>
                          <button className="btn btn-outline">Siguiente Lección Avanzada</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.lockedContent}>
                      <div className={styles.lockIcon}>🔒</div>
                      <h2>Contenido Institucional</h2>
                      <p>
                        Este módulo contiene técnicas y estrategias de nivel institucional. 
                        Completa los módulos anteriores y verifica tu experiencia para acceder a este contenido especializado.
                      </p>
                      <Link href="/subscription" className="btn btn-primary">
                        Acceder a Contenido Institucional
                      </Link>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className={styles.progressSection}>
                  <h3>Progreso Avanzado</h3>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '33%' }}></div>
                  </div>
                  <p>2 de 6 módulos avanzados completados (33%)</p>
                </div>

                {/* Advanced Resources */}
                <div className={styles.resources}>
                  <h3>Recursos Institucionales</h3>
                  <div className={styles.resourcesList}>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceIcon}>📊</span>
                      <div>
                        <h4>Backtesting Framework</h4>
                        <p>Framework profesional para validación de estrategias</p>
                      </div>
                    </div>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceIcon}>🤖</span>
                      <div>
                        <h4>Algoritmos de Ejemplo</h4>
                        <p>Códigos de algoritmos institucionales documentados</p>
                      </div>
                    </div>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceIcon}>📈</span>
                      <div>
                        <h4>Modelos Cuantitativos</h4>
                        <p>Modelos matemáticos utilizados en fondos de inversión</p>
                      </div>
                    </div>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceIcon}>🎯</span>
                      <div>
                        <h4>Estrategias Institucionales</h4>
                        <p>Documentación de estrategias de nivel profesional</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className={styles.features}>
          <div className="container">
            <h2 className={styles.featuresTitle}>Características del Programa Avanzado</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🤖</div>
                <h3>Trading Algorítmico</h3>
                <p>Desarrollo de algoritmos automatizados con Python y frameworks profesionales</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📊</div>
                <h3>Análisis Cuantitativo</h3>
                <p>Modelos estadísticos y matemáticos para optimización de rendimientos</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🏛️</div>
                <h3>Técnicas Institucionales</h3>
                <p>Estrategias utilizadas por fondos de inversión y bancos de inversión</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🎯</div>
                <h3>Backtesting Profesional</h3>
                <p>Validación rigurosa con datos de calidad institucional</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📈</div>
                <h3>Gestión de Portafolios</h3>
                <p>Optimización y diversificación de carteras complejas</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⚡</div>
                <h3>Derivados Avanzados</h3>
                <p>Estrategias sofisticadas con opciones, futuros y derivados exóticos</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  return {
    props: {
      user: session?.user || null,
    },
  };
}; 