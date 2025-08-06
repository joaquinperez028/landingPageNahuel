import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Clock, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/PaymentSuccess.module.css';

interface PaymentSuccessProps {
  // Props del servidor si es necesario
}

const PaymentSuccessPage: React.FC<PaymentSuccessProps> = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { reference, payment_id, status } = router.query;
    
    if (reference) {
      // Aquí podrías hacer una llamada a la API para obtener detalles del pago
      console.log('Pago exitoso:', { reference, payment_id, status });
      setPaymentDetails({ reference, payment_id, status });
    }
    
    setLoading(false);
  }, [router.query]);

  const getServiceName = (reference: string) => {
    if (reference?.includes('TraderCall')) return 'Trader Call';
    if (reference?.includes('SmartMoney')) return 'Smart Money';
    if (reference?.includes('CashFlow')) return 'Cash Flow';
    if (reference?.includes('TradingFundamentals')) return 'Trading Fundamentals';
    if (reference?.includes('DowJones')) return 'Dow Jones';
    return 'Servicio';
  };

  const getServiceRedirect = (reference: string) => {
    if (reference?.includes('TraderCall')) return '/alertas/trader-call';
    if (reference?.includes('SmartMoney')) return '/alertas/smart-money';
    if (reference?.includes('CashFlow')) return '/alertas/cash-flow';
    if (reference?.includes('TradingFundamentals')) return '/entrenamientos/trading';
    if (reference?.includes('DowJones')) return '/entrenamientos/advanced';
    return '/';
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Procesando Pago - Nahuel Lozano</title>
        </Head>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Procesando tu pago...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>¡Pago Exitoso! - Nahuel Lozano</title>
        <meta name="description" content="Tu pago ha sido procesado exitosamente. ¡Bienvenido a la comunidad!" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            className={styles.successCard}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.successIcon}>
              <CheckCircle size={80} />
            </div>

            <h1 className={styles.successTitle}>
              ¡Pago Exitoso!
            </h1>

            <p className={styles.successMessage}>
              Tu suscripción ha sido activada correctamente. ¡Bienvenido a la comunidad!
            </p>

            {paymentDetails?.reference && (
              <div className={styles.paymentDetails}>
                <h3>Detalles del Pago</h3>
                <div className={styles.detailItem}>
                  <span>Servicio:</span>
                  <span>{getServiceName(paymentDetails.reference)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Referencia:</span>
                  <span>{paymentDetails.reference}</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Estado:</span>
                  <span className={styles.statusSuccess}>Aprobado</span>
                </div>
              </div>
            )}

            <div className={styles.accessInfo}>
              <div className={styles.accessCard}>
                <Clock size={24} />
                <h4>Acceso Inmediato</h4>
                <p>Tu suscripción está activa por 30 días desde hoy</p>
              </div>

              <div className={styles.accessCard}>
                <Users size={24} />
                <h4>Comunidad Privada</h4>
                <p>Acceso completo a la comunidad de traders</p>
              </div>

              <div className={styles.accessCard}>
                <Star size={24} />
                <h4>Contenido Premium</h4>
                <p>Alertas y análisis exclusivos en tiempo real</p>
              </div>
            </div>

            <div className={styles.actions}>
              <Link 
                href={getServiceRedirect(paymentDetails?.reference || '')}
                className={styles.primaryButton}
              >
                Ir al Contenido
                <ArrowRight size={20} />
              </Link>

              <Link href="/perfil" className={styles.secondaryButton}>
                Ver Mi Perfil
              </Link>
            </div>

            <div className={styles.nextSteps}>
              <h3>Próximos Pasos</h3>
              <ul>
                <li>✅ Revisa tu email para confirmación</li>
                <li>✅ Explora el contenido premium</li>
                <li>✅ Únete a la comunidad privada</li>
                <li>✅ Configura tus notificaciones</li>
              </ul>
            </div>

            <div className={styles.support}>
              <p>
                ¿Necesitas ayuda? Contacta a nuestro equipo de soporte en{' '}
                <a href="mailto:soporte@lozanonahuel.com">soporte@lozanonahuel.com</a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PaymentSuccessPage; 