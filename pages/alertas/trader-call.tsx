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

// Vista de suscriptor simplificada
const SubscriberView: React.FC = () => {
  return (
    <div className={styles.subscriberView}>
      <div className={styles.container}>
        <h1>Dashboard de Trader Call</h1>
        <p>Contenido para usuarios suscritos...</p>
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
      isSubscribed: false,
      metrics,
      historicalAlerts
    }
  };
};

export default TraderCallPage; 