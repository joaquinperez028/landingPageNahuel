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
import styles from '@/styles/SmartMoney.module.css';
import { useRouter } from 'next/router';
import { calculateDaysRemaining, calculateDaysSinceSubscription } from '../../utils/dateUtils';
import SPY500Indicator from '@/components/SPY500Indicator';
import PortfolioTimeRange from '@/components/PortfolioTimeRange';

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
                <span className={styles.heroSubtitle}>Alertas de Flujo Institucional</span>
              </h1>
              <p className={styles.heroDescription}>
                Detecta movimientos de dinero inteligente antes que el mercado. 
                Nuestro sistema de alertas te muestra dónde están entrando y saliendo los grandes inversores.
              </p>
              <div className={styles.heroFeatures}>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Detección de flujos institucionales</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Alertas en tiempo real</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Análisis de volumen y precio</span>
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
                Únete a {metrics.activeUsers} traders que ya están siguiendo el dinero inteligente con nuestras alertas precisas
              </p>
              <div className={styles.subscriptionFeatures}>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Alertas en tiempo real vía email y WhatsApp</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Análisis de flujos institucionales detallado</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Detección de manipulación del mercado</span>
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

  // Función para abrir informe completo mejorada
  const openReport = async (reportId: string) => {
    try {
      console.log('🔍 Abriendo informe:', reportId);
      
      // Mostrar loading state
      setSelectedReport(null);
      setShowReportModal(true);
      
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const report = data.data.report;
        
        // Procesar y enriquecer los datos del informe
        const enrichedReport = {
          ...report,
          // Asegurar que tenemos un ID válido
          id: report.id || report._id,
          // Procesar autor
          author: report.author ? 
            (typeof report.author === 'object' ? 
              report.author.name || report.author.email : 
              report.author) : 
            'Anónimo',
          // Procesar imágenes
          images: report.images || [],
          coverImage: report.coverImage || null,
          // Procesar tags
          tags: report.tags || [],
          // Procesar estadísticas
          views: report.views || 0,
          // Procesar fechas
          publishedAt: report.publishedAt || report.createdAt,
          // Procesar contenido
          content: report.content || 'Sin contenido disponible',
          // Procesar tipo y categoría
          type: report.type || 'text',
          category: report.category || 'general'
        };
        
        // Debug: Mostrar qué datos estamos recibiendo
        console.log('📊 Informe enriquecido:', {
          id: enrichedReport.id,
          title: enrichedReport.title,
          author: enrichedReport.author,
          type: enrichedReport.type,
          category: enrichedReport.category,
          hasCoverImage: !!enrichedReport.coverImage,
          imagesCount: enrichedReport.images.length,
          tagsCount: enrichedReport.tags.length,
          views: enrichedReport.views,
          contentLength: enrichedReport.content.length
        });
        
        setSelectedReport(enrichedReport);
        
        // Incrementar contador de vistas (opcional)
        try {
          await fetch(`/api/reports/${reportId}/view`, {
            method: 'POST',
            credentials: 'same-origin'
          });
        } catch (viewError) {
          console.log('No se pudo incrementar el contador de vistas:', viewError);
        }
        
      } else {
        console.error('Error al cargar informe:', response.status);
        const errorData = await response.json().catch(() => ({}));
        alert(`Error al cargar el informe: ${errorData.message || 'Error desconocido'}`);
        setShowReportModal(false);
      }
    } catch (error) {
      console.error('Error al cargar informe:', error);
      alert('Error de conexión al cargar el informe. Verifica tu internet e intenta nuevamente.');
      setShowReportModal(false);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedReport(null);
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
          category: 'smart-money' // Asignar categoría Smart Money
        }),
      });

      console.log('📡 Respuesta recibida del servidor:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Informe Smart Money creado exitosamente:', result);
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
          tipo: 'SmartMoney',
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
        console.log('✅ Alerta Smart Money creada:', result.alert);
        
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
        
        alert('¡Alerta de Smart Money creada exitosamente!');
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
      const dailyChange = (Math.random() - 0.5) * 0.02; // ±1% diario
      currentValue *= (1 + dailyChange);
      
      data.push({
        date: date.toISOString(),
        value: currentValue,
        change: dailyChange * 100
      });
    }
    
    return data;
  };

  // Funciones de renderizado
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
        action: alert.action,
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
          <h2 className={styles.sectionTitle}>🎯 Seguimiento de Alertas 3D</h2>
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
                  <h3 className={styles.infoTitle}>📈 Detalles de Alertas</h3>
                  <p className={styles.infoSubtitle}>Información detallada de cada alerta activa</p>
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
                <span>📈 Acción:</span>
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

  // Funciones auxiliares para el gráfico de torta
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
        action.textContent = segment.action;
        action.className = `${styles.tooltipAction} ${segment.action === 'BUY' ? styles.buyAction : styles.sellAction}`;
      }
      if (entry) entry.textContent = segment.entryPrice;
      if (current) entry.textContent = segment.currentPrice;
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
    const alertasActivas = realAlerts.filter(alert => alert.status === 'ACTIVE');
    
    return (
      <div className={styles.vigentesContent}>
        <div className={styles.vigentesHeader}>
          <h2 className={styles.sectionTitle}>Alertas Vigentes</h2>
          <div className={styles.priceUpdateControls}>
            {userRole === 'admin' && (
              <button 
                className={styles.createAlertButton}
                onClick={() => setShowCreateAlert(true)}
                title="Crear nueva alerta"
              >
                + Crear Alerta
              </button>
            )}
            <button 
              className={styles.updatePricesButton}
              onClick={() => updatePrices(false)}
              disabled={updatingPrices}
            >
              {updatingPrices ? '🔄 Actualizando...' : '📈 Actualizar Precios'}
            </button>
          </div>
        </div>
        
        {loadingAlerts ? (
          <div className={styles.loadingContainer}>
            <p>Cargando alertas...</p>
          </div>
        ) : alertasActivas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay alertas vigentes en este momento.</p>
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
        <h2 className={styles.sectionTitle}>📊 Informes y Análisis</h2>
        {userRole === 'admin' && (
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateReportModal(true)}
            title="Crear nuevo informe"
          >
            <PlusCircle size={16} />
            Crear Informe
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
          {informes.map((informe: any) => {
            const reportDate = new Date(informe.publishedAt || informe.createdAt);
            const isRecent = (Date.now() - reportDate.getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 días
            const readTime = Math.ceil((informe.content?.length || 0) / 1000);
            
            return (
              <div key={informe.id || informe._id} className={styles.informeCard}>
                <div className={styles.informeHeader}>
                  <h3>{informe.title}</h3>
                  <div className={styles.informeMeta}>
                    <span className={styles.informeDate}>
                      📅 {reportDate.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                      {isRecent && (
                        <span className={styles.recentBadge}>NUEVO</span>
                      )}
                    </span>
                    <span className={styles.informeType}>
                      {informe.type === 'video' ? '🎥 Video' : 
                       informe.type === 'analisis' ? '📊 Análisis' : 
                       informe.type === 'mixed' ? '📋 Mixto' : '📄 Informe'}
                    </span>
                    {informe.category && (
                      <span className={styles.informeCategory}>
                        📂 {informe.category.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Imagen de portada si existe */}
                {informe.coverImage && (
                  <div className={styles.informeCover}>
                    <img 
                      src={informe.coverImage.secure_url || informe.coverImage.url} 
                      alt={informe.title}
                      loading="lazy"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                )}
                
                <p className={styles.informeDescription}>
                  {informe.content ? 
                    (informe.content.length > 200 ? 
                      informe.content.substring(0, 200) + '...' : 
                      informe.content) : 
                    'Sin descripción disponible'
                  }
                </p>

                {/* Estadísticas del informe */}
                <div className={styles.informeStats}>
                  <span className={styles.informeStat}>
                    👁️ {informe.views || 0} vistas
                  </span>
                  <span className={styles.informeStat}>
                    ⏱️ {readTime} min lectura
                  </span>
                  {informe.images && informe.images.length > 0 && (
                    <span className={styles.informeStat}>
                      📸 {informe.images.length} imágenes
                    </span>
                  )}
                </div>

                {/* Tags del informe */}
                {informe.tags && informe.tags.length > 0 && (
                  <div className={styles.informeTags}>
                    {informe.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                    {informe.tags.length > 3 && (
                      <span className={styles.tag}>+{informe.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className={styles.informeActions}>
                  <button 
                    className={styles.readButton}
                    onClick={() => openReport(informe.id || informe._id)}
                  >
                    📖 Leer Informe Completo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h3>No hay informes disponibles</h3>
          <p>Los informes y análisis aparecerán aquí cuando estén disponibles.</p>
        </div>
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
          <div className={styles.chatHeader}>
            <div className={styles.chatTitle}>
              <h2>💬 Comunidad Smart Money</h2>
            </div>
          </div>
          
          <div className={styles.chatMainFull}>
            {messages.length === 0 ? (
              <div className={styles.emptyChat}>
                <div className={styles.emptyChatIcon}>💬</div>
                <p>¡Sé el primero en escribir un mensaje!</p>
              </div>
            ) : (
              <div className={styles.messagesContainer}>
                {messages.map((msg, index) => (
                  <div key={msg._id || index} className={styles.chatMessage}>
                    <div className={styles.messageHeader}>
                      <div className={styles.messageUser}>
                        <div className={styles.userAvatar}>
                          <div className={styles.userAvatarPlaceholder}>
                            {msg.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <span className={styles.userName}>{msg.userName || 'Usuario'}</span>
                      </div>
                      <span className={styles.messageTime}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    
                    <div className={styles.messageContent}>
                      {msg.replyTo && (
                        <div className={styles.replyReference}>
                          <div className={styles.replyLine}></div>
                          <div className={styles.replyContent}>
                            <span className={styles.replyUser}>{msg.replyTo.userName}</span>
                            <span className={styles.replyText}>{msg.replyTo.message}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className={styles.messageText}>{msg.message}</div>
                    </div>
                    
                    <div className={styles.messageActions}>
                      <button 
                        className={styles.replyButton}
                        onClick={() => handleReply(msg)}
                      >
                        <Reply size={14} />
                        Responder
                      </button>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className={styles.chatInput}>
            {replyingTo && (
              <div className={styles.replyingTo}>
                <div className={styles.replyingHeader}>
                  <span>Respondiendo a {replyingTo.userName}</span>
                  <button onClick={cancelReply} className={styles.cancelReply}>
                    <X size={14} />
                  </button>
                </div>
                <div className={styles.replyingText}>{replyingTo.message}</div>
              </div>
            )}
            
            <div className={styles.inputContainer}>
              <textarea
                className={`${styles.messageInput} messageInput`}
                placeholder="Escribe tu mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
              <button 
                className={styles.sendButton}
                onClick={sendMessage}
                disabled={!message.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComunidad = () => <CommunityChat />;

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
              </div>
            </div>

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
      {/* Header de Bienvenida Personalizado */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Hola {session?.user?.name || 'Nahuel'}! Ésta es tu área exclusiva de Smart Money
          </h1>
          <p className={styles.welcomeSubtitle}>
            Aquí tienes acceso completo a todas las alertas y recursos
          </p>
        </div>
      </div>

      {/* Layout Principal con Sidebar */}
      <div className={styles.mainLayout}>
        {/* Sidebar de Accesos Rápidos */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <button 
              className={`${styles.sidebarButton} ${activeTab === 'dashboard' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 size={20} />
              Dashboard
            </button>
            <button 
              className={`${styles.sidebarButton} ${activeTab === 'seguimiento' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('seguimiento')}
            >
              <Activity size={20} />
              Seguimiento
            </button>
            <button 
              className={`${styles.sidebarButton} ${activeTab === 'vigentes' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('vigentes')}
            >
              <Bell size={20} />
              Alertas Vigentes
            </button>
            <button 
              className={`${styles.sidebarButton} ${activeTab === 'informes' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('informes')}
            >
              <Download size={20} />
              Informes
            </button>
            <button 
              className={`${styles.sidebarButton} ${activeTab === 'comunidad' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('comunidad')}
            >
              <MessageCircle size={20} />
              Consultas
            </button>
          </nav>

          {/* Accesos Rápidos */}
          <div className={styles.quickAccess}>
            <h3 className={styles.quickAccessTitle}>Accesos Rápidos</h3>
            <div className={styles.quickAccessLinks}>
              <Link href="/entrenamientos" className={styles.quickLink}>
                <TrendingUp size={16} />
                Entrenamientos
              </Link>
              <Link href="/asesorias" className={styles.quickLink}>
                <Users size={16} />
                Asesorías
              </Link>
              <Link href="/recursos" className={styles.quickLink}>
                <Download size={16} />
                Recursos
              </Link>
            </div>
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className={styles.mainContent}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'seguimiento' && renderSeguimientoAlertas()}
          {activeTab === 'vigentes' && renderAlertasVigentes()}
          {activeTab === 'informes' && renderInformes()}
          {activeTab === 'comunidad' && renderComunidad()}
        </main>
      </div>

      {/* Modales */}
      {renderCreateAlertModal()}
      {showCreateReportModal && (
        <CreateReportModal 
          onClose={() => setShowCreateReportModal(false)}
          onSubmit={handleCreateReport}
          loading={creatingReport}
        />
      )}
      {showReportModal && selectedReport && (
        <ReportViewModal 
          report={selectedReport}
          onClose={closeReportModal}
        />
      )}

      {/* Modales de Imágenes */}
      {showImageModal && selectedImage && (
        <div className={styles.modalOverlay} onClick={closeImageModal}>
          <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.imageModalHeader}>
              <h3>Gráfico de TradingView</h3>
              <button className={styles.closeModalButton} onClick={closeImageModal}>
                ×
              </button>
            </div>
            <div className={styles.imageModalContent}>
              <img 
                src={selectedImage.secure_url} 
                alt="Gráfico de TradingView"
                className={styles.modalImage}
              />
              <div className={styles.imageInfo}>
                <span>{selectedImage.width} × {selectedImage.height}</span>
                <span>{Math.round(selectedImage.bytes / 1024)}KB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdditionalImagesModal && selectedAlertImages.length > 0 && (
        <div className={styles.modalOverlay} onClick={closeAdditionalImagesModal}>
          <div className={styles.additionalImagesModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.imageModalHeader}>
              <h3>Imágenes Adicionales ({selectedAlertImages.length})</h3>
              <button className={styles.closeModalButton} onClick={closeAdditionalImagesModal}>
                ×
              </button>
            </div>
            <div className={styles.additionalImagesContent}>
              {selectedAlertImages.map((image, index) => (
                <div key={image.public_id} className={styles.additionalImageItem}>
                  <img 
                    src={image.secure_url} 
                    alt={`Imagen adicional ${index + 1}`}
                    className={styles.additionalImage}
                  />
                  {image.caption && (
                    <p className={styles.imageCaption}>{image.caption}</p>
                  )}
                  <div className={styles.imageInfo}>
                    <span>{image.width} × {image.height}</span>
                    <span>{Math.round(image.bytes / 1024)}KB</span>
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

// Componente para modal de visualización de informes mejorado
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
              <div 
                className={styles.reportBody}
                dangerouslySetInnerHTML={{ __html: report.content }}
              />
            </div>

            {/* Imágenes adicionales */}
            {report.images && report.images.length > 0 && (
              <div className={styles.reportImages}>
                <h3>📸 Imágenes del Informe ({report.images.length})</h3>
                <div className={styles.imagesGrid}>
                  {report.images.map((image: any, index: number) => (
                    <div 
                      key={image.public_id} 
                      className={styles.imageThumbnail}
                      onClick={() => handleImageClick(index)}
                      title={image.caption || `Imagen ${index + 1}`}
                    >
                      <img 
                        src={image.secure_url || image.url} 
                        alt={image.caption || `Imagen ${index + 1}`}
                        loading="lazy"
                      />
                      {image.caption && (
                        <div className={styles.imageCaption}>
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags del informe */}
            {report.tags && report.tags.length > 0 && (
              <div className={styles.reportTags}>
                <h3>🏷️ Etiquetas</h3>
                <div className={styles.tagsList}>
                  {report.tags.map((tag: string, index: number) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Estadísticas del informe */}
            <div className={styles.reportStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>👁️ Vistas</span>
                <span className={styles.statValue}>{report.views || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>⏱️ Tiempo de Lectura</span>
                <span className={styles.statValue}>{readTime} min</span>
              </div>
              {report.images && report.images.length > 0 && (
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>📸 Imágenes</span>
                  <span className={styles.statValue}>{report.images.length}</span>
                </div>
              )}
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

      {/* Modal para imágenes */}
      {showImageModal && report.images && (
        <div className={styles.imageModalOverlay} onClick={closeImageModal}>
          <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeImageModal} 
              onClick={closeImageModal}
              aria-label="Cerrar modal de imagen"
            >
              ×
            </button>
            <div className={styles.imageModalContent}>
              <button 
                className={styles.imageNavButton} 
                onClick={prevImage}
                disabled={currentImageIndex === 0}
                aria-label="Imagen anterior"
              >
                ‹
              </button>
              <img 
                src={report.images[currentImageIndex].secure_url || report.images[currentImageIndex].url}
                alt={report.images[currentImageIndex].caption || `Imagen ${currentImageIndex + 1}`}
                className={styles.modalImage}
                loading="lazy"
              />
              <button 
                className={styles.imageNavButton} 
                onClick={nextImage}
                disabled={currentImageIndex === report.images.length - 1}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
            </div>
            <div className={styles.imageModalInfo}>
              <span className={styles.imageCounter}>
                {currentImageIndex + 1} de {report.images.length}
              </span>
              {report.images[currentImageIndex].caption && (
                <span className={styles.imageCaption}>
                  {report.images[currentImageIndex].caption}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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

const SmartMoneyPage: React.FC<SmartMoneyPageProps> = ({ 
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

export default SmartMoneyPage; 