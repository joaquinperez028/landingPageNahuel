import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/PaymentPending.module.css';

interface PaymentPendingProps {
  // Props del servidor si es necesario
}

const PaymentPendingPage: React.FC<PaymentPendingProps> = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const { reference, payment_id, status } = router.query;
    
    if (reference) {
      console.log('Pago pendiente:', { reference, payment_id, status });
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

  const checkPaymentStatus = async () => {
    if (!paymentDetails?.reference) return;

    setCheckingStatus(true);
    
    try {
      // Aquí podrías hacer una llamada a la API para verificar el estado del pago
      const response = await fetch(`/api/payments/mercadopago/verify?reference=${paymentDetails.reference}`);
      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus(data.status);
        
        if (data.status === 'approved') {
          // Redirigir a página de éxito
          router.push(`/payment/success?reference=${paymentDetails.reference}`);
        } else if (data.status === 'rejected') {
          // Redirigir a página de fallo
          router.push(`/payment/failure?reference=${paymentDetails.reference}`);
        }
      }
    } catch (error) {
      console.error('Error verificando estado del pago:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Verificar estado automáticamente cada 30 segundos
  useEffect(() => {
    if (paymentDetails?.reference) {
      const interval = setInterval(checkPaymentStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [paymentDetails]);

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
        <title>Pago en Proceso - Nahuel Lozano</title>
        <meta name="description" content="Tu pago está siendo procesado. Te notificaremos cuando esté listo." />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            className={styles.pendingCard}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.pendingIcon}>
              <Clock size={80} />
            </div>

            <h1 className={styles.pendingTitle}>
              Pago en Proceso
            </h1>

            <p className={styles.pendingMessage}>
              Tu pago está siendo procesado por el banco. Esto puede tomar unos minutos.
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
                  <span className={styles.statusPending}>En Proceso</span>
                </div>
              </div>
            )}

            <div className={styles.statusInfo}>
              <div className={styles.statusCard}>
                <Clock size={24} />
                <h4>Procesando Pago</h4>
                <p>El banco está verificando tu información de pago</p>
              </div>

              <div className={styles.statusCard}>
                <CheckCircle size={24} />
                <h4>Verificación</h4>
                <p>Validando fondos y datos de la tarjeta</p>
              </div>

              <div className={styles.statusCard}>
                <CheckCircle size={24} />
                <h4>Confirmación</h4>
                <p>Activando tu suscripción automáticamente</p>
              </div>
            </div>

            <div className={styles.whatHappens}>
              <h3>¿Qué está pasando?</h3>
              <ul>
                <li>✅ Tu pago fue enviado al banco</li>
                <li>⏳ El banco está verificando los fondos</li>
                <li>⏳ Validando la información de la tarjeta</li>
                <li>⏳ Procesando la transacción</li>
                <li>⏳ Activando tu suscripción</li>
              </ul>
            </div>

            <div className={styles.actions}>
              <button 
                onClick={checkPaymentStatus}
                disabled={checkingStatus}
                className={styles.primaryButton}
              >
                {checkingStatus ? (
                  <>
                    <div className={styles.spinner}></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    Verificar Estado
                  </>
                )}
              </button>

              <Link href="/" className={styles.secondaryButton}>
                <ArrowLeft size={20} />
                Volver al Inicio
              </Link>
            </div>

            <div className={styles.importantInfo}>
              <h3>Información Importante</h3>
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <h4>⏰ Tiempo de Procesamiento</h4>
                  <p>Los pagos suelen procesarse en 2-5 minutos, pero pueden tardar hasta 24 horas en casos excepcionales.</p>
                </div>

                <div className={styles.infoCard}>
                  <h4>📧 Notificaciones</h4>
                  <p>Recibirás un email de confirmación cuando el pago se complete exitosamente.</p>
                </div>

                <div className={styles.infoCard}>
                  <h4>🔒 Seguridad</h4>
                  <p>Tu información está protegida con encriptación de nivel bancario.</p>
                </div>
              </div>
            </div>

            <div className={styles.support}>
              <h3>¿Tienes Dudas?</h3>
              <p>
                Si el proceso toma más tiempo del esperado, contacta a nuestro equipo:
              </p>
              <div className={styles.contactInfo}>
                <p>📧 Email: <a href="mailto:soporte@lozanonahuel.com">soporte@lozanonahuel.com</a></p>
                <p>💬 WhatsApp: <a href="https://wa.me/5491112345678">+54 9 11 1234-5678</a></p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PaymentPendingPage; 