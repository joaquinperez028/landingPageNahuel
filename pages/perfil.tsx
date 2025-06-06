import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  Bell,
  Mail,
  Building,
  GraduationCap,
  TrendingUp,
  Edit3,
  Download,
  Calendar,
  DollarSign,
  AlertTriangle,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/Perfil.module.css';

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState(1);
  const [showIncompleteNotification, setShowIncompleteNotification] = useState(true);

  // Verificar información incompleta del perfil
  const profileIncomplete = useMemo(() => {
    if (!session?.user) return { incomplete: false, missingFields: [] };
    
    const missingFields = [];
    
    // Verificar campos obligatorios
    if (!session.user.name || session.user.name.trim() === '') {
      missingFields.push('Nombre completo');
    }
    
    // Simular otros campos que podrían faltar
    // En una implementación real, estos vendrían de la base de datos
    const mockUserData = {
      cuitCuil: null, // Este vendría de la BD
      educacionFinanciera: null, // Este vendría de la BD  
      brokerPreferencia: null, // Este vendría de la BD
    };
    
    if (!mockUserData.cuitCuil) {
      missingFields.push('CUIT/CUIL');
    }
    
    if (!mockUserData.educacionFinanciera) {
      missingFields.push('Educación Financiera');
    }
    
    if (!mockUserData.brokerPreferencia) {
      missingFields.push('Broker de Preferencia');
    }
    
    return {
      incomplete: missingFields.length > 0,
      missingFields
    };
  }, [session]);

  if (status === 'loading') {
    return (
      <>
        <Head>
          <title>Mi Cuenta - Nahuel Lozano</title>
        </Head>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner} />
              <p>Cargando tu cuenta...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!session) {
    return null;
  }

  const sections = [
    {
      id: 1,
      title: 'Información Personal',
      description: 'Nombre y Apellido, Avatar, CUIT/CUIL, Correo Electrónico, Educación Financiera, Broker de Preferencia',
      icon: <User size={20} />
    },
    {
      id: 2,
      title: 'Mis Compras',
      description: 'Suscripciones, Compras Entrenamientos, Compras Cursos, etc',
      icon: <ShoppingBag size={20} />
    },
    {
      id: 3,
      title: 'Notificaciones',
      description: 'Central de Notificaciones del usuario respecto al pago y novedades',
      icon: <Bell size={20} />
    }
  ];

  return (
    <>
      <Head>
        <title>Mi Cuenta - Nahuel Lozano</title>
        <meta name="description" content="Gestiona tu cuenta, información personal y consulta tu historial de compras" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            className={styles.profileContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div className={styles.profileHeader}>
              <h1 className={styles.mainTitle}>Mi Cuenta</h1>
              <p className={styles.mainSubtitle}>
                Gestiona tu información personal y consulta tu historial de compras
              </p>
            </div>

            {/* Notificación de perfil incompleto */}
            {profileIncomplete.incomplete && showIncompleteNotification && (
              <motion.div
                className={styles.incompleteNotification}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationIcon}>
                    <AlertTriangle size={24} />
                  </div>
                  <div className={styles.notificationText}>
                    <h3>Completa tu perfil</h3>
                    <p>
                      Te faltan algunos datos importantes: {profileIncomplete.missingFields.join(', ')}. 
                      Completar tu perfil te ayudará a tener una mejor experiencia.
                    </p>
                  </div>
                  <div className={styles.notificationActions}>
                    <button 
                      className={styles.completeButton}
                      onClick={() => {
                        setActiveSection(1);
                        setShowIncompleteNotification(false);
                      }}
                    >
                      Completar Ahora
                    </button>
                    <button 
                      className={styles.dismissButton}
                      onClick={() => setShowIncompleteNotification(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Table */}
            <div className={styles.navigationTable}>
              <div className={styles.tableHeader}>
                <div className={styles.headerColumn}>Menú y Submenú Desplegable</div>
                <div className={styles.headerColumn}>
                  Alertas (Trader Call - Smart Money - CashFlow) - Entrenamientos - Cursos - Asesorías (Consultorio Financiero - Cuenta Asesorada) - Recursos
                </div>
              </div>
              
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  className={`${styles.tableRow} ${activeSection === section.id ? styles.active : ''}`}
                  onClick={() => setActiveSection(section.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.sectionNumber}>{section.id}</div>
                  <div className={styles.sectionInfo}>
                    <div className={styles.sectionTitle}>
                      {section.icon}
                      <span>{section.title}</span>
                    </div>
                  </div>
                  <div className={styles.sectionDescription}>
                    {section.description}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Content Sections */}
            <div className={styles.contentContainer}>
              {/* Información Personal */}
              {activeSection === 1 && (
                <motion.div
                  className={styles.sectionContent}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={styles.sectionHeader}>
                    <h2>Información Personal</h2>
                    <button className={styles.editButton}>
                      <Edit3 size={16} />
                      Carga y Modificación
                    </button>
                  </div>
                  
                  <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                      <div className={styles.cardIcon}>
                        <User size={24} />
                      </div>
                      <h3>Datos Personales</h3>
                      <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Nombre y Apellido:</span>
                          <span className={`${styles.value} ${!session?.user?.name ? styles.missing : ''}`}>
                            {session?.user?.name || 'No especificado'}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>CUIT/CUIL:</span>
                          <span className={`${styles.value} ${styles.missing}`}>
                            No especificado
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoCard}>
                      <div className={styles.cardIcon}>
                        <Mail size={24} />
                      </div>
                      <h3>Contacto</h3>
                      <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Correo Electrónico:</span>
                          <span className={styles.value}>{session?.user?.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Avatar:</span>
                          <span className={styles.value}>
                            <img 
                              src={session?.user?.image || `https://via.placeholder.com/40x40/3b82f6/ffffff?text=${session?.user?.name?.charAt(0) || 'U'}`}
                              alt="Avatar"
                              className={styles.avatarSmall}
                            />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoCard}>
                      <div className={styles.cardIcon}>
                        <GraduationCap size={24} />
                      </div>
                      <h3>Preferencias</h3>
                      <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Educación Financiera:</span>
                          <span className={`${styles.value} ${styles.missing}`}>
                            No especificado
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Broker de Preferencia:</span>
                          <span className={`${styles.value} ${styles.missing}`}>
                            No especificado
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información sobre seguridad de pagos */}
                  <div className={styles.securityNotice}>
                    <div className={styles.securityIcon}>
                      🔒
                    </div>
                    <div className={styles.securityText}>
                      <h4>Seguridad en Pagos</h4>
                      <p>
                        Por tu seguridad, no almacenamos información de tarjetas de crédito. 
                        Todos los pagos se procesan de forma segura a través de <strong>Mercado Pago</strong> y <strong>transferencia bancaria</strong> 
                        al momento de realizar cada compra.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mis Compras */}
              {activeSection === 2 && (
                <motion.div
                  className={styles.sectionContent}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={styles.sectionHeader}>
                    <h2>Mis Compras</h2>
                    <button className={styles.downloadButton}>
                      <Download size={16} />
                      Descargar Historial
                    </button>
                  </div>
                  
                  <div className={styles.purchasesGrid}>
                    <div className={styles.purchaseCard}>
                      <div className={styles.cardHeader}>
                        <TrendingUp size={24} />
                        <h3>Suscripciones Activas</h3>
                      </div>
                      <div className={styles.subscriptionsList}>
                        <div className={styles.subscriptionItem}>
                          <div className={styles.subInfo}>
                            <h4>Smart Money Premium</h4>
                            <p>Suscripción mensual</p>
                          </div>
                          <div className={styles.subPrice}>$99 USD</div>
                          <div className={styles.subStatus}>Activa</div>
                        </div>
                        <div className={styles.subscriptionItem}>
                          <div className={styles.subInfo}>
                            <h4>Trader Call</h4>
                            <p>Suscripción mensual</p>
                          </div>
                          <div className={styles.subPrice}>$49 USD</div>
                          <div className={styles.subStatus}>Activa</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.purchaseCard}>
                      <div className={styles.cardHeader}>
                        <GraduationCap size={24} />
                        <h3>Entrenamientos</h3>
                      </div>
                      <div className={styles.purchasesList}>
                        <div className={styles.purchaseItem}>
                          <div className={styles.purchaseInfo}>
                            <h4>Trading Fundamentals</h4>
                            <p>Comprado el 15 de Enero, 2024</p>
                          </div>
                          <div className={styles.purchaseAmount}>$299 USD</div>
                        </div>
                        <div className={styles.purchaseItem}>
                          <div className={styles.purchaseInfo}>
                            <h4>Advanced Trading</h4>
                            <p>Comprado el 10 de Marzo, 2024</p>
                          </div>
                          <div className={styles.purchaseAmount}>$499 USD</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.purchaseCard}>
                      <div className={styles.cardHeader}>
                        <Building size={24} />
                        <h3>Asesorías</h3>
                      </div>
                      <div className={styles.purchasesList}>
                        <div className={styles.purchaseItem}>
                          <div className={styles.purchaseInfo}>
                            <h4>Consultorio Financiero</h4>
                            <p>Sesión del 20 de Abril, 2024</p>
                          </div>
                          <div className={styles.purchaseAmount}>$150 USD</div>
                        </div>
                        <div className={styles.purchaseItem}>
                          <div className={styles.purchaseInfo}>
                            <h4>Cuenta Asesorada</h4>
                            <p>Abril 2024</p>
                          </div>
                          <div className={styles.purchaseAmount}>$999 USD</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notificaciones */}
              {activeSection === 3 && (
                <motion.div
                  className={styles.sectionContent}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={styles.sectionHeader}>
                    <h2>Central de Notificaciones</h2>
                  </div>
                  
                  <div className={styles.notificationsContainer}>
                    <div className={styles.notificationCard}>
                      <div className={styles.cardHeader}>
                        <Bell size={24} />
                        <h3>Notificaciones de Pago</h3>
                      </div>
                      <div className={styles.notificationsList}>
                        <div className={styles.notificationItem}>
                          <div className={styles.notificationIcon}>
                            <DollarSign size={16} />
                          </div>
                          <div className={styles.notificationContent}>
                            <h4>Pago procesado exitosamente</h4>
                            <p>Tu suscripción a Smart Money ha sido renovada</p>
                            <span className={styles.notificationTime}>Hace 2 días</span>
                          </div>
                        </div>
                        <div className={styles.notificationItem}>
                          <div className={styles.notificationIcon}>
                            <Calendar size={16} />
                          </div>
                          <div className={styles.notificationContent}>
                            <h4>Próximo cobro programado</h4>
                            <p>Tu suscripción se renovará el 15 de mayo</p>
                            <span className={styles.notificationTime}>Hace 1 semana</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.notificationCard}>
                      <div className={styles.cardHeader}>
                        <TrendingUp size={24} />
                        <h3>Novedades y Actualizaciones</h3>
                      </div>
                      <div className={styles.notificationsList}>
                        <div className={styles.notificationItem}>
                          <div className={styles.notificationIcon}>
                            <Bell size={16} />
                          </div>
                          <div className={styles.notificationContent}>
                            <h4>Nuevo contenido disponible</h4>
                            <p>Se ha publicado un nuevo análisis en Smart Money</p>
                            <span className={styles.notificationTime}>Hace 3 horas</span>
                          </div>
                        </div>
                        <div className={styles.notificationItem}>
                          <div className={styles.notificationIcon}>
                            <GraduationCap size={16} />
                          </div>
                          <div className={styles.notificationContent}>
                            <h4>Nuevo entrenamiento disponible</h4>
                            <p>Advanced Trading: Módulo 5 ya está disponible</p>
                            <span className={styles.notificationTime}>Hace 1 día</span>
                          </div>
                        </div>
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
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};