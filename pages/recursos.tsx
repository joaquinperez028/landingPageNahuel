import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from '../styles/Recursos.module.css';

interface RecursosPageProps {
  user: any;
}

const recursos = [
  {
    id: 1,
    title: 'Análisis Semanal de Mercados',
    description: 'Reporte semanal con análisis técnico y fundamental de los principales índices y activos.',
    type: 'Reporte',
    date: '2024-01-15',
    downloadUrl: '/downloads/analisis-semanal-2024-01-15.pdf',
    category: 'Análisis'
  },
  {
    id: 2,
    title: 'Guía de Indicadores Técnicos',
    description: 'Manual completo con los principales indicadores técnicos y cómo utilizarlos.',
    type: 'Guía',
    date: '2024-01-10',
    downloadUrl: '/downloads/guia-indicadores-tecnicos.pdf',
    category: 'Educación'
  },
  {
    id: 3,
    title: 'Plantilla de Gestión de Riesgo',
    description: 'Excel para calcular position sizing, riesgo por operación y gestión de capital.',
    type: 'Plantilla',
    date: '2024-01-08',
    downloadUrl: '/downloads/plantilla-gestion-riesgo.xlsx',
    category: 'Herramientas'
  },
  {
    id: 4,
    title: 'Webinar: Estrategias para 2024',
    description: 'Grabación del webinar sobre las mejores estrategias de inversión para el año 2024.',
    type: 'Video',
    date: '2024-01-05',
    downloadUrl: '/videos/webinar-estrategias-2024',
    category: 'Webinars'
  },
  {
    id: 5,
    title: 'Calendario Económico',
    description: 'Eventos económicos importantes que pueden afectar los mercados financieros.',
    type: 'Calendario',
    date: '2024-01-03',
    downloadUrl: '/downloads/calendario-economico-2024.pdf',
    category: 'Análisis'
  },
  {
    id: 6,
    title: 'Glosario de Trading',
    description: 'Términos esenciales que todo trader debe conocer, explicados de forma clara y sencilla.',
    type: 'Guía',
    date: '2024-01-01',
    downloadUrl: '/downloads/glosario-trading.pdf',
    category: 'Educación'
  }
];

const categorias = ['Todos', 'Análisis', 'Educación', 'Herramientas', 'Webinars'];

export default function RecursosPage({ user }: RecursosPageProps) {
  return (
    <>
      <Head>
        <title>Recursos - Material Educativo | Nahuel Lozano</title>
        <meta name="description" content="Accede a reportes, guías, plantillas y material educativo para mejorar tus habilidades de inversión y trading." />
      </Head>
      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Centro de Recursos</h1>
              <p className={styles.heroSubtitle}>
                Accede a nuestro repositorio de material educativo: reportes de mercado, 
                guías especializadas, plantillas de trabajo y grabaciones de webinars.
              </p>
              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>50+</span>
                  <span className={styles.statLabel}>Recursos disponibles</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>15</span>
                  <span className={styles.statLabel}>Actualizaciones mensuales</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>100%</span>
                  <span className={styles.statLabel}>Gratuito para suscriptores</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className={styles.filters}>
          <div className="container">
            <div className={styles.filterButtons}>
              {categorias.map((categoria) => (
                <button key={categoria} className={`${styles.filterButton} ${categoria === 'Todos' ? styles.active : ''}`}>
                  {categoria}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className={styles.content}>
          <div className="container">
            <div className={styles.resourcesGrid}>
              {recursos.map((recurso) => (
                <div key={recurso.id} className={styles.resourceCard}>
                  <div className={styles.resourceHeader}>
                    <div className={styles.resourceCategory}>{recurso.category}</div>
                    <div className={styles.resourceType}>{recurso.type}</div>
                  </div>
                  <h3 className={styles.resourceTitle}>{recurso.title}</h3>
                  <p className={styles.resourceDescription}>{recurso.description}</p>
                  <div className={styles.resourceFooter}>
                    <span className={styles.resourceDate}>{recurso.date}</span>
                    <button className={styles.downloadButton}>
                      Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className="container">
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>¿No tienes acceso aún?</h2>
              <p className={styles.ctaDescription}>
                Suscríbete para acceder a todo nuestro material educativo y 
                mantente actualizado con los últimos análisis de mercado.
              </p>
              <Link href="/subscription" className={styles.ctaButton}>
                Comenzar Suscripción
              </Link>
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