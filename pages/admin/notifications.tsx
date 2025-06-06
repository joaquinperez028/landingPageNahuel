import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Megaphone,
  Gift,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import User from '@/models/User';
import styles from '@/styles/AdminNotifications.module.css';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'novedad' | 'actualizacion' | 'sistema' | 'promocion';
  priority: 'alta' | 'media' | 'baja';
  targetUsers: 'todos' | 'suscriptores' | 'admin';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  icon: string;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationFormData {
  title: string;
  message: string;
  type: 'novedad' | 'actualizacion' | 'sistema' | 'promocion';
  priority: 'alta' | 'media' | 'baja';
  targetUsers: 'todos' | 'suscriptores' | 'admin';
  icon: string;
  actionUrl: string;
  actionText: string;
  expiresAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'novedad',
    priority: 'media',
    targetUsers: 'todos',
    icon: '📢',
    actionUrl: '',
    actionText: '',
    expiresAt: ''
  });

  // Obtener todas las notificaciones
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications/list');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mostrar notificaciones toast
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 5000);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'novedad',
      priority: 'media',
      targetUsers: 'todos',
      icon: '📢',
      actionUrl: '',
      actionText: '',
      expiresAt: ''
    });
  };

  // Abrir modal de creación
  const handleCreateNew = () => {
    resetForm();
    setEditingNotification(null);
    setShowCreateModal(true);
  };

  // Abrir modal de edición
  const handleEdit = (notif: Notification) => {
    setFormData({
      title: notif.title,
      message: notif.message,
      type: notif.type,
      priority: notif.priority,
      targetUsers: notif.targetUsers,
      icon: notif.icon,
      actionUrl: notif.actionUrl || '',
      actionText: notif.actionText || '',
      expiresAt: notif.expiresAt ? new Date(notif.expiresAt).toISOString().slice(0, 16) : ''
    });
    setEditingNotification(notif);
    setShowCreateModal(true);
  };

  // Crear o editar notificación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      showNotification('error', 'El título y mensaje son obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingNotification 
        ? `/api/admin/notifications/update/${editingNotification._id}`
        : '/api/admin/notifications/create';
      
      const method = editingNotification ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
        })
      });

      const result = await response.json();

      if (response.ok) {
        showNotification('success', 
          editingNotification 
            ? 'Notificación actualizada exitosamente'
            : 'Notificación creada exitosamente'
        );
        setShowCreateModal(false);
        resetForm();
        setEditingNotification(null);
        fetchNotifications();
      } else {
        showNotification('error', result.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar notificación
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/notifications/delete/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('success', 'Notificación eliminada exitosamente');
        fetchNotifications();
      } else {
        const result = await response.json();
        showNotification('error', result.message || 'Error al eliminar la notificación');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al eliminar la notificación');
    }
  };

  // Cambiar estado activo/inactivo
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/notifications/toggle/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        showNotification('success', 
          `Notificación ${!isActive ? 'activada' : 'desactivada'} exitosamente`
        );
        fetchNotifications();
      } else {
        const result = await response.json();
        showNotification('error', result.message || 'Error al actualizar la notificación');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al actualizar la notificación');
    }
  };

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'todos' || notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Obtener ícono del tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promocion': return <Gift size={20} />;
      case 'actualizacion': return <CheckCircle size={20} />;
      case 'sistema': return <AlertTriangle size={20} />;
      default: return <Megaphone size={20} />;
    }
  };

  // Obtener color del tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promocion': return '#f59e0b';
      case 'actualizacion': return '#3b82f6';
      case 'sistema': return '#ef4444';
      default: return '#10b981';
    }
  };

  // Obtener color de la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <Head>
        <title>Gestión de Notificaciones - Admin</title>
        <meta name="description" content="Panel de administración para gestionar notificaciones" />
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
                  <Bell size={32} />
                </div>
                <div>
                  <h1 className={styles.title}>Gestión de Notificaciones</h1>
                  <p className={styles.subtitle}>
                    Administra las notificaciones que reciben todos los usuarios
                  </p>
                </div>
              </div>
              <button 
                className={styles.createButton}
                onClick={handleCreateNew}
              >
                <Plus size={20} />
                Nueva Notificación
              </button>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Bell size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{notifications.length}</h3>
                  <p>Total Notificaciones</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{notifications.filter(n => n.isActive).length}</h3>
                  <p>Activas</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{notifications.filter(n => n.targetUsers === 'todos').length}</h3>
                  <p>Para Todos</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
              <div className={styles.searchContainer}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.filterContainer}>
                <Filter size={20} className={styles.filterIcon} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="novedad">Novedades</option>
                  <option value="actualizacion">Actualizaciones</option>
                  <option value="sistema">Sistema</option>
                  <option value="promocion">Promociones</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className={styles.notificationsList}>
              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <p>Cargando notificaciones...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className={styles.empty}>
                  <Bell size={64} className={styles.emptyIcon} />
                  <h3>Sin notificaciones</h3>
                  <p>No hay notificaciones que coincidan con tu búsqueda.</p>
                </div>
              ) : (
                filteredNotifications.map((notif, index) => (
                  <motion.div
                    key={notif._id}
                    className={`${styles.notificationCard} ${!notif.isActive ? styles.inactive : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div 
                      className={styles.priorityIndicator}
                      style={{ backgroundColor: getPriorityColor(notif.priority) }}
                    />

                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <div className={styles.cardHeaderLeft}>
                          <div 
                            className={styles.typeIcon}
                            style={{ color: getTypeColor(notif.type) }}
                          >
                            {getTypeIcon(notif.type)}
                          </div>
                          <div className={styles.notificationIcon}>
                            <span className={styles.emoji}>{notif.icon}</span>
                          </div>
                          <div>
                            <h3 className={styles.notificationTitle}>{notif.title}</h3>
                            <div className={styles.notificationMeta}>
                              <span 
                                className={styles.notificationType}
                                style={{ color: getTypeColor(notif.type) }}
                              >
                                {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                              </span>
                              <span className={styles.priority}>
                                Prioridad: {notif.priority}
                              </span>
                              <span className={styles.target}>
                                Para: {notif.targetUsers}
                              </span>
                              <span className={styles.status}>
                                {notif.isActive ? 'Activa' : 'Inactiva'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.cardActions}>
                          <button
                            className={styles.toggleButton}
                            onClick={() => handleToggleActive(notif._id, notif.isActive)}
                            title={notif.isActive ? 'Desactivar' : 'Activar'}
                          >
                            {notif.isActive ? '🔴' : '🟢'}
                          </button>
                          <button
                            className={styles.editButton}
                            onClick={() => handleEdit(notif)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(notif._id)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.cardBody}>
                        <p className={styles.notificationMessage}>{notif.message}</p>
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.cardInfo}>
                          <Calendar size={16} />
                          <span>Creada: {new Date(notif.createdAt).toLocaleDateString()}</span>
                          {notif.expiresAt && (
                            <>
                              <span className={styles.separator}>•</span>
                              <span>Expira: {new Date(notif.expiresAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        {notif.actionUrl && notif.actionText && (
                          <a 
                            href={notif.actionUrl}
                            className={styles.actionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {notif.actionText}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Modal de Creación/Edición */}
        {showCreateModal && (
          <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>
                  {editingNotification ? 'Editar Notificación' : 'Nueva Notificación'}
                </h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalContent}>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">Título *</label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={styles.formInput}
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="type">Tipo</label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className={styles.formSelect}
                      >
                        <option value="novedad">Novedad</option>
                        <option value="actualizacion">Actualización</option>
                        <option value="sistema">Sistema</option>
                        <option value="promocion">Promoción</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="priority">Prioridad</label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className={styles.formSelect}
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="targetUsers">Destinatarios</label>
                      <select
                        id="targetUsers"
                        value={formData.targetUsers}
                        onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value as any })}
                        className={styles.formSelect}
                      >
                        <option value="todos">Todos los usuarios</option>
                        <option value="suscriptores">Solo suscriptores</option>
                        <option value="admin">Solo administradores</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="icon">Ícono (Emoji)</label>
                      <input
                        type="text"
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className={styles.formInput}
                        placeholder="📢"
                        maxLength={5}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="expiresAt">Fecha de expiración (opcional)</label>
                      <input
                        type="datetime-local"
                        id="expiresAt"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">Mensaje *</label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={styles.formTextarea}
                      required
                      maxLength={500}
                      rows={4}
                    />
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="actionUrl">URL de acción (opcional)</label>
                      <input
                        type="url"
                        id="actionUrl"
                        value={formData.actionUrl}
                        onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                        className={styles.formInput}
                        placeholder="https://ejemplo.com"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="actionText">Texto del botón (opcional)</label>
                      <input
                        type="text"
                        id="actionText"
                        value={formData.actionText}
                        onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
                        className={styles.formInput}
                        placeholder="Ver más"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <button 
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className={styles.saveButton}
                      disabled={isSubmitting}
                    >
                      <Save size={16} />
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
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
              <AlertTriangle size={20} />
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

  // Verificar que el usuario sea administrador
  const user = await User.findOne({ email: session.user?.email });
  if (!user || user.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
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