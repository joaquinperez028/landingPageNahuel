import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayerMux from '@/components/VideoPlayerMux';
import Carousel from '@/components/Carousel';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Activity, 
  Download, 
  BarChart3,
  CheckCircle,
  Star
} from 'lucide-react';
import styles from '@/styles/TraderCall.module.css';
import { useRouter } from 'next/router';

interface TraderCallPageProps {
  isSubscribed: boolean;
  metrics: {
    performance: string;
    activeUsers: string;
    alertsSent: string;
    accuracy: string;
  };
  historicalAlerts: Array<{
    date: string;
    symbol: string;
    action: string;
    price: string;
    result: string;
    profit: string;
  }>;
}

// Vista No Suscripto
const NonSubscriberView: React.FC<{ metrics: any, historicalAlerts: any[] }> = ({ 
  metrics, 
  historicalAlerts 
}) => {
  const { data: session } = useSession();

  const handleSubscribe = () => {
    if (!session) {
      signIn('google');
    } else {
      window.location.href = '/payment/trader-call';
    }
  };

  const handleExportPDF = () => {
    console.log('Exportando PDF...');
  };

  const exampleImages = [
    {
      src: '/alerts/trader-call-example-1.jpg',
      alt: 'Ejemplo de alerta Trader Call - Análisis AAPL',
      title: 'Alerta AAPL - Entrada Perfecta',
      description: 'Señal de compra en Apple con +15% de ganancia en 3 días'
    },
    {
      src: '/alerts/trader-call-example-2.jpg',
      alt: 'Ejemplo de alerta Trader Call - Análisis TSLA',
      title: 'Alerta TSLA - Stop Loss Activado',
      description: 'Protección de capital con stop loss inteligente'
    },
    {
      src: '/alerts/trader-call-example-3.jpg',
      alt: 'Ejemplo de alerta Trader Call - Análisis SPY',
      title: 'Alerta SPY - Take Profit',
      description: 'Maximización de ganancias con take profit automático'
    }
  ];

  return (
    <div className={styles.nonSubscriberView}>
      {/* Hero Section con Video */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Trader Call
                <span className={styles.heroSubtitle}>Alertas de Trading en Tiempo Real</span>
              </h1>
              <p className={styles.heroDescription}>
                Recibe señales precisas de compra y venta con análisis técnico avanzado. 
                Nuestro sistema de alertas te ayuda a tomar decisiones informadas en el momento exacto.
              </p>
              <div className={styles.heroFeatures}>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Análisis técnico profesional</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Alertas en tiempo real</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Stop loss y take profit incluidos</span>
                </div>
              </div>
            </div>
            <div className={styles.heroVideo}>
              <div className={styles.videoContainer}>
                <VideoPlayerMux 
                  playbackId="sample-trader-call-video" 
                  autoplay={true}
                  className={styles.video}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sección de Métricas */}
      <section className={styles.metricsSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Números con Datos Actualizables
          </motion.h2>
          
          <div className={styles.metricsGrid}>
            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className={styles.metricIcon}>
                <TrendingUp size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.performance}</h3>
              <p className={styles.metricLabel}>% de Rendimiento del Último Año</p>
            </motion.div>

            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.metricIcon}>
                <Users size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.activeUsers}</h3>
              <p className={styles.metricLabel}>Usuarios Activos</p>
            </motion.div>

            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.metricIcon}>
                <Activity size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.alertsSent}</h3>
              <p className={styles.metricLabel}>Alertas Enviadas</p>
            </motion.div>

            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.metricIcon}>
                <BarChart3 size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.accuracy}</h3>
              <p className={styles.metricLabel}>Precisión Promedio</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Alertas Históricas */}
      <section className={styles.historySection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Alertas Históricas
          </motion.h2>
          <motion.p 
            className={styles.sectionDescription}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Visualización de algunas de nuestras mejores alertas pasadas
          </motion.p>
          
          <motion.div 
            className={styles.historyTable}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.tableHeader}>
              <span>Fecha</span>
              <span>Símbolo</span>
              <span>Acción</span>
              <span>Precio Entrada</span>
              <span>Resultado</span>
              <span>Ganancia</span>
            </div>
            
            {historicalAlerts.slice(0, 8).map((alert, index) => (
              <motion.div 
                key={index}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span className={styles.tableCell}>{alert.date}</span>
                <span className={styles.tableCell}>{alert.symbol}</span>
                <span className={`${styles.tableCell} ${alert.action === 'BUY' ? styles.buyAction : styles.sellAction}`}>
                  {alert.action}
                </span>
                <span className={styles.tableCell}>${alert.price}</span>
                <span className={`${styles.tableCell} ${alert.result === 'PROFIT' ? styles.profitResult : styles.lossResult}`}>
                  {alert.result}
                </span>
                <span className={`${styles.tableCell} ${alert.result === 'PROFIT' ? styles.profitAmount : styles.lossAmount}`}>
                  {alert.profit}
                </span>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className={styles.exportActions}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button className={styles.exportButton} onClick={handleExportPDF}>
              <Download size={20} />
              Descargar Reporte PDF
            </button>
          </motion.div>
        </div>
      </section>

      {/* Imágenes con Ejemplo de Alertas */}
      <section className={styles.examplesSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Ejemplos de Nuestras Alertas
          </motion.h2>
          <motion.p 
            className={styles.sectionDescription}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Carrusel de imágenes con informes reales y ejemplos de alertas exitosas
          </motion.p>
          
          <motion.div 
            className={styles.carouselContainer}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Carousel 
              items={exampleImages.map((image, index) => (
                <div key={index} className={styles.exampleCard}>
                  <img src={image.src} alt={image.alt} className={styles.exampleImage} />
                  <div className={styles.exampleContent}>
                    <h3 className={styles.exampleTitle}>{image.title}</h3>
                    <p className={styles.exampleDescription}>{image.description}</p>
                  </div>
                </div>
              ))}
              autoplay={true}
              interval={4000}
              showDots={true}
              showArrows={true}
              itemsPerView={1}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA de Suscripción */}
      <section className={styles.subscriptionSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.subscriptionCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.subscriptionContent}>
              <h2 className={styles.subscriptionTitle}>
                ¿Listo para Recibir Alertas Profesionales?
              </h2>
              <p className={styles.subscriptionDescription}>
                Únete a {metrics.activeUsers} traders que ya están maximizando sus ganancias con nuestras alertas precisas
              </p>
              <div className={styles.subscriptionFeatures}>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Alertas en tiempo real vía email y WhatsApp</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Análisis técnico detallado para cada señal</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Stop loss y take profit calculados</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Acceso a la comunidad privada de traders</span>
                </div>
              </div>
              <button 
                className={styles.subscribeButton}
                onClick={handleSubscribe}
              >
                {session ? 'Suscribirme Ahora' : 'Iniciar Sesión y Suscribirme'}
              </button>
              <p className={styles.subscriptionNote}>
                {!session && 'Si no tienes cuenta activa, la tenés que hacer primero antes de continuar'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Interfaces para tipos
interface CommunityMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
}

// Vista de suscriptor completa
const SubscriberView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    action: 'BUY',
    stopLoss: '',
    takeProfit: '',
    analysis: ''
  });
  const [stockPrice, setStockPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [realAlerts, setRealAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [informes, setInformes] = useState<any[]>([]);
  const [loadingInformes, setLoadingInformes] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [creatingReport, setCreatingReport] = useState(false);
  const [userRole, setUserRole] = React.useState<string>('');
  const [refreshingActivity, setRefreshingActivity] = useState(false);
  
  // Estados para filtros
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // Estados para información del mercado
  const [marketStatus, setMarketStatus] = useState<string>('');
  const [isUsingSimulatedPrices, setIsUsingSimulatedPrices] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  // Verificar rol del usuario
  React.useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/profile/get', {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user?.role || '');
        }
      } catch (error) {
        console.error('Error al verificar rol:', error);
      }
    };

    if (session?.user) {
      checkUserRole();
    }
  }, [session]);

  // Alertas vigentes (definir primero para evitar dependencias circulares)
  const alertasVigentes = [
    {
      id: 1,
      symbol: 'AAPL',
      action: 'BUY',
      entryPrice: '$185.50',
      currentPrice: '$189.20',
      stopLoss: '$182.00',
      takeProfit: '$195.00',
      profit: '+2.0%',
      status: 'ACTIVE',
      date: '2024-01-15'
    },
    {
      id: 2,
      symbol: 'TSLA',
      action: 'SELL',
      entryPrice: '$248.90',
      currentPrice: '$245.30',
      stopLoss: '$255.00',
      takeProfit: '$235.00',
      profit: '+1.4%',
      status: 'ACTIVE',
      date: '2024-01-14'
    }
  ];

  // Datos históricos de alertas (simulando base de datos)
  const alertasHistoricas = [
    { id: 1, symbol: 'AAPL', action: 'BUY', entryPrice: 185.50, exitPrice: 189.20, profit: 2.0, status: 'CLOSED', date: '2024-01-10', type: 'WIN' },
    { id: 2, symbol: 'TSLA', action: 'SELL', entryPrice: 248.90, exitPrice: 245.30, profit: 1.4, status: 'CLOSED', date: '2024-01-11', type: 'WIN' },
    { id: 3, symbol: 'MSFT', action: 'BUY', entryPrice: 380.50, exitPrice: 375.20, profit: -1.4, status: 'CLOSED', date: '2024-01-12', type: 'LOSS' },
    { id: 4, symbol: 'NVDA', action: 'BUY', entryPrice: 520.30, exitPrice: 535.80, profit: 2.98, status: 'CLOSED', date: '2024-01-13', type: 'WIN' },
    { id: 5, symbol: 'GOOGL', action: 'SELL', entryPrice: 142.10, exitPrice: 139.45, profit: 1.87, status: 'CLOSED', date: '2024-01-14', type: 'WIN' },
    { id: 6, symbol: 'META', action: 'BUY', entryPrice: 365.20, exitPrice: 358.90, profit: -1.73, status: 'CLOSED', date: '2024-01-14', type: 'LOSS' },
    { id: 7, symbol: 'AMD', action: 'BUY', entryPrice: 148.50, exitPrice: 155.30, profit: 4.58, status: 'CLOSED', date: '2024-01-15', type: 'WIN' }
  ];

  // Función para calcular métricas reales del dashboard usando alertas reales
  const calculateDashboardMetrics = () => {
    // Usar alertas reales en lugar de datos simulados
    const alertasActivas = realAlerts.filter(alert => alert.status === 'ACTIVE').length;
    const alertasCerradas = realAlerts.filter(alert => alert.status === 'CLOSED');
    
    // Calcular ganadoras y perdedoras basándose en el profit
    const alertasGanadoras = alertasCerradas.filter(alert => {
      const profitValue = parseFloat(alert.profit.replace('%', '').replace('+', ''));
      return profitValue > 0;
    }).length;
    
    const alertasPerdedoras = alertasCerradas.filter(alert => {
      const profitValue = parseFloat(alert.profit.replace('%', '').replace('+', ''));
      return profitValue < 0;
    }).length;
    
    // Calcular alertas de esta semana (últimos 7 días)
    const ahora = new Date();
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const alertasSemanales = realAlerts.filter(alert => {
      const fechaAlert = new Date(alert.date);
      return fechaAlert >= hace7Dias;
    }).length;

    // Calcular rentabilidad semanal usando alertas reales
    const alertasSemanalConGanancias = realAlerts.filter(alert => {
      const fechaAlert = new Date(alert.date);
      return fechaAlert >= hace7Dias;
    });

    const gananciasSemanal = alertasSemanalConGanancias.reduce((total, alert) => {
      const profitValue = parseFloat(alert.profit.replace('%', '').replace('+', ''));
      return total + profitValue;
    }, 0);

    const rentabilidadSemanal = gananciasSemanal.toFixed(1);

    return {
      alertasActivas,
      alertasGanadoras,
      alertasPerdedoras,
      rentabilidadSemanal: `${gananciasSemanal >= 0 ? '+' : ''}${rentabilidadSemanal}%`,
      alertasSemanales
    };
  };

  // Calcular métricas reactivamente cuando cambien las alertas reales
  const dashboardMetrics = React.useMemo(() => {
    return calculateDashboardMetrics();
  }, [realAlerts]);

  // Generar actividad reciente con alertas e informes
  const generateRecentActivity = () => {
    const activities: any[] = [];
    
    // Agregar alertas recientes
    realAlerts.forEach((alert) => {
      const alertDate = new Date(alert.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - alertDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));

      let timestamp;
      if (diffDays > 0) {
        timestamp = `${diffDays}d`;
      } else if (diffHours > 0) {
        timestamp = `${diffHours}h`;
      } else {
        timestamp = `${diffMinutes}min`;
      }

      let message = '';
      let type = 'alert';
      
      if (alert.status === 'ACTIVE') {
        const currentPnL = alert.currentPrice && alert.entryPrice 
          ? ((alert.currentPrice - alert.entryPrice) / alert.entryPrice * 100).toFixed(2)
          : '0.00';
        const pnlValue = parseFloat(currentPnL);
        message = `${alert.symbol} actualizado: ${pnlValue > 0 ? '+' : ''}${currentPnL}% P&L #${alert.symbol}`;
      } else if (alert.status === 'CLOSED') {
        const profit = alert.profit || 0;
        message = `${alert.symbol} cerrado: ${profit > 0 ? '+' : ''}${profit.toFixed(2)}% ${profit > 0 ? 'ganancia' : 'pérdida'} #${alert.symbol}`;
      } else {
        message = `Nueva alerta: ${alert.symbol} ${alert.action} a $${alert.entryPrice} #${alert.symbol}`;
      }

      activities.push({
        id: alert._id,
        type,
        message,
        timestamp,
        dateCreated: alertDate
      });
    });

    // Agregar informes recientes
    informes.forEach((informe) => {
      const informeDate = new Date(informe.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - informeDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));

      let timestamp;
      if (diffDays > 0) {
        timestamp = `${diffDays}d`;
      } else if (diffHours > 0) {
        timestamp = `${diffHours}h`;
      } else {
        timestamp = `${diffMinutes}min`;
      }

      const typeIcon = informe.type === 'video' ? '🎥' : informe.type === 'analisis' ? '📊' : '📄';
      const message = `Nuevo ${informe.type}: ${informe.title} ${typeIcon}`;

      activities.push({
        id: informe.id || informe._id,
        type: 'informe',
        message,
        timestamp,
        dateCreated: informeDate,
        reportData: informe
      });
    });

    // Ordenar por fecha más reciente y tomar los primeros 6
    return activities
      .sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime())
      .slice(0, 6);
  };

  // Generar actividad reciente reactivamente cuando cambien las alertas
  const recentActivity = React.useMemo(() => {
    return generateRecentActivity();
  }, [realAlerts, informes]);

  // Función para cargar alertas desde la API
  const loadAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const response = await fetch('/api/alerts/list?tipo=TraderCall', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setRealAlerts(data.alerts || []);
        console.log('Alertas cargadas:', data.alerts?.length || 0);
      } else {
        console.error('Error al cargar alertas:', response.status);
      }
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Función para actualizar precios en tiempo real
  const updatePrices = async (silent: boolean = false) => {
    if (!silent) setUpdatingPrices(true);
    
    try {
      const response = await fetch('/api/alerts/update-prices', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Precios actualizados:', data.updated, 'alertas');
        setLastPriceUpdate(new Date());
        
        // Actualizar información del mercado si está disponible
        if (data.alerts && data.alerts.length > 0) {
          // Verificar si alguna alerta está usando precios simulados
          const hasSimulated = data.alerts.some((alert: any) => alert.isSimulated);
          setIsUsingSimulatedPrices(hasSimulated);
          
          // Usar el estado del mercado de la primera alerta (todas deberían tener el mismo)
          if (data.alerts[0].marketStatus) {
            setMarketStatus(data.alerts[0].marketStatus);
          }
        }
        
        // Recargar alertas para mostrar los nuevos precios
        await loadAlerts();
      } else {
        console.error('Error al actualizar precios:', response.status);
      }
    } catch (error) {
      console.error('Error al actualizar precios:', error);
    } finally {
      if (!silent) setUpdatingPrices(false);
    }
  };

  // Función para cargar informes desde la API
  const loadInformes = async () => {
    setLoadingInformes(true);
    try {
      const response = await fetch('/api/reports?limit=6&featured=false', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setInformes(data.data?.reports || []);
        console.log('Informes cargados:', data.data?.reports?.length || 0);
      } else {
        console.error('Error al cargar informes:', response.status);
      }
    } catch (error) {
      console.error('Error al cargar informes:', error);
    } finally {
      setLoadingInformes(false);
    }
  };

  // Función para abrir informe completo
  const openReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data.data.report);
      } else {
        console.error('Error al cargar informe:', response.status);
        alert('Error al cargar el informe');
      }
    } catch (error) {
      console.error('Error al cargar informe:', error);
      alert('Error al cargar el informe');
    }
  };

  const handleCreateReport = async (formData: any) => {
    setCreatingReport(true);
    try {
      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        const newReport = result.data;
        setInformes(prev => [newReport, ...prev]);
        setShowCreateReportModal(false);
        // Mostrar mensaje de éxito
        alert('Informe creado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al crear informe:', error);
      alert('Error al crear el informe');
    } finally {
      setCreatingReport(false);
    }
  };

  // Refrescar actividad
  const refreshActivity = async () => {
    setRefreshingActivity(true);
    try {
      // Recargar alertas y informes
      await Promise.all([
        loadAlerts(),
        loadInformes()
      ]);
      console.log('✅ Actividad actualizada correctamente');
    } catch (error) {
      console.error('❌ Error al actualizar actividad:', error);
    } finally {
      setRefreshingActivity(false);
    }
  };

  // Función para filtrar alertas
  const getFilteredAlerts = () => {
    let filtered = [...realAlerts];

    // Filtrar por símbolo
    if (filterSymbol) {
      filtered = filtered.filter(alert => 
        alert.symbol.toLowerCase().includes(filterSymbol.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterStatus) {
      filtered = filtered.filter(alert => alert.status === filterStatus);
    }

    // Filtrar por fecha
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter(alert => {
        const alertDate = new Date(alert.date || alert.createdAt);
        return alertDate >= filterDateObj;
      });
    }

    return filtered;
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilterSymbol('');
    setFilterStatus('');
    setFilterDate('');
  };

  // Cargar alertas y informes al montar el componente
  React.useEffect(() => {
    loadAlerts();
    loadInformes();
  }, []);

  // Sistema de actualización automática de precios cada 30 segundos
  React.useEffect(() => {
    // Solo actualizar si hay alertas activas
    const hasActiveAlerts = realAlerts.some(alert => alert.status === 'ACTIVE');
    
    if (!hasActiveAlerts) return;

    // Actualizar precios inmediatamente si es la primera vez
    if (!lastPriceUpdate) {
      updatePrices(true);
    }

    // Configurar intervalo de actualización cada 30 segundos
    const interval = setInterval(() => {
      updatePrices(true); // silent = true para no mostrar loading
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [realAlerts, lastPriceUpdate]);

  // Funciones dummy para evitar errores de compilación
  const fetchStockPrice = async (symbol: string) => {
    console.log('fetchStockPrice not implemented:', symbol);
  };

  const handleCreateAlert = async () => {
    console.log('handleCreateAlert not implemented');
  };

  const renderDashboard = () => (
    <div className={styles.dashboardContent}>
      <h2 className={styles.sectionTitle}>Dashboard de Trabajo</h2>
      
      {/* Métricas principales */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Activity size={24} />
          </div>
          <h3>Alertas Activas</h3>
          <p className={styles.metricNumber}>{dashboardMetrics.alertasActivas}</p>
          <span className={styles.metricLabel}>Posiciones abiertas</span>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <TrendingUp size={24} />
          </div>
          <h3>Alertas Ganadoras</h3>
          <p className={styles.metricNumber} style={{ color: 'var(--success-color)' }}>
            {dashboardMetrics.alertasGanadoras}
          </p>
          <span className={styles.metricLabel}>Cerradas con ganancia</span>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <TrendingDown size={24} />
          </div>
          <h3>Alertas Perdedoras</h3>
          <p className={styles.metricNumber} style={{ color: 'var(--error-color)' }}>
            {dashboardMetrics.alertasPerdedoras}
          </p>
          <span className={styles.metricLabel}>Cerradas con pérdida</span>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <BarChart3 size={24} />
          </div>
          <h3>Rentabilidad Semanal</h3>
          <p className={styles.metricNumber} style={{ color: 'var(--warning-color)' }}>
            {dashboardMetrics.rentabilidadSemanal}
          </p>
          <span className={styles.metricLabel}>Últimos 7 días</span>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Users size={24} />
          </div>
          <h3>Alertas Semanales</h3>
          <p className={styles.metricNumber}>{dashboardMetrics.alertasSemanales}</p>
          <span className={styles.metricLabel}>Enviadas esta semana</span>
        </div>
      </div>

      {/* Resumen de Performance */}
      <div className={styles.performanceSection}>
        <h3>Resumen de Performance</h3>
        <div className={styles.performanceGrid}>
          <div className={styles.performanceCard}>
            <h4>Win Rate</h4>
            <p className={styles.performanceValue}>
              {dashboardMetrics.alertasGanadoras + dashboardMetrics.alertasPerdedoras > 0 
                ? ((dashboardMetrics.alertasGanadoras / (dashboardMetrics.alertasGanadoras + dashboardMetrics.alertasPerdedoras)) * 100).toFixed(1) 
                : '0.0'}%
            </p>
          </div>
          <div className={styles.performanceCard}>
            <h4>Total Alertas</h4>
            <p className={styles.performanceValue}>
              {realAlerts.length}
            </p>
          </div>
          <div className={styles.performanceCard}>
            <h4>Ratio G/P</h4>
            <p className={styles.performanceValue}>
              {dashboardMetrics.alertasPerdedoras > 0 
                ? (dashboardMetrics.alertasGanadoras / dashboardMetrics.alertasPerdedoras).toFixed(1) 
                : dashboardMetrics.alertasGanadoras > 0 ? '∞' : '0.0'}:1
            </p>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className={styles.activitySection}>
        <h3>Última actividad</h3>
        <p className={styles.activitySubtitle}>Actividad reciente en Trader Call</p>
        
        <div className={styles.activityFeed}>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className={`${styles.activityItem} ${activity.type === 'informe' ? styles.clickableActivity : ''}`}
                onClick={activity.type === 'informe' ? () => openReport(activity.id) : undefined}
                style={activity.type === 'informe' ? { cursor: 'pointer' } : {}}
              >
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>
                    {activity.message}
                  </div>
                  <div className={styles.activityMeta}>
                    <span className={styles.activityTime}>hace {activity.timestamp}</span>
                    <span className={styles.activityType}>
                      {activity.type === 'informe' ? '📰 INFORME' : '🔄 ACTUALIZACIÓN'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyActivity}>
              <span>📋</span>
              <p>No hay actividad reciente.</p>
              <p>Las alertas e informes aparecerán aquí cuando se generen.</p>
            </div>
          )}
        </div>
        
        <div className={styles.activityActions}>
          <button 
            className={styles.viewAllButton}
            onClick={() => setActiveTab('seguimiento')}
          >
            Ver toda la actividad
          </button>
          <button 
            className={styles.refreshButton}
            onClick={() => refreshActivity()}
            disabled={refreshingActivity}
          >
            <Activity size={16} />
            {refreshingActivity ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Gráfico de rendimiento */}
      <div className={styles.chartContainer}>
        <h3>Evolución del Portafolio (Últimos 30 días)</h3>
        <div className={styles.chartPlaceholder}>
          <BarChart3 size={64} />
          <p>Gráfico de Chart.js se implementaría aquí</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Mostrará la evolución diaria del rendimiento del portafolio
          </p>
        </div>
      </div>
    </div>
  );

  const renderSeguimientoAlertas = () => (
    <div className={styles.alertasContent}>
      <div className={styles.alertasHeader}>
        <h2 className={styles.sectionTitle}>Seguimiento de Alertas</h2>
        <button 
          className={styles.createAlertButton}
          onClick={() => setShowCreateAlert(true)}
        >
          + Crear Nueva Alerta
        </button>
      </div>
      
      {/* Filtros */}
      <div className={styles.alertFilters}>
        <select 
          className={styles.filterSelect}
          value={filterSymbol}
          onChange={(e) => setFilterSymbol(e.target.value)}
        >
          <option value="">Filtrar por símbolo</option>
          {/* Generar opciones dinámicamente basándose en alertas existentes */}
          {Array.from(new Set(realAlerts.map(alert => alert.symbol))).map(symbol => (
            <option key={symbol} value={symbol}>{symbol}</option>
          ))}
        </select>
        <select 
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Filtrar por estado</option>
          <option value="ACTIVE">Activa</option>
          <option value="CLOSED">Cerrada</option>
          <option value="STOPPED">Stop Loss</option>
        </select>
        <input 
          type="date" 
          className={styles.filterDate}
          placeholder="Fecha desde"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        {/* Botón para limpiar filtros */}
        {(filterSymbol || filterStatus || filterDate) && (
          <button 
            className={styles.clearFilters}
            onClick={clearFilters}
            title="Limpiar todos los filtros"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Tabla de alertas */}
      <div className={styles.alertasTable}>
        <div className={styles.tableHeader}>
          <span>Fecha</span>
          <span>Símbolo</span>
          <span>Acción</span>
          <span>Precio Entrada</span>
          <span>Precio Actual</span>
          <span>Stop Loss</span>
          <span>Take Profit</span>
          <span>P&L</span>
          <span>Estado</span>
        </div>
        
        {/* Mostrar alertas reales filtradas */}
        {(() => {
          const filteredAlerts = getFilteredAlerts();
          
          if (loadingAlerts) {
            return (
              <div className={styles.tableRow} style={{ textAlign: 'center', padding: '2rem' }}>
                <span>Cargando alertas...</span>
              </div>
            );
          }
          
          if (realAlerts.length === 0) {
            return (
              <div className={styles.tableRow} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <span>No hay alertas creadas aún. ¡Crea tu primera alerta!</span>
              </div>
            );
          }
          
          if (filteredAlerts.length === 0) {
            return (
              <div className={styles.tableRow} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <span>No se encontraron alertas con los filtros aplicados.</span>
                <br />
                <button 
                  onClick={clearFilters}
                  style={{ 
                    marginTop: '0.5rem', 
                    background: 'none', 
                    border: '1px solid var(--primary-color)', 
                    color: 'var(--primary-color)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            );
          }
          
          return filteredAlerts.map((alert) => (
            <div key={alert.id} className={styles.tableRow}>
              <span>{alert.date}</span>
              <span className={styles.symbol}>{alert.symbol}</span>
              <span className={`${styles.action} ${alert.action === 'BUY' ? styles.buyAction : styles.sellAction}`}>
                {alert.action}
              </span>
              <span>{alert.entryPrice}</span>
              <span>{alert.exitPrice || alert.currentPrice}</span>
              <span>{alert.stopLoss || '-'}</span>
              <span>{alert.takeProfit || '-'}</span>
              <span className={alert.profit.includes('+') ? styles.profit : styles.loss}>
                {alert.profit}
              </span>
              <span className={`${styles.status} ${alert.status === 'ACTIVE' ? styles.statusActive : ''}`}>
                {alert.status === 'ACTIVE' ? 'ACTIVA' : 'CERRADA'}
              </span>
            </div>
          ));
        })()}
      </div>
    </div>
  );

  const renderAlertasVigentes = () => {
    // Filtrar solo alertas activas de las alertas reales
    const alertasActivas = realAlerts.filter(alert => alert.status === 'ACTIVE');
    
    return (
      <div className={styles.vigentesContent}>
        <div className={styles.vigentesHeader}>
          <h2 className={styles.sectionTitle}>Alertas Vigentes</h2>
          <div className={styles.priceUpdateControls}>
            <button 
              className={styles.updatePricesButton}
              onClick={() => updatePrices(false)}
              disabled={updatingPrices}
            >
              {updatingPrices ? '🔄 Actualizando...' : '📈 Actualizar Precios'}
            </button>
            <div className={styles.marketInfo}>
              {lastPriceUpdate && (
                <span className={styles.lastUpdateTime}>
                  Última actualización: {lastPriceUpdate.toLocaleTimeString()}
                </span>
              )}
              {marketStatus && (
                <span className={`${styles.marketStatus} ${styles[`status${marketStatus}`]}`}>
                  {marketStatus === 'OPEN' ? '🟢 Mercado Abierto' : 
                   marketStatus === 'CLOSED_WEEKEND' ? '🔴 Mercado Cerrado (Fin de semana)' :
                   marketStatus === 'CLOSED_AFTER_HOURS' ? '🟡 Mercado Cerrado (After hours)' :
                   marketStatus === 'CLOSED_PRE_MARKET' ? '🟡 Mercado Cerrado (Pre-market)' :
                   '🟡 Estado desconocido'}
                </span>
              )}
              {isUsingSimulatedPrices && (
                <span className={styles.simulatedWarning}>
                  ⚠️ Precios simulados
                </span>
              )}
            </div>
          </div>
        </div>
        
        {loadingAlerts ? (
          <div className={styles.loadingContainer}>
            <p>Cargando alertas...</p>
          </div>
        ) : alertasActivas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay alertas vigentes en este momento.</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Las alertas aparecerán aquí cuando las crees.
            </p>
          </div>
        ) : (
          alertasActivas.map((alert) => (
            <div key={alert.id} className={styles.alertCard}>
              <div className={styles.alertHeader}>
                <h3 className={styles.alertSymbol}>{alert.symbol}</h3>
                <span className={`${styles.alertAction} ${alert.action === 'BUY' ? styles.buyAction : styles.sellAction}`}>
                  {alert.action}
                </span>
              </div>
              
              <div className={styles.alertDetails}>
                <div className={styles.alertDetail}>
                  <span>Precio Entrada:</span>
                  <strong>{alert.entryPrice}</strong>
                </div>
                <div className={styles.alertDetail}>
                  <span>Precio Actual:</span>
                  <strong>{alert.currentPrice}</strong>
                </div>
                <div className={styles.alertDetail}>
                  <span>Stop Loss:</span>
                  <strong>{alert.stopLoss}</strong>
                </div>
                <div className={styles.alertDetail}>
                  <span>Take Profit:</span>
                  <strong>{alert.takeProfit}</strong>
                </div>
                <div className={styles.alertDetail}>
                  <span>P&L:</span>
                  <strong className={alert.profit.includes('+') ? styles.profit : styles.loss}>
                    {alert.profit}
                  </strong>
                </div>
              </div>
              
              <div className={styles.alertActions}>
                <button className={styles.closeButton}>Cerrar Posición</button>
                <button className={styles.modifyButton}>Modificar</button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderInformes = () => (
    <div className={styles.informesContent}>
      <div className={styles.informesHeader}>
        <h2 className={styles.sectionTitle}>Informes</h2>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateReportModal(true)}
          title="Crear nuevo informe"
        >
          + Crear Informe
        </button>
      </div>
      
      {loadingInformes ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <h3>Cargando informes...</h3>
        </div>
      ) : informes.length > 0 ? (
        <div className={styles.informesList}>
          {informes.map((informe) => (
            <div key={informe.id || informe._id} className={styles.informeCard}>
              <div className={styles.informeHeader}>
                <h3>{informe.title}</h3>
                <span className={styles.informeDate}>
                  {new Date(informe.publishedAt || informe.createdAt).toLocaleDateString('es-ES')}
                </span>
                {informe.isFeature && (
                  <span className={styles.featuredBadge}>⭐ Destacado</span>
                )}
              </div>
              
              <div className={styles.informeMeta}>
                <span className={styles.informeType}>
                  {informe.type === 'video' ? '🎥' : informe.type === 'analisis' ? '📊' : '📄'} 
                  {informe.type === 'video' ? 'Video' : informe.type === 'analisis' ? 'Análisis' : 'Informe'}
                </span>
                {informe.readTime && (
                  <span className={styles.readTime}>⏱️ {informe.readTime} min lectura</span>
                )}
                <span className={styles.views}>👁️ {informe.views} vistas</span>
              </div>

              <p className={styles.informeDescription}>
                {informe.summary}
              </p>

              {informe.tags && informe.tags.length > 0 && (
                <div className={styles.informeTags}>
                  {informe.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className={styles.tag}>#{tag}</span>
                  ))}
                </div>
              )}

              <div className={styles.informeActions}>
                <button 
                  className={styles.readButton}
                  onClick={() => openReport(informe.id || informe._id)}
                >
                  {informe.type === 'video' ? 'Ver Video' : 'Leer Informe'}
                </button>
                {informe.pdfUrl && (
                  <button className={styles.downloadButton}>
                    <Download size={16} />
                    Descargar PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h3>No hay informes disponibles</h3>
          <p>Los informes y análisis aparecerán aquí cuando estén disponibles.</p>
          <div className={styles.emptyActions}>
            <p className={styles.emptyHint}>
              Puedes crear el primer informe para comenzar.
            </p>
            <button 
              className={styles.emptyCreateButton}
              onClick={() => setShowCreateReportModal(true)}
            >
              Crear Primer Informe
            </button>
          </div>
        </div>
      )}

      {/* Modal para mostrar informe completo */}
      {selectedReport && (
        <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div className={styles.reportModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.reportHeader}>
              <h2>{selectedReport.title}</h2>
              <button 
                className={styles.closeModal}
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.reportMeta}>
              <span>Por {selectedReport.author}</span>
              <span>{new Date(selectedReport.publishedAt || selectedReport.createdAt).toLocaleDateString('es-ES')}</span>
            </div>

            <div className={styles.reportContent}>
              {selectedReport.type === 'video' && selectedReport.videoMuxId ? (
                <div className={styles.videoContainer}>
                  <VideoPlayerMux 
                    playbackId={selectedReport.videoMuxId} 
                    autoplay={false}
                    className={styles.reportVideo}
                  />
                </div>
              ) : null}
              
              <div className={styles.reportText}>
                {selectedReport.content.split('\n').map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Sección de comentarios */}
              <ReportComments reportId={selectedReport.id || selectedReport._id} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear informe */}
      {showCreateReportModal && (
        <CreateReportModal 
          onClose={() => setShowCreateReportModal(false)}
          onSubmit={handleCreateReport}
          loading={creatingReport}
        />
      )}
    </div>
  );

  // Componente separado para el Chat de Comunidad
  const CommunityChat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    // Cargar mensajes existentes al montar el componente
    useEffect(() => {
      fetchMessages();
    }, []);

    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/chat/messages');
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      } finally {
        setLoading(false);
      }
    };

    const sendMessage = async () => {
      if (message.trim()) {
        try {
          const messageData: any = {
            message: message.trim(),
            chatType: 'trader-call'
          };

          // Si estamos respondiendo a un mensaje, incluir la referencia
          if (replyingTo) {
            messageData.replyTo = {
              messageId: replyingTo._id || replyingTo.id,
              userName: replyingTo.userName,
              message: replyingTo.message
            };
          }

          const response = await fetch('/api/chat/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
          });

          if (response.ok) {
            const data = await response.json();
            setMessages(prev => [...prev, data.message]);
            setMessage('');
            setReplyingTo(null); // Limpiar la respuesta
          } else {
            alert('Error al enviar mensaje');
          }
        } catch (error) {
          console.error('Error enviando mensaje:', error);
          alert('Error al enviar mensaje');
        }
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      } else if (e.key === 'Escape') {
        setReplyingTo(null); // Cancelar respuesta con Escape
      }
    };

    const handleReply = (msg: any) => {
      setReplyingTo(msg);
      // Enfocar el input después de seleccionar respuesta
      setTimeout(() => {
        const input = document.querySelector('.messageInput') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    };

    const cancelReply = () => {
      setReplyingTo(null);
    };

    const formatTime = (timestamp: string) => {
      return new Date(timestamp).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };

    if (loading) {
      return (
        <div className={styles.comunidadContent}>
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
              <div className={styles.chatTitle}>
                <h2>💬 Comunidad Trader Call</h2>
              </div>
            </div>
            <div className={styles.loadingChat}>
              <div className={styles.loadingSpinner}></div>
              <p>Cargando chat...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.comunidadContent}>
        <div className={styles.chatContainer}>
          {/* Header del Chat */}
          <div className={styles.chatHeader}>
            <div className={styles.chatTitle}>
              <h2>💬 Comunidad Trader Call</h2>
            </div>
          </div>

          {/* Área Principal del Chat - Sin panel lateral */}
          <div className={styles.chatMainFull}>
            <div className={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div className={styles.emptyChat}>
                  <div className={styles.emptyChatIcon}>💬</div>
                  <p>¡Sé el primero en escribir un mensaje!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg._id || msg.id} 
                    className={`${styles.chatMessage} ${msg.type === 'highlight' ? styles.highlightMessage : ''}`}
                  >
                    {/* Mostrar cita si el mensaje es una respuesta */}
                    {msg.replyTo && (
                      <div className={styles.replyReference}>
                        <div className={styles.replyLine}></div>
                        <div className={styles.replyContent}>
                          <span className={styles.replyUser}>@{msg.replyTo.userName}</span>
                          <span className={styles.replyText}>
                            {msg.replyTo.message.length > 50 
                              ? msg.replyTo.message.substring(0, 50) + '...' 
                              : msg.replyTo.message}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={styles.messageHeader}>
                      <span className={styles.messageUser}>
                        {/* Imagen de perfil del usuario */}
                        {msg.userImage ? (
                          <img 
                            src={msg.userImage} 
                            alt={`Foto de ${msg.userName}`}
                            className={styles.userAvatar}
                            onError={(e) => {
                              // Si falla la carga de la imagen, mostrar placeholder
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const placeholder = target.nextElementSibling as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        {/* Placeholder para usuarios sin imagen */}
                        <div 
                          className={styles.userAvatarPlaceholder}
                          style={{ display: msg.userImage ? 'none' : 'flex' }}
                        >
                          {msg.userName ? msg.userName.charAt(0).toUpperCase() : '?'}
                        </div>
                        {msg.userName}
                      </span>
                      <span className={styles.messageTime}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className={styles.messageContent}>
                      {msg.message}
                    </div>

                    {/* Botón de respuesta (aparece en hover) */}
                    <div className={styles.messageActions}>
                      <button 
                        className={styles.replyButton}
                        onClick={() => handleReply(msg)}
                        title="Responder mensaje"
                      >
                        ↩️ Responder
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input para enviar mensajes */}
            <div className={styles.chatInput}>
              {/* Mostrar cita cuando se está respondiendo */}
              {replyingTo && (
                <div className={styles.replyingTo}>
                  <div className={styles.replyingHeader}>
                    <span>Respondiendo a @{replyingTo.userName}</span>
                    <button className={styles.cancelReply} onClick={cancelReply}>
                      ✕
                    </button>
                  </div>
                  <div className={styles.replyingText}>
                    {replyingTo.message.length > 100 
                      ? replyingTo.message.substring(0, 100) + '...' 
                      : replyingTo.message}
                  </div>
                </div>
              )}

              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={replyingTo ? "Escribe tu respuesta..." : "Escribe un mensaje..."}
                  className={`${styles.messageInput} messageInput`}
                  maxLength={200}
                />
                <button 
                  onClick={sendMessage}
                  className={styles.sendButton}
                  disabled={!message.trim()}
                >
                  🚀
                </button>
              </div>
              <div className={styles.chatInfo}>
                <span>Presiona Enter para enviar • Escape para cancelar respuesta • {message.length}/200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComunidad = () => <CommunityChat />;

  // Componente para los comentarios de informes
  const ReportComments = ({ reportId }: { reportId: string }) => {
    const { data: session } = useSession();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);

    // Cargar comentarios cuando se monta el componente
    useEffect(() => {
      if (reportId) {
        fetchComments();
      }
    }, [reportId]);

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/reports/comments?reportId=${reportId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Error cargando comentarios:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    const submitComment = async () => {
      if (!newComment.trim() || !session) return;
      
      setSubmittingComment(true);
      try {
        const commentData: any = {
          reportId,
          comment: newComment.trim()
        };

        if (replyingTo) {
          commentData.replyTo = {
            commentId: replyingTo._id || replyingTo.id,
            userName: replyingTo.userName,
            comment: replyingTo.comment
          };
        }

        const response = await fetch('/api/reports/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
        });

        if (response.ok) {
          const data = await response.json();
          setComments(prev => [...prev, data.comment]);
          setNewComment('');
          setReplyingTo(null);
        }
      } catch (error) {
        console.error('Error enviando comentario:', error);
      } finally {
        setSubmittingComment(false);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitComment();
      } else if (e.key === 'Escape') {
        setReplyingTo(null);
      }
    };

    const formatCommentTime = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays}d`;
      return date.toLocaleDateString('es-ES');
    };

    const getCharCountClass = () => {
      if (newComment.length >= 450) return 'error';
      if (newComment.length >= 400) return 'warning';
      return '';
    };

    return (
      <div className={styles.reportComments}>
        <div className={styles.commentsHeader}>
          <h3 className={styles.commentsTitle}>
            💬 Comentarios
            {comments.length > 0 && (
              <span className={styles.commentsCount}>{comments.length}</span>
            )}
          </h3>
        </div>

        {/* Formulario para nuevo comentario */}
        {session ? (
          <div className={styles.commentForm}>
            {replyingTo && (
              <div className={styles.commentReply}>
                <div className={styles.commentReplyUser}>
                  Respondiendo a @{replyingTo.userName}
                </div>
                <div className={styles.commentReplyText}>
                  {replyingTo.comment.length > 100 
                    ? `${replyingTo.comment.substring(0, 100)}...` 
                    : replyingTo.comment}
                </div>
                <button 
                  onClick={() => setReplyingTo(null)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ef4444', 
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  ✕ Cancelar respuesta
                </button>
              </div>
            )}
            
            <div className={styles.commentInputContainer}>
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name} 
                  className={styles.commentUserAvatar}
                />
              ) : (
                <div className={styles.commentUserPlaceholder}>
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className={styles.commentInputWrapper}>
                <textarea
                  className={styles.commentTextarea}
                  placeholder={replyingTo ? `Responder a ${replyingTo.userName}...` : "Escribe tu comentario..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  maxLength={500}
                />
                
                <div className={styles.commentActions}>
                  <span className={`${styles.commentCharCount} ${styles[getCharCountClass()]}`}>
                    {newComment.length}/500
                  </span>
                  
                  <button 
                    className={styles.commentSubmitButton}
                    onClick={submitComment}
                    disabled={!newComment.trim() || submittingComment || newComment.length > 500}
                  >
                    {submittingComment ? 'Enviando...' : (replyingTo ? 'Responder' : 'Comentar')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.commentForm}>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Debes iniciar sesión para comentar
            </p>
          </div>
        )}

        {/* Lista de comentarios */}
        {loadingComments ? (
          <div className={styles.commentsLoading}>
            <div>⏳ Cargando comentarios...</div>
          </div>
        ) : comments.length > 0 ? (
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment._id || comment.id} className={styles.comment}>
                {comment.replyTo && (
                  <div className={styles.commentReply}>
                    <div className={styles.commentReplyUser}>
                      @{comment.replyTo.userName}
                    </div>
                    <div className={styles.commentReplyText}>
                      {comment.replyTo.comment.length > 100 
                        ? `${comment.replyTo.comment.substring(0, 100)}...` 
                        : comment.replyTo.comment}
                    </div>
                  </div>
                )}
                
                <div className={styles.commentHeader}>
                  <div className={styles.commentUser}>
                    {comment.userImage ? (
                      <img 
                        src={comment.userImage} 
                        alt={comment.userName} 
                        className={styles.commentAvatar}
                      />
                    ) : (
                      <div className={styles.commentAvatarPlaceholder}>
                        {comment.userName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {comment.userName}
                  </div>
                  <span className={styles.commentTime}>
                    {formatCommentTime(comment.timestamp)}
                  </span>
                </div>
                
                <div className={styles.commentContent}>
                  {comment.comment}
                </div>
                
                {session && (
                  <button 
                    className={styles.commentReplyButton}
                    onClick={() => setReplyingTo(comment)}
                  >
                    ↩️ Responder
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.commentsEmpty}>
            <div className={styles.commentsEmptyIcon}>💬</div>
            <h4>Aún no hay comentarios</h4>
            <p>Sé el primero en comentar este informe</p>
          </div>
        )}
      </div>
    );
  };

  // Modal para crear nueva alerta
  const renderCreateAlertModal = () => {
    if (!showCreateAlert) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h3>Crear Nueva Alerta</h3>
            <button 
              className={styles.closeModal}
              onClick={() => setShowCreateAlert(false)}
            >
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* Símbolo de la acción */}
            <div className={styles.inputGroup}>
              <label>Símbolo de la Acción</label>
              <div className={styles.symbolInput}>
                <input
                  type="text"
                  placeholder="Ej: AAPL, TSLA, MSFT"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                  className={styles.input}
                />
                <button
                  onClick={() => fetchStockPrice(newAlert.symbol)}
                  disabled={!newAlert.symbol || priceLoading}
                  className={styles.getPriceButton}
                >
                  {priceLoading ? 'Cargando...' : 'Obtener Precio'}
                </button>
              </div>
            </div>

            {/* Precio actual */}
            {stockPrice && (
              <div className={styles.priceDisplay}>
                <label>Precio Actual:</label>
                <span className={styles.currentPrice}>${stockPrice.toFixed(2)}</span>
              </div>
            )}

            {/* Acción */}
            <div className={styles.inputGroup}>
              <label>Acción</label>
              <select
                value={newAlert.action}
                onChange={(e) => setNewAlert(prev => ({ ...prev, action: e.target.value }))}
                className={styles.select}
              >
                <option value="BUY">BUY (Compra)</option>
                <option value="SELL">SELL (Venta)</option>
              </select>
            </div>

            {/* Stop Loss */}
            <div className={styles.inputGroup}>
              <label>Stop Loss</label>
              <input
                type="number"
                step="0.01"
                placeholder="Precio de stop loss"
                value={newAlert.stopLoss}
                onChange={(e) => setNewAlert(prev => ({ ...prev, stopLoss: e.target.value }))}
                className={styles.input}
              />
            </div>

            {/* Take Profit */}
            <div className={styles.inputGroup}>
              <label>Take Profit</label>
              <input
                type="number"
                step="0.01"
                placeholder="Precio de take profit"
                value={newAlert.takeProfit}
                onChange={(e) => setNewAlert(prev => ({ ...prev, takeProfit: e.target.value }))}
                className={styles.input}
              />
            </div>

            {/* Análisis */}
            <div className={styles.inputGroup}>
              <label>Análisis / Descripción</label>
              <textarea
                placeholder="Descripción del análisis técnico o fundamental..."
                value={newAlert.analysis}
                onChange={(e) => setNewAlert(prev => ({ ...prev, analysis: e.target.value }))}
                className={styles.textarea}
                rows={4}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button 
              onClick={() => setShowCreateAlert(false)}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button 
              onClick={handleCreateAlert}
              disabled={!newAlert.symbol || !stockPrice || loading}
              className={styles.createButton}
            >
              {loading ? 'Creando...' : 'Crear Alerta'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.subscriberView}>
      <div className={styles.container}>
        {/* Header de suscriptor */}
        <div className={styles.subscriberHeader}>
          <h1 className={styles.subscriberTitle}>Trader Call - Dashboard</h1>
          <p className={styles.subscriberWelcome}>
            Bienvenido a tu área exclusiva de Trader Call. Aquí tienes acceso completo a todas las alertas y recursos.
          </p>
        </div>

        {/* Navegación de pestañas */}
        <nav className={styles.subscriberNav}>
          <button 
            className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.navActive : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={20} />
            Dashboard de Trabajo
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'seguimiento' ? styles.navActive : ''}`}
            onClick={() => setActiveTab('seguimiento')}
          >
            <Activity size={20} />
            Seguimiento de Alertas
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'vigentes' ? styles.navActive : ''}`}
            onClick={() => setActiveTab('vigentes')}
          >
            <TrendingUp size={20} />
            Alertas Vigentes
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'informes' ? styles.navActive : ''}`}
            onClick={() => setActiveTab('informes')}
          >
            <Download size={20} />
            Informes
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'comunidad' ? styles.navActive : ''}`}
            onClick={() => setActiveTab('comunidad')}
          >
            <Users size={20} />
            Comunidad
          </button>
        </nav>

        {/* Contenido dinámico */}
        <div className={styles.subscriberContent}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'seguimiento' && renderSeguimientoAlertas()}
          {activeTab === 'vigentes' && renderAlertasVigentes()}
          {activeTab === 'informes' && renderInformes()}
          {activeTab === 'comunidad' && renderComunidad()}
        </div>
      </div>

      {/* Modal para crear alertas */}
      {renderCreateAlertModal()}
    </div>
  );
};

// Componente para modal de creación de informes
const CreateReportModal = ({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'informe',
    content: '',
    summary: '',
    tags: '',
    status: 'published'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Título y contenido son obligatorios');
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    onSubmit({
      ...formData,
      tags: tagsArray
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.createReportModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Crear Nuevo Informe</h2>
          <button 
            className={styles.closeModal}
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.createReportForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Título del informe"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              disabled={loading}
            >
              <option value="informe">📄 Informe</option>
              <option value="analisis">📊 Análisis</option>
              <option value="video">🎥 Video</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="summary">Resumen</label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Breve descripción del informe"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">Contenido *</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Contenido completo del informe"
              rows={8}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tags">Tags (separados por comas)</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="trading, análisis, mercado"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              disabled={loading}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Informe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TraderCallPage: React.FC<TraderCallPageProps> = ({ 
  isSubscribed, 
  metrics, 
  historicalAlerts 
}) => {
  return (
    <>
      <Head>
        <title>Trader Call - Alertas de Trading en Tiempo Real | Nahuel Lozano</title>
        <meta name="description" content="Recibe alertas de trading profesionales en tiempo real con análisis técnico avanzado. Señales precisas de compra y venta para maximizar tus ganancias." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />
      
      <main className={styles.main}>
        {isSubscribed ? (
          <SubscriberView />
        ) : (
          <NonSubscriberView 
            metrics={metrics} 
            historicalAlerts={historicalAlerts} 
          />
        )}
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Verificar autenticación y suscripción
  let isSubscribed = false;
  
  try {
    // Importar dinámicamente para evitar errores de SSR
    const { getSession } = await import('next-auth/react');
    const dbConnect = (await import('@/lib/mongodb')).default;
    const User = (await import('@/models/User')).default;

    const session = await getSession(context);
    
    if (session?.user?.email) {
      await dbConnect();
      const user = await User.findOne({ email: session.user.email });
      
      if (user) {
        // Verificar si tiene suscripción activa a TraderCall
        const suscripcionActiva = user.suscripciones?.find(
          (sub: any) => 
            sub.servicio === 'TraderCall' && 
            sub.activa === true && 
            new Date(sub.fechaVencimiento) > new Date()
        );
        
        // También verificar en el array alternativo
        const subscriptionActiva = user.subscriptions?.find(
          (sub: any) => 
            sub.tipo === 'TraderCall' && 
            sub.activa === true &&
            (!sub.fechaFin || new Date(sub.fechaFin) > new Date())
        );

        isSubscribed = !!(suscripcionActiva || subscriptionActiva);
      }
    }
  } catch (error) {
    console.error('Error verificando suscripción:', error);
    // En caso de error, mostramos vista no suscrita por defecto
    isSubscribed = false;
  }

  const metrics = {
    performance: '+87.5%',
    activeUsers: '+500',
    alertsSent: '+1,300',
    accuracy: '92.3%'
  };

  const historicalAlerts = [
    {
      date: '2024-01-15',
      symbol: 'AAPL',
      action: 'BUY',
      price: '185.50',
      result: 'PROFIT',
      profit: '+12.5%'
    },
    {
      date: '2024-01-14',
      symbol: 'TSLA',
      action: 'SELL',
      price: '248.90',
      result: 'PROFIT',
      profit: '+8.3%'
    },
    {
      date: '2024-01-12',
      symbol: 'MSFT',
      action: 'BUY',
      price: '375.20',
      result: 'PROFIT',
      profit: '+15.2%'
    },
    {
      date: '2024-01-11',
      symbol: 'GOOGL',
      action: 'BUY',
      price: '142.80',
      result: 'PROFIT',
      profit: '+9.7%'
    },
    {
      date: '2024-01-10',
      symbol: 'NVDA',
      action: 'SELL',
      price: '552.30',
      result: 'LOSS',
      profit: '-3.2%'
    },
    {
      date: '2024-01-09',
      symbol: 'AMD',
      action: 'BUY',
      price: '148.60',
      result: 'PROFIT',
      profit: '+18.4%'
    },
    {
      date: '2024-01-08',
      symbol: 'SPY',
      action: 'BUY',
      price: '478.20',
      result: 'PROFIT',
      profit: '+5.8%'
    },
    {
      date: '2024-01-05',
      symbol: 'QQQ',
      action: 'SELL',
      price: '395.40',
      result: 'PROFIT',
      profit: '+7.1%'
    }
  ];

  return {
    props: {
      isSubscribed,
      metrics,
      historicalAlerts
    }
  };
};

export default TraderCallPage; 