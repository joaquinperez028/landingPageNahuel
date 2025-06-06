import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  ExternalLink,
  TrendingUp,
  FileText,
  BookOpen,
  Calculator,
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  Play
} from 'lucide-react';
import styles from '@/styles/Recursos.module.css';

interface RecursosPageProps {
  afiliados: Array<{
    nombre: string;
    descripcion: string;
    url: string;
    icon: string;
  }>;
  indicadores: Array<{
    nombre: string;
    descripcion: string;
    descarga: string;
    icon: string;
  }>;
  planillas: Array<{
    nombre: string;
    descripcion: string;
    url: string;
    icon: string;
  }>;
  libros: Array<{
    nombre: string;
    descripcion: string;
    autor: string;
    url: string;
  }>;
  materialComplementario: Array<{
    nombre: string;
    descripcion: string;
    descarga: string;
    icon: string;
  }>;
  linksImportantes: Array<{
    nombre: string;
    descripcion: string;
    url: string;
    icon: string;
  }>;
  formulasTradingView: Array<{
    nombre: string;
    descripcion: string;
    formula: string;
    icon: string;
  }>;
}

const RecursosPage: React.FC<RecursosPageProps> = ({ 
  afiliados, 
  indicadores, 
  planillas, 
  libros, 
  materialComplementario, 
  linksImportantes, 
  formulasTradingView 
}) => {
  return (
    <>
      <Head>
        <title>Recursos - Centro de Herramientas y Material Educativo | Nahuel Lozano</title>
        <meta name="description" content="Accede a nuestra biblioteca completa de recursos: indicadores, planillas, libros recomendados, links de afiliados y fórmulas de TradingView." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* Hero Section con Video Explicativo */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.heroContent}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>
                  Centro de Recursos
                  <span className={styles.heroSubtitle}>Herramientas y Material Educativo</span>
                </h1>
                <p className={styles.heroDescription}>
                  Accede a nuestra biblioteca completa de recursos para maximizar tu potencial en los mercados financieros. 
                  Desde indicadores técnicos hasta planillas especializadas y libros fundamentales.
                </p>
                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>50+</span>
                    <span className={styles.statLabel}>Recursos Disponibles</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>100%</span>
                    <span className={styles.statLabel}>Gratuito</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>24/7</span>
                    <span className={styles.statLabel}>Acceso Libre</span>
                  </div>
                </div>
              </div>
              <div className={styles.heroVideo}>
                <div className={styles.videoContainer}>
                  {/* Placeholder de video explicativo */}
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.placeholderIcon}>🎯</div>
                    <h3 className={styles.placeholderTitle}>Video: Explicación de los Recursos</h3>
                    <p className={styles.placeholderText}>
                      Descubre cómo aprovechar al máximo todas las herramientas y recursos disponibles
                    </p>
                    <div className={styles.placeholderFeatures}>
                      <span>📊 Indicadores Técnicos</span>
                      <span>📋 Planillas Google Sheets</span>
                      <span>📚 Material Educativo</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Links de Afiliados */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Links de Afiliados
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Plataformas recomendadas para trading e inversión
            </motion.p>
            
            <div className={styles.cardsGrid}>
              {afiliados.map((item, index) => (
                <motion.a 
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.cardIcon}>
                    <span className={styles.iconEmoji}>{item.icon}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.nombre}</h3>
                  <p className={styles.cardDescription}>{item.descripcion}</p>
                  <div className={styles.cardAction}>
                    <ExternalLink size={20} />
                    <span>Acceder</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Indicadores */}
        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Indicadores Técnicos
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Indicadores personalizados para TradingView y otras plataformas
            </motion.p>
            
            <div className={styles.cardsGrid}>
              {indicadores.map((item, index) => (
                <motion.div 
                  key={index}
                  className={styles.card}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.cardIcon}>
                    <span className={styles.iconEmoji}>{item.icon}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.nombre}</h3>
                  <p className={styles.cardDescription}>{item.descripcion}</p>
                  <button className={styles.cardButton}>
                    <TrendingUp size={20} />
                    <span>Descargar</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Planillas Google Sheets */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Planillas Google Sheets
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Herramientas de análisis y cálculo para optimizar tus inversiones
            </motion.p>
            
            <div className={styles.cardsGrid}>
              {planillas.map((item, index) => (
                <motion.a 
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.cardIcon}>
                    <span className={styles.iconEmoji}>{item.icon}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.nombre}</h3>
                  <p className={styles.cardDescription}>{item.descripcion}</p>
                  <div className={styles.cardAction}>
                    <FileText size={20} />
                    <span>Abrir Planilla</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Libros Recomendados */}
        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Libros Recomendados
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Biblioteca esencial para formar tu educación financiera
            </motion.p>
            
            <div className={styles.cardsGrid}>
              {libros.map((item, index) => (
                <motion.a 
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.cardIcon}>
                    <BookOpen size={40} />
                  </div>
                  <h3 className={styles.cardTitle}>{item.nombre}</h3>
                  <p className={styles.cardAuthor}>Por {item.autor}</p>
                  <p className={styles.cardDescription}>{item.descripcion}</p>
                  <div className={styles.cardAction}>
                    <ExternalLink size={20} />
                    <span>Ver Libro</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Material Complementario */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Material Complementario
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Recursos adicionales para profundizar tu conocimiento
            </motion.p>
            
            <div className={styles.cardsGrid}>
              {materialComplementario.map((item, index) => (
                <motion.div 
                  key={index}
                  className={styles.card}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.cardIcon}>
                    <span className={styles.iconEmoji}>{item.icon}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.nombre}</h3>
                  <p className={styles.cardDescription}>{item.descripcion}</p>
                  <button className={styles.cardButton}>
                    <FileText size={20} />
                    <span>Descargar</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Links Importantes */}
        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Links Importantes
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Recursos esenciales para estar al día con los mercados
            </motion.p>
            
            <div className={styles.cardsGridLarge}>
              {linksImportantes.map((item, index) => (
                <motion.a 
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.cardIcon}>
                    <span className={styles.iconEmoji}>{item.icon}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.nombre}</h3>
                  <p className={styles.cardDescription}>{item.descripcion}</p>
                  <div className={styles.cardAction}>
                    <ExternalLink size={20} />
                    <span>Acceder</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Fórmulas TradingView */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Fórmulas de TradingView
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Fórmulas personalizadas para análisis avanzado en TradingView
            </motion.p>
            
            <div className={styles.cardsGridLarge}>
              {formulasTradingView.map((item, index) => (
                <motion.div 
                  key={index}
                  className={`${styles.card} ${styles.formulaCard}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.cardIcon}>
                    <span className={styles.iconEmoji}>{item.icon}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{item.nombre}</h3>
                  <p className={styles.cardDescription}>{item.descripcion}</p>
                  <div className={styles.formulaCode}>
                    <code>{item.formula}</code>
                  </div>
                  <button className={styles.cardButton}>
                    <BarChart3 size={20} />
                    <span>Copiar Fórmula</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  const afiliados = [
    {
      nombre: 'TradingView',
      descripcion: 'Plataforma líder mundial para análisis técnico con gráficos profesionales y herramientas avanzadas.',
      url: 'https://tradingview.com',
      icon: '📈'
    },
    {
      nombre: 'Binance',
      descripcion: 'Exchange de criptomonedas más grande del mundo con las mejores comisiones y liquidez.',
      url: 'https://binance.com',
      icon: '₿'
    },
    {
      nombre: 'Interactive Brokers',
      descripcion: 'Broker global con acceso a más de 150 mercados y las mejores herramientas institucionales.',
      url: 'https://interactivebrokers.com',
      icon: '🏛️'
    }
  ];

  const indicadores = [
    {
      nombre: 'Medias Móviles Automáticas',
      descripcion: 'Indicador que calcula automáticamente las mejores medias móviles para cada timeframe.',
      descarga: '/downloads/medias-moviles-automaticas.pine',
      icon: '📊'
    },
    {
      nombre: 'Cuadro de Información',
      descripcion: 'Panel informativo que muestra datos clave del activo: volumen, volatilidad y niveles importantes.',
      descarga: '/downloads/cuadro-informacion.pine',
      icon: '📋'
    },
    {
      nombre: 'Semáforo de Trading',
      descripcion: 'Sistema visual que indica señales de compra, venta o lateralización basado en múltiples factores.',
      descarga: '/downloads/semaforo-trading.pine',
      icon: '🚦'
    }
  ];

  const planillas = [
    {
      nombre: 'Portfolio Analyzer',
      descripcion: 'Analiza tu portafolio completo: diversificación, riesgo, retorno y optimización de activos.',
      url: 'https://docs.google.com/spreadsheets/d/portfolio-analyzer',
      icon: '📊'
    },
    {
      nombre: 'RSI Screener',
      descripcion: 'Screener automático que identifica activos con RSI en niveles de sobrecompra o sobreventa.',
      url: 'https://docs.google.com/spreadsheets/d/rsi-screener',
      icon: '🔍'
    },
    {
      nombre: 'Calculadora de CEDEARs',
      descripcion: 'Calcula automáticamente el precio justo de CEDEARs versus sus activos subyacentes.',
      url: 'https://docs.google.com/spreadsheets/d/cedears-calculator',
      icon: '💰'
    }
  ];

  const libros = [
    {
      nombre: 'Análisis Técnico de los Mercados Financieros',
      autor: 'John J. Murphy',
      descripcion: 'El manual definitivo sobre análisis técnico. Cubre todos los conceptos fundamentales y técnicas avanzadas.',
      url: 'https://amazon.com/analisis-tecnico-mercados-financieros'
    },
    {
      nombre: 'Trading en la Zona',
      autor: 'Mark Douglas',
      descripcion: 'Libro fundamental sobre psicología del trading. Aprende a dominar tus emociones y mantener disciplina.',
      url: 'https://amazon.com/trading-en-la-zona'
    },
    {
      nombre: 'El Inversor Inteligente',
      autor: 'Benjamin Graham',
      descripcion: 'Clásico sobre inversión a largo plazo y análisis fundamental. La biblia del value investing.',
      url: 'https://amazon.com/el-inversor-inteligente'
    },
    {
      nombre: 'Psicología del Trading',
      autor: 'Brett N. Steenbarger',
      descripcion: 'Estrategias para desarrollar la mentalidad correcta y superar los obstáculos psicológicos del trading.',
      url: 'https://amazon.com/psicologia-del-trading'
    }
  ];

  const materialComplementario = [
    {
      nombre: 'Ratios de Conversión',
      descripcion: 'Guía completa con todos los ratios de conversión de CEDEARs y activos internacionales.',
      descarga: '/downloads/ratios-conversion.pdf',
      icon: '🔄'
    },
    {
      nombre: 'Cómo Medir la Cartera',
      descripcion: 'Manual para evaluar correctamente el performance de tu portafolio y compararlo con benchmarks.',
      descarga: '/downloads/como-medir-cartera.pdf',
      icon: '📏'
    },
    {
      nombre: 'Cálculo CCL',
      descripcion: 'Explicación detallada del funcionamiento del dólar CCL y cómo aprovecharlo para inversiones.',
      descarga: '/downloads/calculo-ccl.pdf',
      icon: '💵'
    }
  ];

  const linksImportantes = [
    {
      nombre: 'Calendario de Balances',
      descripcion: 'Fechas de presentación de resultados trimestrales de empresas argentinas e internacionales.',
      url: 'https://finance.yahoo.com/calendar/earnings',
      icon: '📅'
    },
    {
      nombre: 'Datos de Inflación USA',
      descripcion: 'Información oficial del Bureau of Labor Statistics sobre inflación y datos económicos estadounidenses.',
      url: 'https://bls.gov/cpi',
      icon: '📈'
    },
    {
      nombre: 'Decisión Tasa de Interés de la FED',
      descripcion: 'Calendario oficial de reuniones de la Reserva Federal y decisiones de política monetaria.',
      url: 'https://federalreserve.gov/monetarypolicy/fomccalendars.htm',
      icon: '🏦'
    },
    {
      nombre: 'Avisos de Eventos Corporativos',
      descripcion: 'Información sobre dividendos, splits, fusiones y otros eventos corporativos relevantes.',
      url: 'https://sec.gov/edgar/searchedgar/companysearch.html',
      icon: '🏢'
    },
    {
      nombre: 'Datos de Inflación ARG',
      descripcion: 'Estadísticas oficiales del INDEC sobre inflación y variables económicas argentinas.',
      url: 'https://indec.gob.ar/indec/web/Nivel3-Tema-3-5',
      icon: '🇦🇷'
    },
    {
      nombre: 'Indicador Fear and Greed CNN',
      descripcion: 'Medidor de sentimiento del mercado que combina 7 indicadores diferentes de volatilidad y momentum.',
      url: 'https://cnn.com/markets/fear-and-greed',
      icon: '😰'
    }
  ];

  const formulasTradingView = [
    {
      nombre: 'Dólar CCL',
      descripcion: 'Fórmula para calcular en tiempo real el tipo de cambio CCL usando GD30 y GD30C.',
      formula: 'GD30 / GD30C',
      icon: '💱'
    },
    {
      nombre: 'Acciones Argentinas en Dólar CCL',
      descripcion: 'Convierte automáticamente el precio de acciones argentinas a dólares usando CCL.',
      formula: 'close / (GD30 / GD30C)',
      icon: '🏛️'
    },
    {
      nombre: 'Índice MERVAL en Dólar CCL',
      descripcion: 'Visualiza el MERVAL expresado en dólares CCL para análisis comparativo internacional.',
      formula: 'BCBA:IMV / (BCBA:GD30 / NASDAQ:GD30C)',
      icon: '📊'
    },
    {
      nombre: 'Comparación S&P500 vs MERVAL',
      descripcion: 'Compara el performance relativo entre el S&P500 y el MERVAL en la misma moneda.',
      formula: 'SPX / (BCBA:IMV / (BCBA:GD30 / NASDAQ:GD30C))',
      icon: '⚖️'
    },
    {
      nombre: 'Comparación NASDAQ vs DOW JONES',
      descripcion: 'Ratio que muestra el performance relativo entre tecnológicas (NASDAQ) y blue chips (DOW).',
      formula: 'NASDAQ:NDX / NASDAQ:DJI',
      icon: '🔄'
    },
    {
      nombre: 'Inflación Interanual Argentina',
      descripcion: 'Cálculo de la inflación acumulada en los últimos 12 meses usando datos oficiales.',
      formula: '((close / close[252]) - 1) * 100',
      icon: '📈'
    }
  ];

  return {
    props: {
      afiliados,
      indicadores,
      planillas,
      libros,
      materialComplementario,
      linksImportantes,
      formulasTradingView
    }
  };
};

export default RecursosPage; 