import React, { useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
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
  BarChart3,
  MessageSquare,
  FileText,
  Eye,
  DollarSign
} from 'lucide-react';
import styles from '@/styles/SmartMoney.module.css';

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
      window.location.href = '/api/auth/signin';
    } else {
      window.location.href = '/payment/smart-money';
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
            <h2 className={styles.videoTitle}>Sigue el Dinero Institucional</h2>
            <p className={styles.videoDescription}>
              Descubre cómo los grandes fondos mueven el mercado y cómo puedes aprovechar esa información
            </p>
            <div className={styles.videoWrapper}>
              <VideoPlayerMux 
                playbackId="sample-smart-money-video" 
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
            Análisis del Dinero Institucional
          </motion.h2>
          
          <div className={styles.metricsGrid}>
            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <DollarSign className={styles.metricIcon} />
              <h3 className={styles.metricNumber}>{metrics.performance}</h3>
              <p className={styles.metricLabel}>Flujo Promedio Detectado</p>
            </motion.div>

            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Eye className={styles.metricIcon} />
              <h3 className={styles.metricNumber}>{metrics.activeUsers}</h3>
              <p className={styles.metricLabel}>Analistas Siguiendo</p>
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
              <p className={styles.metricLabel}>Flujos Detectados</p>
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
              <p className={styles.metricLabel}>Precisión de Detección</p>
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
            Flujos Institucionales Detectados
          </motion.h2>
          
          <div className={styles.historyTable}>
            <div className={styles.tableHeader}>
              <span>Fecha</span>
              <span>Símbolo</span>
              <span>Flujo</span>
              <span>Volumen</span>
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
                <span className={alert.flow === 'IN' ? styles.flowIn : styles.flowOut}>
                  {alert.flow === 'IN' ? 'ENTRADA' : 'SALIDA'}
                </span>
                <span>{alert.volume}</span>
                <span className={alert.result === 'CONFIRMED' ? styles.confirmed : styles.pending}>
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

      {/* Características del Servicio */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            ¿Qué hace único a Smart Money?
          </motion.h2>
          
          <div className={styles.featuresGrid}>
            <motion.div 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Eye className={styles.featureIcon} />
              <h3>Detección de Manipulación</h3>
              <p>Identificamos cuando el precio es manipulado por grandes instituciones</p>
            </motion.div>

            <motion.div 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <BarChart3 className={styles.featureIcon} />
              <h3>Análisis de Volumen</h3>
              <p>Análisis profesional del volumen para detectar movimientos institucionales</p>
            </motion.div>

            <motion.div 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Activity className={styles.featureIcon} />
              <h3>Niveles Clave</h3>
              <p>Identificación de niveles donde el dinero institucional toma posiciones</p>
            </motion.div>
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
            <h2 className={styles.ctaTitle}>Únete a Smart Money</h2>
            <p className={styles.ctaDescription}>
              Sigue los movimientos del dinero institucional y aprovecha la información privilegiada del mercado
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
    { id: 'tracking', label: 'Seguimiento de Flujos', icon: Activity },
    { id: 'active', label: 'Flujos Vigentes', icon: TrendingUp },
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

      {/* Contenido dinámico */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          {activeTab === 'dashboard' && (
            <div className={styles.dashboard}>
              <h2 className={styles.contentTitle}>Dashboard Smart Money</h2>
              <div className={styles.dashboardGrid}>
                <div className={styles.chartCard}>
                  <h3>Flujos Institucionales</h3>
                  <div className={styles.placeholder}>
                    [Gráfico de flujos institucionales]
                  </div>
                </div>
                <div className={styles.chartCard}>
                  <h3>Volumen vs Precio</h3>
                  <div className={styles.placeholder}>
                    [Análisis de volumen]
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className={styles.tracking}>
              <h2 className={styles.contentTitle}>Seguimiento de Flujos</h2>
              <div className={styles.flowsList}>
                <div className={styles.flowCard}>
                  <h4>SPY - Flujo Institucional</h4>
                  <p>Entrada masiva detectada | Volumen: 2.5M | Nivel: $445.20</p>
                  <span className={styles.flowStatus}>Confirmado</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'active' && (
            <div className={styles.activeFlows}>
              <h2 className={styles.contentTitle}>Flujos Vigentes</h2>
              <p>Flujos institucionales actualmente monitoreados...</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className={styles.reports}>
              <h2 className={styles.contentTitle}>Informes Semanales</h2>
              <p>Análisis detallados del comportamiento institucional...</p>
            </div>
          )}

          {activeTab === 'community' && (
            <div className={styles.community}>
              <h2 className={styles.contentTitle}>Comunidad Smart Money</h2>
              <p>Intercambia ideas sobre flujos institucionales...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Componente principal
const SmartMoneyPage: React.FC<SmartMoneyPageProps> = ({ 
  isSubscribed, 
  metrics, 
  historicalAlerts 
}) => {
  return (
    <>
      <Head>
        <title>Smart Money - Análisis Institucional | Nahuel Lozano</title>
        <meta name="description" content="Sigue los movimientos del dinero institucional en el mercado. Análisis de volumen profesional y detección de manipulación." />
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
              <h1 className={styles.heroTitle}>Smart Money</h1>
              <p className={styles.heroSubtitle}>
                Análisis del dinero institucional y detección de flujos masivos
              </p>
            </motion.div>
          </div>
        </section>

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const isSubscribed = false;
  
  const metrics = {
    performance: '$2.3B',
    activeUsers: '1,847',
    alertsSent: '+892',
    accuracy: '91.2%'
  };

  const historicalAlerts = [
    {
      date: '2024-01-15',
      symbol: 'SPY',
      flow: 'IN',
      volume: '2.5M',
      result: 'CONFIRMED'
    },
    {
      date: '2024-01-14',
      symbol: 'QQQ',
      flow: 'OUT',
      volume: '1.8M',
      result: 'PENDING'
    },
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