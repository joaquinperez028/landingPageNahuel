import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import styles from './ActiveAlertsPieChart.module.css';

// ✅ NUEVO: Importación condicional de recharts para evitar errores si no está instalado
let PieChart: any, Pie: any, Cell: any, ResponsiveContainer: any, Tooltip: any, Legend: any;

try {
  const recharts = require('recharts');
  PieChart = recharts.PieChart;
  Pie = recharts.Pie;
  Cell = recharts.Cell;
  ResponsiveContainer = recharts.ResponsiveContainer;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
} catch (error) {
  console.warn('Recharts no está instalado, el gráfico no se mostrará');
}

interface AlertData {
  id: string;
  symbol: string;
  profit: number;
  status: string;
  action: 'BUY' | 'SELL';
  tipo: 'TraderCall' | 'SmartMoney' | 'CashFlow';
  entryPriceRange: {
    min: number;
    max: number;
  };
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
}

interface ActiveAlertsPieChartProps {
  alerts: AlertData[];
  className?: string;
}

interface ChartSegment {
  name: string;
  value: number;
  symbol: string;
  profit: number;
  action: string;
  tipo: string;
  color: string;
  darkColor: string;
}

const ActiveAlertsPieChart: React.FC<ActiveAlertsPieChartProps> = ({ 
  alerts, 
  className = '' 
}) => {
  const [chartData, setChartData] = useState<ChartSegment[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // ✅ NUEVO: Paleta de colores dinámicos para cada alerta
  const colorPalette = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#A855F7', '#EAB308', '#22C55E'
  ];

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      // ✅ NUEVO: Filtrar solo alertas activas
      const activeAlerts = alerts.filter(alert => alert.status === 'ACTIVE');
      
      if (activeAlerts.length === 0) {
        setChartData([]);
        return;
      }

      // ✅ NUEVO: Preparar datos para el gráfico de torta
      const chartSegments = activeAlerts.map((alert, index) => {
        const profitValue = Math.abs(alert.profit || 0);
        return {
          name: alert.symbol,
          value: profitValue > 0 ? profitValue : 1, // Mínimo valor para visualización
          symbol: alert.symbol,
          profit: alert.profit || 0,
          action: alert.action,
          tipo: alert.tipo,
          color: colorPalette[index % colorPalette.length],
          darkColor: colorPalette[index % colorPalette.length] + '80'
        };
      });

      setChartData(chartSegments);
    } else {
      setChartData([]);
    }
  }, [alerts]);

  // ✅ NUEVO: Calcular estadísticas del portfolio
  const portfolioStats = React.useMemo(() => {
    if (chartData.length === 0) return null;

    const totalProfit = chartData.reduce((sum, segment) => sum + segment.profit, 0);
    const positiveAlerts = chartData.filter(segment => segment.profit > 0).length;
    const negativeAlerts = chartData.filter(segment => segment.profit < 0).length;
    const avgProfit = totalProfit / chartData.length;
    const winRate = (positiveAlerts / chartData.length) * 100;

    return {
      totalProfit,
      positiveAlerts,
      negativeAlerts,
      avgProfit,
      winRate,
      totalAlerts: chartData.length
    };
  }, [chartData]);

  // ✅ NUEVO: Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // ✅ NUEVO: Formatear porcentaje
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // ✅ NUEVO: Obtener color del profit
  const getProfitColor = (profit: number) => {
    if (profit > 0) return '#10b981';
    if (profit < 0) return '#ef4444';
    return '#6b7280';
  };

  // ✅ NUEVO: Custom tooltip para el gráfico
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartSegment;
      return (
        <div className={styles.tooltip}>
          <h4 className={styles.tooltipTitle}>{data.symbol}</h4>
          <div className={styles.tooltipContent}>
            <p><strong>Acción:</strong> {data.action}</p>
            <p><strong>Tipo:</strong> {data.tipo}</p>
            <p><strong>Profit:</strong> 
              <span style={{ color: getProfitColor(data.profit) }}>
                {formatPercentage(data.profit)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // ✅ NUEVO: Custom legend
  const CustomLegend = ({ payload }: { payload?: any[] }) => {
    if (!payload) return null;
    
    return (
      <div className={styles.legend}>
        {payload.map((entry: any, index: number) => {
          const data = entry.payload as ChartSegment;
          return (
            <div 
              key={entry.value}
              className={styles.legendItem}
              onMouseEnter={() => setHoveredSegment(data.symbol)}
              onMouseLeave={() => setHoveredSegment(null)}
              style={{
                opacity: hoveredSegment && hoveredSegment !== data.symbol ? 0.3 : 1
              }}
            >
              <div 
                className={styles.legendColor} 
                style={{ backgroundColor: data.color }}
              />
              <span className={styles.legendText}>
                {data.symbol} ({formatPercentage(data.profit)})
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // ✅ NUEVO: Verificar si recharts está disponible
  if (!PieChart || !Pie || !Cell || !ResponsiveContainer) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <PieChart size={20} />
            Gráfico de Alertas Activas
          </h3>
          <p className={styles.subtitle}>
            Solo alertas con estado ACTIVO
          </p>
        </div>
        
        <div className={styles.emptyState}>
          <Info size={48} />
          <h4 className={styles.emptyTitle}>Recharts no está instalado</h4>
          <p className={styles.emptyText}>
            Para mostrar el gráfico, instala la dependencia: npm install recharts
          </p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <PieChart size={20} />
            Gráfico de Alertas Activas
          </h3>
          <p className={styles.subtitle}>
            Solo alertas con estado ACTIVO
          </p>
        </div>
        
        <div className={styles.emptyState}>
          <Info size={48} />
          <h4 className={styles.emptyTitle}>No hay alertas activas</h4>
          <p className={styles.emptyText}>
            Actualmente no hay alertas activas para mostrar en el gráfico.
          </p>
          <p className={styles.emptySubtext}>
            Las alertas aparecerán aquí cuando se creen y mantengan estado ACTIVO.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <PieChart size={20} />
          Gráfico de Alertas Activas
        </h3>
        <p className={styles.subtitle}>
          Solo alertas con estado ACTIVO - {chartData.length} alertas
        </p>
      </div>

      {/* ✅ NUEVO: Estadísticas del portfolio */}
      {portfolioStats && (
        <div className={styles.portfolioStats}>
          <div className={styles.statRow}>
            <div className={styles.statItem}>
              <DollarSign size={16} />
              <span className={styles.statLabel}>Total Alertas:</span>
              <span className={styles.statValue}>{portfolioStats.totalAlerts}</span>
            </div>
            <div className={styles.statItem}>
              <TrendingUp size={16} />
              <span className={styles.statLabel}>Profit Total:</span>
              <span 
                className={styles.statValue}
                style={{ color: getProfitColor(portfolioStats.totalProfit) }}
              >
                {formatPercentage(portfolioStats.totalProfit)}
              </span>
            </div>
          </div>
          
          <div className={styles.statRow}>
            <div className={styles.statItem}>
              <div className={styles.statIcon} style={{ color: '#10b981' }}>📈</div>
              <span className={styles.statLabel}>Ganadoras:</span>
              <span className={styles.statValue} style={{ color: '#10b981' }}>
                {portfolioStats.positiveAlerts}
              </span>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon} style={{ color: '#ef4444' }}>📉</div>
              <span className={styles.statLabel}>Perdedoras:</span>
              <span className={styles.statValue} style={{ color: '#ef4444' }}>
                {portfolioStats.negativeAlerts}
              </span>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon} style={{ color: '#8b5cf6' }}>🎯</div>
              <span className={styles.statLabel}>Win Rate:</span>
              <span className={styles.statValue} style={{ color: '#8b5cf6' }}>
                {portfolioStats.winRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NUEVO: Gráfico de torta responsivo */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name: string; percent: number }) => 
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={(data: ChartSegment) => setHoveredSegment(data.symbol)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={entry.darkColor}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ NUEVO: Información adicional */}
      <div className={styles.additionalInfo}>
        <div className={styles.infoItem}>
          <AlertTriangle size={14} />
          <span>
            <strong>Nota:</strong> Solo se muestran alertas con estado ACTIVO.
          </span>
        </div>
        <div className={styles.infoItem}>
          <Info size={14} />
          <span>
            El tamaño de cada segmento representa el profit relativo de la alerta.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActiveAlertsPieChart; 