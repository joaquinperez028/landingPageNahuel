import React from 'react';
import { useRouter } from 'next/router';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/PaymentFailure.module.css';

export default function PaymentFailure() {
  const router = useRouter();
  const { reference, error } = router.query;

  return (
    <>
      <Head>
        <title>Pago Fallido - Nahuel Lozano</title>
        <meta name="description" content="Hubo un problema con tu pago" />
      </Head>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <XCircle className={styles.errorIcon} />
          </div>
          
          <h1 className={styles.title}>Pago No Completado</h1>
          
          <p className={styles.message}>
            Hubo un problema al procesar tu pago. No te preocupes, no se ha cobrado nada.
          </p>

          {error && (
            <div className={styles.errorDetails}>
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          <div className={styles.actions}>
            <button 
              onClick={() => window.history.back()} 
              className={styles.primaryButton}
            >
              <RefreshCw size={20} />
              Intentar Nuevamente
            </button>
            
            <Link href="/" className={styles.secondaryButton}>
              <Home size={20} />
              Volver al Inicio
            </Link>
          </div>

          <div className={styles.help}>
            <h3>¿Necesitas ayuda?</h3>
            <ul>
              <li>Verifica que tu tarjeta tenga fondos suficientes</li>
              <li>Asegúrate de que los datos sean correctos</li>
              <li>Intenta con otro método de pago</li>
              <li>Contacta a soporte si el problema persiste</li>
            </ul>
            
            <div className={styles.support}>
              <HelpCircle size={16} />
              <span>Soporte: soporte@lozanonahuel.com</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 