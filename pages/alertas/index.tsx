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
  backgroundColor: string;
  buttonTextColor: string;
  tag: string;
}

const AlertService: React.FC<AlertServiceProps> = ({ 
  title, 
  description, 
  features, 
  href, 
  backgroundColor, 
  buttonTextColor,
  tag
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
      style={{ backgroundColor }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Video Player Placeholder */}
      <div className={styles.videoPlayerPlaceholder}>
        <div className={styles.videoScreen}>
          <div className={styles.playIcon}>▶</div>
        </div>
        <div className={styles.videoControls}>
          <span className={styles.currentTime}>2:21</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
          <span className={styles.totalTime}>20:00</span>
        </div>
        <div className={styles.controlIcons}>
          <button className={styles.controlIcon}>⏮</button>
          <button className={styles.controlIcon}>⏯</button>
          <button className={styles.controlIcon}>⏭</button>
          <button className={styles.controlIcon}>🔊</button>
          <button className={styles.controlIcon}>⚙️</button>
          <button className={styles.controlIcon}>⏹</button>
          <button className={styles.controlIcon}>⛶</button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.serviceContent}>
        <div className={styles.serviceHeader}>
          <h3 className={styles.serviceTitle}>{title}</h3>
          <span className={styles.serviceTag}>{tag}</span>
        </div>
        
        <p className={styles.serviceDescription}>{description}</p>
        
        <ul className={styles.featureList}>
          {features.map((feature, index) => (
            <li key={index} className={styles.featureItem}>
              <span className={styles.checkmark}>✓</span>
              {feature}
            </li>
          ))}
        </ul>
        
        <div className={styles.trialOffer}>
          <span className={styles.checkmark}>✓</span>
          30 días de prueba gratis
        </div>
        
        <div className={styles.buttonContainer}>
          <button 
            className={styles.serviceButton}
            onClick={handleButtonClick}
            type="button"
            style={{ color: buttonTextColor }}
          >
            Quiero saber más &gt;
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AlertasPage: React.FC = () => {
  const router = useRouter();
  const alertServices = [
    {
      title: 'Trader Call',
      description: 'Servicio de alertas de compra y venta con estrategia de corto plazo, informes detallados y seguimiento activo, para que puedas invertir en CEDEARs y acciones de forma simple y estratégica. Ideal para quienes buscan grandes rendimientos.',
      features: [
        'Estrategia de corto plazo que busca obtener resultados entre unos días y hasta 3 meses',
        'Inversión en instrumentos de renta variable como CEDEARS, ETFs y acciones locales',
        'Informes de mercado todos los días',
        'Alertas fundamentadas en el análisis técnico, delineando salidas con Stop Loss y Take Profit'
      ],
      href: '/alertas/trader-call',
      backgroundColor: '#0f766e',
      buttonTextColor: '#10b981',
      tag: 'Corto Plazo'
    },
    {
      title: 'Smart Money',
      description: 'Servicio de alertas de compra con visión de mediano y largo plazo, pensado para construir carteras sólidas, con foco en crecimiento sostenido y bajo riesgo. Ideal para quienes buscan invertir con estrategia sin estar pendientes del día a día.',
      features: [
        'Estrategia de inversión de varios meses a años, ideal para acumular capital',
        'Selección de activos con fundamentos sólidos tanto de renta fija como de renta variable',
        'Informes de mercado y seguimiento semanal',
        'Alertas del análisis técnicos y fundamental, con revisiones periódicas y constantes'
      ],
      href: '/alertas/smart-money',
      backgroundColor: '#7f1d1d',
      buttonTextColor: '#dc2626',
      tag: 'Mediano y Largo Plazo'
    },
    {
      title: 'CashFlow',
      description: 'Servicio de alertas diseñado para generar flujos de dinero constantes a través de inversiones en instrumentos que pagan intereses y dividendos. Combinamos renta fija y variable para que tu cartera trabaje por vos todos los meses.',
      features: [
        'Estrategia orientada a generar ingresos pasivos mensuales',
        'Combinación de bonos públicos y privados, Letras, CEDEARs con dividendos, ETFs y FCIs.',
        'Informes y rebalanceo mensual de la cartera',
        'Alertas basadas en la estabilidad de la cartera y la generación de flujo de efectivo constante'
      ],
      href: '/alertas/cash-flow',
      backgroundColor: '#1e3a8a',
      buttonTextColor: '#3b82f6',
      tag: 'Ingresos Pasivos'
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
                <h3 className={styles.statNumber}>+2900</h3>
                <p className={styles.statLabel}>Suscriptores</p>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h3 className={styles.statNumber}>+790</h3>
                <p className={styles.statLabel}>Alertas</p>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className={styles.statNumber}>+800</h3>
                <p className={styles.statLabel}>Informes</p>
              </motion.div>
              
              <motion.div 
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h3 className={styles.statNumber}>98%</h3>
                <p className={styles.statLabel}>Satisfacción</p>
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