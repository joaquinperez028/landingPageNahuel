import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import styles from '@/styles/Auth.module.css';

interface AuthErrorProps {
  error?: string;
}

const AuthError: React.FC<AuthErrorProps> = () => {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (error: string | string[] | undefined) => {
    if (typeof error !== 'string') return 'Error de autenticación desconocido';
    
    switch (error) {
      case 'Configuration':
        return 'Error de configuración del proveedor de autenticación';
      case 'AccessDenied':
        return 'Acceso denegado. Verifica tus permisos.';
      case 'Verification':
        return 'Error de verificación. El token pudo haber expirado.';
      case 'Default':
        return 'Error de autenticación. Intenta nuevamente.';
      case 'ClientError':
        return 'Error en el cliente de autenticación';
      default:
        return 'Error de autenticación. Intenta nuevamente.';
    }
  };

  const handleRetry = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Error de Autenticación | Nahuel Lozano</title>
        <meta name="description" content="Error de autenticación" />
      </Head>

      <div className={styles.authErrorContainer}>
        <motion.div
          className={styles.errorCard}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.errorIcon}>
            <AlertTriangle size={64} />
          </div>
          
          <h1 className={styles.errorTitle}>
            Error de Autenticación
          </h1>
          
          <p className={styles.errorMessage}>
            {getErrorMessage(error)}
          </p>
          
          <div className={styles.errorActions}>
            <button 
              onClick={handleRetry}
              className={styles.retryButton}
            >
              <RefreshCw size={20} />
              Intentar Nuevamente
            </button>
            
            <Link href="/" className={styles.homeButton}>
              <Home size={20} />
              Volver al Inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AuthError; 