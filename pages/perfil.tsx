import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useMemo, useEffect } from 'react';
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
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/Perfil.module.css';

// Interfaz para los datos del perfil
interface UserProfile {
  email: string;
  name: string;
  image: string;
  fullName?: string;
  cuitCuil?: string;
  educacionFinanciera?: string;
  brokerPreferencia?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Función para mostrar el nombre del broker de forma legible
const getBrokerDisplayName = (brokerValue: string) => {
  const brokerNames: { [key: string]: string } = {
    'bull-market': 'Bull Market',
    'iol': 'IOL',
    'portfolio-personal': 'Portfolio Personal',
    'cocos-capital': 'Cocos Capital',
    'eco-valores': 'Eco Valores',
    'otros': 'Otros'
  };
  return brokerNames[brokerValue] || brokerValue;
};

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const [activeSection, setActiveSection] = useState(1);
  const [showIncompleteNotification, setShowIncompleteNotification] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    cuitCuil: '',
    educacionFinanciera: '',
    brokerPreferencia: '',
    avatarUrl: ''
  });
  const [previewAvatar, setPreviewAvatar] = useState('');

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch('/api/profile/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUserProfile(result.profile);
        
        // Inicializar formulario con datos reales
        setFormData({
          fullName: result.profile.fullName || result.profile.name || '',
          cuitCuil: result.profile.cuitCuil || '',
          educacionFinanciera: result.profile.educacionFinanciera || '',
          brokerPreferencia: result.profile.brokerPreferencia || '',
          avatarUrl: result.profile.avatarUrl || result.profile.image || ''
        });
        setPreviewAvatar(result.profile.avatarUrl || result.profile.image || '');
      } else {
        console.error('Error al obtener perfil:', response.statusText);
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Obtener perfil al cargar y cuando la sesión esté lista
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
    }
  }, [session]);

  // Verificar información incompleta del perfil usando datos reales
  const profileIncomplete = useMemo(() => {
    if (!userProfile) return { incomplete: false, missingFields: [] };
    
    const missingFields = [];
    
    // Verificar campos obligatorios
    if (!userProfile.fullName || userProfile.fullName.trim() === '') {
      missingFields.push('Nombre completo');
    }
    
    if (!userProfile.cuitCuil) {
      missingFields.push('CUIT/CUIL');
    }
    
    if (!userProfile.educacionFinanciera) {
      missingFields.push('Educación Financiera');
    }
    
    if (!userProfile.brokerPreferencia) {
      missingFields.push('Broker de Preferencia');
    }
    
    return {
      incomplete: missingFields.length > 0,
      missingFields
    };
  }, [userProfile]);

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 5000);
  };

  // Función para manejar upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'La imagen no puede superar los 5MB');
      return;
    }

    setIsLoading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (response.ok) {
        const newAvatarUrl = result.avatarUrl;
        setFormData({ ...formData, avatarUrl: newAvatarUrl });
        setPreviewAvatar(newAvatarUrl);
        showNotification('success', 'Avatar subido exitosamente');
      } else {
        showNotification('error', result.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al subir la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar el perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      showNotification('error', 'El nombre completo es obligatorio');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          cuitCuil: formData.cuitCuil,
          educacionFinanciera: formData.educacionFinanciera,
          brokerPreferencia: formData.brokerPreferencia,
          avatarUrl: formData.avatarUrl
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showNotification('success', 'Perfil actualizado exitosamente');
        setShowEditModal(false);
        setShowIncompleteNotification(false);
        
        // Actualizar los datos del perfil inmediatamente
        await fetchUserProfile();
        
        // También actualizar la sesión de NextAuth si es necesario
        await update();
      } else {
        showNotification('error', result.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || profileLoading) {
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

  if (!session || !userProfile) {
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
                  Servicios y Funcionalidades
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
                    <button 
                      className={styles.editButton}
                      onClick={() => setShowEditModal(true)}
                    >
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
                          <span className={`${styles.value} ${!userProfile?.fullName ? styles.missing : ''}`}>
                            {userProfile?.fullName || 'No especificado'}
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>CUIT/CUIL:</span>
                          <span className={`${styles.value} ${!userProfile?.cuitCuil ? styles.missing : ''}`}>
                            {userProfile?.cuitCuil || 'No especificado'}
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
                          <span className={styles.value}>{userProfile?.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Avatar:</span>
                          <span className={styles.value}>
                            <img 
                              src={userProfile?.avatarUrl || userProfile?.image || `https://via.placeholder.com/40x40/3b82f6/ffffff?text=${userProfile?.name?.charAt(0) || 'U'}`}
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
                          <span className={`${styles.value} ${!userProfile?.educacionFinanciera ? styles.missing : ''}`}>
                            {userProfile?.educacionFinanciera ? 
                              userProfile.educacionFinanciera.charAt(0).toUpperCase() + userProfile.educacionFinanciera.slice(1) : 
                              'No especificado'
                            }
                          </span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.label}>Broker de Preferencia:</span>
                          <span className={`${styles.value} ${!userProfile?.brokerPreferencia ? styles.missing : ''}`}>
                            {userProfile?.brokerPreferencia ? 
                              getBrokerDisplayName(userProfile.brokerPreferencia) : 
                              'No especificado'
                            }
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

        {/* Modal de Edición del Perfil */}
        {showEditModal && (
          <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Editar Información Personal</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalContent}>
                <form className={styles.editForm} onSubmit={handleSaveProfile}>
                  <div className={styles.formGrid}>
                    {/* Preview del Avatar */}
                    <div className={styles.formGroup}>
                      <label>Avatar Actual</label>
                      <div className={styles.avatarPreview}>
                        <img 
                          src={previewAvatar || userProfile?.avatarUrl || userProfile?.image || `https://via.placeholder.com/80x80/3b82f6/ffffff?text=${userProfile?.name?.charAt(0) || 'U'}`}
                          alt="Avatar preview"
                          className={styles.avatarImage}
                        />
                        <div className={styles.avatarActions}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className={styles.fileInput}
                            id="avatarUpload"
                            disabled={isLoading}
                          />
                          <label htmlFor="avatarUpload" className={styles.uploadButton}>
                            {isLoading ? 'Subiendo...' : 'Cambiar Foto'}
                          </label>
                          <small className={styles.uploadNote}>
                            JPG, PNG o GIF. Máximo 5MB.
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="fullName">Nombre y Apellido</label>
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        className={styles.formInput}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="cuitCuil">CUIT/CUIL</label>
                      <input
                        type="text"
                        id="cuitCuil"
                        value={formData.cuitCuil}
                        placeholder="Ej: 20-12345678-9"
                        className={styles.formInput}
                        onChange={(e) => setFormData({ ...formData, cuitCuil: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">Correo Electrónico</label>
                      <input
                        type="email"
                        id="email"
                        value={userProfile?.email || ''}
                        className={styles.formInput}
                        disabled
                      />
                      <small className={styles.formNote}>
                        El email no se puede modificar por seguridad
                      </small>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="educacionFinanciera">Educación Financiera</label>
                      <select 
                        id="educacionFinanciera" 
                        className={styles.formSelect} 
                        value={formData.educacionFinanciera}
                        onChange={(e) => setFormData({ ...formData, educacionFinanciera: e.target.value })}
                      >
                        <option value="">Seleccionar nivel</option>
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                        <option value="experto">Experto</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="brokerPreferencia">Broker de Preferencia</label>
                      <select 
                        id="brokerPreferencia" 
                        className={styles.formSelect}
                        value={formData.brokerPreferencia}
                        onChange={(e) => setFormData({ ...formData, brokerPreferencia: e.target.value })}
                      >
                        <option value="">Seleccionar broker</option>
                        <option value="bull-market">Bull Market</option>
                        <option value="iol">IOL</option>
                        <option value="portfolio-personal">Portfolio Personal</option>
                        <option value="cocos-capital">Cocos Capital</option>
                        <option value="eco-valores">Eco Valores</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <button 
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className={styles.saveButton}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {notification.show && (
        <motion.div
          className={`${styles.toast} ${styles[notification.type]}`}
          initial={{ opacity: 0, y: 50, x: '50%' }}
          animate={{ opacity: 1, y: 0, x: '50%' }}
          exit={{ opacity: 0, y: 50, x: '50%' }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.toastIcon}>
            {notification.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
          </div>
          <span className={styles.toastMessage}>{notification.message}</span>
          <button 
            className={styles.toastClose}
            onClick={() => setNotification({ show: false, type: 'success', message: '' })}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

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