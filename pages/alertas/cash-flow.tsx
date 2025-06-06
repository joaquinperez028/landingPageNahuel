import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Download, 
  DollarSign,
  CheckCircle,
  Star,
  PiggyBank,
  Target,
  Percent
} from 'lucide-react';
import styles from '@/styles/CashFlow.module.css';

interface CashFlowPageProps {
  isSubscribed: boolean;
  metrics: {
    performance: string;
    activeUsers: string;
    alertsSent: string;
    avgYield: string;
  };
  historicalAlerts: Array<{
    date: string;
    symbol: string;
    type: string;
    yield: string;
    status: string;
    returnPct: string;
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
      window.location.href = '/payment/cash-flow';
    }
  };

  const handleExportPDF = () => {
    console.log('Exportando PDF CashFlow...');
  };

  const exampleImages = [
    {
      src: '/alerts/cashflow-example-1.jpg',
      alt: 'Ejemplo de alerta CashFlow - REIT Analysis',
      title: 'REIT Analysis - Realty Income (O)',
      description: 'Alerta de dividendo mensual con yield del 5.8% y proyección de crecimiento sostenible'
    },
    {
      src: '/alerts/cashflow-example-2.jpg',
      alt: 'Ejemplo de alerta CashFlow - Dividend Aristocrat',
      title: 'Dividend Aristocrat - Coca Cola (KO)',
      description: 'Análisis de aristocrata de dividendos con 60+ años de incrementos consecutivos'
    },
    {
      src: '/alerts/cashflow-example-3.jpg',
      alt: 'Ejemplo de alerta CashFlow - Bond Strategy',
      title: 'Bond Strategy - Treasury & Corporate',
      description: 'Estrategia de bonos combinando Treasuries y corporativos para optimizar yield'
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
                CashFlow
                <span className={styles.heroSubtitle}>Genera Ingresos Pasivos Constantes</span>
              </h1>
              <p className={styles.heroDescription}>
                Alertas especializadas en activos generadores de cash flow: dividendos, REITs, bonos y 
                estrategias para maximizar tus ingresos pasivos mensuales de forma consistente.
              </p>
              <div className={styles.heroFeatures}>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Alertas de dividendos y REITs de alta calidad</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Estrategias de bonos y renta fija optimizadas</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Análisis de sostenibilidad de dividendos</span>
                </div>
              </div>
            </div>
            <div className={styles.heroVideo}>
              <div className={styles.videoContainer}>
                {/* Placeholder de video mientras no tenemos uno real configurado */}
                <div className={styles.videoPlaceholder}>
                  <div className={styles.placeholderIcon}>💰</div>
                  <h3 className={styles.placeholderTitle}>Video Explicativo CashFlow</h3>
                  <p className={styles.placeholderText}>
                    Aquí irá el video explicativo sobre nuestras estrategias de generación de ingresos pasivos
                  </p>
                  <div className={styles.placeholderFeatures}>
                    <span>💸 Dividendos sostenibles</span>
                    <span>🏢 REITs de calidad</span>
                    <span>📊 Bonos optimizados</span>
                  </div>
                </div>
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
                <Percent size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.avgYield}</h3>
              <p className={styles.metricLabel}>Yield Promedio</p>
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
              <span>Tipo</span>
              <span>Yield</span>
              <span>Estado</span>
              <span>Retorno</span>
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
                <span className={`${styles.tableCell} ${styles.typeCell}`}>
                  {alert.type}
                </span>
                <span className={styles.tableCell}>{alert.yield}</span>
                <span className={`${styles.tableCell} ${alert.status === 'ACTIVA' ? styles.activeStatus : styles.completedStatus}`}>
                  {alert.status}
                </span>
                <span className={`${styles.tableCell} ${alert.returnPct.startsWith('+') ? styles.positiveReturn : styles.negativeReturn}`}>
                  {alert.returnPct}
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
            Carrusel de imágenes con informes y alertas de ejemplo de generación de cash flow
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
                ¿Listo para Generar Ingresos Pasivos?
              </h2>
              <p className={styles.subscriptionDescription}>
                Únete a {metrics.activeUsers} inversores que ya están generando cash flow constante con nuestras alertas especializadas
              </p>
              <div className={styles.subscriptionFeatures}>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Alertas de dividendos aristocráticos verificados</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Análisis de REITs y fondos de distribución</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Estrategias de bonos y renta fija optimizada</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Calculadora de proyección de ingresos mensuales</span>
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
        <h1>Dashboard de CashFlow</h1>
        <p>Contenido para usuarios suscritos...</p>
      </div>
    </div>
  );
};

const CashFlowPage: React.FC<CashFlowPageProps> = ({ 
  isSubscribed, 
  metrics, 
  historicalAlerts 
}) => {
  return (
    <>
      <Head>
        <title>CashFlow - Genera Ingresos Pasivos Constantes | Nahuel Lozano</title>
        <meta name="description" content="Alertas especializadas en activos generadores de cash flow: dividendos, REITs, bonos y estrategias para maximizar tus ingresos pasivos mensuales." />
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
    performance: '+18.5%',
    activeUsers: '+500',
    alertsSent: '+1,300',
    avgYield: '4.8%'
  };

  const historicalAlerts = [
    {
      date: '2024-01-15',
      symbol: 'REALTY INCOME (O)',
      type: 'REIT',
      yield: '5.8%',
      status: 'ACTIVA',
      returnPct: '+12.3%'
    },
    {
      date: '2024-01-14',
      symbol: 'COCA-COLA (KO)',
      type: 'DIVIDENDO',
      yield: '3.2%',
      status: 'COMPLETADA',
      returnPct: '+8.7%'
    },
    {
      date: '2024-01-12',
      symbol: 'MICROSOFT (MSFT)',
      type: 'DIVIDENDO',
      yield: '2.8%',
      status: 'COMPLETADA',
      returnPct: '+15.4%'
    },
    {
      date: '2024-01-11',
      symbol: 'VANGUARD REIT (VNQ)',
      type: 'ETF-REIT',
      yield: '4.2%',
      status: 'ACTIVA',
      returnPct: '+6.8%'
    },
    {
      date: '2024-01-10',
      symbol: 'US TREASURY 10Y',
      type: 'BONO',
      yield: '4.1%',
      status: 'COMPLETADA',
      returnPct: '+3.2%'
    },
    {
      date: '2024-01-09',
      symbol: 'JOHNSON & JOHNSON (JNJ)',
      type: 'DIVIDENDO',
      yield: '3.1%',
      status: 'COMPLETADA',
      returnPct: '+9.7%'
    },
    {
      date: '2024-01-08',
      symbol: 'PROLOGIS (PLD)',
      type: 'REIT',
      yield: '2.9%',
      status: 'ACTIVA',
      returnPct: '+14.5%'
    },
    {
      date: '2024-01-05',
      symbol: 'CORPORATE BOND BBB',
      type: 'BONO',
      yield: '5.4%',
      status: 'COMPLETADA',
      returnPct: '+7.8%'
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

export default CashFlowPage; 