import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/googleAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayerMux from '@/components/VideoPlayerMux';
import Carousel from '@/components/Carousel';
import ImageUploader, { CloudinaryImage } from '@/components/ImageUploader';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Activity, 
  Download, 
  BarChart3,
  CheckCircle,
  Star,
  Bell,
  Filter,
  Search,
  MessageCircle,
  Clock,
  ThumbsUp,
  Send,
  Reply,
  X,
  AlertTriangle,
  DollarSign,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import styles from '@/styles/TraderCall.module.css';
import { useRouter } from 'next/router';
import { calculateDaysRemaining, calculateDaysSinceSubscription } from '../../utils/dateUtils';
import SPY500Indicator from '@/components/SPY500Indicator';
import PortfolioTimeRange from '@/components/PortfolioTimeRange';

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
  // Estados para imágenes del gráfico de TradingView
  const [chartImage, setChartImage] = useState<CloudinaryImage | null>(null);
  const [additionalImages, setAdditionalImages] = useState<CloudinaryImage[]>([]);
  const [uploadingChart, setUploadingChart] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
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
  
  // Estados para modales de imágenes
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<CloudinaryImage | null>(null);
  const [showAdditionalImagesModal, setShowAdditionalImagesModal] = useState(false);
  const [selectedAlertImages, setSelectedAlertImages] = useState<CloudinaryImage[]>([]);
  
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
    
    // **CAMBIO: Calcular alertas del año actual (en lugar de semanal)**
    const ahora = new Date();
    const inicioAño = new Date(ahora.getFullYear(), 0, 1);
    const alertasAnuales = realAlerts.filter(alert => {
      const fechaAlert = new Date(alert.date);
      return fechaAlert >= inicioAño;
    }).length;

    // **CAMBIO: Calcular rentabilidad anual usando alertas reales**
    const alertasAnualConGanancias = realAlerts.filter(alert => {
      const fechaAlert = new Date(alert.date);
      return fechaAlert >= inicioAño;
    });

    const gananciasAnual = alertasAnualConGanancias.reduce((total, alert) => {
      const profitValue = parseFloat(alert.profit.replace('%', '').replace('+', ''));
      return total + profitValue;
    }, 0);

    const rentabilidadAnual = gananciasAnual.toFixed(1);

    return {
      alertasActivas,
      alertasGanadoras,
      alertasPerdedoras,
      rentabilidadAnual: `${gananciasAnual >= 0 ? '+' : ''}${rentabilidadAnual}%`,
      alertasAnuales
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
        const currentPrice = parseFloat(String(alert.currentPrice || '0').replace('$', ''));
        const entryPrice = parseFloat(String(alert.entryPrice || '0').replace('$', ''));
        const currentPnL = entryPrice > 0 
          ? ((currentPrice - entryPrice) / entryPrice * 100).toFixed(2)
          : '0.00';
        const pnlValue = parseFloat(currentPnL);
        message = `${alert.symbol} actualizado: ${pnlValue > 0 ? '+' : ''}${currentPnL}% P&L #${alert.symbol}`;
      } else if (alert.status === 'CLOSED') {
        const profitString = String(alert.profit || '0%').replace('%', '').replace('+', '');
        const profit = parseFloat(profitString) || 0;
        message = `${alert.symbol} cerrado: ${profit > 0 ? '+' : ''}${profit.toFixed(2)}% ${profit > 0 ? 'ganancia' : 'pérdida'} #${alert.symbol}`;
      } else {
        const entryPriceFormatted = String(alert.entryPrice || '0').replace('$', '');
        message = `Nueva alerta: ${alert.symbol} ${alert.action} a $${entryPriceFormatted} #${alert.symbol}`;
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
      // Filtrar solo informes de Trader Call
      const response = await fetch('/api/reports?limit=6&featured=false&category=trader-call', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setInformes(data.data?.reports || []);
        console.log('Informes Trader Call cargados:', data.data?.reports?.length || 0);
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
        const report = data.data.report;
        
        // Debug: Mostrar qué datos estamos recibiendo
        console.log('📊 Datos del informe recibidos:', {
          id: report.id || report._id,
          title: report.title,
          hasImageUrl: !!report.imageUrl,
          imageUrl: report.imageUrl,
          hasImageMuxId: !!report.imageMuxId,
          imageMuxId: report.imageMuxId,
          hasImages: !!report.images,
          imagesCount: report.images?.length || 0,
          images: report.images
        });
        
        setSelectedReport(report);
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
      console.log('📤 Enviando datos del informe:', formData);
      
      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData, 
          category: 'trader-call' // Asignar categoría Trader Call
        }),
      });

      console.log('📡 Respuesta recibida del servidor:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Informe Trader Call creado exitosamente:', result);
        const newReport = result.data.report;
        setInformes(prev => [newReport, ...prev]);
        setShowCreateReportModal(false);
        // Mostrar mensaje de éxito
        alert('Informe creado exitosamente');
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        alert(`Error: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error al crear informe:', error);
      alert('Error al crear el informe: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      console.log('🔄 Finalizando creación de informe...');
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

  // Función para obtener precio individual de una acción (modal crear alerta)
  const fetchStockPrice = async (symbol: string) => {
    if (!symbol.trim()) {
      alert('Por favor ingresa un símbolo válido');
      return;
    }

    setPriceLoading(true);
    setStockPrice(null);
    
    try {
      console.log(`🔍 Obteniendo precio para: ${symbol}`);
      
      const response = await fetch(`/api/stock-price?symbol=${symbol.toUpperCase()}`, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`💰 Precio obtenido para ${symbol}: $${data.price}`);
        console.log(`📊 Estado del mercado: ${data.marketStatus}`);
        
        setStockPrice(data.price);
        
      } else {
        console.error('Error al obtener precio:', response.status);
        alert('Error al obtener el precio. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al obtener precio:', error);
      alert('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setPriceLoading(false);
    }
  };

  // Funciones para manejar imágenes
  const handleChartImageUploaded = (image: CloudinaryImage) => {
    setChartImage(image);
    setUploadingChart(false);
    console.log('✅ Gráfico de TradingView subido:', image.public_id);
  };

  const handleAdditionalImageUploaded = (image: CloudinaryImage) => {
    setAdditionalImages(prev => [...prev, image]);
    setUploadingImages(false);
    console.log('✅ Imagen adicional subida:', image.public_id);
  };

  const removeChartImage = () => {
    setChartImage(null);
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    setAdditionalImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setAdditionalImages(prev => prev.map((img, i) => 
      i === index ? { ...img, caption } : img
    ));
  };

  const handleCreateAlert = async () => {
    if (!newAlert.symbol || !stockPrice) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          tipo: 'TraderCall',
          symbol: newAlert.symbol.toUpperCase(),
          action: newAlert.action,
          entryPrice: stockPrice,
          stopLoss: parseFloat(newAlert.stopLoss),
          takeProfit: parseFloat(newAlert.takeProfit),
          analysis: newAlert.analysis || '',
          date: new Date().toISOString(),
          chartImage: chartImage,
          images: additionalImages
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Alerta Trader Call creada:', result.alert);
        
        // Recargar alertas y limpiar formulario
        await loadAlerts();
        setNewAlert({
          symbol: '',
          action: 'BUY',
          stopLoss: '',
          takeProfit: '',
          analysis: ''
        });
        setStockPrice(null);
        setChartImage(null);
        setAdditionalImages([]);
        setShowCreateAlert(false);
        
        alert('¡Alerta de Trader Call creada exitosamente!');
      } else {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
        alert(`Error: ${error.message || 'No se pudo crear la alerta'}`);
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Error al crear la alerta');
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar posición
  const handleClosePosition = async (alertId: string, currentPrice: string) => {
    if (!confirm('¿Estás seguro de que quieres cerrar esta posición?')) {
      return;
    }

    try {
      const priceNumber = parseFloat(currentPrice.replace('$', ''));
      
      const response = await fetch('/api/alerts/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          alertId: alertId,
          currentPrice: priceNumber,
          reason: 'MANUAL'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Posición cerrada:', result.alert);
        
        // Recargar alertas para mostrar cambios
        await loadAlerts();
        
        alert('¡Posición cerrada exitosamente!');
      } else {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
        alert(`Error: ${error.message || 'No se pudo cerrar la posición'}`);
      }
    } catch (error) {
      console.error('Error closing position:', error);
      alert('Error al cerrar la posición');
    }
  };

  const renderDashboard = () => (
    <div className={styles.dashboardContent}>
      <h2 className={styles.sectionTitle}>Dashboard de Trabajo</h2>
      
      {/* **NUEVO: SPY500 y Portfolio lado a lado** */}
      <div className={styles.marketOverview}>
        <SPY500Indicator />
        <PortfolioTimeRange
          selectedRange={portfolioRange}
          onRangeChange={handlePortfolioRangeChange}
        />
      </div>
      
      {/* Métricas principales modernizadas */}
      <div className={styles.modernMetricsGrid}>
        <div className={`${styles.modernMetricCard} ${styles.activeCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.iconContainer}>
              <Activity size={20} />
            </div>
            <div className={styles.statusDot}></div>
          </div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricTitle}>ALERTAS ACTIVAS</h3>
            <div className={styles.metricValue}>{dashboardMetrics.alertasActivas}</div>
            <p className={styles.metricSubtext}>Posiciones abiertas</p>
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendIndicator}>●</span>
          </div>
        </div>
        
        <div className={`${styles.modernMetricCard} ${styles.successCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.iconContainer}>
              <TrendingUp size={20} />
            </div>
            <div className={styles.statusDot}></div>
          </div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricTitle}>ALERTAS GANADORAS</h3>
            <div className={styles.metricValue}>{dashboardMetrics.alertasGanadoras}</div>
            <p className={styles.metricSubtext}>Cerradas con ganancia</p>
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendIndicator}>●</span>
          </div>
        </div>
        
        <div className={`${styles.modernMetricCard} ${styles.errorCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.iconContainer}>
              <TrendingDown size={20} />
            </div>
            <div className={styles.statusDot}></div>
          </div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricTitle}>ALERTAS PERDEDORAS</h3>
            <div className={styles.metricValue}>{dashboardMetrics.alertasPerdedoras}</div>
            <p className={styles.metricSubtext}>Cerradas con pérdida</p>
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendIndicator}>●</span>
          </div>
        </div>
        
        <div className={`${styles.modernMetricCard} ${styles.warningCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.iconContainer}>
              <BarChart3 size={20} />
            </div>
            <div className={styles.statusDot}></div>
          </div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricTitle}>RENTABILIDAD ANUAL</h3>
            <div className={styles.metricValue}>{dashboardMetrics.rentabilidadAnual}</div>
            <p className={styles.metricSubtext}>Año {new Date().getFullYear()}</p>
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendIndicator}>●</span>
          </div>
        </div>
        
        <div className={`${styles.modernMetricCard} ${styles.infoCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.iconContainer}>
              <Users size={20} />
            </div>
            <div className={styles.statusDot}></div>
          </div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricTitle}>ALERTAS ANUALES</h3>
            <div className={styles.metricValue}>{dashboardMetrics.alertasAnuales}</div>
            <p className={styles.metricSubtext}>Enviadas este año</p>
          </div>
          <div className={styles.cardTrend}>
            <span className={styles.trendIndicator}>●</span>
          </div>
        </div>
      </div>

      {/* Resumen de Performance modernizado */}
      <div className={styles.modernPerformanceSection}>
        <div className={styles.performanceHeader}>
          <h3 className={styles.performanceTitle}>Resumen de Performance</h3>
          <div className={styles.performanceBadge}>En tiempo real</div>
        </div>
        <div className={styles.modernPerformanceGrid}>
          <div className={styles.performanceStat}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Win Rate</span>
              <div className={styles.statIcon}>📊</div>
            </div>
            <div className={styles.statValue}>
              {dashboardMetrics.alertasGanadoras + dashboardMetrics.alertasPerdedoras > 0 
                ? ((dashboardMetrics.alertasGanadoras / (dashboardMetrics.alertasGanadoras + dashboardMetrics.alertasPerdedoras)) * 100).toFixed(1) 
                : '0.0'}%
            </div>
            <div className={styles.statProgress}>
              <div 
                className={styles.progressBar} 
                style={{ 
                  width: `${dashboardMetrics.alertasGanadoras + dashboardMetrics.alertasPerdedoras > 0 
                    ? ((dashboardMetrics.alertasGanadoras / (dashboardMetrics.alertasGanadoras + dashboardMetrics.alertasPerdedoras)) * 100) 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className={styles.performanceStat}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Alertas</span>
              <div className={styles.statIcon}>🎯</div>
            </div>
            <div className={styles.statValue}>{realAlerts.length}</div>
            <div className={styles.statSubtext}>Alertas procesadas</div>
          </div>
          
          <div className={styles.performanceStat}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Ratio G/P</span>
              <div className={styles.statIcon}>⚖️</div>
            </div>
            <div className={styles.statValue}>
              {dashboardMetrics.alertasPerdedoras > 0 
                ? (dashboardMetrics.alertasGanadoras / dashboardMetrics.alertasPerdedoras).toFixed(2) 
                : dashboardMetrics.alertasGanadoras > 0 ? '∞' : '0.01'}
            </div>
            <div className={styles.statSubtext}>Ganancia vs Pérdida</div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className={styles.activitySection}>
        <div className={styles.activityHeader}>
          <h3>Actividad Reciente</h3>
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
        <div className={styles.activityList}>
          {recentActivity.slice(0, 5).map((activity, index) => (
            <div key={activity.id || index} className={styles.activityItem}>
              <span className={styles.activityTime}>{activity.timestamp}</span>
              <span className={styles.activityMessage}>{activity.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* **MODIFICADO: Gráfico de evolución del portafolio con selector de rango** */}
      <div className={styles.chartContainer}>
        <h3>Evolución del Portafolio - {portfolioRange.toUpperCase()}</h3>
        <div className={styles.chartPlaceholder}>
          <BarChart3 size={64} />
          <p>Gráfico de Chart.js se implementaría aquí</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Mostrará la evolución del rendimiento del portafolio para el período seleccionado
          </p>
          {portfolioData.length > 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Datos cargados: {portfolioData.length} puntos desde {' '}
              {new Date(portfolioData[0]?.date).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSeguimientoAlertas = () => (
    <div className={styles.alertasContent}>
      <div className={styles.alertasHeader}>
        <h2 className={styles.sectionTitle}>Seguimiento de Alertas</h2>
        {userRole === 'admin' && (
          <button 
            className={styles.createAlertButton}
            onClick={() => setShowCreateAlert(true)}
          >
            + Crear Nueva Alerta
          </button>
        )}
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

      {/* Tabla de alertas mejorada */}
      <div className={styles.alertasTableContainer}>
        {(() => {
          const filteredAlerts = getFilteredAlerts();
          
          if (loadingAlerts) {
            return (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <span>Cargando alertas...</span>
              </div>
            );
          }
          
          if (realAlerts.length === 0) {
            return (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <h3>No hay alertas creadas aún</h3>
                <p>¡Crea tu primera alerta para empezar el seguimiento!</p>
                {userRole === 'admin' && (
                  <button 
                    className={styles.createFirstAlertButton}
                    onClick={() => setShowCreateAlert(true)}
                  >
                    + Crear Primera Alerta
                  </button>
                )}
              </div>
            );
          }
          
          if (filteredAlerts.length === 0) {
            return (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>No se encontraron alertas</h3>
                <p>No hay alertas que coincidan con los filtros aplicados.</p>
                <button 
                  className={styles.clearFiltersButton}
                  onClick={clearFilters}
                >
                  🗑️ Limpiar Filtros
                </button>
              </div>
            );
          }
          
          return (
            <div className={styles.alertsGrid}>
              {filteredAlerts.map((alert) => {
                // Calcular información adicional para mostrar
                const entryPrice = parseFloat(String(alert.entryPrice || '0').replace('$', ''));
                const currentPrice = parseFloat(String(alert.currentPrice || '0').replace('$', ''));
                const exitPrice = alert.exitPrice ? parseFloat(String(alert.exitPrice).replace('$', '')) : null;
                const profitPercent = parseFloat(String(alert.profit || '0%').replace('%', '').replace('+', ''));
                
                // Calcular ganancia/pérdida en dólares
                const priceChange = exitPrice ? (exitPrice - entryPrice) : (currentPrice - entryPrice);
                const dollarPL = priceChange.toFixed(2);
                
                // Determinar color del P&L
                const isProfit = profitPercent >= 0;
                const pnlColor = isProfit ? 'var(--success-color)' : 'var(--error-color)';
                
                return (
                  <div key={alert.id} className={styles.alertCard}>
                    {/* Header de la alerta */}
                    <div className={styles.alertCardHeader}>
                      <div className={styles.alertSymbolSection}>
                        <h3 className={styles.alertSymbolTitle}>{alert.symbol}</h3>
                        <span className={`${styles.alertActionBadge} ${alert.action === 'BUY' ? styles.buyBadge : styles.sellBadge}`}>
                          {alert.action}
                        </span>
                      </div>
                      <div className={styles.alertStatusSection}>
                        <span className={`${styles.statusBadge} ${alert.status === 'ACTIVE' ? styles.statusActiveBadge : styles.statusClosedBadge}`}>
                          {alert.status === 'ACTIVE' ? '🟢 ACTIVA' : '🔴 CERRADA'}
                        </span>
                        <span className={styles.alertDate}>{alert.date}</span>
                      </div>
                    </div>

                    {/* Información de precios */}
                    <div className={styles.priceInfoGrid}>
                      <div className={styles.priceInfo}>
                        <span className={styles.priceLabel}>Entrada</span>
                        <span className={styles.priceValue}>{alert.entryPrice}</span>
                      </div>
                      <div className={styles.priceInfo}>
                        <span className={styles.priceLabel}>{alert.status === 'CLOSED' ? 'Salida' : 'Actual'}</span>
                        <span className={styles.priceValue}>
                          {alert.status === 'CLOSED' ? (alert.exitPrice || alert.currentPrice) : alert.currentPrice}
                        </span>
                      </div>
                      <div className={styles.priceInfo}>
                        <span className={styles.priceLabel}>Stop Loss</span>
                        <span className={`${styles.priceValue} ${styles.stopLoss}`}>{alert.stopLoss || '-'}</span>
                      </div>
                      <div className={styles.priceInfo}>
                        <span className={styles.priceLabel}>Take Profit</span>
                        <span className={`${styles.priceValue} ${styles.takeProfit}`}>{alert.takeProfit || '-'}</span>
                      </div>
                    </div>

                    {/* P&L destacado */}
                    <div className={styles.pnlSection}>
                      <div className={styles.pnlMain}>
                        <span className={styles.pnlLabel}>P&L Total</span>
                        <div className={styles.pnlValues}>
                          <span className={styles.pnlPercent} style={{ color: pnlColor }}>
                            {isProfit ? '+' : ''}{profitPercent.toFixed(2)}%
                          </span>
                          <span className={styles.pnlDollar} style={{ color: pnlColor }}>
                            {priceChange >= 0 ? '+' : ''}${dollarPL}
                          </span>
                        </div>
                      </div>
                      {alert.status === 'CLOSED' && alert.exitReason && (
                        <div className={styles.exitReason}>
                          <span className={styles.exitReasonLabel}>Razón:</span>
                          <span className={styles.exitReasonValue}>
                            {alert.exitReason === 'MANUAL' ? '✋ Manual' : 
                             alert.exitReason === 'TAKE_PROFIT' ? '🎯 Take Profit' : 
                             alert.exitReason === 'STOP_LOSS' ? '🛑 Stop Loss' : alert.exitReason}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Análisis si existe */}
                    {alert.analysis && (
                      <div className={styles.analysisSection}>
                        <span className={styles.analysisLabel}>💡 Análisis:</span>
                        <p className={styles.analysisText}>{alert.analysis}</p>
                      </div>
                    )}

                    {/* Botones para ver imágenes */}
                    <div className={styles.imageButtonsSection}>
                      {alert.chartImage && (
                        <button
                          className={styles.imageButton}
                          onClick={() => handleShowChart(alert.chartImage)}
                        >
                          📊 Ver Gráfico
                        </button>
                      )}
                      {alert.images && alert.images.length > 0 && (
                        <button
                          className={styles.imageButton}
                          onClick={() => handleShowAdditionalImages(alert.images)}
                        >
                          📸 Ver Imágenes Extras ({alert.images.length})
                        </button>
                      )}
                    </div>

                    {/* Performance visual */}
                    <div className={styles.performanceBar}>
                      <div className={styles.performanceTrack}>
                        <div 
                          className={`${styles.performanceFill} ${isProfit ? styles.profitFill : styles.lossFill}`}
                          style={{ 
                            width: `${Math.min(Math.abs(profitPercent) * 2, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className={styles.performanceText}>
                        {isProfit ? '📈' : '📉'} {Math.abs(profitPercent).toFixed(1)}% {isProfit ? 'ganancia' : 'pérdida'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
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
                <button 
                  className={styles.closeButton}
                  onClick={() => handleClosePosition(alert.id, alert.currentPrice)}
                  disabled={userRole !== 'admin'}
                  title={userRole !== 'admin' ? 'Solo los administradores pueden cerrar posiciones' : 'Cerrar esta posición'}
                >
                  Cerrar Posición
                </button>
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
        {userRole === 'admin' && (
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateReportModal(true)}
            title="Crear nuevo informe"
          >
            + Crear Informe
          </button>
        )}
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
          {userRole === 'admin' && (
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
          )}
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
              <span>Por {typeof selectedReport.author === 'object' ? selectedReport.author?.name : selectedReport.author || 'Autor desconocido'}</span>
              <span>{new Date(selectedReport.publishedAt || selectedReport.createdAt).toLocaleDateString('es-ES')}</span>
            </div>

            <div className={styles.reportContent}>
              {/* Imagen de portada usando Cloudinary */}
              {(selectedReport.coverImage?.secure_url || selectedReport.imageUrl) && (
                <div className={styles.reportCoverImage}>
                  <img 
                    src={selectedReport.coverImage?.secure_url || selectedReport.imageUrl} 
                    alt={`Imagen de portada: ${selectedReport.title}`}
                    className={styles.coverImage}
                    onError={(e) => {
                      console.error('Error cargando imagen de portada:', selectedReport.coverImage?.secure_url || selectedReport.imageUrl);
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Video si existe */}
              {selectedReport.type === 'video' && selectedReport.muxAssetId ? (
                <div className={styles.videoContainer}>
                  <VideoPlayerMux 
                    playbackId={selectedReport.playbackId || selectedReport.muxAssetId} 
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

              {/* Imágenes adicionales usando Cloudinary */}
              {((selectedReport.images && selectedReport.images.length > 0) || (selectedReport.optimizedImages && selectedReport.optimizedImages.length > 0)) && (
                <div className={styles.reportImages}>
                  <h3 className={styles.imagesTitle}>Imágenes del Informe</h3>
                  <div className={styles.imagesGrid}>
                    {(selectedReport.images || selectedReport.optimizedImages || [])
                      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                      .map((image: any, index: number) => (
                        <div key={index} className={styles.reportImage}>
                          <img 
                            src={image.url} 
                            alt={image.caption || `Imagen ${index + 1} del informe`}
                            className={styles.additionalImage}
                            onError={(e) => {
                              console.error('Error cargando imagen adicional:', image.url);
                              const target = e.currentTarget;
                              target.style.display = 'none';
                            }}
                          />
                          {image.caption && (
                            <p className={styles.imageCaption}>{image.caption}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

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

            {/* Precio actual - Editable */}
            <div className={styles.inputGroup}>
              <label>Precio de Entrada</label>
              <div className={styles.priceInputContainer}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio de entrada"
                  value={stockPrice || ''}
                  onChange={(e) => setStockPrice(parseFloat(e.target.value) || null)}
                  className={styles.input}
                />
                <span className={styles.priceHint}>
                  {stockPrice ? `$${Number(stockPrice).toFixed(2)}` : 'Obtén el precio primero'}
                </span>
              </div>
            </div>

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

            {/* Gráfico Principal de TradingView */}
            <div className={styles.inputGroup}>
              <label>📊 Gráfico de TradingView</label>
              <p className={styles.imageHint}>
                Sube tu análisis gráfico de TradingView para complementar la alerta
              </p>
              {!chartImage ? (
                <ImageUploader
                  onImageUploaded={handleChartImageUploaded}
                  onUploadStart={() => setUploadingChart(true)}
                  onUploadProgress={() => {}}
                  onError={(error) => {
                    console.error('Error subiendo gráfico:', error);
                    alert('Error subiendo gráfico: ' + error);
                    setUploadingChart(false);
                  }}
                  maxFiles={1}
                  multiple={false}
                  buttonText="Subir Gráfico de TradingView"
                  className={styles.chartUploader}
                />
              ) : (
                <div className={styles.uploadedImagePreview}>
                  <img 
                    src={chartImage.secure_url} 
                    alt="Gráfico de TradingView"
                    className={styles.previewImage}
                  />
                  <div className={styles.previewActions}>
                    <span className={styles.imageInfo}>
                      {chartImage.width} × {chartImage.height} | 
                      {Math.round(chartImage.bytes / 1024)}KB
                    </span>
                    <button 
                      type="button" 
                      onClick={removeChartImage}
                      className={styles.removeImageButton}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Imágenes Adicionales */}
            <div className={styles.inputGroup}>
              <label>📸 Imágenes Adicionales</label>
              <p className={styles.imageHint}>
                Agrega más imágenes de análisis, indicadores o contexto adicional
              </p>
              
              <ImageUploader
                onImageUploaded={handleAdditionalImageUploaded}
                onUploadStart={() => setUploadingImages(true)}
                onUploadProgress={() => {}}
                onError={(error) => {
                  console.error('Error subiendo imagen adicional:', error);
                  alert('Error subiendo imagen: ' + error);
                  setUploadingImages(false);
                }}
                maxFiles={3}
                multiple={true}
                buttonText="Subir Imágenes Adicionales"
                className={styles.additionalImagesUploader}
              />

              {/* Preview de imágenes adicionales */}
              {additionalImages.length > 0 && (
                <div className={styles.additionalImagesPreview}>
                  <h4>Imágenes Adicionales ({additionalImages.length})</h4>
                  {additionalImages.map((image, index) => (
                    <div key={image.public_id} className={styles.additionalImageItem}>
                      <img 
                        src={image.secure_url} 
                        alt={`Imagen adicional ${index + 1}`}
                        className={styles.additionalImageThumb}
                      />
                      <div className={styles.additionalImageControls}>
                        <input
                          type="text"
                          placeholder="Descripción de la imagen..."
                          value={image.caption || ''}
                          onChange={(e) => updateImageCaption(index, e.target.value)}
                          className={styles.captionInput}
                        />
                        <button 
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className={styles.removeAdditionalImageButton}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

  // **NUEVO: Estado para manejo de rango temporal del portafolio**
  const [portfolioRange, setPortfolioRange] = useState('30d');
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // **NUEVO: Función para manejar cambio de rango temporal**
  const handlePortfolioRangeChange = useCallback(async (range: string, days: number) => {
    setPortfolioRange(range);
    setPortfolioLoading(true);
    
    try {
      // Simular carga de datos del portafolio
      // En producción, esto haría fetch a una API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar datos simulados basados en el rango
      const mockData = generatePortfolioData(days);
      setPortfolioData(mockData);
    } catch (error) {
      console.error('Error al cargar datos del portafolio:', error);
    } finally {
      setPortfolioLoading(false);
    }
  }, []);

  // **NUEVO: Función para generar datos simulados del portafolio**
  const generatePortfolioData = (days: number) => {
    const data = [];
    const baseValue = 10000;
    let currentValue = baseValue;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Simular variación diaria
      const dailyChange = (Math.random() - 0.5) * 0.02; // ±1% por día
      currentValue *= (1 + dailyChange);
      
      data.push({
        date: date.toISOString(),
        value: parseFloat(currentValue.toFixed(2))
      });
    }
    
    return data;
  };

  // Inicializar datos del portafolio
  useEffect(() => {
    handlePortfolioRangeChange('30d', 30);
  }, [handlePortfolioRangeChange]);

  // Funciones para manejar modales de imágenes
  const handleShowChart = (chartImage: CloudinaryImage) => {
    setSelectedImage(chartImage);
    setShowImageModal(true);
  };

  const handleShowAdditionalImages = (images: CloudinaryImage[]) => {
    setSelectedAlertImages(images);
    setShowAdditionalImagesModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const closeAdditionalImagesModal = () => {
    setShowAdditionalImagesModal(false);
    setSelectedAlertImages([]);
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

      {/* Modal para ver gráfico principal */}
      {showImageModal && selectedImage && (
        <div className={styles.modalOverlay} onClick={closeImageModal}>
          <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.imageModalHeader}>
              <h3>📊 Gráfico de TradingView</h3>
              <button className={styles.closeModalButton} onClick={closeImageModal}>
                ✕
              </button>
            </div>
            <div className={styles.imageModalContent}>
              <img 
                src={selectedImage.secure_url} 
                alt={selectedImage.caption || "Gráfico de TradingView"}
                className={styles.modalImage}
              />
              {selectedImage.caption && (
                <p className={styles.imageCaption}>{selectedImage.caption}</p>
              )}
              <div className={styles.imageInfo}>
                <span>Dimensiones: {selectedImage.width}x{selectedImage.height}</span>
                <span>Tamaño: {(selectedImage.bytes / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver imágenes adicionales */}
      {showAdditionalImagesModal && selectedAlertImages.length > 0 && (
        <div className={styles.modalOverlay} onClick={closeAdditionalImagesModal}>
          <div className={styles.additionalImagesModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.imageModalHeader}>
              <h3>📸 Imágenes Adicionales</h3>
              <button className={styles.closeModalButton} onClick={closeAdditionalImagesModal}>
                ✕
              </button>
            </div>
            <div className={styles.additionalImagesContent}>
              {selectedAlertImages.map((image, index) => (
                <div key={index} className={styles.additionalImageItem}>
                  <img 
                    src={image.secure_url} 
                    alt={image.caption || `Imagen ${index + 1}`}
                    className={styles.additionalImage}
                  />
                  {image.caption && (
                    <p className={styles.imageCaption}>{image.caption}</p>
                  )}
                  <div className={styles.imageInfo}>
                    <span>Dimensiones: {image.width}x{image.height}</span>
                    <span>Tamaño: {(image.bytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
    type: 'text',
    category: 'trader-call',
    content: '',
    summary: '',
    readTime: '',
    tags: '',
    author: 'Nahuel Lozano',
    isFeature: false,
    publishedAt: new Date().toISOString().split('T')[0],
    status: 'published'
  });

  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [coverImage, setCoverImage] = useState<CloudinaryImage | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Título y contenido son obligatorios');
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    // Preparar datos con imágenes de Cloudinary
    const submitData = {
      ...formData,
      tags: tagsArray,
      readTime: formData.readTime ? parseInt(formData.readTime) : null,
      publishedAt: new Date(formData.publishedAt),
      coverImage: coverImage,
      images: images
    };
    
    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCoverImageUploaded = (image: CloudinaryImage) => {
    setCoverImage(image);
    setUploadingCover(false);  // Asegurar que se actualice el estado
    console.log('✅ Imagen de portada seleccionada:', image.public_id);
  };

  const handleImageUploaded = (image: CloudinaryImage) => {
    setImages(prev => [...prev, image]);
    setUploadingImages(false);  // Asegurar que se actualice el estado
    console.log('✅ Imagen adicional agregada:', image.public_id);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  const removeImage = (publicId: string) => {
    setImages(prev => prev.filter(img => img.public_id !== publicId));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.createReportModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Crear Nuevo Informe Trader Call</h2>
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
              placeholder="Título del informe Trader Call"
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
              <option value="text">📄 Texto</option>
              <option value="video">🎥 Video</option>
              <option value="mixed">🔄 Mixto</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="readTime">Tiempo de Lectura (min)</label>
              <input
                id="readTime"
                type="number"
                value={formData.readTime}
                onChange={(e) => handleInputChange('readTime', e.target.value)}
                placeholder="5"
                min="1"
                max="60"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="author">Autor</label>
              <input
                id="author"
                type="text"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Nahuel Lozano"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="publishedAt">Fecha de Publicación</label>
              <input
                id="publishedAt"
                type="date"
                value={formData.publishedAt}
                onChange={(e) => handleInputChange('publishedAt', e.target.value)}
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
                placeholder="trading, análisis, señales"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="summary">Resumen</label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Breve descripción del análisis de Trader Call"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Imagen de portada */}
          <div className={styles.formGroup}>
            <label>Imagen de Portada</label>
            {!coverImage ? (
              <ImageUploader
                onImageUploaded={handleCoverImageUploaded}
                onUploadStart={() => setUploadingCover(true)}
                onUploadProgress={() => {}}
                onError={(error) => {
                  console.error('Error subiendo imagen de portada:', error);
                  alert('Error subiendo imagen: ' + error);
                  setUploadingCover(false);
                }}
                maxFiles={1}
                multiple={false}
                buttonText="Subir Imagen de Portada"
                className={styles.coverImageUploader}
              />
            ) : (
              <div className={styles.uploadedImagePreview}>
                <img 
                  src={coverImage.secure_url} 
                  alt="Imagen de portada"
                  className={styles.previewImage}
                />
                <div className={styles.previewActions}>
                  <span className={styles.imageInfo}>
                    {coverImage.width} × {coverImage.height} | 
                    {Math.round(coverImage.bytes / 1024)}KB
                  </span>
                  <button 
                    type="button" 
                    onClick={removeCoverImage}
                    className={styles.removeImageButton}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
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

          {/* Imágenes adicionales */}
          <div className={styles.formGroup}>
            <label>Imágenes Adicionales</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Imágenes que se mostrarán dentro del contenido del informe
            </p>
            
            <ImageUploader
              onImageUploaded={handleImageUploaded}
              onUploadStart={() => setUploadingImages(true)}
              onUploadProgress={() => {}}
              onError={(error) => {
                console.error('Error subiendo imagen adicional:', error);
                alert('Error subiendo imagen: ' + error);
                setUploadingImages(false);
              }}
              maxFiles={5}
              multiple={true}
              buttonText="Subir Imágenes Adicionales"
              className={styles.additionalImagesUploader}
            />

            {/* Preview de imágenes adicionales */}
            {images.length > 0 && (
              <div className={styles.additionalImagesPreview}>
                <h4>Imágenes Adicionales ({images.length}/5)</h4>
                <div className={styles.imagesGrid}>
                  {images.map((image, index) => (
                    <div key={image.public_id} className={styles.imagePreviewItem}>
                      <img 
                        src={image.secure_url} 
                        alt={`Imagen adicional ${index + 1}`}
                        className={styles.previewThumbnail}
                      />
                      <div className={styles.imagePreviewActions}>
                        <button 
                          type="button" 
                          onClick={() => removeImage(image.public_id)}
                          className={styles.removeImageButton}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              disabled={loading || uploadingCover || uploadingImages}
            >
              {loading ? 'Creando...' : (uploadingCover || uploadingImages) ? 'Subiendo...' : 'Crear Informe'}
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