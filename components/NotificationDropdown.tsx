import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ExternalLink, Clock, ArrowRight } from 'lucide-react';
import styles from '@/styles/NotificationDropdown.module.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'novedad' | 'actualizacion' | 'sistema' | 'promocion';
  priority: 'alta' | 'media' | 'baja';
  icon: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  timeAgo: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener notificaciones
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/get?limit=5');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar notificaciones cuando se abre el dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Función para obtener el color del tipo de notificación
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promocion': return '#f59e0b';
      case 'actualizacion': return '#3b82f6';
      case 'sistema': return '#ef4444';
      default: return '#10b981';
    }
  };

  // Función para obtener el color de la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        className={styles.dropdown}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Bell size={20} />
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount}</span>
            )}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              <Bell size={48} className={styles.emptyIcon} />
              <h4>Sin notificaciones</h4>
              <p>No tienes notificaciones nuevas por el momento.</p>
            </div>
          ) : (
            <div className={styles.notificationsList}>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className={styles.notificationItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Priority indicator */}
                  <div 
                    className={styles.priorityIndicator}
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  />

                  {/* Icon */}
                  <div className={styles.notificationIcon}>
                    <span className={styles.emoji}>{notification.icon}</span>
                  </div>

                  {/* Content */}
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h4 className={styles.notificationTitle}>{notification.title}</h4>
                      <div className={styles.notificationMeta}>
                        <span 
                          className={styles.notificationType}
                          style={{ color: getTypeColor(notification.type) }}
                        >
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                        <Clock size={12} />
                        <span className={styles.timeAgo}>{notification.timeAgo}</span>
                      </div>
                    </div>
                    
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    
                    {/* Action button */}
                    {notification.actionUrl && notification.actionText && (
                      <Link 
                        href={notification.actionUrl}
                        className={styles.actionButton}
                        onClick={onClose}
                      >
                        {notification.actionText}
                        <ExternalLink size={14} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Link href="/notificaciones" className={styles.viewAllButton} onClick={onClose}>
            Ver todas las notificaciones
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdown; 