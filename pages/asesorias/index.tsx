import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayerMux from '@/components/VideoPlayerMux';
import styles from '@/styles/Asesorias.module.css';

interface AsesoriasPageProps {
  session: any;
}

/**
 * Página principal de Asesorías
 * Muestra los dos tipos: Consultorio Financiero y Cuenta Asesorada
 */
export default function AsesoriasPage({ session }: AsesoriasPageProps) {
  const servicios = [
    {
      id: 'consultorio-financiero',
      titulo: 'Consultorio Financiero',
      precio: '$199',
      descripcion: 'Sesiones individuales de consultoría personalizada para optimizar tu estrategia de inversión',
      duracion: '60 minutos',
      modalidad: 'Videollamada',
      incluye: [
        'Análisis completo de tu portafolio actual',
        'Estrategia personalizada según tu perfil de riesgo',
        'Recomendaciones de activos específicos',
        'Plan de acción con objetivos claros',
        'Seguimiento por email durante 30 días'
      ],
      videoId: 'consultorio-financiero-intro',
      href: '/asesorias/consultorio-financiero'
    },
    {
      id: 'cuenta-asesorada',
      titulo: 'Cuenta Asesorada',
      precio: 'Desde $999',
      descripcion: 'Gestión profesional de tu portafolio con reportes mensuales y estrategias avanzadas',
      duracion: 'Servicio mensual',
      modalidad: 'Gestión remota',
      incluye: [
        'Gestión profesional de tu portafolio',
        'Rebalanceo automático mensual',
        'Reportes detallados de performance',
        'Acceso a estrategias institucionales',
        'Soporte prioritario 24/7'
      ],
      videoId: 'cuenta-asesorada-intro',
      href: '/asesorias/cuenta-asesorada'
    }
  ];

  const testimonios = [
    {
      nombre: 'Ana Martínez',
      resultado: '+127% en 8 meses',
      comentario: 'La asesoría personalizada transformó completamente mi estrategia de inversión.',
      servicio: 'Consultorio Financiero'
    },
    {
      nombre: 'Carlos Rivera',
      resultado: '+89% en 12 meses',
      comentario: 'La cuenta asesorada me permite invertir sin preocuparme por la gestión diaria.',
      servicio: 'Cuenta Asesorada'
    },
    {
      nombre: 'María González',
      resultado: '+156% en 10 meses',
      comentario: 'Excelente atención y resultados que superaron mis expectativas.',
      servicio: 'Cuenta Asesorada'
    }
  ];

  return (
    <>
      <Head>
        <title>Asesorías Financieras | Nahuel Lozano</title>
        <meta name="description" content="Consultoría financiera personalizada y gestión profesional de portafolios. Optimiza tus inversiones con estrategias probadas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                <h1 className={styles.heroTitle}>Asesoría Financiera Personalizada</h1>
                <p className={styles.heroSubtitle}>
                  Optimiza tu estrategia de inversión con consultoría profesional. 
                  Desde sesiones individuales hasta gestión completa de portafolio.
                </p>
                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>+120%</span>
                    <span className={styles.statLabel}>Rentabilidad promedio</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>200+</span>
                    <span className={styles.statLabel}>Clientes asesorados</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>5+</span>
                    <span className={styles.statLabel}>Años de experiencia</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Servicios */}
        <section className={styles.servicios}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.sectionHeader}>
                <h2>Nuestros Servicios de Asesoría</h2>
                <p>Elige la modalidad que mejor se adapte a tus objetivos y necesidades</p>
              </div>

              <div className={styles.serviciosGrid}>
                {servicios.map((servicio, index) => (
                  <motion.div
                    key={servicio.id}
                    className={styles.servicioCard}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className={styles.servicioHeader}>
                      <h3>{servicio.titulo}</h3>
                      <div className={styles.precio}>{servicio.precio}</div>
                    </div>

                    <div className={styles.servicioVideo}>
                      <VideoPlayerMux 
                        playbackId={servicio.videoId}
                        className={styles.video}
                      />
                    </div>

                    <p className={styles.servicioDescription}>{servicio.descripcion}</p>

                    <div className={styles.servicioDetalles}>
                      <div className={styles.detalle}>
                        <Clock size={16} />
                        <span>{servicio.duracion}</span>
                      </div>
                      <div className={styles.detalle}>
                        <Calendar size={16} />
                        <span>{servicio.modalidad}</span>
                      </div>
                    </div>

                    <div className={styles.servicioIncluye}>
                      <h4>¿Qué incluye?</h4>
                      <ul>
                        {servicio.incluye.map((item, i) => (
                          <li key={i}>
                            <CheckCircle size={14} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link href={servicio.href} className="btn btn-primary w-full">
                      Solicitar Asesoría
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Proceso */}
        <section className={styles.proceso}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.sectionHeader}>
                <h2>¿Cómo funciona?</h2>
                <p>Un proceso simple y transparente para comenzar</p>
              </div>

              <div className={styles.procesoSteps}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>Solicita tu cita</h3>
                  <p>Completa el formulario con tu información básica y objetivos de inversión</p>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <h3>Análisis inicial</h3>
                  <p>Revisamos tu situación financiera actual y definimos una estrategia personalizada</p>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <h3>Sesión de asesoría</h3>
                  <p>Videollamada de 60 minutos donde discutimos recomendaciones específicas</p>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>4</div>
                  <h3>Plan de acción</h3>
                  <p>Recibes un documento detallado con tu plan de inversión y seguimiento</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonios */}
        <section className={styles.testimonios}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.sectionHeader}>
                <h2>Resultados de nuestros clientes</h2>
                <p>Casos reales de éxito con asesoría personalizada</p>
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
                    <div className={styles.testimonioResultado}>
                      <TrendingUp className={styles.resultadoIcon} />
                      <span className={styles.resultado}>{testimonio.resultado}</span>
                    </div>
                    <h4>{testimonio.nombre}</h4>
                    <p className={styles.testimonioTexto}>"{testimonio.comentario}"</p>
                    <span className={styles.testimonioServicio}>{testimonio.servicio}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <div className="container">
            <motion.div
              className={styles.ctaContent}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>¿Listo para optimizar tus inversiones?</h2>
              <p>Agenda una consulta gratuita de 15 minutos para conocer cómo podemos ayudarte</p>
              
              <div className={styles.ctaActions}>
                <Link href="/asesorias/consultorio-financiero" className="btn btn-primary btn-lg">
                  Agendar Consulta Gratuita
                </Link>
                <Link href="/asesorias/cuenta-asesorada" className="btn btn-outline btn-lg">
                  Conocer Gestión de Portafolio
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);
    
    return {
      props: {
        session: session || null,
      },
    };
  } catch (error) {
    console.error('❌ Error in getServerSideProps:', error);
    return {
      props: {
        session: null,
      },
    };
  }
}; 