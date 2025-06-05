import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Users, Shield, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import VideoPlayerMux from '@/components/VideoPlayerMux';
import styles from '@/styles/Home.module.css';

interface HomeProps {
  isLoggedIn: boolean;
  userName?: string;
}

const Home: React.FC<HomeProps> = ({ isLoggedIn, userName }) => {
  // Datos mock para las empresas (en producción vendrían de la base de datos)
  const empresasLogos = [
    { name: 'Bull Market Brokers', logo: '/logos/bull-market.png' },
    { name: 'TradingView', logo: '/logos/tradingview.png' },
    { name: 'DólarHoy', logo: '/logos/dolarhoy.png' },
    { name: 'Inviu', logo: '/logos/inviu.png' },
    { name: 'Balanz', logo: '/logos/balanz.png' },
    { name: 'Inversiones Andinas', logo: '/logos/inversiones-andinas.png' },
    { name: 'Forbes Argentina', logo: '/logos/forbes.png' },
  ];

  const testimonios = [
    {
      nombre: 'Carlos Mendoza',
      texto: 'Las alertas de Nahuel me han ayudado a incrementar mi portfolio un 45% en los últimos 6 meses.',
      calificacion: 5,
      foto: '/testimonios/carlos.jpg'
    },
    {
      nombre: 'María García',
      texto: 'El entrenamiento de trading cambió completamente mi forma de invertir. Excelente contenido.',
      calificacion: 5,
      foto: '/testimonios/maria.jpg'
    },
    {
      nombre: 'Roberto Silva',
      texto: 'Smart Money es increíble. Las señales son precisas y muy fáciles de seguir.',
      calificacion: 5,
      foto: '/testimonios/roberto.jpg'
    }
  ];

  const servicios = [
    {
      titulo: 'Alertas de Trading',
      descripcion: 'Recibe señales precisas en tiempo real para maximizar tus inversiones',
      icono: <TrendingUp className={styles.serviceIcon} />,
      href: '/alertas',
      precio: 'Desde $99/mes'
    },
    {
      titulo: 'Entrenamientos',
      descripcion: 'Aprende las estrategias más efectivas del mercado financiero',
      icono: <Users className={styles.serviceIcon} />,
      href: '/entrenamientos',
      precio: 'Desde $299'
    },
    {
      titulo: 'Asesorías',
      descripcion: 'Consultoría personalizada para optimizar tu portafolio',
      icono: <Shield className={styles.serviceIcon} />,
      href: '/asesorias',
      precio: 'Desde $199/sesión'
    }
  ];

  return (
    <>
      <Head>
        <title>Nahuel Lozano - Trading & Inversiones</title>
        <meta name="description" content="Experto en trading y análisis financiero. Alertas, entrenamientos y asesorías para maximizar tus inversiones." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <motion.div
              className={styles.heroContent}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>
                  Maximiza tus inversiones con
                  <span className="gradient-text"> estrategias probadas</span>
                </h1>
                <p className={styles.heroDescription}>
                  Únete a más de 1,300 inversores que confían en nuestras alertas y entrenamientos 
                  para obtener resultados consistentes en los mercados financieros.
                </p>
                
                {isLoggedIn ? (
                  <div className={styles.heroActions}>
                    <p className={styles.welcomeMessage}>
                      ¡Hola {userName}! Explora nuestros servicios
                    </p>
                    <Link href="/alertas" className="btn btn-primary btn-lg">
                      Ver Alertas
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                ) : (
                  <div className={styles.heroActions}>
                    <Link href="/alertas" className="btn btn-primary btn-lg">
                      Comenzar Ahora
                      <ChevronRight size={20} />
                    </Link>
                    <Link href="/entrenamientos" className="btn btn-outline btn-lg">
                      Ver Entrenamientos
                    </Link>
                  </div>
                )}
              </div>

              <div className={styles.heroVideo}>
                <VideoPlayerMux
                  playbackId="ejemplo-playback-id" // En producción vendría de la base de datos
                  autoplay={true}
                  muted={true}
                  className={styles.heroVideoPlayer}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Empresas Section */}
        <section className={styles.empresas}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.empresasTitle}>Empresas que confiaron en mí</h2>
              <Carousel 
                items={empresasLogos.map(empresa => (
                  <div key={empresa.name} className={styles.empresaLogo}>
                    <img 
                      src={empresa.logo} 
                      alt={empresa.name}
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/150x80/e2e8f0/64748b?text=${empresa.name}`;
                      }}
                    />
                  </div>
                ))}
                autoplay={true}
                showDots={false}
                className={styles.empresasCarousel}
              />
            </motion.div>
          </div>
        </section>

        {/* Servicios Section */}
        <section className={styles.servicios}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.sectionHeader}>
                <h2>Nuestros Servicios</h2>
                <p>Herramientas y conocimiento para potenciar tus inversiones</p>
              </div>

              <div className={styles.serviciosGrid}>
                {servicios.map((servicio, index) => (
                  <motion.div
                    key={servicio.titulo}
                    className={styles.servicioCard}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className={styles.servicioHeader}>
                      {servicio.icono}
                      <h3>{servicio.titulo}</h3>
                    </div>
                    <p className={styles.servicioDescription}>{servicio.descripcion}</p>
                    <div className={styles.servicioPrecio}>{servicio.precio}</div>
                    <Link href={servicio.href} className="btn btn-primary">
                      Conocer más
                      <ChevronRight size={16} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonios Section */}
        <section className={styles.testimonios}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.sectionHeader}>
                <h2>Lo que dicen nuestros estudiantes</h2>
                <p>Resultados reales de personas reales</p>
              </div>

              <div className={styles.testimoniosGrid}>
                {testimonios.map((testimonio, index) => (
                  <motion.div
                    key={testimonio.nombre}
                    className={styles.testimonioCard}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={styles.testimonioHeader}>
                      <img 
                        src={testimonio.foto} 
                        alt={testimonio.nombre}
                        className={styles.testimonioFoto}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/60x60/2563eb/ffffff?text=${testimonio.nombre.charAt(0)}`;
                        }}
                      />
                      <div>
                        <h4>{testimonio.nombre}</h4>
                        <div className={styles.estrellas}>
                          {[...Array(testimonio.calificacion)].map((_, i) => (
                            <Star key={i} size={16} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className={styles.testimonioTexto}>"{testimonio.texto}"</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Final */}
        <section className={styles.cta}>
          <div className="container">
            <motion.div
              className={styles.ctaContent}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>¿Listo para llevar tus inversiones al siguiente nivel?</h2>
              <p>Únete a nuestra comunidad de inversores exitosos y comienza a ver resultados desde el primer día.</p>
              
              {!isLoggedIn && (
                <div className={styles.ctaActions}>
                  <Link href="/alertas" className="btn btn-primary btn-lg">
                    Comenzar Ahora
                  </Link>
                  <Link href="/entrenamientos" className="btn btn-outline btn-lg">
                    Ver Entrenamientos
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  return {
    props: {
      isLoggedIn: !!session,
      userName: session?.user?.name || null,
    },
  };
};

export default Home; 