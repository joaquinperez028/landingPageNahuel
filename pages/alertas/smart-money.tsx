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
  Star,
  Eye,
  MessageCircle,
  FileText,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import styles from '@/styles/SmartMoney.module.css';
import { useRouter } from 'next/router';
import ImageUploader, { CloudinaryImage } from '@/components/ImageUploader';
import SPY500Indicator from '@/components/SPY500Indicator';
import PortfolioTimeRange from '@/components/PortfolioTimeRange';

// Interfaces para Cloudinary - usando la importada de ImageUploader

interface SmartMoneyPageProps {
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
    flow: string;
    volume: string;
    result: string;
    movement: string;
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
      window.location.href = '/payment/smart-money';
    }
  };

  const handleExportPDF = () => {
    console.log('Exportando PDF...');
  };

  const exampleImages = [
    {
      src: '/alerts/smart-money-example-1.jpg',
      alt: 'Ejemplo de flujo Smart Money - Análisis SPY',
      title: 'Flujo Institucional SPY - Entrada Masiva',
      description: 'Detección de $2.3B en flujos institucionales hacia SPY'
    },
    {
      src: '/alerts/smart-money-example-2.jpg',
      alt: 'Ejemplo de flujo Smart Money - Análisis QQQ',
      title: 'Smart Money QQQ - Salida Coordinada',
      description: 'Identificación de salida institucional antes de corrección'
    },
    {
      src: '/alerts/smart-money-example-3.jpg',
      alt: 'Ejemplo de flujo Smart Money - Análisis Sectorial',
      title: 'Rotación Sectorial - Tech a Energy',
      description: 'Flujos institucionales mostrando rotación de sectores'
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
                Smart Money
                <span className={styles.heroSubtitle}>Sigue los Movimientos Institucionales</span>
              </h1>
              <p className={styles.heroDescription}>
                Descubre hacia dónde se dirige el dinero institucional antes que el resto del mercado. 
                Nuestro análisis de flujos te permite seguir a los grandes fondos y aprovechar sus movimientos.
              </p>
              <div className={styles.heroFeatures}>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Detección de flujos institucionales en tiempo real</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Análisis de volumen y liquidez profesional</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Identificación de manipulación del mercado</span>
                </div>
              </div>
            </div>
            <div className={styles.heroVideo}>
              <div className={styles.videoContainer}>
                <VideoPlayerMux 
                  playbackId="sample-smart-money-video" 
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
              <span>Flujo</span>
              <span>Volumen</span>
              <span>Resultado</span>
              <span>Movimiento</span>
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
                <span className={`${styles.tableCell} ${alert.flow === 'ENTRADA' ? styles.buyAction : styles.sellAction}`}>
                  {alert.flow}
                </span>
                <span className={styles.tableCell}>${alert.volume}</span>
                <span className={`${styles.tableCell} ${alert.result === 'PROFIT' ? styles.profitResult : styles.lossResult}`}>
                  {alert.result}
                </span>
                <span className={`${styles.tableCell} ${alert.result === 'PROFIT' ? styles.profitAmount : styles.lossAmount}`}>
                  {alert.movement}
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
                ¿Listo para Seguir el Smart Money?
              </h2>
              <p className={styles.subscriptionDescription}>
                Únete a {metrics.activeUsers} analistas que ya están siguiendo los movimientos institucionales para maximizar sus ganancias
              </p>
              <div className={styles.subscriptionFeatures}>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Detección de flujos en tiempo real vía email</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Análisis de volumen institucional detallado</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Identificación de manipulación del mercado</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Reportes semanales de flujos principales</span>
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
    flow: 'ENTRADA',
    volume: '',
    expectedMovement: '',
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
  const [showReportModal, setShowReportModal] = useState(false);
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

  // Estados para Portfolio Time Range
  const [portfolioRange, setPortfolioRange] = useState('30d');

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

  // Función para manejar cambios en el rango del portfolio
  const handlePortfolioRangeChange = async (range: string, days: number) => {
    setPortfolioRange(range);
    // Aquí podrías agregar lógica adicional si necesitas cargar datos específicos
  };

  const { data: session } = useSession();
  const router = useRouter();

  // Debug: Logear cambios en userRole
  React.useEffect(() => {
    console.log('🎭 UserRole actual:', userRole);
  }, [userRole]);

  // Verificar rol del usuario
  React.useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/profile/get', {
          credentials: 'same-origin',
        });
        
        if (response.ok) {
          const data = await response.json();
          const role = data.user?.role || '';
          setUserRole(role);
        }
      } catch (error) {
        console.error('❌ Error al verificar rol:', error);
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

    // **CAMBIO: Calcular rentabilidad anual usando alertas reales**
    const inicioAño = new Date(new Date().getFullYear(), 0, 1);
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
      rentabilidadSemanal: `${gananciasSemanal >= 0 ? '+' : ''}${rentabilidadSemanal}%`,
      rentabilidadAnual: `${gananciasAnual >= 0 ? '+' : ''}${rentabilidadAnual}%`,
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
        message = `Nuevo flujo: ${alert.symbol} ${alert.flow} volumen $${alert.volume} #${alert.symbol}`;
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
      const response = await fetch('/api/alerts/list?tipo=SmartMoney', {
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
      // Filtrar solo informes de Smart Money
      const response = await fetch('/api/reports?limit=6&featured=false&category=smart-money', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        const reports = data.data?.reports || [];
        
        // Log temporal para depurar
        console.log('📊 Informes Smart Money recibidos:', reports);
        if (reports.length > 0) {
          console.log('📊 Estructura del primer informe:', {
            id: reports[0].id,
            _id: reports[0]._id,
            title: reports[0].title,
            category: reports[0].category,
            keys: Object.keys(reports[0])
          });
        }
        
        setInformes(reports);
        console.log('✅ Informes Smart Money cargados:', reports.length);
      } else {
        console.error('❌ Error al cargar informes:', response.status);
      }
    } catch (error) {
      console.error('❌ Error al cargar informes:', error);
    } finally {
      setLoadingInformes(false);
    }
  };

  // Función para abrir informe completo
  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const openReport = async (reportId: string) => {
    console.log('🔍 Intentando abrir informe con ID:', reportId);
    
    if (!reportId) {
      console.error('❌ ID de informe es undefined o vacío');
      alert('Error: ID del informe no válido');
      return;
    }
    
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data.data.report);
        console.log('✅ Informe cargado exitosamente:', data.data.report.title);
      } else {
        console.error('❌ Error al cargar informe:', response.status);
        alert('Error al cargar el informe');
      }
    } catch (error) {
      console.error('❌ Error al cargar informe:', error);
      alert('Error al cargar el informe');
    }
  };

  const handleCreateReport = async (formData: any) => {
    setCreatingReport(true);
    try {
      // Mapear los tipos del formulario a los valores del enum del modelo
      let modelType = 'text'; // valor por defecto
      switch(formData.type) {
        case 'video':
          modelType = 'video';
          break;
        case 'analisis':
          modelType = 'mixed';
          break;
        case 'informe':
        default:
          modelType = 'text';
          break;
      }

      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData, 
          type: modelType,
          category: 'smart-money' // Asignar categoría Smart Money
        }),
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
    try {
      setLoading(true);
      
      if (!stockPrice) {
        alert('Por favor obtén el precio actual primero');
        return;
      }

      const alertData = {
        symbol: newAlert.symbol.toUpperCase(),
        action: newAlert.flow, // Usar 'flow' en lugar de 'action'
        entryPrice: stockPrice,
        stopLoss: parseFloat(newAlert.volume) || stockPrice * 0.95, // Usar volume como valor alternativo
        takeProfit: parseFloat(newAlert.expectedMovement) || stockPrice * 1.05, // Usar expectedMovement
        analysis: newAlert.analysis,
        date: new Date().toISOString(),
        tipo: 'SmartMoney', // Especificar que es Smart Money
        chartImage: chartImage,
        images: additionalImages
      };

      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Alerta Smart Money creada:', result.alert);
        
        // Recargar alertas y limpiar formulario
        await loadAlerts();
        setNewAlert({
          symbol: '',
          flow: 'ENTRADA',
          volume: '',
          expectedMovement: '',
          analysis: ''
        });
        setStockPrice(null);
        setChartImage(null);
        setAdditionalImages([]);
        setShowCreateAlert(false);
        
        alert('¡Alerta de Smart Money creada exitosamente!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'No se pudo crear la alerta'}`);
      }
    } catch (error) {
      console.error('Error creando alerta:', error);
      alert('Error de conexión. Intenta nuevamente.');
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
      
      {/* Métricas principales */}
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
    </div>
  );

  const renderSeguimientoAlertas = () => {
    const alertasActivas = realAlerts.filter(alert => alert.status === 'ACTIVE');
    const alertasCerradas = realAlerts.filter(alert => alert.status === 'CLOSED');
    
    // Paleta de colores dinámicos para cada alerta
    const colorPalette = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#14B8A6', '#F43F5E', '#A855F7', '#EAB308', '#22C55E'
    ];
    
    // Preparar datos para el gráfico de torta 3D
    const chartData = [...alertasActivas, ...alertasCerradas].map((alert, index) => {
      const profitValue = parseFloat(alert.profit.replace(/[+%]/g, ''));
      return {
        id: alert.id,
        symbol: alert.symbol,
        profit: profitValue,
        status: alert.status,
        entryPrice: alert.entryPrice,
        currentPrice: alert.currentPrice,
        stopLoss: alert.stopLoss,
        takeProfit: alert.takeProfit,
        flow: alert.flow,
        date: alert.date,
        analysis: alert.analysis,
        // Color único para cada alerta
        color: colorPalette[index % colorPalette.length],
        // Color más oscuro para efecto 3D
        darkColor: colorPalette[index % colorPalette.length] + '80'
      };
    });

    // Calcular el tamaño de cada segmento basado en el profit
    const totalProfit = chartData.reduce((sum, alert) => sum + Math.abs(alert.profit), 0);
    const chartSegments = chartData.map((alert, index) => {
      const size = totalProfit > 0 ? (Math.abs(alert.profit) / totalProfit) * 100 : 100 / chartData.length;
      const startAngle = chartData.slice(0, index).reduce((sum, a) => sum + (Math.abs(a.profit) / totalProfit) * 360, 0);
      const endAngle = startAngle + (Math.abs(alert.profit) / totalProfit) * 360;
      
      return {
        ...alert,
        size,
        startAngle,
        endAngle,
        centerAngle: (startAngle + endAngle) / 2
      };
    });

    return (
      <div className={styles.seguimientoContent}>
        <div className={styles.seguimientoHeader}>
          <h2 className={styles.sectionTitle}>🎯 Seguimiento de Alertas Smart Money 3D</h2>
          <div className={styles.chartControls}>
            {userRole === 'admin' && (
              <button 
                className={styles.createAlertButton}
                onClick={() => setShowCreateAlert(true)}
                title="Crear nueva alerta"
              >
                + Crear Nueva Alerta
              </button>
            )}
            <div className={styles.filtersContainer}>
              <input
                type="text"
                placeholder="Filtrar por símbolo..."
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className={styles.filterInput}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVE">Activas</option>
                <option value="CLOSED">Cerradas</option>
                <option value="STOPPED">Detenidas</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className={styles.filterDate}
              />
              <button onClick={clearFilters} className={styles.clearFilters}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
        
        {loadingAlerts ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando alertas...</p>
          </div>
        ) : realAlerts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3>No hay alertas disponibles</h3>
            <p>Las alertas aparecerán aquí cuando sean creadas por el administrador.</p>
            {userRole === 'admin' && (
              <button 
                className={styles.createFirstAlertButton}
                onClick={() => setShowCreateAlert(true)}
              >
                + Crear Primera Alerta
              </button>
            )}
          </div>
        ) : (
          <div className={styles.chartContainer}>
            <div className={styles.chartLayout}>
              {/* Gráfico de torta 3D - Lado izquierdo */}
              <div className={styles.pieChart3D}>
                <svg viewBox="0 0 300 300" className={styles.chartSvg3D}>
                  {/* Sombra del gráfico para efecto 3D */}
                  <defs>
                    <filter id="shadow3D" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
                    </filter>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Fondo del gráfico con efecto 3D */}
                  <circle cx="150" cy="150" r="120" className={styles.chartBackground3D} />
                  
                  {/* Segmentos del gráfico 3D */}
                  {chartSegments.map((segment, index) => (
                    <g key={segment.id} className={styles.chartSegment3D}>
                      {/* Sombra del segmento */}
                      <path
                        d={describeArc(150, 150, 120, segment.startAngle, segment.endAngle)}
                        fill={segment.darkColor}
                        filter="url(#shadow3D)"
                        className={styles.segmentShadow}
                      />
                      {/* Segmento principal */}
                      <path
                        d={describeArc(150, 150, 120, segment.startAngle, segment.endAngle)}
                        fill={segment.color}
                        className={styles.segmentPath3D}
                        onMouseEnter={(e) => showTooltip(e, segment)}
                        onMouseLeave={hideTooltip}
                        filter="url(#glow)"
                      />
                      {/* Borde del segmento */}
                      <path
                        d={describeArc(150, 150, 120, segment.startAngle, segment.endAngle)}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        opacity="0.3"
                        className={styles.segmentBorder}
                      />
                      {/* Etiqueta del símbolo */}
                      {segment.size > 5 && (
                        <text
                          x={150 + Math.cos((segment.centerAngle - 90) * Math.PI / 180) * 80}
                          y={150 + Math.sin((segment.centerAngle - 90) * Math.PI / 180) * 80}
                          className={styles.segmentLabel}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="12"
                          fontWeight="bold"
                          fill="#ffffff"
                          filter="url(#shadow3D)"
                        >
                          {segment.symbol}
                        </text>
                      )}
                    </g>
                  ))}
                  
                  {/* Círculo central con efecto 3D */}
                  <circle cx="150" cy="150" r="40" className={styles.chartCenter3D} />
                </svg>
              </div>
              
              {/* Información complementaria - Lado derecho */}
              <div className={styles.chartInfoPanel}>
                <div className={styles.infoHeader}>
                  <h3 className={styles.infoTitle}>📈 Detalles de Alertas Smart Money</h3>
                  <p className={styles.infoSubtitle}>Información detallada de cada alerta de flujo institucional</p>
                </div>
                
                {/* Resumen estadístico */}
                <div className={styles.statsSummary}>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>📊</div>
                    <div className={styles.summaryContent}>
                      <span className={styles.summaryLabel}>Total Alertas</span>
                      <span className={styles.summaryValue}>{chartData.length}</span>
                    </div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>🟢</div>
                    <div className={styles.summaryContent}>
                      <span className={styles.summaryLabel}>Activas</span>
                      <span className={styles.summaryValue}>{alertasActivas.length}</span>
                    </div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>🔴</div>
                    <div className={styles.summaryContent}>
                      <span className={styles.summaryLabel}>Cerradas</span>
                      <span className={styles.summaryValue}>{alertasCerradas.length}</span>
                    </div>
                  </div>
                </div>
                
                {/* Leyenda mejorada con colores dinámicos */}
                <div className={styles.chartLegend3D}>
                  <h3 className={styles.legendTitle}>🎨 Alertas por Color</h3>
                  <div className={styles.legendList}>
                    {chartSegments.map((segment, index) => (
                      <div key={segment.id} className={styles.legendItem3D}>
                        <div 
                          className={styles.legendColor3D}
                          style={{ backgroundColor: segment.color }}
                        ></div>
                        <div className={styles.legendInfo}>
                          <span className={styles.legendSymbol}>{segment.symbol}</span>
                          <span className={styles.legendProfit}>
                            {segment.profit >= 0 ? '+' : ''}{segment.profit.toFixed(2)}%
                          </span>
                          <span className={styles.legendStatus}>
                            {segment.status === 'ACTIVE' ? '🟢' : '🔴'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Información adicional */}
                <div className={styles.additionalInfo}>
                  <h4 className={styles.additionalTitle}>💡 Información Adicional</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Mejor Rendimiento:</span>
                      <span className={styles.infoValue}>
                        {chartSegments.length > 0 ? 
                          chartSegments.reduce((max, segment) => 
                            segment.profit > max.profit ? segment : max
                          ).symbol : 'N/A'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Promedio P&L:</span>
                      <span className={styles.infoValue}>
                        {chartSegments.length > 0 ? 
                          (chartSegments.reduce((sum, segment) => sum + segment.profit, 0) / chartSegments.length).toFixed(2) + '%' : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tooltip mejorado para mostrar información de alerta */}
        <div id="chartTooltip" className={styles.chartTooltip3D}>
          <div className={styles.tooltipContent3D}>
            <h4 className={styles.tooltipSymbol}></h4>
            <div className={styles.tooltipDetails}>
              <div className={styles.tooltipRow}>
                <span>📈 Flujo:</span>
                <span className={styles.tooltipAction}></span>
              </div>
              <div className={styles.tooltipRow}>
                <span>💰 Entrada:</span>
                <span className={styles.tooltipEntry}></span>
              </div>
              <div className={styles.tooltipRow}>
                <span>📊 Actual:</span>
                <span className={styles.tooltipCurrent}></span>
              </div>
              <div className={styles.tooltipRow}>
                <span>📈 P&L:</span>
                <span className={styles.tooltipPnl}></span>
              </div>
              <div className={styles.tooltipRow}>
                <span>🎯 Estado:</span>
                <span className={styles.tooltipStatus}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Funciones auxiliares para el gráfico de torta 3D
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "Z"
    ].join(" ");
  };

  const showTooltip = (event: React.MouseEvent, segment: any) => {
    const tooltip = document.getElementById('chartTooltip') as HTMLElement;
    if (tooltip) {
      const symbol = tooltip.querySelector(`.${styles.tooltipSymbol}`) as HTMLElement;
      const action = tooltip.querySelector(`.${styles.tooltipAction}`) as HTMLElement;
      const entry = tooltip.querySelector(`.${styles.tooltipEntry}`) as HTMLElement;
      const current = tooltip.querySelector(`.${styles.tooltipCurrent}`) as HTMLElement;
      const pnl = tooltip.querySelector(`.${styles.tooltipPnl}`) as HTMLElement;
      const status = tooltip.querySelector(`.${styles.tooltipStatus}`) as HTMLElement;

      if (symbol) symbol.textContent = segment.symbol;
      if (action) {
        action.textContent = segment.flow;
        action.className = `${styles.tooltipAction} ${segment.flow === 'ENTRADA' ? styles.buyAction : styles.sellAction}`;
      }
      if (entry) entry.textContent = segment.entryPrice;
      if (current) current.textContent = segment.currentPrice;
      if (pnl) {
        pnl.textContent = `${segment.profit >= 0 ? '+' : ''}${segment.profit.toFixed(2)}%`;
        pnl.className = `${styles.tooltipPnl} ${segment.profit >= 0 ? styles.profit : styles.loss}`;
      }
      if (status) {
        status.textContent = segment.status === 'ACTIVE' ? '🟢 ACTIVA' : '🔴 CERRADA';
        status.className = `${styles.tooltipStatus} ${segment.status === 'ACTIVE' ? styles.activeStatus : styles.closedStatus}`;
      }

      tooltip.style.display = 'block';
      tooltip.style.left = event.pageX + 10 + 'px';
      tooltip.style.top = event.pageY - 10 + 'px';
    }
  };

  const hideTooltip = () => {
    const tooltip = document.getElementById('chartTooltip') as HTMLElement;
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  };

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
                <span className={`${styles.alertAction} ${alert.flow === 'ENTRADA' ? styles.buyAction : styles.sellAction}`}>
                  {alert.flow}
                </span>
              </div>
              
              <div className={styles.alertDetails}>
                <div className={styles.alertDetail}>
                  <span>Volumen Detectado:</span>
                  <strong>{alert.volume || alert.entryPrice}</strong>
                </div>
                <div className={styles.alertDetail}>
                  <span>Precio Actual:</span>
                  <strong>{alert.currentPrice}</strong>
                </div>
                <div className={styles.alertDetail}>
                  <span>Flujo Mínimo:</span>
                  <strong>{alert.volume || alert.stopLoss}</strong>
                </div>
                <div className={styles.alertDetail}>
                  <span>Objetivo de Movimiento:</span>
                  <strong>{alert.expectedMovement || alert.takeProfit}</strong>
                </div>
                <div className={styles.alertDetail}>
                  <span>Impacto:</span>
                  <strong className={alert.profit.includes('+') ? styles.profit : styles.loss}>
                    {alert.movement || alert.profit}
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
        {session && userRole === 'admin' && (
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
                  onClick={() => {
                    // Obtener ID de manera más robusta
                    let reportId = null;
                    
                    // Intentar diferentes propiedades que pueden contener el ID
                    if (informe._id) {
                      reportId = informe._id;
                    } else if (informe.id) {
                      reportId = informe.id;
                    } else if (informe.ObjectId) {
                      reportId = informe.ObjectId;
                    } else if (typeof informe === 'object' && Object.keys(informe).length > 0) {
                      // Buscar cualquier propiedad que parezca un ID de MongoDB
                      const keys = Object.keys(informe);
                      for (const key of keys) {
                        const value = informe[key];
                        if (typeof value === 'string' && value.length === 24 && /^[0-9a-fA-F]{24}$/.test(value)) {
                          reportId = value;
                          console.log(`🔍 ID encontrado en propiedad '${key}':`, value);
                          break;
                        }
                      }
                    }
                    
                    console.log('🔍 Datos del informe completo:', informe);
                    console.log('🔍 Propiedades disponibles:', Object.keys(informe));
                    console.log('🔍 ID final seleccionado:', reportId);
                    
                    if (!reportId) {
                      console.error('❌ No se pudo obtener ID del informe');
                      console.log('📊 Estructura completa del informe:', JSON.stringify(informe, null, 2));
                      alert('Error: No se pudo obtener el ID del informe. Revisa la consola para más detalles.');
                      return;
                    }
                    
                    openReport(reportId);
                  }}
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
          {session && userRole === 'admin' && (
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
                            src={image.secure_url || image.url || image.optimizedUrl} 
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
        const response = await fetch('/api/chat/messages?chatType=smart-money');
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
            chatType: 'smart-money'
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
                <h2>💬 Comunidad Smart Money</h2>
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
              <h2>💬 Comunidad Smart Money</h2>
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
                              <label>Símbolo del Instrumento</label>
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
              <label>Tipo de Flujo</label>
              <select
                value={newAlert.flow}
                                  onChange={(e) => setNewAlert(prev => ({ ...prev, flow: e.target.value }))}
                className={styles.select}
              >
                <option value="ENTRADA">ENTRADA (Flujo Institucional)</option>
                <option value="SALIDA">SALIDA (Retirada de Fondos)</option>
              </select>
            </div>

            {/* Volumen */}
            <div className={styles.inputGroup}>
              <label>Volumen Detectado</label>
              <input
                type="text"
                placeholder="Ej: 2.3B, 850M"
                value={newAlert.volume}
                onChange={(e) => setNewAlert(prev => ({ ...prev, volume: e.target.value }))}
                className={styles.input}
              />
            </div>

            {/* Movimiento Esperado */}
            <div className={styles.inputGroup}>
              <label>Movimiento Esperado</label>
              <input
                type="text"
                placeholder="Ej: +8.5%, -12.3%"
                value={newAlert.expectedMovement}
                onChange={(e) => setNewAlert(prev => ({ ...prev, expectedMovement: e.target.value }))}
                className={styles.input}
              />
            </div>

            {/* Análisis */}
            <div className={styles.inputGroup}>
              <label>Análisis / Descripción</label>
              <textarea
                placeholder="Descripción del análisis de flujos institucionales..."
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
                          <h1 className={styles.subscriberTitle}>Smart Money - Dashboard</h1>
          <p className={styles.subscriberWelcome}>
                          Bienvenido a tu área exclusiva de Smart Money. Aquí tienes acceso completo a todos los flujos institucionales y análisis.
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
      
      {/* Modal para ver informes */}
      {showReportModal && selectedReport && (
        <ReportViewModal 
          report={selectedReport} 
          onClose={closeReportModal} 
        />
      )}
    </div>
  );
};

// Componente para modal de creación de informes con funcionalidad de imágenes
const CreateReportModal = ({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'informe',
    category: 'smart-money',
    content: '',
    summary: '',
    readTime: '',
    tags: '',
    author: 'Nahuel Lozano',
    isFeature: false,
    publishedAt: new Date().toISOString().split('T')[0],
    status: 'published'
  });

  // Estados para manejo de imágenes
  const [coverImage, setCoverImage] = useState<CloudinaryImage | null>(null);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Título y contenido son obligatorios');
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    // Incluir imágenes en los datos del formulario
    const submitData = {
      ...formData,
      tags: tagsArray,
      readTime: formData.readTime ? parseInt(formData.readTime) : null,
      publishedAt: new Date(formData.publishedAt),
      coverImage: coverImage,
      images: images.map((img, index) => ({
        ...img,
        caption: img.caption || '',
        order: index + 1
      }))
    };
    
    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones para manejo de imágenes
  const handleCoverImageUploaded = (image: CloudinaryImage) => {
    setCoverImage(image);
    setUploadingCover(false);
    console.log('✅ Imagen de portada seleccionada:', image.public_id);
  };

  const handleImageUploaded = (image: CloudinaryImage) => {
    setImages(prev => [...prev, image]);
    setUploadingImages(false);
    console.log('✅ Imagen adicional agregada:', image.public_id);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, caption } : img
    ));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.createReportModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Crear Nuevo Informe Smart Money</h2>
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
              placeholder="Título del informe Smart Money"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
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
          </div>

          <div className={styles.formRow}>
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
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="summary">Resumen</label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Breve descripción del análisis Smart Money"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Imagen de Portada */}
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
              placeholder="Contenido completo del análisis Smart Money"
              rows={8}
              required
              disabled={loading}
            />
          </div>

          {/* Imágenes Adicionales */}
          <div className={styles.formGroup}>
            <label>Imágenes Adicionales</label>
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
                <h4>Imágenes Adicionales ({images.length})</h4>
                <div className={styles.imagesGrid}>
                  {images.map((image, index) => (
                    <div key={index} className={styles.imagePreviewItem}>
                      <img 
                        src={image.secure_url} 
                        alt={`Imagen ${index + 1}`}
                        className={styles.previewThumbnail}
                      />
                      <div className={styles.imagePreviewActions}>
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)}
                          className={styles.removeImageButton}
                        >
                          ×
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Descripción de la imagen..."
                        value={image.caption || ''}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        className={styles.captionInput}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tags">Tags (separados por comas)</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="smart-money, flujos, institucional"
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
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

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isFeature}
                  onChange={(e) => handleInputChange('isFeature', e.target.checked.toString())}
                  disabled={loading}
                />
                <span>Informe Destacado</span>
              </label>
            </div>
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
              {loading ? 'Creando...' : uploadingCover || uploadingImages ? 'Subiendo...' : 'Crear Informe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReportViewModal = ({ report, onClose }: {
  report: any;
  onClose: () => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    if (report.images && currentImageIndex < report.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'analisis':
        return '📊';
      case 'mixed':
        return '📋';
      default:
        return '📄';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'analisis':
        return 'Análisis';
      case 'mixed':
        return 'Mixto';
      default:
        return 'Informe';
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Aquí se puede implementar la descarga del informe
      // Por ahora simulamos una descarga
      const link = document.createElement('a');
      link.href = `data:text/html;charset=utf-8,${encodeURIComponent(`
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #333; }
              .meta { color: #666; margin-bottom: 20px; }
              .content { line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <div class="meta">
              <p>Fecha: ${formatDate(report.publishedAt || report.createdAt)}</p>
              <p>Tipo: ${getReportTypeLabel(report.type)}</p>
              ${report.author ? `<p>Autor: ${report.author}</p>` : ''}
            </div>
            <div class="content">${report.content}</div>
          </body>
        </html>
      `)}`;
      link.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      link.click();
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el informe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: report.title,
          text: report.content?.substring(0, 200) + '...' || report.title,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('✅ Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      alert('Error al compartir el informe');
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content?.split(' ').length || 0;
    return Math.ceil(words / wordsPerMinute);
  };

  const readTime = calculateReadTime(report.content);

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.reportViewModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>
              <h2>{report.title}</h2>
              <div className={styles.reportMeta}>
                <span className={styles.reportDate}>
                  📅 {formatDate(report.publishedAt || report.createdAt)}
                </span>
                <span className={styles.reportType}>
                  {getReportTypeIcon(report.type)} {getReportTypeLabel(report.type)}
                </span>
                {report.author && (
                  <span className={styles.reportAuthor}>
                    👤 {typeof report.author === 'object' ? report.author.name || report.author.email : report.author}
                  </span>
                )}
                {report.category && (
                  <span className={styles.reportType}>
                    📂 {report.category.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                )}
              </div>
            </div>
            <button 
              className={styles.closeModal}
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>

          <div className={styles.reportContent}>
            {/* Imagen de portada */}
            {report.coverImage && (
              <div className={styles.reportCover}>
                <img 
                  src={report.coverImage.secure_url || report.coverImage.url} 
                  alt={report.title}
                  className={styles.coverImage}
                  loading="lazy"
                />
              </div>
            )}

            {/* Contenido del informe */}
            <div className={styles.reportText}>
              <div className={styles.reportBody}>
                {report.content && (
                  <div dangerouslySetInnerHTML={{ __html: report.content }} />
                )}
              </div>

              {/* Imágenes adicionales */}
              {report.images && report.images.length > 0 && (
                <div className={styles.reportImages}>
                  <h3>📸 Imágenes Adicionales</h3>
                  <div className={styles.imagesGrid}>
                    {report.images.map((image: any, index: number) => (
                      <div key={index} className={styles.imageThumbnail}>
                        <img 
                          src={image.secure_url || image.url} 
                          alt={`Imagen ${index + 1}`}
                          onClick={() => handleImageClick(index)}
                          loading="lazy"
                        />
                        {image.caption && (
                          <p className={styles.imageCaption}>{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {report.tags && report.tags.length > 0 && (
                <div className={styles.reportTags}>
                  <h3>🏷️ Tags</h3>
                  <div className={styles.tagsList}>
                    {report.tags.map((tag: string, index: number) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Estadísticas */}
              <div className={styles.reportStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>👁️ Vistas</span>
                  <span className={styles.statValue}>{report.views || 0}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>⏱️ Tiempo de lectura</span>
                  <span className={styles.statValue}>{readTime} min</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>📸 Imágenes</span>
                  <span className={styles.statValue}>{report.images?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button 
              className={styles.downloadButton}
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Descargando...' : '📥 Descargar Informe'}
            </button>
            <button 
              className={styles.shareButton}
              onClick={handleShare}
            >
              📤 Compartir
            </button>
          </div>
        </div>
      </div>

      {/* Modal para ver imágenes */}
      {showImageModal && report.images && (
        <div className={styles.modalOverlay} onClick={closeImageModal}>
          <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.imageModalHeader}>
              <h3>Imagen {currentImageIndex + 1} de {report.images.length}</h3>
              <button className={styles.closeModal} onClick={closeImageModal}>×</button>
            </div>
            <div className={styles.imageModalContent}>
              <img 
                src={report.images[currentImageIndex].secure_url || report.images[currentImageIndex].url} 
                alt={`Imagen ${currentImageIndex + 1}`}
                className={styles.modalImage}
              />
              {report.images[currentImageIndex].caption && (
                <p className={styles.imageCaption}>{report.images[currentImageIndex].caption}</p>
              )}
            </div>
            <div className={styles.imageModalControls}>
              <button onClick={prevImage} disabled={currentImageIndex === 0}>← Anterior</button>
              <button onClick={nextImage} disabled={currentImageIndex === report.images.length - 1}>Siguiente →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SmartMoneyPage: React.FC<SmartMoneyPageProps> = ({ 
  isSubscribed, 
  metrics, 
  historicalAlerts 
}) => {
  return (
    <>
      <Head>
        <title>Smart Money - Flujos Institucionales | Nahuel Lozano</title>
                  <meta name="description" content="Sigue los movimientos del dinero inteligente. Detecta flujos institucionales y aprovecha los movimientos de los grandes fondos antes que el mercado." />
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
        // Verificar si tiene suscripción activa a SmartMoney
        const suscripcionActiva = user.suscripciones?.find(
          (sub: any) => 
            sub.servicio === 'SmartMoney' && 
            sub.activa === true && 
            new Date(sub.fechaVencimiento) > new Date()
        );
        
        // También verificar en el array alternativo
        const subscriptionActiva = user.subscriptions?.find(
          (sub: any) => 
            sub.tipo === 'SmartMoney' && 
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
    performance: '+94.2%',
    activeUsers: '+680',
    alertsSent: '+2,100',
    accuracy: '89.7%'
  };

  const historicalAlerts = [
    {
      date: '2024-01-15',
      symbol: 'SPY',
      flow: 'ENTRADA',
      volume: '2.3B',
      result: 'PROFIT',
      movement: '+8.7%'
    },
    {
      date: '2024-01-14',
      symbol: 'QQQ',
      flow: 'SALIDA',
      volume: '1.8B',
      result: 'PROFIT',
      movement: '+12.4%'
    },
    {
      date: '2024-01-12',
      symbol: 'AAPL',
      flow: 'ENTRADA',
      volume: '950M',
      result: 'PROFIT',
      movement: '+15.2%'
    },
    {
      date: '2024-01-11',
      symbol: 'MSFT',
      flow: 'ENTRADA',
      volume: '1.2B',
      result: 'PROFIT',
      movement: '+9.8%'
    },
    {
      date: '2024-01-10',
      symbol: 'NVDA',
      flow: 'SALIDA',
      volume: '2.1B',
      result: 'LOSS',
      movement: '-4.1%'
    },
    {
      date: '2024-01-09',
      symbol: 'TSLA',
      flow: 'ENTRADA',
      volume: '1.4B',
      result: 'PROFIT',
      movement: '+22.3%'
    },
    {
      date: '2024-01-08',
      symbol: 'XLF',
      flow: 'ENTRADA',
      volume: '850M',
      result: 'PROFIT',
      movement: '+6.9%'
    },
    {
      date: '2024-01-05',
      symbol: 'IWM',
      flow: 'SALIDA',
      volume: '720M',
      result: 'PROFIT',
      movement: '+11.5%'
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

export default SmartMoneyPage; 