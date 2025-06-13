import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Filter,
  Calendar,
  Clock
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

// Memoizar las secciones del dashboard para evitar re-renders innecesarios
const useDashboardSections = () => {
  return useMemo(() => [
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
        { label: 'Usuarios Activos', href: '/admin/users/active', icon: <UserCheck size={16} /> },
        { label: 'Gestión de Roles', href: '/admin/users/roles', icon: <Settings size={16} /> }
      ]
    },
    {
      id: 'schedules',
      title: 'Gestión de Horarios',
      description: 'Envío centralizado de links de reunión para asesorías y entrenamientos programados. Lista de sesiones próximas ordenadas por proximidad para gestión eficiente.',
      icon: <Calendar size={32} />,
      color: 'from-indigo-500 to-purple-500',
      links: [
        { label: 'Horarios Asesorías', href: '/admin/asesorias-horarios', icon: <Clock size={16} /> },
        { label: 'Horarios Entrenamientos', href: '/admin/entrenamientos-horarios', icon: <Calendar size={16} /> },
        { label: 'Enviar Link de Reunión', href: '/admin/horarios', icon: <Settings size={16} /> }
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
  ], []);
};

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
  const [fixingLogins, setFixingLogins] = useState(false);

  const dashboardSections = useDashboardSections();

  // Optimizar la función de fetch con useCallback
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📊 Dashboard - Cargando estadísticas...');
      
      // Usar AbortController para cancelar requests si el componente se desmonta
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch('/api/admin/dashboard/stats', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard - Estadísticas cargadas:', data);
        setStats(data);
      } else {
        console.error('❌ Dashboard - Error al cargar estadísticas:', response.status);
        // Mostrar datos por defecto en caso de error
        setStats(prev => ({ ...prev }));
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('💥 Dashboard - Error al cargar estadísticas:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimizar la función de corrección de logins
  const fixLoginDates = useCallback(async () => {
    try {
      setFixingLogins(true);
      console.log('🔧 Iniciando corrección de fechas de login...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos para esta operación
      
      const response = await fetch('/api/admin/users/fix-login-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Corrección completada:', data);
        
        if (data.updated > 0) {
          alert(`✅ Se actualizaron ${data.updated} usuarios con fechas de último login`);
          // Recargar estadísticas
          fetchDashboardStats();
        } else {
          alert('ℹ️ Todos los usuarios ya tienen fecha de último login configurada');
        }
      } else {
        console.error('❌ Error en corrección:', response.status);
        alert('❌ Error al corregir fechas de login');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('💥 Error al corregir fechas:', error);
        alert('💥 Error al corregir fechas de login');
      }
    } finally {
      setFixingLogins(false);
    }
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Memoizar las estadísticas para evitar re-renders
  const statsCards = useMemo(() => [
    {
      icon: <Users size={24} className={styles.iconBlue} />,
      value: stats.totalUsers,
      label: 'Total Usuarios'
    },
    {
      icon: <UserCheck size={24} className={styles.iconGreen} />,
      value: stats.adminUsers,
      label: 'Administradores'
    },
    {
      icon: <Bell size={24} className={styles.iconPurple} />,
      value: stats.activeNotifications,
      label: 'Notificaciones Activas'
    },
    {
      icon: <TrendingUp size={24} className={styles.iconAmber} />,
      value: stats.suscriptorUsers,
      label: 'Suscriptores'
    }
  ], [stats]);

  return (
    <>
      <Head>
        <title>Dashboard Administrador - Nahuel Lozano</title>
        <meta name="description" content="Panel de administración principal" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preload" href="/api/admin/dashboard/stats" as="fetch" crossOrigin="anonymous" />
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
              {statsCards.map((stat, index) => (
                <motion.div
                  key={index}
                  className={styles.statCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.statIcon}>
                    {stat.icon}
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{loading ? '...' : stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                </motion.div>
              ))}
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
                <Link href="/admin/asesorias-horarios" className={`${styles.quickActionCard} ${styles.schedules}`}>
                  <Calendar size={24} />
                  <span>Crear Horarios</span>
                </Link>
                <Link href="/admin/billing/export" className={`${styles.quickActionCard} ${styles.export}`}>
                  <Download size={24} />
                  <span>Exportar Datos</span>
                </Link>
                <Link href="/admin/email/bulk" className={`${styles.quickActionCard} ${styles.email}`}>
                  <Mail size={24} />
                  <span>Envío Masivo</span>
                </Link>
                <button
                  onClick={fixLoginDates}
                  disabled={fixingLogins}
                  className={`${styles.quickActionCard} ${styles.users}`}
                  style={{ 
                    border: 'none', 
                    cursor: fixingLogins ? 'not-allowed' : 'pointer',
                    opacity: fixingLogins ? 0.6 : 1
                  }}
                >
                  <Activity size={24} />
                  <span>{fixingLogins ? 'Corrigiendo...' : 'Corregir Login Dates'}</span>
                </button>
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
                    <motion.div 
                      key={index} 
                      className={styles.activityItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={styles.activityIcon}>
                        <Activity size={16} />
                      </div>
                      <div className={styles.activityContent}>
                        <p className={styles.activityText}>{activity.description}</p>
                        <span className={styles.activityTime}>{activity.time}</span>
                      </div>
                    </motion.div>
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
  console.log('🔍 [DASHBOARD] Iniciando verificación de acceso...');
  
  try {
    // Usar la función de verificación que ya sabemos que funciona
    const verification = await verifyAdminAccess(context);
    
    console.log('🔍 [DASHBOARD] Resultado de verificación:', verification);
    
    if (!verification.isAdmin) {
      console.log('❌ [DASHBOARD] Acceso denegado - redirigiendo a:', verification.redirectTo);
      return {
        redirect: {
          destination: verification.redirectTo || '/',
          permanent: false,
        },
      };
    }

    console.log('✅ [DASHBOARD] Acceso de admin confirmado para:', verification.user?.email);
    
    return {
      props: {
        user: verification.user,
      },
    };

  } catch (error) {
    console.error('💥 [DASHBOARD] Error en getServerSideProps:', error);
    
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
}; 