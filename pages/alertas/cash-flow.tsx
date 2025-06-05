import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import VideoPlayerMux from '../../components/VideoPlayerMux';
// import { FiDownload, FiFileText, FiTrendingUp, FiDollarSign, FiBarChart3, FiTarget, FiUsers, FiMessageSquare, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import styles from '../../styles/CashFlow.module.css';

interface CashFlowPageProps {
  isSubscribed: boolean;
  user: any;
}

interface HistoricalAlert {
  id: string;
  date: string;
  symbol: string;
  type: 'DIVIDENDO' | 'BONO' | 'REIT' | 'ACCION';
  yield: number;
  recommendation: string;
  status: 'ACTIVA' | 'COMPLETADA' | 'CANCELADA';
  returnPct: number;
}

const mockHistoricalAlerts: HistoricalAlert[] = [
  {
    id: '1',
    date: '2024-01-15',
    symbol: 'REALTY INCOME (O)',
    type: 'REIT',
    yield: 5.8,
    recommendation: 'Compra para dividendo mensual',
    status: 'ACTIVA',
    returnPct: 12.3
  },
  {
    id: '2',
    date: '2024-01-10',
    symbol: 'COCA-COLA (KO)',
    type: 'DIVIDENDO',
    yield: 3.2,
    recommendation: 'Acumulación gradual',
    status: 'COMPLETADA',
    returnPct: 8.7
  },
  {
    id: '3',
    date: '2024-01-05',
    symbol: 'APPLE (AAPL)',
    type: 'ACCION',
    yield: 0.5,
    recommendation: 'Buy back program',
    status: 'COMPLETADA',
    returnPct: 15.4
  }
];

const mockMetrics = {
  totalAlerts: 89,
  avgYield: 4.8,
  successRate: 87.6,
  totalReturn: 23.4
};

export default function CashFlowPage({ isSubscribed, user }: CashFlowPageProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const exportData = (format: 'pdf' | 'csv') => {
    console.log(`Exportando datos en formato ${format}`);
  };

  // Vista para no suscriptores
  if (!isSubscribed) {
    return (
      <>
        <Head>
          <title>Cash Flow - Alertas de Inversión | Nahuel Lozano</title>
          <meta name="description" content="Alertas especializadas en generación de cash flow: dividendos, REITs, bonos y estrategias de ingresos pasivos." />
        </Head>
        <Navbar />
        
        <main className={styles.main}>
          {/* Hero Section */}
          <section className={styles.hero}>
            <div className="container">
              <div className={styles.heroContent}>
                <div className={styles.heroText}>
                  <h1 className={styles.heroTitle}>Cash Flow Alerts</h1>
                  <p className={styles.heroSubtitle}>
                    Alertas especializadas en activos generadores de ingresos pasivos. 
                    Dividendos, REITs, bonos y estrategias para maximizar tu cash flow mensual.
                  </p>
                  <div className={styles.heroActions}>
                    <Link href="/subscription" className="btn btn-primary btn-lg">
                      Suscribirse Ahora
                    </Link>
                    <Link href="/alertas" className="btn btn-outline btn-lg">
                      Ver Todos los Servicios
                    </Link>
                  </div>
                </div>
                <div className={styles.heroVideo}>
                  <VideoPlayerMux 
                    playbackId="ejemplo-cash-flow"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Section */}
          <section className={styles.metrics}>
            <div className="container">
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricNumber}>{mockMetrics.totalAlerts}</div>
                  <div className={styles.metricLabel}>Alertas Enviadas</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricNumber}>{mockMetrics.avgYield}%</div>
                  <div className={styles.metricLabel}>Yield Promedio</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricNumber}>{mockMetrics.successRate}%</div>
                  <div className={styles.metricLabel}>Tasa de Éxito</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricNumber}>{mockMetrics.totalReturn}%</div>
                  <div className={styles.metricLabel}>Retorno Total</div>
                </div>
              </div>
            </div>
          </section>

          {/* Historical Alerts */}
          <section className={styles.historical}>
            <div className="container">
              <div className={styles.historicalContent}>
                <h2 className={styles.historicalTitle}>Historial de Alertas</h2>
                <p className={styles.historicalDescription}>
                  Revisa el desempeño histórico de nuestras alertas de cash flow y 
                  las oportunidades de inversión que hemos identificado.
                </p>
              </div>

              <div className={styles.exportActions}>
                <button onClick={() => exportData('pdf')} className={styles.exportButton}>
                  Exportar PDF
                </button>
                <button onClick={() => exportData('csv')} className={styles.exportButton}>
                  Exportar CSV
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th>Fecha</th>
                      <th>Símbolo</th>
                      <th>Tipo</th>
                      <th>Yield %</th>
                      <th>Estado</th>
                      <th>Retorno %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockHistoricalAlerts.map((alert) => (
                      <tr key={alert.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>{alert.date}</td>
                        <td className={styles.tableCell}>{alert.symbol}</td>
                        <td className={styles.tableCell}>{alert.type}</td>
                        <td className={styles.tableCell}>{alert.yield}%</td>
                        <td className={styles.statusCell}>
                          <span className={`${styles.status} ${
                            alert.status === 'COMPLETADA' ? styles.statusSuccess :
                            alert.status === 'ACTIVA' ? styles.statusPending :
                            styles.statusError
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className={styles.tableCell}>{alert.returnPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Examples Carousel */}
          <section className={styles.examples}>
            <div className="container">
              <h2 className={styles.examplesTitle}>Ejemplos de Alertas Exitosas</h2>
              <div className={styles.carousel}>
                <div className={styles.carouselSlide}>
                  <h3 className={styles.slideTitle}>REIT - Realty Income (O)</h3>
                  <p className={styles.slideDescription}>
                    Alerta de acumulación en REIT con dividendos mensuales. 
                    Yield del 5.8% con crecimiento sostenido durante 25 años.
                  </p>
                  <div className={styles.slideResult}>
                    +12.3% en 6 meses
                  </div>
                </div>
                <div className={styles.carouselSlide}>
                  <h3 className={styles.slideTitle}>Dividend King - Coca Cola</h3>
                  <p className={styles.slideDescription}>
                    Estrategia de acumulación gradual en dividend aristocrat. 
                    59 años consecutivos aumentando dividendos.
                  </p>
                  <div className={styles.slideResult}>
                    +8.7% + dividendos
                  </div>
                </div>
                <div className={styles.carouselSlide}>
                  <h3 className={styles.slideTitle}>Buy Back Program - Apple</h3>
                  <p className={styles.slideDescription}>
                    Aprovechamiento de programa de recompra masiva de acciones 
                    durante caída temporal del precio.
                  </p>
                  <div className={styles.slideResult}>
                    +15.4% en 4 meses
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Subscription CTA */}
          <section className={styles.subscriptionCta}>
            <div className="container">
              <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>
                  Comienza a Generar Cash Flow Pasivo
                </h2>
                <p className={styles.ctaDescription}>
                  Únete a nuestros suscriptores y recibe alertas especializadas 
                  en activos generadores de ingresos pasivos.
                </p>
                <Link href="/subscription" className={styles.ctaButton}>
                  Suscribirse por $47/mes
                </Link>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  // Vista para suscriptores
  return (
    <>
      <Head>
        <title>Panel Cash Flow | Nahuel Lozano</title>
        <meta name="description" content="Panel de suscriptor para alertas de cash flow y generación de ingresos pasivos." />
      </Head>
      <Navbar />
      
      <main className={styles.main}>
        {/* Header */}
        <section className={styles.content}>
          <div className="container">
            <h1>Panel Cash Flow</h1>
            <p>Bienvenido a tu panel de alertas de cash flow, {user?.name}</p>
          </div>
        </section>

        {/* Dashboard */}
        <section className={styles.dashboard}>
          <div className="container">
            <div className={styles.dashboardTabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Panel
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'alerts' ? styles.active : ''}`}
                onClick={() => setActiveTab('alerts')}
              >
                Mis Alertas
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'portfolio' ? styles.active : ''}`}
                onClick={() => setActiveTab('portfolio')}
              >
                Cartera
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'reports' ? styles.active : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                Reportes
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'community' ? styles.active : ''}`}
                onClick={() => setActiveTab('community')}
              >
                Comunidad
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'dashboard' && (
                <div className={styles.chartsGrid}>
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Cash Flow Mensual</h3>
                    <div className={styles.chartPlaceholder}>
                      Gráfico de ingresos pasivos mensuales
                    </div>
                  </div>
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Distribución por Sectores</h3>
                    <div className={styles.chartPlaceholder}>
                      Gráfico de sectores (REITs, Dividendos, Bonos)
                    </div>
                  </div>
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Yield Histórico</h3>
                    <div className={styles.chartPlaceholder}>
                      Evolución del rendimiento de la cartera
                    </div>
                  </div>
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Rendimiento vs S&P 500</h3>
                    <div className={styles.chartPlaceholder}>
                      Comparación de rendimiento
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'alerts' && (
                <div>
                  <h3>Alertas Activas de Cash Flow</h3>
                  <p>Aquí aparecerán tus alertas personalizadas de generación de cash flow.</p>
                </div>
              )}
              
              {activeTab === 'portfolio' && (
                <div>
                  <h3>Mi Cartera de Cash Flow</h3>
                  <p>Seguimiento de tus inversiones en activos generadores de ingresos pasivos.</p>
                </div>
              )}
              
              {activeTab === 'reports' && (
                <div>
                  <h3>Reportes de Cash Flow</h3>
                                      <p>Reportes detallados de rendimiento y generación de ingresos.</p>
                </div>
              )}
              
              {activeTab === 'community' && (
                <div>
                  <h3>Comunidad Cash Flow</h3>
                  <p>Conecta con otros inversores enfocados en ingresos pasivos.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  // Mock subscription status - en producción esto vendría de la base de datos
  const isSubscribed = session?.user ? true : false;
  
  return {
    props: {
      isSubscribed,
      user: session?.user || null,
    },
  };
}; 