import React, { useState } from 'react';
import { Play, Pause, RefreshCw, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAutoPriceUpdate } from '@/hooks/useAutoPriceUpdate';
import { useMarketClose } from '@/hooks/useMarketClose';
import styles from './AutoUpdateController.module.css';

interface AutoUpdateControllerProps {
  className?: string;
  onPriceUpdate?: () => Promise<void>;
  onMarketClose?: () => Promise<void>;
}

/**
 * ✅ NUEVO: Componente para controlar actualizaciones automáticas (alternativa gratuita a cron jobs)
 * 
 * Características:
 * - Control de actualización de precios cada 10 minutos
 * - Control de monitoreo de cierre de mercado
 * - Interfaz visual para el usuario
 * - Persistencia en localStorage
 */
const AutoUpdateController: React.FC<AutoUpdateControllerProps> = ({
  className = '',
  onPriceUpdate,
  onMarketClose
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ✅ NUEVO: Hook para actualización automática de precios
  const {
    isActive: isPriceUpdateActive,
    lastUpdate: lastPriceUpdate,
    nextUpdate: nextPriceUpdate,
    startAutoUpdate: startPriceUpdate,
    stopAutoUpdate: stopPriceUpdate,
    forceUpdate: forcePriceUpdate,
    error: priceUpdateError
  } = useAutoPriceUpdate(
    onPriceUpdate || (async () => {
      console.log('🔄 Función de actualización de precios no configurada');
    }),
    10 // 10 minutos
  );

  // ✅ NUEVO: Hook para monitoreo de cierre de mercado
  const {
    isMarketOpen,
    timeUntilClose,
    lastCloseCheck,
    nextCloseCheck,
    startMarketMonitoring,
    stopMarketMonitoring,
    forceCloseCheck,
    error: marketCloseError
  } = useMarketClose(
    onMarketClose || (async () => {
      console.log('🔔 Función de cierre de mercado no configurada');
    }),
    5 // 5 minutos
  );

  // ✅ NUEVO: Formatear fecha para mostrar
  const formatTime = (date: Date | null): string => {
    if (!date) return 'Nunca';
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Montevideo'
    });
  };

  // ✅ NUEVO: Formatear tiempo restante
  const formatTimeRemaining = (date: Date | null): string => {
    if (!date) return 'N/A';
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes <= 0) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Clock className={styles.icon} />
          Control de Actualizaciones Automáticas
        </h3>
        <p className={styles.subtitle}>
          Alternativa gratuita a cron jobs - Funciona solo cuando estás en la página
        </p>
      </div>

      {/* ✅ NUEVO: Control de actualización de precios */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>
            📊 Actualización de Precios
          </h4>
          <div className={styles.statusIndicator}>
            {isPriceUpdateActive ? (
              <CheckCircle className={styles.statusIcon} />
            ) : (
              <AlertTriangle className={styles.statusIcon} />
            )}
            <span className={styles.statusText}>
              {isPriceUpdateActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className={styles.controls}>
          <button
            onClick={startPriceUpdate}
            disabled={isPriceUpdateActive}
            className={`${styles.button} ${styles.startButton}`}
          >
            <Play className={styles.buttonIcon} />
            Iniciar (cada 10 min)
          </button>

          <button
            onClick={stopPriceUpdate}
            disabled={!isPriceUpdateActive}
            className={`${styles.button} ${styles.stopButton}`}
          >
            <Pause className={styles.buttonIcon} />
            Detener
          </button>

          <button
            onClick={forcePriceUpdate}
            className={`${styles.button} ${styles.forceButton}`}
          >
            <RefreshCw className={styles.buttonIcon} />
            Actualizar Ahora
          </button>
        </div>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Última actualización:</span>
            <span className={styles.infoValue}>
              {formatTime(lastPriceUpdate)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Próxima actualización:</span>
            <span className={styles.infoValue}>
              {isPriceUpdateActive ? formatTimeRemaining(nextPriceUpdate) : 'N/A'}
            </span>
          </div>
        </div>

        {priceUpdateError && (
          <div className={styles.error}>
            <AlertTriangle className={styles.errorIcon} />
            {priceUpdateError}
          </div>
        )}
      </div>

      {/* ✅ NUEVO: Control de monitoreo de mercado */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>
            🕐 Monitoreo de Cierre de Mercado
          </h4>
          <div className={styles.marketStatus}>
            <span className={`${styles.marketIndicator} ${isMarketOpen ? styles.open : styles.closed}`}>
              {isMarketOpen ? '🟢 Abierto' : '🔴 Cerrado'}
            </span>
            {isMarketOpen && (
              <span className={styles.timeUntilClose}>
                Cierra en: {timeUntilClose}
              </span>
            )}
          </div>
        </div>

        <div className={styles.controls}>
          <button
            onClick={startMarketMonitoring}
            className={`${styles.button} ${styles.startButton}`}
          >
            <Play className={styles.buttonIcon} />
            Iniciar Monitoreo
          </button>

          <button
            onClick={forceCloseCheck}
            className={`${styles.button} ${styles.forceButton}`}
          >
            <RefreshCw className={styles.buttonIcon} />
            Verificar Ahora
          </button>
        </div>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Última verificación:</span>
            <span className={styles.infoValue}>
              {formatTime(lastCloseCheck)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Próxima verificación:</span>
            <span className={styles.infoValue}>
              {formatTimeRemaining(nextCloseCheck)}
            </span>
          </div>
        </div>

        {marketCloseError && (
          <div className={styles.error}>
            <AlertTriangle className={styles.errorIcon} />
            {marketCloseError}
          </div>
        )}
      </div>

      {/* ✅ NUEVO: Información adicional */}
      <div className={styles.footer}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={styles.advancedToggle}
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Información Técnica
        </button>

        {showAdvanced && (
          <div className={styles.advancedInfo}>
            <h5>📋 Detalles Técnicos:</h5>
            <ul>
              <li>✅ <strong>setInterval</strong> en lugar de cron jobs</li>
              <li>✅ <strong>localStorage</strong> para persistencia</li>
              <li>✅ <strong>visibilitychange</strong> para optimización</li>
              <li>✅ <strong>Reintentos automáticos</strong> en caso de error</li>
              <li>✅ <strong>Zona horaria</strong> America/Montevideo</li>
              <li>✅ <strong>Días hábiles</strong> (lunes a viernes)</li>
              <li>✅ <strong>Horario de mercado</strong> 9:00 - 17:30</li>
            </ul>
            
            <div className={styles.note}>
              <strong>⚠️ Nota:</strong> Las actualizaciones solo funcionan cuando el usuario está en la página.
              Para actualizaciones 24/7, considera usar servicios externos gratuitos como:
              <ul>
                <li>• <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer">cron-job.org</a></li>
                <li>• <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer">UptimeRobot</a></li>
                <li>• <a href="https://easycron.com" target="_blank" rel="noopener noreferrer">EasyCron</a></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoUpdateController; 