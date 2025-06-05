import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import VideoPlayerMux from '../../components/VideoPlayerMux';
import styles from '../../styles/Entrenamientos.module.css';

interface TrainingPageProps {
  user: any;
}

const modules = [
  {
    id: 1,
    title: 'Fundamentos del Trading',
    duration: '4 horas',
    lessons: 12,
    description: 'Conceptos básicos, terminología y funcionamiento de los mercados',
    completed: true
  },
  {
    id: 2,
    title: 'Análisis Técnico',
    duration: '6 horas',
    lessons: 18,
    description: 'Lectura de gráficos, patrones y indicadores técnicos',
    completed: true
  },
  {
    id: 3,
    title: 'Análisis Fundamental',
    duration: '5 horas',
    lessons: 15,
    description: 'Evaluación de empresas y factores macroeconómicos',
    completed: false
  },
  {
    id: 4,
    title: 'Gestión de Riesgo',
    duration: '3 horas',
    lessons: 10,
    description: 'Position sizing, stop loss y gestión de capital',
    completed: false
  },
  {
    id: 5,
    title: 'Psicología del Trading',
    duration: '4 horas',
    lessons: 12,
    description: 'Control emocional y disciplina en el trading',
    completed: false
  },
  {
    id: 6,
    title: 'Estrategias Avanzadas',
    duration: '8 horas',
    lessons: 24,
    description: 'Estrategias específicas para diferentes mercados',
    completed: false
  }
];

export default function TradingPage({ user }: TrainingPageProps) {
  const [activeModule, setActiveModule] = useState(1);

  return (
    <>
      <Head>
        <title>Entrenamiento en Trading | Nahuel Lozano</title>
        <meta name="description" content="Curso completo de trading desde fundamentos hasta estrategias avanzadas. Aprende análisis técnico, fundamental y gestión de riesgo." />
      </Head>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>Entrenamiento en Trading</h1>
                <p className={styles.heroSubtitle}>
                  Domina el arte del trading con nuestro curso completo. 
                  Desde los fundamentos hasta estrategias avanzadas, aprende a operar 
                  en los mercados financieros con confianza y disciplina.
                </p>
                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>30+</span>
                    <span className={styles.statLabel}>Horas de contenido</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>91</span>
                    <span className={styles.statLabel}>Lecciones</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>500+</span>
                    <span className={styles.statLabel}>Estudiantes</span>
                  </div>
                </div>
                <div className={styles.heroActions}>
                  <Link href="/subscription" className="btn btn-primary btn-lg">
                    Comenzar Ahora
                  </Link>
                  <Link href="/entrenamientos" className="btn btn-outline btn-lg">
                    Ver Todos los Cursos
                  </Link>
                </div>
              </div>
              <div className={styles.heroVideo}>
                <VideoPlayerMux 
                  playbackId="trading-intro"
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
                <h3>Módulos del Curso</h3>
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
                          playbackId={`trading-module-${activeModule}`}
                        />
                      </div>
                      <div className={styles.lessonInfo}>
                        <h3>Lección 1: Introducción</h3>
                        <p>
                          En esta lección aprenderás los conceptos fundamentales que necesitas 
                          dominar para comenzar tu camino en el trading profesional.
                        </p>
                        <div className={styles.lessonActions}>
                          <button className="btn btn-primary">Marcar como Completada</button>
                          <button className="btn btn-outline">Siguiente Lección</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.lockedContent}>
                      <div className={styles.lockIcon}>🔒</div>
                      <h2>Contenido Premium</h2>
                      <p>
                        Este módulo está disponible para suscriptores premium. 
                        Completa los módulos anteriores y actualiza tu suscripción para acceder.
                      </p>
                      <Link href="/subscription" className="btn btn-primary">
                        Actualizar Suscripción
                      </Link>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className={styles.progressSection}>
                  <h3>Tu Progreso</h3>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '33%' }}></div>
                  </div>
                  <p>2 de 6 módulos completados (33%)</p>
                </div>

                {/* Resources */}
                <div className={styles.resources}>
                  <h3>Recursos Adicionales</h3>
                  <div className={styles.resourcesList}>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceIcon}>📊</span>
                      <div>
                        <h4>Plantilla de Análisis</h4>
                        <p>Excel para análisis técnico y fundamental</p>
                      </div>
                      <button className="btn btn-sm">Descargar</button>
                    </div>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceIcon}>📚</span>
                      <div>
                        <h4>Glosario de Trading</h4>
                        <p>Términos esenciales del trading</p>
                      </div>
                      <button className="btn btn-sm">Ver</button>
                    </div>
                    <div className={styles.resourceItem}>
                      <span className={styles.resourceIcon}>🎯</span>
                      <div>
                        <h4>Ejercicios Prácticos</h4>
                        <p>Pon en práctica lo aprendido</p>
                      </div>
                      <button className="btn btn-sm">Acceder</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className={styles.features}>
          <div className="container">
            <h2 className={styles.featuresTitle}>¿Qué incluye este entrenamiento?</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🎥</div>
                <h3>Videos HD</h3>
                <p>Más de 30 horas de contenido en video de alta calidad</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📱</div>
                <h3>Acceso Mobile</h3>
                <p>Aprende desde cualquier dispositivo, en cualquier momento</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🏆</div>
                <h3>Certificado</h3>
                <p>Obtén tu certificado al completar el curso</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💬</div>
                <h3>Comunidad</h3>
                <p>Conecta con otros traders y comparte experiencias</p>
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