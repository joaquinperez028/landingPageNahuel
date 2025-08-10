import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Activity, 
  Bell, 
  TrendingUp, 
  Eye, 
  Clock, 
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  Target,
  DollarSign,
  BookOpen,
  Calendar
} from 'lucide-react';
import styles from '@/styles/RealTimeMetrics.module.css';

interface RealTimeMetricsProps {
  className?: string;
}

interface LiveUser {
  id: string;
  email: string;
  name: string;
  role: string;
  lastActivity: Date;
  currentPage: string;
  sessionDuration: number;
  isActive: boolean;
}

interface WebhookEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  data: any;
  retryCount: number;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

export default function RealTimeMetrics({ className }: RealTimeMetricsProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Simular datos en tiempo real (en producción esto vendría de WebSockets)
  const generateMockData = useCallback(() => {
    const mockUsers: LiveUser[] = [
      {
        id: '1',
        email: 'usuario1@ejemplo.com',
        name: 'Juan Pérez',
        role: 'suscriptor',
        lastActivity: new Date(),
        currentPage: '/alertas/smart-money',
        sessionDuration: Math.floor(Math.random() * 1800) + 300, // 5-35 min
        isActive: true
      },
      {
        id: '2',
        email: 'usuario2@ejemplo.com',
        name: 'María García',
        role: 'admin',
        lastActivity: new Date(Date.now() - 60000),
        currentPage: '/admin/dashboard',
        sessionDuration: Math.floor(Math.random() * 3600) + 600, // 10-70 min
        isActive: true
      },
      {
        id: '3',
        email: 'usuario3@ejemplo.com',
        name: 'Carlos López',
        role: 'normal',
        lastActivity: new Date(Date.now() - 120000),
        currentPage: '/entrenamientos',
        sessionDuration: Math.floor(Math.random() * 900) + 180, // 3-18 min
        isActive: false
      }
    ];

    const mockWebhooks: WebhookEvent[] = [
      {
        id: '1',
        type: 'payment_success',
        source: 'mercadopago',
        timestamp: new Date(),
        status: 'success',
        data: { amount: 15000, currency: 'ARS' },
        retryCount: 0
      },
      {
        id: '2',
        type: 'user_registration',
        source: 'google_auth',
        timestamp: new Date(Date.now() - 300000),
        status: 'success',
        data: { email: 'nuevo@ejemplo.com' },
        retryCount: 0
      },
      {
        id: '3',
        type: 'subscription_cancelled',
        source: 'webhook_handler',
        timestamp: new Date(Date.now() - 600000),
        status: 'error',
        data: { userId: '123', reason: 'payment_failed' },
        retryCount: 2
      }
    ];

    const mockMetrics: MetricCard[] = [
      {
        title: 'Usuarios Activos',
        value: mockUsers.filter(u => u.isActive).length,
        change: 12.5,
        icon: <Users size={20} />,
        color: '#10b981',
        trend: 'up'
      },
      {
        title: 'Sesiones Hoy',
        value: Math.floor(Math.random() * 150) + 50,
        change: -2.3,
        icon: <Activity size={20} />,
        color: '#3b82f6',
        trend: 'down'
      },
      {
        title: 'Webhooks Exitosos',
        value: mockWebhooks.filter(w => w.status === 'success').length,
        change: 8.7,
        icon: <CheckCircle size={20} />,
        color: '#059669',
        trend: 'up'
      },
      {
        title: 'Tasa de Conversión',
        value: '3.2%',
        change: 0.8,
        icon: <Target size={20} />,
        color: '#f59e0b',
        trend: 'up'
      }
    ];

    setLiveUsers(mockUsers);
    setWebhookEvents(mockWebhooks);
    setMetrics(mockMetrics);
    setLastUpdate(new Date());
  }, []);

  // Actualizar datos cada 30 segundos
  useEffect(() => {
    generateMockData();
    const interval = setInterval(generateMockData, 30000);
    return () => clearInterval(interval);
  }, [generateMockData]);

  // Simular conexión/desconexión
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% de probabilidad de estar conectado
    }, 10000);
    return () => clearInterval(connectionInterval);
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    generateMockData();
    setIsLoading(false);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className={styles.trendUp} />;
      case 'down':
        return <TrendingUp size={16} className={styles.trendDown} />;
      default:
        return <BarChart3 size={16} className={styles.trendNeutral} />;
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Header con estado de conexión */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>
            <Zap size={24} />
            Métricas en Tiempo Real
          </h2>
          <div className={styles.connectionStatus}>
            <div className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`} />
            <span className={styles.statusText}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          </div>
        </div>
        
        <div className={styles.controls}>
          <span className={styles.lastUpdate}>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            className={styles.metricCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.metricIcon} style={{ color: metric.color }}>
              {metric.icon}
            </div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricTitle}>{metric.title}</h3>
              <div className={styles.metricValue}>{metric.value}</div>
              <div className={styles.metricChange}>
                {getTrendIcon(metric.trend)}
                <span className={`${styles.changeValue} ${styles[`trend${metric.trend.charAt(0).toUpperCase() + metric.trend.slice(1)}`]}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contenido principal en dos columnas */}
      <div className={styles.mainContent}>
        {/* Usuarios en vivo */}
        <div className={styles.liveSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Users size={20} />
              Usuarios Activos ({liveUsers.filter(u => u.isActive).length})
            </h3>
            <span className={styles.sectionSubtitle}>
              En tiempo real
            </span>
          </div>
          
          <div className={styles.liveUsersList}>
            <AnimatePresence>
              {liveUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  className={`${styles.userCard} ${user.isActive ? styles.active : styles.inactive}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userDetails}>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                      <div className={styles.userRole}>
                        <span className={`${styles.roleBadge} ${styles[`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.userActivity}>
                    <div className={styles.currentPage}>
                      <Globe size={14} />
                      {user.currentPage}
                    </div>
                    <div className={styles.sessionInfo}>
                      <Clock size={14} />
                      {formatDuration(user.sessionDuration)}
                    </div>
                    <div className={`${styles.activityIndicator} ${user.isActive ? styles.active : styles.inactive}`} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Webhooks y eventos */}
        <div className={styles.webhooksSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Bell size={20} />
              Webhooks Recientes ({webhookEvents.length})
            </h3>
            <span className={styles.sectionSubtitle}>
              Últimas 24 horas
            </span>
          </div>
          
          <div className={styles.webhooksList}>
            <AnimatePresence>
              {webhookEvents.map((webhook, index) => (
                <motion.div
                  key={webhook.id}
                  className={styles.webhookCard}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.webhookHeader}>
                    <div className={styles.webhookType}>
                      <span className={styles.typeBadge}>{webhook.type}</span>
                    </div>
                    <div className={styles.webhookStatus}>
                      <div 
                        className={styles.statusIndicator}
                        style={{ backgroundColor: getStatusColor(webhook.status) }}
                      />
                      <span className={styles.statusText}>{webhook.status}</span>
                    </div>
                  </div>
                  
                  <div className={styles.webhookDetails}>
                    <div className={styles.webhookSource}>
                      <span className={styles.sourceLabel}>Fuente:</span>
                      <span className={styles.sourceValue}>{webhook.source}</span>
                    </div>
                    <div className={styles.webhookTime}>
                      <Clock size={14} />
                      {webhook.timestamp.toLocaleTimeString()}
                    </div>
                    {webhook.retryCount > 0 && (
                      <div className={styles.retryCount}>
                        <AlertCircle size={14} />
                        Reintentos: {webhook.retryCount}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.webhookData}>
                    <pre className={styles.dataPreview}>
                      {JSON.stringify(webhook.data, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 