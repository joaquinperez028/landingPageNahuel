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
  Star,
  Eye,
  DollarSign,
  Target
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
    console.log('Exportando PDF Smart Money...');
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
                <DollarSign size={40} />
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
                <Target size={40} />
              </div>
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
            Alertas Históricas (Google Sheets)
          </motion.h2>
          <motion.p 
            className={styles.sectionDescription}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Visualización de algunas alertas y botón de descarga de PDF
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
                <span className={`${styles.tableCell} ${alert.flow === 'ENTRADA' ? styles.flowIn : styles.flowOut}`}>
                  {alert.flow}
                </span>
                <span className={styles.tableCell}>{alert.volume}</span>
                <span className={`${styles.tableCell} ${alert.result === 'CONFIRMADO' ? styles.confirmedResult : styles.pendingResult}`}>
                  {alert.result}
                </span>
                <span className={`${styles.tableCell} ${alert.movement.startsWith('+') ? styles.positiveMovement : styles.negativeMovement}`}>
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
            Imágenes con Ejemplo de Alertas
          </motion.h2>
          <motion.p 
            className={styles.sectionDescription}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Carrusel de imágenes con informes y alertas de flujos institucionales
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
              interval={4500}
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

// Vista de suscriptor simplificada
const SubscriberView: React.FC = () => {
  return (
    <div className={styles.subscriberView}>
      <div className={styles.container}>
        <h1>Dashboard de Smart Money</h1>
        <p>Contenido para usuarios suscritos...</p>
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
        <title>Smart Money - Sigue los Movimientos Institucionales | Nahuel Lozano</title>
        <meta name="description" content="Descubre hacia dónde se dirige el dinero institucional antes que el resto del mercado. Análisis de flujos profesional para maximizar tus ganancias." />
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
    performance: '+94.2%',
    activeUsers: '+500',
    alertsSent: '+1,300',
    accuracy: '89.7%'
  };

  const historicalAlerts = [
    {
      date: '2024-01-15',
      symbol: 'SPY',
      flow: 'ENTRADA',
      volume: '$2.3B',
      result: 'CONFIRMADO',
      movement: '+8.4%'
    },
    {
      date: '2024-01-14',
      symbol: 'QQQ',
      flow: 'SALIDA',
      volume: '$1.8B',
      result: 'CONFIRMADO',
      movement: '-5.2%'
    },
    {
      date: '2024-01-12',
      symbol: 'IWM',
      flow: 'ENTRADA',
      volume: '$950M',
      result: 'CONFIRMADO',
      movement: '+12.1%'
    },
    {
      date: '2024-01-11',
      symbol: 'XLF',
      flow: 'ENTRADA',
      volume: '$1.2B',
      result: 'CONFIRMADO',
      movement: '+6.8%'
    },
    {
      date: '2024-01-10',
      symbol: 'XLK',
      flow: 'SALIDA',
      volume: '$2.1B',
      result: 'PENDIENTE',
      movement: '-2.3%'
    },
    {
      date: '2024-01-09',
      symbol: 'VTI',
      flow: 'ENTRADA',
      volume: '$3.4B',
      result: 'CONFIRMADO',
      movement: '+9.7%'
    },
    {
      date: '2024-01-08',
      symbol: 'EFA',
      flow: 'ENTRADA',
      volume: '$780M',
      result: 'CONFIRMADO',
      movement: '+4.5%'
    },
    {
      date: '2024-01-05',
      symbol: 'XLE',
      flow: 'SALIDA',
      volume: '$560M',
      result: 'CONFIRMADO',
      movement: '-7.8%'
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

export default SmartMoneyPage; 