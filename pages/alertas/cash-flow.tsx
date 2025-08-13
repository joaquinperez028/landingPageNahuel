import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/googleAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import styles from '@/styles/CashFlow.module.css';

interface CashFlowPageProps {
  isSubscribed: boolean;
}

const CashFlowPage: React.FC<CashFlowPageProps> = ({ isSubscribed }) => {
  return (
    <>
      <Head>
        <title>Cash Flow - Próximamente | Lozano Nahuel</title>
        <meta name="description" content="Cash Flow - Servicio de alertas de trading próximamente disponible. Alertas de compra y venta de corto plazo." />
        <meta name="keywords" content="cash flow, trading, alertas, inversiones, próximamente" />
        <meta property="og:title" content="Cash Flow - Próximamente | Lozano Nahuel" />
        <meta property="og:description" content="Cash Flow - Servicio de alertas de trading próximamente disponible." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lozanonahuel.vercel.app/alertas/cash-flow" />
        <link rel="canonical" href="https://lozanonahuel.vercel.app/alertas/cash-flow" />
      </Head>

      <div className={styles.pageContainer}>
        <Navbar />
        
        <div className={styles.nonSubscriberView}>
          {/* Hero Section */}
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
                  <div className={styles.comingSoonContainer}>
                    <motion.div 
                      className={styles.comingSoonBadge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      <span className={styles.comingSoonText}>Próximamente</span>
                    </motion.div>
                    <motion.p 
                      className={styles.heroDescription}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      Estamos trabajando en algo increíble para ti. 
                      Muy pronto podrás acceder a nuestro servicio de Cash Flow con alertas de compra y venta de corto plazo.
                    </motion.p>
                  </div>
                </div>
                <div className={styles.heroVideo}>
                  <div className={styles.videoContainer}>
                    <div className={styles.placeholderVideo}>
                      <motion.div 
                        className={styles.placeholderContent}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <div className={styles.placeholderIcon}>🚀</div>
                        <p className={styles.placeholderText}>Contenido en desarrollo</p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>

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

  return {
    props: {
      isSubscribed
    }
  };
};

export default CashFlowPage; 