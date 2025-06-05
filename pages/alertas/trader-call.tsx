import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayerMux from '@/components/VideoPlayerMux';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Download, 
  Play,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText
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
      // Redirigir a login
              signIn('google');
    } else {
      // Procesar suscripción
      window.location.href = '/payment/trader-call';
    }
  };

  return (
    <div className={styles.nonSubscriberView}>
      {/* Video Explicativo */}
      <section className={styles.videoSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.videoContainer}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.videoTitle}>Descubre el Poder de Trader Call</h2>
            <div className={styles.videoWrapper}>
              <VideoPlayerMux 
                playbackId="sample-trader-call-video" 
                autoplay={true}
                className={styles.video}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Métricas */}
      <section className={styles.metricsSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Resultados Comprobados
          </motion.h2>
          
          <div className={styles.metricsGrid}>
            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <TrendingUp className={styles.metricIcon} />
              <h3 className={styles.metricNumber}>{metrics.performance}</h3>
              <p className={styles.metricLabel}>Rendimiento Promedio</p>
            </motion.div>

            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Users className={styles.metricIcon} />
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
              <Activity className={styles.metricIcon} />
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
              <BarChart3 className={styles.metricIcon} />
              <h3 className={styles.metricNumber}>{metrics.accuracy}</h3>
              <p className={styles.metricLabel}>Precisión</p>
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
            Historial de Alertas
          </motion.h2>
          
          <div className={styles.historyTable}>
            <div className={styles.tableHeader}>
              <span>Fecha</span>
              <span>Símbolo</span>
              <span>Acción</span>
              <span>Precio</span>
              <span>Resultado</span>
            </div>
            
            {historicalAlerts.slice(0, 10).map((alert, index) => (
              <motion.div 
                key={index}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span>{alert.date}</span>
                <span>{alert.symbol}</span>
                <span className={alert.action === 'BUY' ? styles.buy : styles.sell}>
                  {alert.action}
                </span>
                <span>${alert.price}</span>
                <span className={alert.result === 'PROFIT' ? styles.profit : styles.loss}>
                  {alert.result}
                </span>
              </motion.div>
            ))}
          </div>
          
          <div className={styles.exportButtons}>
            <button className={styles.exportButton}>
              <Download size={20} />
              Exportar PDF
            </button>
            <button className={styles.exportButton}>
              <Download size={20} />
              Exportar CSV
            </button>
          </div>
        </div>
      </section>

      {/* Ejemplos de Alertas */}
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
          
          <div className={styles.examplesCarousel}>
            <div className={styles.exampleCard}>
              <img src="/images/alert-example-1.jpg" alt="Ejemplo de alerta 1" />
            </div>
            <div className={styles.exampleCard}>
              <img src="/images/alert-example-2.jpg" alt="Ejemplo de alerta 2" />
            </div>
            <div className={styles.exampleCard}>
              <img src="/images/alert-example-3.jpg" alt="Ejemplo de alerta 3" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Suscripción */}
      <section className={styles.subscriptionCta}>
        <div className={styles.container}>
          <motion.div 
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.ctaTitle}>Únete a Trader Call</h2>
            <p className={styles.ctaDescription}>
              Accede a alertas de trading precisas y multiplica tu capital con estrategias probadas
            </p>
            <button onClick={handleSubscribe} className={styles.subscribeButton}>
              Suscribirme Ahora
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Vista Suscripto
const SubscriberView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard de Trabajo', icon: BarChart3 },
    { id: 'tracking', label: 'Seguimiento de Alertas', icon: Activity },
    { id: 'active', label: 'Alertas Vigentes', icon: TrendingUp },
    { id: 'reports', label: 'Informes', icon: FileText },
    { id: 'community', label: 'Comunidad', icon: MessageSquare },
  ];

  return (
    <div className={styles.subscriberView}>
      {/* Submenu */}
      <section className={styles.submenuSection}>
        <div className={styles.container}>
          <nav className={styles.submenu}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${styles.submenuItem} ${activeTab === item.id ? styles.active : ''}`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Contenido dinámico según tab activo */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          {activeTab === 'dashboard' && (
            <div className={styles.dashboard}>
              <h2 className={styles.contentTitle}>Dashboard de Trabajo</h2>
              <div className={styles.dashboardGrid}>
                <div className={styles.chartCard}>
                  <h3>Rendimiento Semanal</h3>
                  <div className={styles.placeholder}>
                    [Gráfico de rendimiento - Chart.js]
                  </div>
                </div>
                <div className={styles.chartCard}>
                  <h3>Alertas por Día</h3>
                  <div className={styles.placeholder}>
                    [Gráfico de alertas - Chart.js]
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className={styles.tracking}>
              <h2 className={styles.contentTitle}>Seguimiento de Alertas</h2>
              <div className={styles.alertsList}>
                <div className={styles.alertCard}>
                  <h4>AAPL - Compra</h4>
                  <p>Precio: $150.25 | Target: $155.00 | Stop: $147.00</p>
                  <span className={styles.alertStatus}>En progreso</span>
                </div>
                {/* Más alertas... */}
              </div>
            </div>
          )}

          {activeTab === 'active' && (
            <div className={styles.activeAlerts}>
              <h2 className={styles.contentTitle}>Alertas Vigentes</h2>
              <p>Alertas actualmente abiertas y en seguimiento...</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className={styles.reports}>
              <h2 className={styles.contentTitle}>Informes</h2>
              <p>Artículos, análisis y reportes detallados...</p>
            </div>
          )}

          {activeTab === 'community' && (
            <div className={styles.community}>
              <h2 className={styles.contentTitle}>Comunidad</h2>
              <p>Chat y foro de la comunidad Trader Call...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Componente principal
const TraderCallPage: React.FC<TraderCallPageProps> = ({ 
  isSubscribed, 
  metrics, 
  historicalAlerts 
}) => {
  return (
    <>
      <Head>
        <title>Trader Call - Alertas de Trading Profesional | Nahuel Lozano</title>
        <meta name="description" content="Alertas de trading en tiempo real con análisis técnico avanzado. Únete a más de 2,500 traders exitosos." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.container}>
            <motion.div 
              className={styles.heroContent}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className={styles.heroTitle}>Trader Call</h1>
              <p className={styles.heroSubtitle}>
                Alertas de trading profesional con análisis técnico avanzado
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contenido dinámico según suscripción */}
        {isSubscribed ? (
          <SubscriberView />
        ) : (
          <NonSubscriberView metrics={metrics} historicalAlerts={historicalAlerts} />
        )}
      </main>

      <Footer />
    </>
  );
};

// Server-side rendering para verificar suscripción
export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: Implementar verificación de suscripción real con MongoDB
  // Por ahora retornamos datos mock
  
  const isSubscribed = false; // Obtener del estado de usuario en MongoDB
  
  const metrics = {
    performance: '+24.7%',
    activeUsers: '2,584',
    alertsSent: '+1,342',
    accuracy: '87.3%'
  };

  const historicalAlerts = [
    {
      date: '2024-01-15',
      symbol: 'AAPL',
      action: 'BUY',
      price: '185.25',
      result: 'PROFIT'
    },
    {
      date: '2024-01-14',
      symbol: 'GOOGL',
      action: 'SELL',
      price: '142.80',
      result: 'PROFIT'
    },
    // Más alertas...
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