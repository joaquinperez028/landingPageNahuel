import React, { useState, useEffect } from 'react';
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

  // Datos de ejemplo para el dashboard
  const dashboardMetrics = {
    alertasActivas: 8,
    alertasGanancias: 127,
    alertasPerdidas: 18,
    rentabilidadSemanal: '+12.5%',
    alertasSemanales: 15
  };

  // Feed de actividad reciente
  const recentActivity = [
    {
      id: 1,
      type: 'comment',
      user: 'María González',
      message: 'Excelente entrada en AAPL, ya estoy en +8%',
      alert: 'AAPL',
      timestamp: '2 min',
      icon: '💬'
    },
    {
      id: 2,
      type: 'news',
      message: 'Fed: Powell hablará sobre política monetaria hoy a las 15:30hs',
      timestamp: '15 min',
      icon: '📰'
    },
    {
      id: 3,
      type: 'update',
      message: 'Se actualizó el Stop Loss de TSLA a $240.00',
      alert: 'TSLA',
      timestamp: '22 min',
      icon: '🔄'
    },
    {
      id: 4,
      type: 'comment',
      user: 'Carlos Rodríguez',
      message: 'Gracias por la alerta de EUR/USD, entrada perfecta',
      alert: 'EUR/USD',
      timestamp: '35 min',
      icon: '💬'
    },
    {
      id: 5,
      type: 'alert',
      message: 'Nueva alerta enviada: MSFT - BUY en $380.50',
      alert: 'MSFT',
      timestamp: '1h',
      icon: '🚨'
    },
    {
      id: 6,
      type: 'news',
      message: 'Mercados: Datos de inflación mejor de lo esperado',
      timestamp: '1h 15min',
      icon: '📈'
    }
  ];

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

  const handleSendMessage = (message: string) => {
    // Simular envío de mensaje
    const newMessage = {
      id: Date.now(),
      user: 'Tu',
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setCommunityMessages(prev => [...prev, newMessage]);
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
            {dashboardMetrics.alertasGanancias}
          </p>
          <span className={styles.metricLabel}>Cerradas con ganancia</span>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <TrendingDown size={24} />
          </div>
          <h3>Alertas Perdedoras</h3>
          <p className={styles.metricNumber} style={{ color: 'var(--error-color)' }}>
            {dashboardMetrics.alertasPerdidas}
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
              {(dashboardMetrics.alertasGanancias / (dashboardMetrics.alertasGanancias + dashboardMetrics.alertasPerdidas) * 100).toFixed(1)}%
            </p>
          </div>
          <div className={styles.performanceCard}>
            <h4>Total Alertas</h4>
            <p className={styles.performanceValue}>
              {dashboardMetrics.alertasGanancias + dashboardMetrics.alertasPerdidas + dashboardMetrics.alertasActivas}
            </p>
          </div>
          <div className={styles.performanceCard}>
            <h4>Ratio G/P</h4>
            <p className={styles.performanceValue}>
              {(dashboardMetrics.alertasGanancias / dashboardMetrics.alertasPerdidas).toFixed(1)}:1
            </p>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className={styles.activitySection}>
        <h3>Mensajes Destacados / Noticias</h3>
        <p className={styles.activitySubtitle}>Actividad reciente en Trader Call</p>
        
        <div className={styles.activityFeed}>
          {recentActivity.map((item) => (
            <div key={item.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <span>{item.icon}</span>
              </div>
              
              <div className={styles.activityContent}>
                <div className={styles.activityMessage}>
                  {item.user && (
                    <span className={styles.activityUser}>{item.user}: </span>
                  )}
                  {item.message}
                  {item.alert && (
                    <span className={styles.activityAlert}> #{item.alert}</span>
                  )}
                </div>
                <div className={styles.activityTime}>
                  hace {item.timestamp}
                </div>
              </div>
              
              <div className={styles.activityType}>
                <span className={`${styles.typeTag} ${styles[`type-${item.type}`]}`}>
                  {item.type === 'comment' && 'Comentario'}
                  {item.type === 'news' && 'Noticia'}
                  {item.type === 'update' && 'Actualización'}
                  {item.type === 'alert' && 'Alerta'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.activityActions}>
          <button className={styles.viewAllButton}>
            Ver toda la actividad
          </button>
          <button className={styles.refreshButton}>
            <Activity size={16} />
            Actualizar
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
      <h2 className={styles.sectionTitle}>Seguimiento de Alertas</h2>
      
      {/* Filtros */}
      <div className={styles.alertFilters}>
        <select className={styles.filterSelect}>
          <option value="">Filtrar por símbolo</option>
          <option value="AAPL">AAPL</option>
          <option value="TSLA">TSLA</option>
          <option value="MSFT">MSFT</option>
        </select>
        <select className={styles.filterSelect}>
          <option value="">Filtrar por estado</option>
          <option value="ACTIVE">Activa</option>
          <option value="CLOSED">Cerrada</option>
          <option value="STOPPED">Stop Loss</option>
        </select>
        <input 
          type="date" 
          className={styles.filterDate}
          placeholder="Fecha desde"
        />
      </div>

      {/* Tabla de alertas */}
      <div className={styles.alertasTable}>
        <div className={styles.tableHeader}>
          <span>Fecha</span>
          <span>Símbolo</span>
          <span>Acción</span>
          <span>Precio Entrada</span>
          <span>Precio Actual</span>
          <span>P&L</span>
          <span>Estado</span>
        </div>
        
        {alertasVigentes.map((alert) => (
          <div key={alert.id} className={styles.tableRow}>
            <span>{alert.date}</span>
            <span className={styles.symbol}>{alert.symbol}</span>
            <span className={`${styles.action} ${alert.action === 'BUY' ? styles.buyAction : styles.sellAction}`}>
              {alert.action}
            </span>
            <span>{alert.entryPrice}</span>
            <span>{alert.currentPrice}</span>
            <span className={styles.profit}>{alert.profit}</span>
            <span className={`${styles.status} ${styles.statusActive}`}>
              {alert.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlertasVigentes = () => (
    <div className={styles.vigentesContent}>
      <h2 className={styles.sectionTitle}>Alertas Vigentes</h2>
      
      {alertasVigentes.map((alert) => (
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
              <strong className={styles.profit}>{alert.profit}</strong>
            </div>
          </div>
          
          <div className={styles.alertActions}>
            <button className={styles.closeButton}>Cerrar Posición</button>
            <button className={styles.modifyButton}>Modificar</button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInformes = () => (
    <div className={styles.informesContent}>
      <h2 className={styles.sectionTitle}>Informes</h2>
      
      <div className={styles.informesList}>
        <div className={styles.informeCard}>
          <div className={styles.informeHeader}>
            <h3>Análisis Semanal - Semana 3 Enero 2024</h3>
            <span className={styles.informeDate}>15 Enero 2024</span>
          </div>
          <p className={styles.informeDescription}>
            Análisis completo de las oportunidades de la semana en el mercado estadounidense. 
            Cobertura de sectores tecnológicos y financieros.
          </p>
          <div className={styles.informeActions}>
            <button className={styles.readButton}>Leer Informe</button>
            <button className={styles.downloadButton}>
              <Download size={16} />
              Descargar PDF
            </button>
          </div>
        </div>

        <div className={styles.informeCard}>
          <div className={styles.informeHeader}>
            <h3>Video Análisis: Estrategia Swing Trading</h3>
            <span className={styles.informeDate}>12 Enero 2024</span>
          </div>
          <p className={styles.informeDescription}>
            Video explicativo sobre técnicas avanzadas de swing trading aplicadas a nuestras alertas recientes.
          </p>
          <div className={styles.videoContainer}>
            <VideoPlayerMux 
              playbackId="sample-analysis-video" 
              autoplay={false}
              className={styles.informeVideo}
            />
          </div>
        </div>

        <div className={styles.informeCard}>
          <div className={styles.informeHeader}>
            <h3>Reporte Mensual - Diciembre 2023</h3>
            <span className={styles.informeDate}>31 Diciembre 2023</span>
          </div>
          <p className={styles.informeDescription}>
            Resumen completo del desempeño del mes, alertas más exitosas y lecciones aprendidas.
          </p>
          <div className={styles.informeActions}>
            <button className={styles.readButton}>Leer Informe</button>
            <button className={styles.downloadButton}>
              <Download size={16} />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComunidad = () => (
    <div className={styles.comunidadContent}>
      <h2 className={styles.sectionTitle}>Comunidad Trader Call</h2>
      
      <div className={styles.chatContainer}>
        <div className={styles.chatMessages}>
          <div className={styles.message}>
            <strong>Nahuel Lozano:</strong>
            <p>¡Bienvenidos al chat de la comunidad! Aquí pueden compartir ideas y hacer consultas.</p>
            <span className={styles.messageTime}>09:30</span>
          </div>
          
          <div className={styles.message}>
            <strong>María González:</strong>
            <p>Excelente la alerta de AAPL, ya estoy en +8%. ¿Mantenemos hasta el take profit?</p>
            <span className={styles.messageTime}>10:15</span>
          </div>
          
          <div className={styles.message}>
            <strong>Carlos Rodríguez:</strong>
            <p>¿Qué opinan sobre el sector tech esta semana? Veo mucha volatilidad.</p>
            <span className={styles.messageTime}>10:45</span>
          </div>

          {communityMessages.map((msg) => (
            <div key={msg.id} className={styles.message}>
              <strong>{msg.user}:</strong>
              <p>{msg.message}</p>
              <span className={styles.messageTime}>{msg.timestamp}</span>
            </div>
          ))}
        </div>
        
        <div className={styles.chatInput}>
          <input 
            type="text" 
            placeholder="Escribe tu mensaje..."
            className={styles.messageInput}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleSendMessage(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button className={styles.sendButton}>Enviar</button>
        </div>
      </div>
      
      <div className={styles.comunidadStats}>
        <div className={styles.statCard}>
          <h4>Miembros Activos</h4>
          <p>342</p>
        </div>
        <div className={styles.statCard}>
          <h4>Mensajes Hoy</h4>
          <p>89</p>
        </div>
        <div className={styles.statCard}>
          <h4>Ideas Compartidas</h4>
          <p>23</p>
        </div>
      </div>
    </div>
  );

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