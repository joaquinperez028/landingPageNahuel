import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, BarChart3, DollarSign, Target, Percent } from 'lucide-react';
import styles from './PortfolioTimeRange.module.css';

interface TimeRangeOption {
  value: string;
  label: string;
  days: number;
  description: string;
}

interface PortfolioData {
  date: string;
  value: number;
  profit: number;
  alertsCount: number;
}

interface PortfolioStats {
  totalProfit: number;
  totalAlerts: number;
  winRate: number;
  avgProfit: number;
}

interface PortfolioTimeRangeProps {
  selectedRange: string;
  onRangeChange: (range: string, days: number) => void;
}

const timeRangeOptions: TimeRangeOption[] = [
  {
    value: '7d',
    label: '7 Días',
    days: 7,
    description: 'Evolución semanal'
  },
  {
    value: '30d',
    label: '30 Días',
    days: 30,
    description: 'Evolución mensual'
  },
  {
    value: '1y',
    label: '1 Año',
    days: 365,
    description: 'Evolución anual'
  }
];

const PortfolioTimeRange: React.FC<PortfolioTimeRangeProps> = ({
  selectedRange,
  onRangeChange
}) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPortfolioData = async (days: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/alerts/portfolio-evolution?days=${days}`);
      const result = await response.json();
      
      if (result.success) {
        setPortfolioData(result.data || []);
        setPortfolioStats(result.stats || null);
      } else {
        setError(result.error || 'Error al cargar datos del portfolio');
      }
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError('Error de conexión al cargar datos del portfolio');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const selectedOption = timeRangeOptions.find(opt => opt.value === selectedRange);
    if (selectedOption) {
      fetchPortfolioData(selectedOption.days);
    }
  }, [selectedRange]);

  const calculatePerformance = () => {
    if (portfolioData.length === 0) return { change: 0, percentage: 0, currentValue: 10000 };
    
    const firstValue = portfolioData[0]?.value || 10000;
    const lastValue = portfolioData[portfolioData.length - 1]?.value || 10000;
    
    const change = lastValue - firstValue;
    const percentage = firstValue ? (change / firstValue) * 100 : 0;
    
    return { change, percentage, currentValue: lastValue };
  };

  const performance = calculatePerformance();
  const isPositive = performance.percentage >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className={styles.portfolioTimeRange}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            <BarChart3 size={20} />
            Evolución del Portafolio Real
          </h3>
          <p className={styles.subtitle}>
            Basado en P&L de todas las alertas creadas
          </p>
        </div>
        
        <div className={styles.performanceIndicator}>
          <span className={styles.performanceLabel}>Rendimiento:</span>
          <span 
            className={`${styles.performanceValue} ${isPositive ? styles.positive : styles.negative}`}
          >
            {formatPercentage(performance.percentage)}
          </span>
        </div>
      </div>

      <div className={styles.rangeSelector}>
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            className={`${styles.rangeButton} ${selectedRange === option.value ? styles.active : ''}`}
            onClick={() => onRangeChange(option.value, option.days)}
            disabled={loading}
          >
            <span className={styles.rangeLabel}>{option.label}</span>
            <span className={styles.rangeDescription}>{option.description}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.loadingIndicator}>
          <div className={styles.loadingSpinner}></div>
          <span>Cargando datos reales del portfolio...</span>
        </div>
      )}

      {error && (
        <div className={styles.errorIndicator}>
          <span className={styles.errorText}>{error}</span>
          <button 
            className={styles.retryButton}
            onClick={() => {
              const selectedOption = timeRangeOptions.find(opt => opt.value === selectedRange);
              if (selectedOption) fetchPortfolioData(selectedOption.days);
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && portfolioData.length > 0 && (
        <>
          {/* Estadísticas principales */}
          <div className={styles.mainStats}>
            <div className={styles.mainStatItem}>
              <DollarSign size={16} />
              <span className={styles.mainStatLabel}>Valor Actual:</span>
              <span className={styles.mainStatValue}>
                {formatCurrency(performance.currentValue)}
              </span>
            </div>
            <div className={styles.mainStatItem}>
              <TrendingUp size={16} />
              <span className={styles.mainStatLabel}>Cambio:</span>
              <span className={`${styles.mainStatValue} ${isPositive ? styles.positive : styles.negative}`}>
                {formatCurrency(performance.change)}
              </span>
            </div>
          </div>

          {/* Estadísticas del período */}
          <div className={styles.summaryStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Período:</span>
              <span className={styles.statValue}>
                {timeRangeOptions.find(opt => opt.value === selectedRange)?.label}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Días con alertas:</span>
              <span className={styles.statValue}>
                {portfolioData.filter(d => d.alertsCount > 0).length}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total alertas:</span>
              <span className={styles.statValue}>
                {portfolioData.reduce((sum, d) => sum + d.alertsCount, 0)}
              </span>
            </div>
          </div>

          {/* Estadísticas generales */}
          {portfolioStats && (
            <div className={styles.globalStats}>
              <h4 className={styles.globalStatsTitle}>
                <Target size={16} />
                Estadísticas Generales
              </h4>
              <div className={styles.globalStatsGrid}>
                <div className={styles.globalStatItem}>
                  <span className={styles.globalStatLabel}>P&L Total:</span>
                  <span className={`${styles.globalStatValue} ${portfolioStats.totalProfit >= 0 ? styles.positive : styles.negative}`}>
                    {formatPercentage(portfolioStats.totalProfit)}
                  </span>
                </div>
                <div className={styles.globalStatItem}>
                  <span className={styles.globalStatLabel}>Total Alertas:</span>
                  <span className={styles.globalStatValue}>
                    {portfolioStats.totalAlerts}
                  </span>
                </div>
                <div className={styles.globalStatItem}>
                  <span className={styles.globalStatLabel}>Win Rate:</span>
                  <span className={`${styles.globalStatValue} ${portfolioStats.winRate >= 50 ? styles.positive : styles.negative}`}>
                    {portfolioStats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className={styles.globalStatItem}>
                  <span className={styles.globalStatLabel}>Profit Promedio:</span>
                  <span className={`${styles.globalStatValue} ${portfolioStats.avgProfit >= 0 ? styles.positive : styles.negative}`}>
                    {formatPercentage(portfolioStats.avgProfit)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.updateInfo}>
            <Percent size={14} />
            <span>Último update: {new Date().toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
        </>
      )}

      {!loading && !error && portfolioData.length === 0 && (
        <div className={styles.noDataIndicator}>
          <BarChart3 size={48} />
          <span className={styles.noDataText}>
            No hay datos de alertas en el período seleccionado
          </span>
          <span className={styles.noDataSubtext}>
            Los datos del portfolio se calcularán automáticamente cuando se creen alertas
          </span>
        </div>
      )}
    </div>
  );
};

export default PortfolioTimeRange; 