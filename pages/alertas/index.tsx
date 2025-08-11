import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import styles from '@/styles/Alertas.module.css';

interface AlertServiceProps {
  title: string;
  description: string;
  features: string[];
  href: string;
  gradient: string;
}

const AlertService: React.FC<AlertServiceProps> = ({ 
  title, 
  description, 
  features, 
  href, 
  gradient 
}) => {
  const router = useRouter();

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Usar router.push como método principal
    router.push(href).catch(() => {
      // Fallback a window.location si router.push falla
      window.location.href = href;
    });
  };

  return (
    <motion.div 
      className={styles.serviceCard}
      style={{ background: gradient }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className={styles.serviceTitle}>{title}</h3>
      <p className={styles.serviceDescription}>{description}</p>
      
      <ul className={styles.featureList}>
        {features.map((feature, index) => (
          <li key={index} className={styles.featureItem}>
            <span className={styles.checkmark}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      
      <div className={styles.buttonContainer}>
        <button 
          className={styles.serviceButton}
          onClick={handleButtonClick}
          type="button"
        >
          Ver Detalles
        </button>
      </div>
    </motion.div>
  );
};

const AlertasPage: React.FC = () => {
  const router = useRouter();
  const alertServices = [
    {
      title: 'Trader Call',
      description: 'Alertas de trading en tiempo real con análisis técnico avanzado',
      features: [
        'Señales de compra y venta precisas',
        'Análisis técnico detallado',
        'Stop loss y take profit',
        'Alertas en tiempo real',
        'Historial de operaciones'
      ],
      href: '/alertas/trader-call',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Smart Money',
      description: 'Sigue los movimientos del dinero institucional en el mercado',
      features: [
        'Flujos de dinero institucional',
        'Análisis de volumen profesional',
        'Detección de manipulación',
        'Niveles clave del mercado',
        'Reportes semanales'
      ],
      href: '/alertas/smart-money',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'CashFlow',
      description: 'Estrategias de inversión para generar flujo de efectivo constante',
      features: [
        'Estrategias de dividendos',
        'Análisis fundamental',
        'Portfolio balanceado',
        'Reinversión automática',
        'Reportes mensuales'
      ],
      href: '/alertas/cash-flow',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
  ];

  return (
    <>
      <Head>
        <title>Alertas de Trading - Nahuel Lozano</title>
        <meta name="description" content="Servicios de alertas profesionales: Trader Call, Smart Money y CashFlow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />
      
      <main className={styles.main}>
        {/* Hero Section - Nuevo diseño con video */}
        <section className={styles.hero}>
          <div className={styles.container}>
            <motion.div 
              className={styles.heroContent}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>
                  Servicio de Alertas
                </h1>
                <p className={styles.heroDescription}>
                  Accedé a señales precisas y actualizaciones periódicas para operar en los mercados. 
                  Elegí la estrategia que mejor se ajuste a tus objetivos y mejorá tus probabilidades de éxito.
                </p>
                <button 
                  className={styles.heroButton}
                  onClick={() => {
                    const servicesSection = document.querySelector(`.${styles.services}`);
                    if (servicesSection) {
                      servicesSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                >
                  Empezá Ahora &gt;
                </button>
              </div>
              
              <div className={styles.heroVideo}>
                <div className={styles.videoPlayer}>
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.playIcon}>▶</div>
                  </div>
                  <div className={styles.videoControls}>
                    <span className={styles.currentTime}>2:21</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill}></div>
                    </div>
                    <div className={styles.controlButtons}>
                      <button className={styles.controlBtn}>⏮</button>
                      <button className={styles.controlBtn}>⏯</button>
                      <button className={styles.controlBtn}>⏭</button>
                      <button className={styles.controlBtn}>🔊</button>
                      <span className={styles.totalTime}>20:00</span>
                      <button className={styles.controlBtn}>⚙️</button>
                      <button className={styles.controlBtn}>⏹</button>
                      <button className={styles.controlBtn}>⛶</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className={styles.services}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Nuestros Servicios de Alertas
            </motion.h2>
            
            <div className={styles.servicesGrid}>
              {alertServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <AlertService {...service} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.stats}>
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h3 className={styles.statNumber}>+1,300</h3>
                <p className={styles.statLabel}>Alertas Enviadas</p>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h3 className={styles.statNumber}>87%</h3>
                <p className={styles.statLabel}>Precisión Promedio</p>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className={styles.statNumber}>2,500+</h3>
                <p className={styles.statLabel}>Traders Activos</p>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h3 className={styles.statNumber}>24/7</h3>
                <p className={styles.statLabel}>Monitoreo del Mercado</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.container}>
            <motion.div 
              className={styles.ctaContent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.ctaTitle}>
                ¿Listo para llevar tu trading al siguiente nivel?
              </h2>
              <p className={styles.ctaDescription}>
                Únete a miles de traders que ya confían en nuestras alertas profesionales
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/alertas/trader-call" className={styles.ctaButton}>
                  Comenzar Ahora
                </Link>
                <Link href="/recursos" className={styles.ctaButtonSecondary}>
                  Ver Recursos Gratuitos
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AlertasPage; 