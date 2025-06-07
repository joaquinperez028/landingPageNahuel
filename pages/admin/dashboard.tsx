import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Bell, 
  FileText, 
  Database,
  UserCheck,
  TrendingUp,
  Mail,
  DollarSign,
  Activity,
  Settings,
  Download,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import User from '@/models/User';
import styles from '@/styles/AdminDashboard.module.css';
import dbConnect from '@/lib/mongodb';

interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  suscriptorUsers: number;
  normalUsers: number;
  totalNotifications: number;
  activeNotifications: number;
  recentActivity: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    adminUsers: 0,
    suscriptorUsers: 0,
    normalUsers: 0,
    totalNotifications: 0,
    activeNotifications: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  // Verificar si es admin en el lado del cliente
  const checkAdminStatus = async () => {
    try {
      setChecking(true);
      console.log('🔍 Dashboard - Iniciando verificación de admin...');
      
      const response = await fetch('/api/profile/get');
      console.log('📡 Dashboard - Respuesta de API:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Dashboard - Datos recibidos:', data);
        
        if (data.user?.role === 'admin') {
          console.log('✅ Dashboard - Usuario es admin, permitiendo acceso');
          setIsAdmin(true);
        } else {
          console.log('❌ Dashboard - Usuario no es admin, rol:', data.user?.role);
          console.log('🔄 Dashboard - Redirigiendo al home...');
          window.location.href = '/';
          return;
        }
      } else {
        console.log('❌ Dashboard - Error en API, status:', response.status);
        window.location.href = '/api/auth/signin';
        return;
      }
    } catch (error) {
      console.error('💥 Dashboard - Error en verificación:', error);
      window.location.href = '/';
      return;
    } finally {
      setChecking(false);
    }
  };

  // Cargar estadísticas del dashboard
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  // Mostrar loading mientras verifica permisos
  if (checking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #667eea', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <p>Verificando permisos de administrador...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // No mostrar nada si no es admin (ya se redirigió)
  if (!isAdmin) {
    return null;
  }

  const dashboardSections = [
    {
      id: 'control',
      title: 'Sala de Control',
      description: 'Datos de seguimiento, cantidad de usuarios, actividad, control de pagos, gestión de comunidad, creación de contenido',
      icon: <BarChart3 size={32} />,
      color: 'from-blue-500 to-cyan-500',
      links: [
        { label: 'Ver Estadísticas', href: '#estadisticas', icon: <TrendingUp size={16} /> },
        { label: 'Actividad Reciente', href: '#actividad', icon: <Activity size={16} /> },
        { label: 'Control de Pagos', href: '/admin/billing', icon: <DollarSign size={16} /> }
      ]
    },
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      description: 'Carga y modificación de información de usuario',
      icon: <Users size={32} />,
      color: 'from-green-500 to-emerald-500',
      links: [
        { label: 'Lista de Usuarios', href: '/admin/users', icon: <Users size={16} /> },
        { label: 'Usuarios Activos', href: '/admin/users?filter=active', icon: <UserCheck size={16} /> },
        { label: 'Gestión de Roles', href: '/admin/users/roles', icon: <Settings size={16} /> }
      ]
    },
    {
      id: 'database',
      title: 'Base de Datos',
      description: 'Información de contacto de los clientes para poder contactarlos por fuera de la web. Envíos de mails masivos, lanzamientos, problema con los pagos, etc',
      icon: <Database size={32} />,
      color: 'from-purple-500 to-violet-500',
      links: [
        { label: 'Exportar Contactos', href: '/admin/export/contacts', icon: <Download size={16} /> },
        { label: 'Envío Masivo', href: '/admin/email/bulk', icon: <Mail size={16} /> },
        { label: 'Gestión de BD', href: '/admin/database', icon: <Database size={16} /> }
      ]
    },
    {
      id: 'billing',
      title: 'Facturación',
      description: 'Descarga de información para facturación (Planilla excel con Nombre, Apellido, CUIT/CUIL, Monto abonado, Fecha)',
      icon: <FileText size={32} />,
      color: 'from-amber-500 to-orange-500',
      links: [
        { label: 'Generar Reporte', href: '/admin/billing/generate', icon: <FileText size={16} /> },
        { label: 'Exportar Excel', href: '/admin/billing/export', icon: <Download size={16} /> },
        { label: 'Historial', href: '/admin/billing/history', icon: <Activity size={16} /> }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Dashboard Administrador - Nahuel Lozano</title>
        <meta name="description" content="Panel de administración principal" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.headerIcon}>
                  <BarChart3 size={40} />
                </div>
                <div>
                  <h1 className={styles.title}>Dashboard Administrador</h1>
                  <p className={styles.subtitle}>
                    Panel de control y gestión completa del sistema
                  </p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <Link 
                  href="/admin/notifications"
                  className={`${styles.actionButton} ${styles.primary}`}
                >
                  <Bell size={20} />
                  Gestionar Notificaciones
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} className={styles.iconBlue} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{loading ? '...' : stats.totalUsers}</h3>
                  <p>Total Usuarios</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <UserCheck size={24} className={styles.iconGreen} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{loading ? '...' : stats.adminUsers}</h3>
                  <p>Administradores</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Bell size={24} className={styles.iconPurple} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{loading ? '...' : stats.activeNotifications}</h3>
                  <p>Notificaciones Activas</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUp size={24} className={styles.iconAmber} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{loading ? '...' : stats.suscriptorUsers}</h3>
                  <p>Suscriptores</p>
                </div>
              </div>
            </div>

            {/* Main Dashboard Sections */}
            <div className={styles.sectionsGrid}>
              {dashboardSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  className={styles.sectionCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`${styles.sectionHeader} ${styles[section.id]}`}>
                    <div className={`${styles.sectionIcon} bg-gradient-to-br ${section.color}`}>
                      {section.icon}
                    </div>
                    <div className={styles.sectionInfo}>
                      <h3 className={styles.sectionTitle}>{section.title}</h3>
                      <p className={styles.sectionDescription}>{section.description}</p>
                    </div>
                  </div>

                  <div className={styles.sectionActions}>
                    {section.links.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        href={link.href}
                        className={styles.sectionLink}
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h2 className={styles.quickActionsTitle}>Acciones Rápidas</h2>
              <div className={styles.quickActionsGrid}>
                <Link href="/admin/notifications" className={`${styles.quickActionCard} ${styles.notifications}`}>
                  <Bell size={24} />
                  <span>Nueva Notificación</span>
                </Link>
                <Link href="/admin/users" className={`${styles.quickActionCard} ${styles.users}`}>
                  <Plus size={24} />
                  <span>Gestionar Usuarios</span>
                </Link>
                <Link href="/admin/billing/export" className={`${styles.quickActionCard} ${styles.export}`}>
                  <Download size={24} />
                  <span>Exportar Datos</span>
                </Link>
                <Link href="/admin/email/bulk" className={`${styles.quickActionCard} ${styles.email}`}>
                  <Mail size={24} />
                  <span>Envío Masivo</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentActivity}>
              <div className={styles.activityHeader}>
                <h2 className={styles.activityTitle}>Actividad Reciente</h2>
                <Link href="/admin/logs" className={styles.viewAllLink}>
                  Ver Todo
                </Link>
              </div>
              <div className={styles.activityList}>
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Cargando actividad...</p>
                  </div>
                ) : stats.recentActivity.length === 0 ? (
                  <div className={styles.emptyActivity}>
                    <Activity size={48} className={styles.emptyIcon} />
                    <p>No hay actividad reciente</p>
                  </div>
                ) : (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        <Activity size={16} />
                      </div>
                      <div className={styles.activityContent}>
                        <p className={styles.activityText}>{activity.description}</p>
                        <span className={styles.activityTime}>{activity.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('🔍 Dashboard - Verificando sesión...');
  
  try {
    const session = await getSession(context);
    
    if (!session) {
      console.log('❌ Dashboard - No hay sesión, redirigiendo a login');
      return {
        redirect: {
          destination: '/api/auth/signin',
          permanent: false,
        },
      };
    }

    console.log('✅ Dashboard - Sesión válida encontrada');
    
    return {
      props: {
        session,
      },
    };

  } catch (error) {
    console.error('❌ Dashboard - Error en getServerSideProps:', error);
    
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
}; 