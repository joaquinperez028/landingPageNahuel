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
  Play,
  Download
} from 'lucide-react';
import styles from '@/styles/Recursos.module.css';

interface RecursosPageProps {
  formulasTradingView: Array<{
    nombre: string;
    descripcion: string;
    formula: string;
    icon: string;
  }>;
  linksImportantes: Array<{
    nombre: string;
    descripcion: string;
    url: string;
    icon: string;
  }>;
  materialComplementario: Array<{
    nombre: string;
    descripcion: string;
    descarga: string;
    icon: string;
  }>;
  librosRecomendados: Array<{
    nombre: string;
    autor: string;
    descripcion: string;
    descarga: string;
  }>;
  listasActivos: Array<{
    nombre: string;
    descripcion: string;
    url: string;
    icon: string;
  }>;
}

const RecursosPage: React.FC<RecursosPageProps> = ({ 
  formulasTradingView,
  linksImportantes,
  materialComplementario,
  librosRecomendados,
  listasActivos
}) => {
  return (
    <>
      <Head>
        <title>Herramientas - Centro de Recursos para Trading | Nahuel Lozano</title>
        <meta name="description" content="Herramientas útiles para hacer análisis técnico: fórmulas de TradingView, links importantes, material complementario y libros recomendados." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* Hero Section con Video Explicativo */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.container}>
            <motion.div 
              className={styles.heroContent}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>Recursos</h1>
                <p className={styles.heroDescription}>
                  <em>Herramientas útiles e indispensables para aumentar el control sobre tus inversiones en bolsa. Recursos para TradingView, información actualizada y material educativo</em>
                </p>
                <a href="#recursos-lista" className={styles.heroButtonWhite}>
                  Empezá ahora &gt;
                </a>
              </div>
              <div className={styles.heroVideo}>
                <div className={styles.videoContainer}>
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Video Recursos"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                  ></iframe>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* TradingView Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div 
              className={styles.tradingViewSection}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.tradingViewCard}>
                <div className={styles.tradingViewContent}>
                  <div className={styles.tradingViewIcon}>📈</div>
                  <h2 className={styles.tradingViewTitle}>TradingView</h2>
                  <p className={styles.tradingViewSubtitle}>El aliado que necesitas</p>
                  <p className={styles.tradingViewDescription}>
                    Plataforma amigable, rápida y portable en la cual los gráficos se guardan en una nube que no consume memoria de nuestra computadora.
                    <br /><br />
                    Personalización de muchos aspectos, tanto de la interfaz como de los gráficos, instrumentos e indicadores. Su versión gratuita es realmente buena.
                    <br /><br />
                    Ofrece la posibilidad de analizar una gran cantidad de activos y compartirlos rápidamente con la comunidad inversora para discutir puntos de vista.
                  </p>
                  <div className={styles.tradingViewCTA}>
                    <h3 className={styles.discountTitle}>¡Comienza a utilizar TradingView con 15 U$D de descuento!</h3>
                    <a 
                      href="https://tradingview.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.discountButton}
                    >
                      Quiero el descuento
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Fórmulas TradingView */}
        <section className={styles.sectionAlt} id="recursos-lista">
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Herramientas para TradingView
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Para utilizarlas debe copiarlas y pegarlas al momento de añadir un nuevo símbolo en la plataforma de TradingView
            </motion.p>
            
            <div className={styles.cardsGridLarge}>
              {/* Ejemplo de imágenes, puedes personalizar cada una luego */}
              <div className={styles.card} style={{background: 'none'}}>
                <img src="/images/wallstreet.jpg" className={styles.cardImage} alt="Wall Street" />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Lista de Seguimiento<br/>Wall Street</div>
                </div>
              </div>
              <div className={styles.card} style={{background: 'none'}}>
                <img src="/images/argentina.jpg" className={styles.cardImage} alt="Merval" />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Lista de Seguimiento<br/>Merval</div>
                </div>
              </div>
              <div className={styles.card} style={{background: 'none'}}>
                <img src="/images/dolares.jpg" className={styles.cardImage} alt="Dólar CCL" />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Fórmula<br/>Dólar CCL</div>
                </div>
              </div>
              <div className={styles.card} style={{background: 'none'}}>
                <img src="/images/acciones.jpg" className={styles.cardImage} alt="Acciones en CCL" />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Fórmula<br/>Acciones en CCL</div>
                </div>
              </div>
              <div className={styles.card} style={{background: 'none'}}>
                <img src="/images/merval-ccl.jpg" className={styles.cardImage} alt="Merval en CCL" />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Fórmula<br/>Merval en CCL</div>
                </div>
              </div>
              <div className={styles.card} style={{background: 'none'}}>
                <img src="/images/wallstreet-bull.jpg" className={styles.cardImage} alt="Promedio Wall Street" />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Fórmula Promedio<br/>Índices Wall Street</div>
                </div>
              </div>
              <div className={styles.card} style={{background: 'none'}}>
                <img src="/images/mer-val-sp.jpg" className={styles.cardImage} alt="MerVal vs SP500" />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Fórmula Comparación<br/>Merval vs S&amp;P500</div>
                </div>
              </div>
              <div className={styles.card} style={{background: 'none'}}>
                <img src="/images/nasdaq-dow.jpg" className={styles.cardImage} alt="Nasdaq vs Dow Jones" />
                <div className={styles.cardOverlay}></div>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>Fórmula Comparación<br/>Nasdaq vs Dow Jones</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Biblioteca del Inversor */}
        <section className={styles.bibliotecaSection}>
          <div className={styles.bibliotecaContainer}>
            <h2 className={styles.bibliotecaTitle}>Biblioteca del Inversor</h2>
            <div className={styles.bibliotecaCarousel}>
              <button className={styles.carouselArrow} aria-label="Anterior">&#60;</button>
              <div className={styles.bibliotecaCards}>
                <div className={styles.bibliotecaCard}>
                  <img src="/images/wickoff.jpg" alt="El Método Wickoff" className={styles.bibliotecaImg} />
                  <div className={styles.bibliotecaCardText}>
                    <div className={styles.bibliotecaBookTitle}>El Método Wickoff</div>
                    <div className={styles.bibliotecaBookAuthor}><em>Enrique Díaz Valdecantos</em></div>
                  </div>
                </div>
                <div className={styles.bibliotecaCard}>
                  <img src="/images/padrerico.jpg" alt="Padre Rico, Padre Pobre" className={styles.bibliotecaImg} />
                  <div className={styles.bibliotecaCardText}>
                    <div className={styles.bibliotecaBookTitle}>Padre Rico, Padre Pobre</div>
                    <div className={styles.bibliotecaBookAuthor}><em>Robert T. Kiyosaki</em></div>
                  </div>
                </div>
                <div className={styles.bibliotecaCard}>
                  <img src="/images/murphy.jpg" alt="Análisis Técnico de los Mercados Financieros" className={styles.bibliotecaImg} />
                  <div className={styles.bibliotecaCardText}>
                    <div className={styles.bibliotecaBookTitle}>Análisis Técnico de los Mercados Financieros</div>
                    <div className={styles.bibliotecaBookAuthor}><em>John J. Murphy</em></div>
                  </div>
                </div>
              </div>
              <button className={styles.carouselArrow} aria-label="Siguiente">&#62;</button>
            </div>
          </div>
        </section>

        {/* Links que Todo Trader Necesita */}
        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Links que Todo Trader Necesita
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Recursos esenciales para estar al día con los mercados financieros
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
                    <Download size={20} />
                    <span>Descargar</span>
                  </button>
                </motion.div>
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
              {librosRecomendados.map((item, index) => (
                <motion.div 
                  key={index}
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
                  <button className={styles.cardButton}>
                    <Download size={20} />
                    <span>Descargar</span>
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
  
  const formulasTradingView = [
    {
      nombre: 'Dólar CCL',
      descripcion: 'Dólar con el CEDEAR más utilizado para esta operatoria',
      formula: 'BCBA:KO*5/NYSE:KO',
      icon: '💱'
    },
    {
      nombre: 'Acciones Argentinas en Dólar CCL',
      descripcion: 'Reemplazar ALUA por el ticker del activo local que quieras',
      formula: 'BCBA:ALUA/(BCBA:KO*5/NYSE:KO)',
      icon: '🏛️'
    },
    {
      nombre: 'Índice MERVAL en Dólar CCL',
      descripcion: 'El índice MERVAL ajustado por Dólar CCL, para evitar contaminar el análisis de la devaluación del peso',
      formula: 'BCBA:IMV/(BCBA:KO*5/NYSE:KO)',
      icon: '📊'
    },
    {
      nombre: 'Comparación entre S&P500 y MERVAL',
      descripcion: 'Cuando el gráfico está alcista, conviene estar invertido en activos del S&P500. Cuando está bajista, en activos del MERVAL',
      formula: 'BCBA:IMV/(BCBA:KO*5/NYSE:KO)/SP:SPX',
      icon: '⚖️'
    },
    {
      nombre: 'Comparación entre NASDAQ 100 y DOW JONES 30',
      descripcion: 'Cuando el gráfico está alcista, conviene estar invertido en activos del NASDAQ 100. Cuando está bajista, en activos del DOW JONES 30',
      formula: 'NASDAQ:NDX/TVC:DJI',
      icon: '🔄'
    }
  ];

  const listasActivos = [
    {
      nombre: 'Lista de Activos de USA',
      descripcion: 'Watchlist completa con los principales activos del mercado estadounidense que analizo regularmente',
      url: '#',
      icon: '🇺🇸'
    },
    {
      nombre: 'Lista de Activos de ARG',
      descripcion: 'Activos del mercado argentino: acciones locales, CEDEARs y bonos más relevantes para análisis',
      url: '#',
      icon: '🇦🇷'
    }
  ];

  const linksImportantes = [
    {
      nombre: 'Calendario Dato Inflación USA',
      descripcion: 'Información oficial del Bureau of Labor Statistics sobre inflación y datos económicos estadounidenses',
      url: 'https://www.bls.gov/cpi/',
      icon: '📈'
    },
    {
      nombre: 'Calendario FED Tasa de Interés USA',
      descripcion: 'Calendario oficial de reuniones de la Reserva Federal y decisiones de política monetaria',
      url: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
      icon: '🏦'
    },
    {
      nombre: 'Balances Próximos',
      descripcion: 'Fechas de presentación de resultados trimestrales de empresas argentinas e internacionales',
      url: 'https://finance.yahoo.com/calendar/earnings',
      icon: '📅'
    },
    {
      nombre: 'Calendario Económico',
      descripcion: 'Eventos económicos importantes que pueden afectar los mercados financieros globales',
      url: 'https://es.investing.com/economic-calendar/',
      icon: '📊'
    },
    {
      nombre: 'Calculadora de CEDEARs',
      descripcion: 'Herramienta para calcular el precio justo de CEDEARs versus sus activos subyacentes',
      url: '#',
      icon: '💰'
    },
    {
      nombre: 'Indicador Fear and Greed',
      descripcion: 'Medidor de sentimiento del mercado que combina 7 indicadores diferentes de volatilidad y momentum',
      url: 'https://cnn.com/markets/fear-and-greed',
      icon: '😰'
    },
    {
      nombre: 'Mercap Abbaco - Renta Fija',
      descripcion: 'Información detallada sobre bonos y instrumentos de renta fija del mercado argentino',
      url: '#',
      icon: '📋'
    }
  ];

  const materialComplementario = [
    {
      nombre: 'Ratios de Conversión COMAFI',
      descripcion: 'Guía completa con todos los ratios de conversión de CEDEARs proporcionada por COMAFI',
      descarga: '/downloads/ratios-conversion-comafi.pdf',
      icon: '🔄'
    },
    {
      nombre: 'Ratios de Conversión BYMA',
      descripcion: 'Ratios oficiales de conversión de CEDEARs según BYMA (Bolsas y Mercados Argentinos)',
      descarga: '/downloads/ratios-conversion-byma.pdf',
      icon: '📊'
    },
    {
      nombre: 'Cálculo para Comprar y Vender CEDEARs',
      descripcion: 'Manual práctico con ejemplos para calcular correctamente operaciones con CEDEARs',
      descarga: '/downloads/calculo-cedears.pdf',
      icon: '💵'
    },
    {
      nombre: '¿Cómo Medir la Cartera?',
      descripcion: 'Manual para evaluar correctamente el performance de tu portafolio y compararlo con benchmarks',
      descarga: '/downloads/como-medir-cartera.pdf',
      icon: '📏'
    }
  ];

  const librosRecomendados = [
    {
      nombre: 'Análisis Técnico de los Mercados Financieros',
      autor: 'John J. Murphy',
      descripcion: 'El manual definitivo sobre análisis técnico. Cubre todos los conceptos fundamentales y técnicas avanzadas.',
      descarga: '/downloads/analisis-tecnico-murphy.pdf'
    },
    {
      nombre: 'Guía para Invertir',
      autor: 'Robert T. Kiyosaki',
      descripcion: 'Estrategias de inversión y educación financiera para construir riqueza a largo plazo.',
      descarga: '/downloads/guia-para-invertir-kiyosaki.pdf'
    },
    {
      nombre: 'El Método Wyckoff',
      autor: 'Enrique Díaz Valdecantos',
      descripcion: 'Análisis profundo del método Wyckoff para entender la estructura del mercado y el volumen.',
      descarga: '/downloads/metodo-wyckoff.pdf'
    },
    {
      nombre: 'Padre Rico, Padre Pobre',
      autor: 'Robert T. Kiyosaki',
      descripcion: 'Fundamentos de educación financiera y mentalidad para alcanzar la libertad financiera.',
      descarga: '/downloads/padre-rico-padre-pobre.pdf'
    }
  ];

  return {
    props: {
      formulasTradingView,
      linksImportantes,
      materialComplementario,
      librosRecomendados,
      listasActivos
    }
  };
};

export default RecursosPage; 