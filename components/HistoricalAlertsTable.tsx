import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, MapPin, DollarSign, Percent } from 'lucide-react';
import styles from '@/styles/HistoricalAlertsTable.module.css';

interface HistoricalAlert {
  date: string;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
  country: string;
  ticker: string;
  entryPrice: string;
  currentPrice: string;
  takeProfit1: string;
  takeProfit2?: string;
  stopLoss?: string;
  div?: string;
  exitPrice: string;
  profitPercentage: string;
}

interface HistoricalAlertsTableProps {
  alerts: HistoricalAlert[];
  maxItems?: number;
}

const HistoricalAlertsTable: React.FC<HistoricalAlertsTableProps> = ({ 
  alerts, 
  maxItems = 10 
}) => {
  const displayedAlerts = alerts.slice(0, maxItems);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'BAJO': return '#10b981';
      case 'MEDIO': return '#f59e0b';
      case 'ALTO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CERRADO TP1': return '#10b981';
      case 'CERRADO TP1 Y SL': return '#059669';
      case 'CERRADO SL': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CERRADO TP1':
      case 'CERRADO TP1 Y SL':
        return <TrendingUp size={16} />;
      case 'CERRADO SL':
        return <TrendingDown size={16} />;
      default:
        return <DollarSign size={16} />;
    }
  };

  const getProfitColor = (percentage: string) => {
    const isPositive = percentage.startsWith('+');
    return isPositive ? '#10b981' : '#ef4444';
  };

  if (displayedAlerts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay alertas históricas disponibles</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {/* Mobile Cards View */}
      <div className={styles.mobileView}>
        {displayedAlerts.map((alert, index) => (
          <motion.div
            key={index}
            className={styles.alertCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <div className={styles.tickerInfo}>
                  <span className={styles.ticker}>{alert.ticker}</span>
                  <div className={styles.location}>
                    <MapPin size={14} />
                    <span>{alert.country}</span>
                  </div>
                </div>
                <div className={styles.cardBadges}>
                  <span 
                    className={styles.riskBadge}
                    style={{ backgroundColor: getRiskColor(alert.riskLevel) }}
                  >
                    {alert.riskLevel}
                  </span>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(alert.status) }}
                  >
                    {getStatusIcon(alert.status)}
                    {alert.status}
                  </span>
                </div>
              </div>
              <div className={styles.dateInfo}>
                <Calendar size={14} />
                <span>{alert.date}</span>
              </div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.priceGrid}>
                <div className={styles.priceItem}>
                  <span className={styles.priceLabel}>P. Entrada</span>
                  <span className={styles.priceValue}>{alert.entryPrice}</span>
                </div>
                <div className={styles.priceItem}>
                  <span className={styles.priceLabel}>P. Actual</span>
                  <span className={styles.priceValue}>{alert.currentPrice}</span>
                </div>
                <div className={styles.priceItem}>
                  <span className={styles.priceLabel}>Take Profit 1</span>
                  <span className={styles.priceValue}>{alert.takeProfit1}</span>
                </div>
                {alert.takeProfit2 && (
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Take Profit 2</span>
                    <span className={styles.priceValue}>{alert.takeProfit2}</span>
                  </div>
                )}
                {alert.stopLoss && (
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Stop Loss</span>
                    <span className={styles.priceValue}>{alert.stopLoss}</span>
                  </div>
                )}
                {alert.div && (
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>$ Div</span>
                    <span className={styles.priceValue}>{alert.div}</span>
                  </div>
                )}
                <div className={styles.priceItem}>
                  <span className={styles.priceLabel}>P. Salida</span>
                  <span className={styles.priceValue}>{alert.exitPrice}</span>
                </div>
              </div>

              <div className={styles.profitSection}>
                <Percent size={16} />
                <span 
                  className={styles.profitValue}
                  style={{ color: getProfitColor(alert.profitPercentage) }}
                >
                  {alert.profitPercentage}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className={styles.desktopView}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>F. de Entrada</th>
                <th>Riesgo</th>
                <th>Status</th>
                <th>País de Origen</th>
                <th>Ticker</th>
                <th>P. de Entrada</th>
                <th>P. Actual</th>
                <th>Take Profit 1</th>
                <th>Take Profit 2</th>
                <th>Stop Loss</th>
                <th>$ Div</th>
                <th>P. de Salida</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {displayedAlerts.map((alert, index) => (
                <motion.tr
                  key={index}
                  className={styles.tableRow}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className={styles.dateCell}>
                    <div className={styles.dateContent}>
                      <Calendar size={14} />
                      {alert.date}
                    </div>
                  </td>
                  <td>
                    <span 
                      className={styles.riskBadge}
                      style={{ backgroundColor: getRiskColor(alert.riskLevel) }}
                    >
                      {alert.riskLevel}
                    </span>
                  </td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(alert.status) }}
                    >
                      {getStatusIcon(alert.status)}
                      {alert.status}
                    </span>
                  </td>
                  <td className={styles.countryCell}>
                    <div className={styles.countryContent}>
                      <MapPin size={14} />
                      {alert.country}
                    </div>
                  </td>
                  <td>
                    <span className={styles.tickerCell}>{alert.ticker}</span>
                  </td>
                  <td className={styles.priceCell}>{alert.entryPrice}</td>
                  <td className={styles.priceCell}>{alert.currentPrice}</td>
                  <td className={styles.priceCell}>{alert.takeProfit1}</td>
                  <td className={styles.priceCell}>{alert.takeProfit2 || '-'}</td>
                  <td className={styles.priceCell}>{alert.stopLoss || '-'}</td>
                  <td className={styles.priceCell}>{alert.div || '-'}</td>
                  <td className={styles.priceCell}>{alert.exitPrice}</td>
                  <td className={styles.profitCell}>
                    <span 
                      className={styles.profitPercentage}
                      style={{ color: getProfitColor(alert.profitPercentage) }}
                    >
                      {alert.profitPercentage}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoricalAlertsTable;
