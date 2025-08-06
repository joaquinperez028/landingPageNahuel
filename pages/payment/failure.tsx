import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/PaymentFailure.module.css';

interface PaymentFailureProps {
  // Props del servidor si es necesario
}

const PaymentFailurePage: React.FC<PaymentFailureProps> = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { reference, payment_id, status, error } = router.query;
    
    if (reference) {
      console.log('Pago fallido:', { reference, payment_id, status, error });
      setPaymentDetails({ reference, payment_id, status, error });
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

  const handleRetry = () => {
    // Redirigir de vuelta al servicio para intentar nuevamente
    const redirectUrl = getServiceRedirect(paymentDetails?.reference || '');
    router.push(redirectUrl);
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
          <p>Procesando información...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Error en el Pago - Nahuel Lozano</title>
        <meta name="description" content="Hubo un problema con tu pago. Te ayudamos a solucionarlo." />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            className={styles.failureCard}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.failureIcon}>
              <XCircle size={80} />
            </div>

            <h1 className={styles.failureTitle}>
              Error en el Pago
            </h1>

            <p className={styles.failureMessage}>
              Lo sentimos, hubo un problema al procesar tu pago. No te preocupes, no se ha realizado ningún cargo.
            </p>

            {paymentDetails?.reference && (
              <div className={styles.paymentDetails}>
                <h3>Detalles del Intento</h3>
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
                  <span className={styles.statusFailure}>Fallido</span>
                </div>
                {paymentDetails.error && (
                  <div className={styles.detailItem}>
                    <span>Error:</span>
                    <span className={styles.errorMessage}>{paymentDetails.error}</span>
                  </div>
                )}
              </div>
            )}

            <div className={styles.possibleCauses}>
              <h3>Posibles Causas</h3>
              <ul>
                <li>❌ Fondos insuficientes en la cuenta</li>
                <li>❌ Tarjeta bloqueada o vencida</li>
                <li>❌ Problemas temporales del banco</li>
                <li>❌ Datos de pago incorrectos</li>
                <li>❌ Problemas de conectividad</li>
              </ul>
            </div>

            <div className={styles.solutions}>
              <h3>Soluciones</h3>
              <div className={styles.solutionCards}>
                <div className={styles.solutionCard}>
                  <RefreshCw size={24} />
                  <h4>Intentar Nuevamente</h4>
                  <p>Verifica tus datos y vuelve a intentar el pago</p>
                </div>

                <div className={styles.solutionCard}>
                  <HelpCircle size={24} />
                  <h4>Contactar Soporte</h4>
                  <p>Nuestro equipo te ayudará a resolver el problema</p>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                onClick={handleRetry}
                className={styles.primaryButton}
              >
                Intentar Nuevamente
                <RefreshCw size={20} />
              </button>

              <Link href="/" className={styles.secondaryButton}>
                <ArrowLeft size={20} />
                Volver al Inicio
              </Link>
            </div>

            <div className={styles.support}>
              <h3>¿Necesitas Ayuda?</h3>
              <p>
                Nuestro equipo de soporte está disponible para ayudarte:
              </p>
              <div className={styles.contactInfo}>
                <p>📧 Email: <a href="mailto:soporte@lozanonahuel.com">soporte@lozanonahuel.com</a></p>
                <p>💬 WhatsApp: <a href="https://wa.me/5491112345678">+54 9 11 1234-5678</a></p>
              </div>
            </div>

            <div className={styles.importantNote}>
              <h4>Nota Importante</h4>
              <p>
                Si ves un cargo en tu cuenta pero recibiste este mensaje, 
                el dinero será reembolsado automáticamente en 3-5 días hábiles.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PaymentFailurePage; 