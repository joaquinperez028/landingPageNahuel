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
import AlertExamplesCarousel from '@/components/AlertExamplesCarousel';
import HistoricalAlertsTable from '@/components/HistoricalAlertsTable';
import FAQAccordion from '@/components/FAQAccordion';
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader
} from 'lucide-react';
import styles from '@/styles/CashFlow.module.css';
import { useRouter } from 'next/router';
import { calculateDaysRemaining, calculateDaysSinceSubscription } from '../../utils/dateUtils';
import SPY500Indicator from '@/components/SPY500Indicator';
import PortfolioTimeRange from '@/components/PortfolioTimeRange';

interface AlertExample {
  id: string;
  title: string;
  description: string;
  chartImage?: string;
  entryPrice: string;
  exitPrice: string;
  profit: string;
  profitPercentage: string;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
  country: string;
  ticker: string;
  order: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'trader-call' | 'smart-money' | 'cash-flow' | 'general';
  order: number;
  visible: boolean;
}

interface HistoricalAlert {
  date: string;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
  country: string;
  ticker: string;
  entryPrice: string;
  currentPrice: string;
  takeProfit1: string;
  takeProfit2?: string;
  stopLoss?: string;
  div?: string;
  exitPrice: string;
  profitPercentage: string;
}

interface CashFlowPageProps {
  isSubscribed: boolean;
  metrics: {
    performance: string;
    activeUsers: string;
    alertsSent: string;
    accuracy: string;
  };
  historicalAlerts: HistoricalAlert[];
  alertExamples: AlertExample[];
  faqs: FAQ[];
}

// Vista No Suscripto
const NonSubscriberView: React.FC<{ 
  metrics: any, 
  historicalAlerts: HistoricalAlert[], 
  alertExamples: AlertExample[], 
  faqs: FAQ[] 
}> = ({ 
  metrics, 
  historicalAlerts,
  alertExamples,
  faqs
}) => {
  const { data: session } = useSession();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (!session) {
      signIn('google');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/payments/mercadopago/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'CashFlow',
          amount: 35000, // $35,000 ARS
          currency: 'ARS',
          type: 'subscription'
        }),
      });

        const data = await response.json();

        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
        console.error('Error creando checkout:', data.error);
        alert('Error al procesar el pago. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = () => {
    console.log('Exportando PDF...');
  };

  const exampleImages = [
    {
      src: '/alerts/cash-flow-example-1.jpg',
      alt: 'Ejemplo de alerta Cash Flow - Análisis AAPL',
      title: 'Alerta AAPL - Entrada Perfecta',
      description: 'Señal de compra en Apple con +15% de ganancia en 3 días'
    },
    {
      src: '/alerts/cash-flow-example-2.jpg',
      alt: 'Ejemplo de alerta Cash Flow - Análisis TSLA',
      title: 'Alerta TSLA - Stop Loss Activado',
      description: 'Protección de capital con stop loss inteligente'
    },
    {
      src: '/alerts/cash-flow-example-3.jpg',
      alt: 'Ejemplo de alerta Cash Flow - Análisis SPY',
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
                Cash Flow
              </h1>
              <p className={styles.heroDescription}>
                Servicio de alertas de compra y venta con estrategia de corto plazo, informes detallados y seguimiento activo, para que puedas invertir en CEDEARs y acciones de forma simple y estratégica. Ideal para quienes buscan grandes rendimientos.
              </p>
              <div className={styles.heroFeatures}>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Quiero Suscribirme</span>
                </div>
              </div>
            </div>
            <div className={styles.heroVideo}>
              <div className={styles.videoContainer}>
                <VideoPlayerMux 
                  playbackId="sample-cash-flow-video" 
                  autoplay={true}
                  className={styles.video}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ejemplo de Alertas */}
      <section className={styles.examplesSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Ejemplo de Alertas
          </motion.h2>
          
          <motion.div 
            className={styles.carouselContainer}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AlertExamplesCarousel 
              examples={alertExamples}
              autoplay={true}
              interval={5000}
            />
          </motion.div>
        </div>
      </section>

      {/* Métricas - Sección independiente para ocupar todo el ancho */}
      <section className={styles.metricsSection}>
        <div className={styles.metricsGrid}>
          <motion.div 
            className={styles.metricCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className={styles.metricNumber}>+700</h3>
            <p className={styles.metricLabel}>USUARIOS ACTIVOS</p>
          </motion.div>

          <motion.div 
            className={styles.metricCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className={styles.metricNumber}>+87%</h3> 
            <p className={styles.metricLabel}>RENTABILIDAD ANUAL</p>
          </motion.div>

          <motion.div 
            className={styles.metricCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={styles.metricNumber}>+200</h3>
            <p className={styles.metricLabel}>ALERTAS ENVIADAS</p>
          </motion.div>

          <motion.div 
            className={styles.metricCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h3 className={styles.metricNumber}>+79%</h3>
            <p className={styles.metricLabel}>EFECTIVIDAD</p>
          </motion.div>
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
          
          <motion.div 
            className={styles.historyImageContainer}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img 
              src="/logos/alertashistoricas.png" 
              alt="Alertas Históricas - Rendimiento de Trading"
              className={styles.historyImage}
            />
          </motion.div>
        </div>
      </section>

      {/* Preguntas Frecuentes */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Preguntas Frecuentes
          </motion.h2>
          
          <motion.div 
            className={styles.faqContainer}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FAQAccordion 
              faqs={faqs}
              category="cash-flow"
              maxItems={10}
            />
          </motion.div>
        </div>
      </section>



      {/* CTA Final */}
      <section className={styles.ctaInvestmentSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaInvestmentContent}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.ctaInvestmentTitle}>
              ¿Listo para llevar tus inversiones al siguiente nivel?
            </h2>
            <p className={styles.ctaInvestmentSubtitle}>
              Únete a nuestra comunidad y comienza construir tu libertad financiera
            </p>
            
            <div className={styles.ctaInvestmentActions}>
              {session ? (
              <button 
                onClick={handleSubscribe}
                  className={styles.ctaInvestmentButtonPrimary}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                      <Loader size={20} className={styles.spinner} />
                    Procesando...
                  </>
                ) : (
                    'Suscribirse a Cash Flow - $35,000 ARS'
                )}
              </button>
              ) : (
                <button 
                  onClick={() => signIn('google')} 
                  className={styles.ctaInvestmentButtonPrimary}
                >
                  Comenzar ahora
                </button>
              )}
              
              <a 
                href="https://plataformacursos.lozanonahuel.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaInvestmentButtonSecondary}
              >
                Ir a Mentoring 🚀
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* YouTube Community Section */}
      <section className={styles.youtubeSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.youtubeContent}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.youtubeText}>
              <h2 className={styles.youtubeTitle}>
                ¡Sumate a nuestra comunidad<br />
                en YouTube!
              </h2>
              <p className={styles.youtubeSubtitle}>
                No te pierdas nuestros últimos videos
              </p>
            </div>

            <div className={styles.youtubeVideoContainer}>
              <YouTubeAutoCarousel />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Componente YouTubeAutoCarousel idéntico al de la landing page
const YouTubeAutoCarousel: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  
  const videos = [
    {
      id: '0NpdClGWaY8',
      title: 'Video 1'
    },
    {
      id: 'jl3lUCIluAs',
      title: 'Video 2'
    },
    {
      id: '_AMDVmj9_jw',
      title: 'Video 3'
    },
    {
      id: 'sUktp76givU',
      title: 'Video 4'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [videos.length]);

  const goToPrevious = () => {
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToNext = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  return (
    <div className={styles.youtubeAutoCarousel}>
      <button 
        onClick={goToPrevious}
        className={styles.youtubeArrowLeft}
        aria-label="Video anterior"
      >
        <ChevronLeft size={24} />
      </button>
      
      <div className={styles.youtubeVideoFrame}>
        <iframe
          src={`https://www.youtube.com/embed/${videos[currentVideo].id}`}
          title={videos[currentVideo].title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={styles.youtubeVideoPlayer}
        />
      </div>
      
      <button 
        onClick={goToNext}
        className={styles.youtubeArrowRight}
        aria-label="Siguiente video"
      >
        <ChevronRight size={24} />
      </button>

      <div className={styles.youtubeIndicators}>
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentVideo(index)}
            className={`${styles.youtubeIndicator} ${
              index === currentVideo ? styles.youtubeIndicatorActive : ''
            }`}
            aria-label={`Ver video ${index + 1}`}
          />
        ))}
      </div>
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
      const response = await fetch('/api/alerts/list?tipo=CashFlow', {
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
      // Filtrar solo informes de Cash Flow
      const response = await fetch('/api/reports?limit=6&featured=false&category=cash-flow', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setInformes(data.data?.reports || []);
        console.log('Informes Cash Flow cargados:', data.data?.reports?.length || 0);
      } else {
        console.error('Error al cargar informes:', response.status);
      }
    } catch (error) {
      console.error('Error al cargar informes:', error);
    } finally {
      setLoadingInformes(false);
    }
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

  return (
    <div className={styles.subscriberView}>
      {/* Header de Bienvenida Personalizado */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Hola {session?.user?.name || 'Nahuel'}! Ésta es tu área exclusiva de Cash Flow
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
    <div className={styles.dashboardContent}>
            <h2 className={styles.sectionTitle}>Dashboard de Cash Flow</h2>
            
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
                    onClick={() => {
                      setRefreshingActivity(true);
                      Promise.all([loadAlerts(), loadInformes()]).finally(() => setRefreshingActivity(false));
                    }}
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
        </main>
              </div>
      </div>
    );
  };

// Componente principal
const CashFlowPage: React.FC<CashFlowPageProps> = ({ 
  isSubscribed, 
  metrics, 
  historicalAlerts, 
  alertExamples, 
  faqs 
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
      return (
      <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
        <p>Cargando...</p>
        </div>
      );
    }

  return (
    <>
      <Head>
        <title>Cash Flow - Alertas de Trading | Nahuel Lozano</title>
        <meta name="description" content="Servicio de alertas Cash Flow con estrategia de corto plazo, informes detallados y seguimiento activo para inversiones en CEDEARs y acciones." />
        <meta name="keywords" content="cash flow, alertas trading, inversiones, CEDEARs, acciones, trading, finanzas" />
        <meta property="og:title" content="Cash Flow - Alertas de Trading" />
        <meta property="og:description" content="Servicio de alertas Cash Flow con estrategia de corto plazo para inversiones exitosas." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lozanonahuel.vercel.app/alertas/cash-flow" />
        <link rel="canonical" href="https://lozanonahuel.vercel.app/alertas/cash-flow" />
      </Head>

      <div className={styles.pageContainer}>
      <Navbar />
      
        {isSubscribed ? (
          <SubscriberView />
        ) : (
          <NonSubscriberView 
            metrics={metrics} 
            historicalAlerts={historicalAlerts} 
            alertExamples={alertExamples}
            faqs={faqs}
          />
        )}

      <Footer />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  let isSubscribed = false;
    
    if (session?.user?.email) {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/subscriptions`, {
        headers: {
          'Cookie': context.req.headers.cookie || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        isSubscribed = data.subscriptions?.some((sub: any) => 
          sub.service === 'CashFlow' && sub.status === 'active'
        ) || false;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  // Obtener datos de configuración del sitio
  let siteConfig = null;
  try {
    const configResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/site-config`);
    if (configResponse.ok) {
      siteConfig = await configResponse.json();
    }
  } catch (error) {
    console.error('Error fetching site config:', error);
  }

  // Datos por defecto
  const defaultMetrics = {
    performance: '+87%',
    activeUsers: '+700',
    alertsSent: '+200',
    accuracy: '+79%'
  };

  const defaultHistoricalAlerts: HistoricalAlert[] = [
    {
      date: '2024-01-15',
      riskLevel: 'MEDIO',
      status: 'CERRADO TP1',
      country: 'United States',
      ticker: 'AAPL',
      entryPrice: '$132.31',
      currentPrice: '$230.25',
      takeProfit1: '$203.64',
      exitPrice: '$230.25',
      profitPercentage: '+15.89%'
    },
    {
      date: '2024-01-10',
      riskLevel: 'BAJO',
      status: 'CERRADO TP1 Y SL',
      country: 'United States',
      ticker: 'TSLA',
      entryPrice: '$185.50',
      currentPrice: '$210.75',
      takeProfit1: '$200.00',
      exitPrice: '$210.75',
      profitPercentage: '+13.61%'
    }
  ];

  const defaultAlertExamples: AlertExample[] = [
    {
      id: '1',
      title: 'Alerta AAPL - Entrada Perfecta',
      description: 'Señal de compra en Apple con +15% de ganancia en 3 días',
      entryPrice: 'USD $132.31',
      exitPrice: 'USD $230.25 ($203.64)',
      profit: '$75.00',
      profitPercentage: '+15.89%',
      riskLevel: 'MEDIO',
      status: 'CERRADO TP1',
      country: 'United States',
      ticker: 'AAPL',
      order: 1
    },
    {
      id: '2',
      title: 'Alerta TSLA - Stop Loss Activado',
      description: 'Protección de capital con stop loss inteligente',
      entryPrice: 'USD $185.50',
      exitPrice: 'USD $210.75 ($200.00)',
      profit: '$45.00',
      profitPercentage: '+13.61%',
      riskLevel: 'BAJO',
      status: 'CERRADO TP1 Y SL',
      country: 'United States',
      ticker: 'TSLA',
      order: 2
    }
  ];

  const defaultFaqs: FAQ[] = [
    {
      id: '1',
      question: '¿Qué es CASH FLOW?',
      answer: 'Es un servicio de suscripción de alertas mediano/largo plazo, donde buscaremos detectar activos que se encuentren subvaluados en el mercado para poder sacarle rendimientos. este servicio tiene como finalidad encontrar oportunidades en el mercado de aquellos activos financieros que se precie de tener un rendimiento potencial significativo en el largo plazo. con este servicio podrás armar de forma fácil y práctica una cartera de inversión profesional que obtenga rentabilidades constantes y crecientes a lo largo del tiempo, sin la necesidad de asumir un riesgo muy elevado. ideal para inversores pacientes y que opten por un plazo de inversión más largo.',
      category: 'cash-flow',
      order: 1,
      visible: true
    },
    {
      id: '2',
      question: '¿Como funcionan los informes de mercado?',
      answer: 'Los informes y seguimiento de la cartera de inversión se realizan mediante un canal privado de telegram donde detallamos los principales datos financieros de la semana y qué activos identificamos como oportunidad. la publicación de los informes es de modalidad semanal los días viernes entre las 18 y las 22 hs. se responderán consultas y dudas de los suscriptores en un lapso no mayor a 48hs. en cada informe se presentarán los principales datos financieros de la semana y se realizará un repaso del estado actual de todos los activos en cartera, detallando su estado actual. los activos seleccionados están rigurosamente analizados y tienen como horizonte de inversión entre unos pocos meses hasta incluso varios años. al momento de encontrar una oportunidad de mercado, se pasará una alerta de inversión y se añadirá a la cartera del servicio, detallando fecha, precio, objetivos y fundamentos de la inversión. el análisis, las alertas y el seguimiento se realiza sobre el activo que cotiza en usa, en dólares. pero esto no presenta ningun inconveniente en realizar operaciones en cedears contra pesos y en argentina. esto permite que puedas ingresar en cada alerta con menor cantidad de dinero y en pesos, ya que los cedears cotizan tanto en pesos como en dólares y tienen un ratio de conversión que facilita el acceso a inversores con menor capital inicial. de hecho, el servicio contempla la inversión en cedears y en pesos como la preferible ya que suele haber mucho más volumen de operaciones en el mercado local en esa moneda. cada alerta de compra tiene asignado un nivel de riesgo propio, que contempla tanto el riesgo del contexto general de mercado, como del riesgo particular de cada activo. este servicio no tiene vínculo alguno con brokers de bolsa argentinos o internacionales, por lo que dicha estrategia puede ser aplicada por los inversores en cualquier cuenta de inversiones, independientemente del broker o intermediario que utilice.',
      category: 'cash-flow',
      order: 2,
      visible: true
    },
    {
      id: '3',
      question: '¿Las alertas tienen vencimiento?',
      answer: 'Si, tanto las alertas de compra como de venta tienen una semana de vencimiento. esto se debe a que el análisis realizado del activo y del contexto en general cambia constantemente, siguiendo el desarrollo del mercado. en cada informe detallamos a qué activos, de los que ya tuvieron alertas de compra con fechas anteriores, se puede ingresar a la semana siguiente en el caso que hubiera alguno.',
      category: 'cash-flow',
      order: 3,
      visible: true
    },
    {
      id: '4',
      question: '¿Cuánto dinero hay que invertir?',
      answer: 'No hay un mínimo de dinero con el que tengas que comenzar, pero una suma recomendable sería el equivalente a u$d 1.000.-',
      category: 'cash-flow',
      order: 4,
      visible: true
    },
    {
      id: '5',
      question: '¿Como son los pagos de la suscripción?',
      answer: 'Los cobros de mercado pago son automáticos. todos los 1ro de mes, se debitará del método de pago asociado el importe de la suscripción con la referencia "smartmoney". se debitará el prorrateo correspondiente de los días del mes en curso hasta llegar al primer día del mes siguiente. esto quiere decir que el primer cobro de la suscripción puede ser menor al valor del mes entero, ya que corresponden al prorrateo de días. luego de hecho el primer pago, todos los 1ro de cada mes, se debitará el valor total de la suscripción. cabe destacar, que son días corridos y no días hábiles. importante: tenga a bien contar con los fondos suficientes en el método de pago seleccionado en las fechas de cobro a para no tener inconvenientes con el estado de su suscripción. es oportuno aclarar que en ningún caso se cobrarán comisiones extras a la hora de realizar las operaciones a mercado, ya que no existe vínculo alguno entre el servicio y ningun broker de bolsa argentino o internacional.',
      category: 'cash-flow',
      order: 5,
      visible: true
    },
    {
      id: '6',
      question: '¿Seguís con dudas?',
      answer: 'Escribime un correo electrónico a la siguiente casilla para resolver las dudas que te puedan surgir: lozanonahuel@gmail.com',
      category: 'cash-flow',
      order: 6,
      visible: true
    }
  ];

  return {
    props: {
      isSubscribed,
      metrics: defaultMetrics,
      historicalAlerts: defaultHistoricalAlerts,
      alertExamples: defaultAlertExamples,
      faqs: defaultFaqs
    },
  };
};

export default CashFlowPage; 