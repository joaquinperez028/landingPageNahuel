import React from 'react';
import { GetServerSideProps } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MessageSquare, 
  Star, 
  Users, 
  Settings,
  BarChart3,
  Clock,
  FileText,
  ArrowRight,
  Globe,
  BookOpen
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/AdminDashboard.module.css';

interface AdminDashboardProps {
  user: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const adminSections = [
    {
      title: 'Configuración del Sitio',
      description: 'Configura el video principal, secciones y elementos del landing page',
      icon: <Globe size={32} />,
      href: '/admin/site-config',
      color: '#7c3aed'
    },
    {
      title: 'Gestión de Lecciones',
      description: 'Crea, edita y administra las lecciones de los entrenamientos TradingFundamentals y DowJones',
      icon: <BookOpen size={32} />,
      href: '/admin/lecciones',
      color: '#dc2626'
    },
    {
      title: 'Tarjetas de Cursos',
      description: 'Gestiona las tarjetas de cursos personalizadas que aparecen en el landing',
      icon: <FileText size={32} />,
      href: '/admin/course-cards',
      color: '#059669'
    },
    {
      title: 'Gestión de Horarios',
      description: 'Configura los días y horarios disponibles para entrenamientos',
      icon: <Calendar size={32} />,
      href: '/admin/horarios',
      color: '#3b82f6'
    },
    {
      title: 'Testimonios',
      description: 'Gestiona testimonios de clientes para mostrar en el sitio',
      icon: <Star size={32} />,
      href: '/admin/testimonios',
      color: '#f59e0b'
    },
    {
      title: 'Preguntas Frecuentes',
      description: 'Administra las FAQs por categoría (consultorio, entrenamientos, etc.)',
      icon: <MessageSquare size={32} />,
      href: '/admin/faqs',
      color: '#10b981'
    },
    {
      title: 'Usuarios',
      description: 'Gestiona usuarios registrados y sus permisos',
      icon: <Users size={32} />,
      href: '/admin/usuarios',
      color: '#8b5cf6'
    },
    {
      title: 'Reservas',
      description: 'Visualiza y gestiona todas las reservas de entrenamientos y asesorías',
      icon: <Clock size={32} />,
      href: '/admin/reservas',
      color: '#ef4444'
    },
    {
      title: 'Reportes',
      description: 'Estadísticas y reportes de actividad del sitio',
      icon: <BarChart3 size={32} />,
      href: '/admin/reportes',
      color: '#06b6d4'
    }
  ];

  return (
    <>
      <Head>
        <title>Panel de Administración - Nahuel Lozano</title>
        <meta name="description" content="Panel de administración para gestionar contenido y configuraciones" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.header}
          >
            <h1 className={styles.title}>Panel de Administración</h1>
            <p className={styles.subtitle}>
              Bienvenido, {user?.name || 'Administrador'}. Gestiona el contenido y configuraciones del sitio.
            </p>
          </motion.div>

          <div className={styles.sectionsGrid}>
            {adminSections.map((section, index) => (
              <motion.div
                key={section.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={section.href} className={styles.sectionCard}>
                  <div 
                    className={styles.sectionIcon}
                    style={{ backgroundColor: `${section.color}20`, color: section.color }}
                  >
                    {section.icon}
                  </div>
                  <div className={styles.sectionContent}>
                    <h3 className={styles.sectionTitle}>{section.title}</h3>
                    <p className={styles.sectionDescription}>{section.description}</p>
                  </div>
                  <div className={styles.sectionArrow}>
                    <ArrowRight size={20} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={styles.quickStats}
          >
            <h2 className={styles.statsTitle}>Acceso Rápido</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Globe size={24} />
                </div>
                <div className={styles.statContent}>
                  <h4>Configuración del Sitio</h4>
                  <p>Configura el video de YouTube y secciones del landing</p>
                  <Link href="/admin/site-config" className={styles.statLink}>
                    Configurar sitio →
                  </Link>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FileText size={24} />
                </div>
                <div className={styles.statContent}>
                  <h4>Tarjetas de Cursos</h4>
                  <p>Gestiona las tarjetas personalizadas de cursos</p>
                  <Link href="/admin/course-cards" className={styles.statLink}>
                    Gestionar cursos →
                  </Link>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <BookOpen size={24} />
                </div>
                <div className={styles.statContent}>
                  <h4>Gestión de Lecciones</h4>
                  <p>Crea y administra lecciones de entrenamientos</p>
                  <Link href="/admin/lecciones" className={styles.statLink}>
                    Gestionar lecciones →
                  </Link>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Calendar size={24} />
                </div>
                <div className={styles.statContent}>
                  <h4>Horarios Configurados</h4>
                  <p>Gestiona los horarios de entrenamiento disponibles</p>
                  <Link href="/admin/horarios" className={styles.statLink}>
                    Ver horarios →
                  </Link>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Clock size={24} />
                </div>
                <div className={styles.statContent}>
                  <h4>Reservas Recientes</h4>
                  <p>Revisa las últimas reservas de clientes</p>
                  <Link href="/admin/reservas" className={styles.statLink}>
                    Ver reservas →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const verification = await verifyAdminAccess(context);
  
  if (!verification.isAdmin) {
    return {
      redirect: {
        destination: verification.redirectTo || '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: verification.user,
    },
  };
};

export default AdminDashboard; 