import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import styles from './SPY500Indicator.module.css';

interface SPY500Data {
  currentPrice: number;
  yearStartPrice: number;
  yearChange: number;
  yearChangePercent: number;
  lastUpdate: string;
  volume: string;
  marketCap: string;
}

const SPY500Indicator: React.FC = () => {
  const [spyData, setSpyData] = useState<SPY500Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSPY500Data();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchSPY500Data, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSPY500Data = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/market-data/spy500');
      if (!response.ok) {
        throw new Error('Error al obtener datos del SPY500');
      }
      
      const data = await response.json();
      setSpyData(data);
    } catch (err) {
      console.error('Error fetching SPY500 data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Datos de fallback para desarrollo
      setSpyData({
        currentPrice: 478.50,
        yearStartPrice: 415.26,
        yearChange: 63.24,
        yearChangePercent: 15.23,
        lastUpdate: new Date().toISOString(),
        volume: '67.8M',
        marketCap: '$43.2T'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchSPY500Data();
  };

  if (loading) {
    return (
      <div className={styles.spyIndicator}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <span>Cargando SPY500...</span>
        </div>
      </div>
    );
  }

  if (error && !spyData) {
    return (
      <div className={styles.spyIndicator}>
        <div className={styles.errorContent}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>Error: {error}</span>
          <button onClick={refreshData} className={styles.retryButton}>
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!spyData) return null;

  const isPositive = spyData.yearChangePercent >= 0;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.spyIndicator}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            <BarChart3 size={18} />
            SPY500
          </h3>
          <span className={styles.subtitle}>S&P 500 Index</span>
        </div>
        
        <button 
          onClick={refreshData}
          className={styles.refreshButton}
          disabled={loading}
          title="Actualizar datos"
        >
          <RefreshCw size={16} className={loading ? styles.spinning : ''} />
        </button>
      </div>

      <div className={styles.mainMetrics}>
        <div className={styles.currentPrice}>
          <span className={styles.priceLabel}>Precio actual:</span>
          <span className={styles.priceValue}>${spyData.currentPrice.toFixed(2)}</span>
        </div>

        <div className={styles.yearPerformance}>
          <div className={styles.performanceHeader}>
            <span className={styles.performanceLabel}>Variación anual:</span>
            <div className={styles.performanceIcon}>
              {isPositive ? (
                <TrendingUp size={20} className={styles.positive} />
              ) : (
                <TrendingDown size={20} className={styles.negative} />
              )}
            </div>
          </div>
          
          <div className={styles.performanceValues}>
            <span className={`${styles.percentageChange} ${isPositive ? styles.positive : styles.negative}`}>
              {isPositive ? '+' : ''}{spyData.yearChangePercent.toFixed(2)}%
            </span>
            <span className={styles.absoluteChange}>
              {isPositive ? '+' : ''}${spyData.yearChange.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.additionalInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Volumen:</span>
          <span className={styles.infoValue}>{spyData.volume}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Cap. Mercado:</span>
          <span className={styles.infoValue}>{spyData.marketCap}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.lastUpdate}>
          Última actualización: {formatDate(spyData.lastUpdate)}
        </span>
        {error && (
          <span className={styles.errorIndicator} title={error}>
            ⚠️ Datos simulados
          </span>
        )}
      </div>
    </div>
  );
};

export default SPY500Indicator; 