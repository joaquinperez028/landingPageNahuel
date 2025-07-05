import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import styles from './PortfolioTimeRange.module.css';

interface TimeRangeOption {
  value: string;
  label: string;
  days: number;
  description: string;
}

interface PortfolioTimeRangeProps {
  selectedRange: string;
  onRangeChange: (range: string, days: number) => void;
  data?: any[];
  loading?: boolean;
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
  onRangeChange,
  data = [],
  loading = false
}) => {
  const [currentData, setCurrentData] = useState<any[]>([]);
  
  useEffect(() => {
    if (data && data.length > 0) {
      const selectedOption = timeRangeOptions.find(opt => opt.value === selectedRange);
      if (selectedOption) {
        // Filtrar datos según el rango seleccionado
        const filteredData = filterDataByRange(data, selectedOption.days);
        setCurrentData(filteredData);
      }
    }
  }, [data, selectedRange]);

  const filterDataByRange = (data: any[], days: number) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  };

  const calculatePerformance = () => {
    if (currentData.length === 0) return { change: 0, percentage: 0 };
    
    const firstValue = currentData[0]?.value || 0;
    const lastValue = currentData[currentData.length - 1]?.value || 0;
    
    const change = lastValue - firstValue;
    const percentage = firstValue ? (change / firstValue) * 100 : 0;
    
    return { change, percentage };
  };

  const performance = calculatePerformance();
  const isPositive = performance.percentage >= 0;

  return (
    <div className={styles.portfolioTimeRange}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>
            <BarChart3 size={20} />
            Evolución del Portafolio
          </h3>
          <p className={styles.subtitle}>
            Selecciona el período para analizar el rendimiento
          </p>
        </div>
        
        <div className={styles.performanceIndicator}>
          <span className={styles.performanceLabel}>Rendimiento:</span>
          <span 
            className={`${styles.performanceValue} ${isPositive ? styles.positive : styles.negative}`}
          >
            {isPositive ? '+' : ''}{performance.percentage.toFixed(2)}%
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
          <span>Cargando datos del portafolio...</span>
        </div>
      )}

      {!loading && currentData.length > 0 && (
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Período:</span>
            <span className={styles.statValue}>
              {timeRangeOptions.find(opt => opt.value === selectedRange)?.label}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Puntos de datos:</span>
            <span className={styles.statValue}>{currentData.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Último update:</span>
            <span className={styles.statValue}>
              {new Date().toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTimeRange; 