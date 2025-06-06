import { GetServerSideProps } from 'next';
import { getSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, TrendingUp, Users, Shield, Star, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import VideoPlayerMux from '@/components/VideoPlayerMux';
import styles from '@/styles/Home.module.css';

interface HomeProps {
  /** @param session - Sesión del usuario autenticado */
  session: any;
}

/**
 * Página principal del sitio web de Nahuel Lozano
 */
export default function Home({ session }: HomeProps) {
  console.log('🏠 Renderizando página principal');
  
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Mostrar popup después de 3 segundos si no está logueado
  useEffect(() => {
    if (!session) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitMessage('¡Perfecto! Revisa tu email para confirmar tu suscripción y recibir tu curso gratuito.');
        setEmail('');
        setTimeout(() => setShowPopup(false), 3000);
      } else {
        setSubmitMessage('Error al suscribirse. Por favor intenta nuevamente.');
      }
    } catch (error) {
      setSubmitMessage('Error al suscribirse. Por favor intenta nuevamente.');
    }

    setIsSubmitting(false);
  };
  
  const empresasLogos = [
    '/images/bull-market-brokers.png',
    '/images/tradingview.png', 
    '/images/dolarhoy.png',
    '/images/inviu.png',
    '/images/balanz.png',
    '/images/inversiones-andinas.png',
    '/images/forbes-argentina.png'
  ];

  const testimonios = [
    {
      nombre: 'Carlos Mendoza',
      texto: 'Las alertas de Nahuel me han ayudado a incrementar mi cartera un 45% en los últimos 6 meses.',
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

      {/* Popup de Descuentos y Alertas */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className={styles.popupOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className={styles.popupContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.popupClose}
                onClick={() => setShowPopup(false)}
              >
                <X size={24} />
              </button>
              
              <div className={styles.popupHeader}>
                <h2>🎁 ¡Oferta Especial!</h2>
                <p>Recibí Códigos de Descuento y Alertas de Lanzamiento</p>
              </div>

              <form onSubmit={handlePopupSubmit} className={styles.popupForm}>
                <input
                  type="email"
                  placeholder="Ingresa tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.popupInput}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.popupButton}
                >
                  {isSubmitting ? 'Enviando...' : 'Quiero mi curso gratuito'}
                </button>
              </form>

              {submitMessage && (
                <p className={styles.popupMessage}>{submitMessage}</p>
              )}

              <div className={styles.popupBenefits}>
                <p>✅ Curso gratuito de introducción al trading</p>
                <p>✅ Descuentos exclusivos en todos nuestros servicios</p>
                <p>✅ Alertas de lanzamiento de nuevos productos</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  Únete a más de 1,500 inversores que confían en nuestras alertas y entrenamientos 
                  para obtener resultados consistentes en los mercados financieros.
                </p>
                
                <div className={styles.heroActions}>
                  {session ? (
                    <>
                      <p className={styles.welcomeMessage}>
                        ¡Hola {session.user?.name}! Explora nuestros servicios
                      </p>
                      <Link href="/alertas" className="btn btn-primary btn-lg">
                        Ver Alertas
                        <ChevronRight size={20} />
                      </Link>
                    </>
                  ) : (
                    <button onClick={() => signIn('google')} className="btn btn-primary btn-lg">
                      Comenzá a Aprender
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Video de Presentación, Explicación y Finalidad */}
              <div className={styles.heroVideo}>
                <VideoPlayerMux
                  playbackId="presentacion-nahuel-lozano" // Video pantalla completa y reproducción automática
                  autoplay={true}
                  muted={true}
                  className={styles.heroVideoPlayer}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Empresas que confiaron en mí */}
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
                items={empresasLogos.map((empresa, index) => {
                  const empresaNombres = [
                    'Bull Market Brokers',
                    'TradingView', 
                    'DólarHoy',
                    'Inviu',
                    'Balanz',
                    'Inversiones Andinas',
                    'Forbes Argentina'
                  ];
                  
                  return (
                    <div key={empresa} className={styles.empresaLogo}>
                      <img 
                        src={empresa} 
                        alt={empresaNombres[index]}
                        onError={(e) => {
                          // Fallback si la imagen no carga
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/150x80/e2e8f0/64748b?text=${empresaNombres[index]}`;
                        }}
                      />
                    </div>
                  );
                })}
                autoplay={true}
                showDots={false}
                className={styles.empresasCarousel}
              />
            </motion.div>
          </div>
        </section>

        {/* Números con datos actualizables - Exactos del spreadsheet */}
        <section className={styles.stats}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <h3 className={styles.statNumber}>7</h3>
                  <p className={styles.statLabel}>Años trabajando con el mercado</p>
                </div>
                <div className={styles.statItem}>
                  <h3 className={styles.statNumber}>+1,500</h3>
                  <p className={styles.statLabel}>Alumnos</p>
                </div>
                <div className={styles.statItem}>
                  <h3 className={styles.statNumber}>+300</h3>
                  <p className={styles.statLabel}>Horas de formación</p>
                </div>
              </div>
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

        {/* Sistema de cobros personalizado */}
        <section className={styles.sistemaCobranza}>
          <div className="container">
            <motion.div
              className={styles.cobranzaContent}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.cobranzaTitle}>Sistema de Cobros Personalizado</h2>
              <p className={styles.cobranzaDescription}>
                Ofrecemos múltiples opciones de pago para adaptarnos a tu ubicación y preferencias. 
                Pagos seguros y procesados por las plataformas más confiables del mercado.
              </p>

              <div className={styles.paymentMethods}>
                <motion.div
                  className={styles.paymentCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={styles.paymentIcon}>💰</div>
                  <h3>Mercado Pago</h3>
                  <p>Pagos locales en ARS. Mercado Pago, Rapipago, PagoFácil y transferencias bancarias.</p>
                </motion.div>

                <motion.div
                  className={styles.paymentCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className={styles.paymentIcon}>🏦</div>
                  <h3>Transferencias</h3>
                  <p>Transferencias bancarias directas para montos mayores. Soporte personalizado.</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
                  🔒 Todos los pagos están protegidos con encriptación SSL de 256 bits. 
                  No almacenamos información de tarjetas de crédito.
                </p>
              </motion.div>
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
              
              {!session && (
                <div className={styles.ctaActions}>
                  <button onClick={() => signIn('google')} className="btn btn-primary btn-lg">
                    Comenzar Ahora
                  </button>
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
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('🔄 Ejecutando getServerSideProps en página principal');
  
  try {
    const session = await getSession(context);
    console.log('✅ Sesión obtenida:', session ? 'Usuario autenticado' : 'Usuario no autenticado');
    
    return {
      props: {
        session: session || null,
      },
    };
  } catch (error) {
    console.error('❌ Error in getServerSideProps:', error);
    // En lugar de crashear, devolvemos props vacías
    return {
      props: {
        session: null,
      },
    };
  }
}; 