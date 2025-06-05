import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  ShoppingBag, 
  Settings, 
  Bell
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/Perfil.module.css';

interface PerfilPageProps {
  session: any;
  userDetails: any;
}

export default function PerfilPage({ session }: PerfilPageProps) {
  const [activeTab, setActiveTab] = useState('perfil');

  const tabs = [
    { id: 'perfil', label: 'Mi Perfil', icon: <User size={20} /> },
    { id: 'suscripciones', label: 'Suscripciones', icon: <Bell size={20} /> },
    { id: 'compras', label: 'Mis Compras', icon: <ShoppingBag size={20} /> },
    { id: 'facturacion', label: 'Facturación', icon: <CreditCard size={20} /> },
    { id: 'configuracion', label: 'Configuración', icon: <Settings size={20} /> },
  ];

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'Activa',
      'inactive': 'Inactiva',
      'pending': 'Pendiente',
      'completed': 'Completado',
      'failed': 'Fallido',
      'cancelled': 'Cancelado',
      'confirmed': 'Confirmado'
    };
    return statusMap[status] || status;
  };

  const getRoleText = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrador',
      'suscriptor': 'Suscriptor',
      'normal': 'Usuario'
    };
    return roleMap[role] || 'Usuario';
  };

  return (
    <>
      <Head>
        <title>Mi Perfil - Nahuel Lozano</title>
        <meta name="description" content="Gestiona tu perfil, suscripciones y configuración" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className="container">
          <motion.div
            className={styles.perfilContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Encabezado */}
            <div className={styles.perfilHeader}>
              <div className={styles.userInfo}>
                <img 
                  src={session?.user?.image || `https://via.placeholder.com/80x80/2563eb/ffffff?text=${session?.user?.name?.charAt(0) || 'U'}`}
                  alt={session?.user?.name || 'Usuario'}
                  className={styles.userAvatar}
                />
                <div>
                  <h1 className={styles.userName}>{session?.user?.name}</h1>
                  <p className={styles.userEmail}>{session?.user?.email}</p>
                  <span className={`${styles.userRole} ${styles[session?.user?.role || 'normal']}`}>
                    {getRoleText(session?.user?.role || 'normal')}
                  </span>
                </div>
              </div>
            </div>

            {/* Pestañas */}
            <div className={styles.tabsContainer}>
              <div className={styles.tabs}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido de Pestañas */}
            <div className={styles.tabContent}>
              {/* Pestaña Perfil */}
              {activeTab === 'perfil' && (
                <motion.div
                  className={styles.tabPanel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2>Información Personal</h2>
                  <div className={styles.profileGrid}>
                    <div className={styles.profileCard}>
                      <div className={styles.cardHeader}>
                        <User size={24} />
                        <h3>Datos Básicos</h3>
                      </div>
                      <div className={styles.profileInfo}>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Nombre:</span>
                          <span className={styles.value}>{session?.user?.name}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Correo Electrónico:</span>
                          <span className={styles.value}>{session?.user?.email}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Foto de Perfil:</span>
                          <span className={styles.value}>
                            {session?.user?.image ? 'Configurada desde Google' : 'No disponible'}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Proveedor de Autenticación:</span>
                          <span className={styles.value}>Google</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Rol:</span>
                          <span className={styles.value}>{getRoleText(session?.user?.role || 'normal')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Pestaña Suscripciones */}
              {activeTab === 'suscripciones' && (
                <motion.div
                  className={styles.tabPanel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2>Mis Suscripciones</h2>
                  <div className={styles.subscriptionsGrid}>
                    {session?.user?.suscripciones?.length > 0 ? (
                      session.user.suscripciones.map((suscripcion: any, index: number) => (
                        <div key={index} className={styles.subscriptionCard}>
                          <div className={styles.subscriptionHeader}>
                            <h3>{suscripcion.servicio}</h3>
                            <span className={`${styles.status} ${suscripcion.activa ? styles.active : styles.inactive}`}>
                              {suscripcion.activa ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          <div className={styles.subscriptionInfo}>
                            <div className={styles.infoRow}>
                              <span className={styles.label}>Fecha de Inicio:</span>
                              <span className={styles.value}>{formatDate(suscripcion.fechaInicio)}</span>
                            </div>
                            <div className={styles.infoRow}>
                              <span className={styles.label}>Fecha de Vencimiento:</span>
                              <span className={styles.value}>{formatDate(suscripcion.fechaVencimiento)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <Bell size={48} />
                        <h3>No tienes suscripciones activas</h3>
                        <p>Explora nuestros servicios de alertas y entrenamientos</p>
                        <a href="/alertas" className="btn btn-primary">Ver Servicios</a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Pestaña Compras */}
              {activeTab === 'compras' && (
                <motion.div
                  className={styles.tabPanel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2>Historial de Compras</h2>
                  <div className={styles.emptyState}>
                    <ShoppingBag size={48} />
                    <h3>Historial de Compras</h3>
                    <p>Esta sección estará disponible próximamente</p>
                    <p>Por ahora, todas las compras se procesan directamente a través de nuestros sistemas de pago</p>
                    <a href="/entrenamientos" className="btn btn-primary">Ver Entrenamientos</a>
                  </div>
                </motion.div>
              )}

              {/* Pestaña Facturación */}
              {activeTab === 'facturacion' && (
                <motion.div
                  className={styles.tabPanel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2>Información de Facturación</h2>
                  <div className={styles.emptyState}>
                    <CreditCard size={48} />
                    <h3>Información de Facturación</h3>
                    <p>Los pagos se procesan de forma segura a través de:</p>
                    <div style={{ margin: '1rem 0' }}>
                      <p>💳 <strong>Stripe</strong> - Tarjetas internacionales</p>
                      <p>💰 <strong>Mobbex</strong> - Pagos locales (Argentina/Uruguay)</p>
                    </div>
                    <p>No almacenamos información de tarjetas por seguridad</p>
                  </div>
                </motion.div>
              )}

              {/* Pestaña Configuración */}
              {activeTab === 'configuracion' && (
                <motion.div
                  className={styles.tabPanel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2>Configuración de Cuenta</h2>
                  <div className={styles.settingsGrid}>
                    <div className={styles.settingsCard}>
                      <div className={styles.cardHeader}>
                        <Settings size={24} />
                        <h3>Preferencias</h3>
                      </div>
                      <div className={styles.settingsContent}>
                        <div className={styles.settingItem}>
                          <div>
                            <h4>Notificaciones por Correo</h4>
                            <p>Recibir alertas y actualizaciones por correo electrónico</p>
                          </div>
                          <label className={styles.switch}>
                            <input type="checkbox" defaultChecked />
                            <span className={styles.slider}></span>
                          </label>
                        </div>
                        <div className={styles.settingItem}>
                          <div>
                            <h4>Alertas Push</h4>
                            <p>Notificaciones en tiempo real</p>
                          </div>
                          <label className={styles.switch}>
                            <input type="checkbox" defaultChecked />
                            <span className={styles.slider}></span>
                          </label>
                        </div>
                        <div className={styles.settingItem}>
                          <div>
                            <h4>Reportes Semanales</h4>
                            <p>Resumen semanal de rendimiento</p>
                          </div>
                          <label className={styles.switch}>
                            <input type="checkbox" />
                            <span className={styles.slider}></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className={styles.settingsCard}>
                      <div className={styles.cardHeader}>
                        <User size={24} />
                        <h3>Seguridad</h3>
                      </div>
                      <div className={styles.settingsContent}>
                        <button className="btn btn-outline">Cambiar Contraseña</button>
                        <button className="btn btn-outline">Configurar 2FA</button>
                        <button className="btn btn-outline">Descargar Mis Datos</button>
                        <button className="btn btn-danger">Eliminar Cuenta</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Solo devolvemos la sesión, toda la información viene de Google OAuth
  return {
    props: {
      session,
      userDetails: null, // No necesitamos datos adicionales
    },
  };
};