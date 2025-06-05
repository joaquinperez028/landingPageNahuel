import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, DollarSign, Phone, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayerMux from '@/components/VideoPlayerMux';
import styles from '@/styles/ConsultorioFinanciero.module.css';

interface ConsultorioPageProps {
  session: any;
}

/**
 * Página del Consultorio Financiero
 * Sesiones individuales de consultoría personalizada
 */
export default function ConsultorioFinancieroPage({ session }: ConsultorioPageProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    patrimonioActual: '',
    objetivos: '',
    experiencia: '',
    consulta: '',
    fechaPreferida: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/asesorias/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tipo: 'ConsultorioFinanciero'
        }),
      });

      if (response.ok) {
        setSubmitMessage('¡Solicitud enviada! Te contactaremos dentro de 24 horas para coordinar tu consulta.');
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          patrimonioActual: '',
          objetivos: '',
          experiencia: '',
          consulta: '',
          fechaPreferida: ''
        });
      } else {
        setSubmitMessage('Error al enviar la solicitud. Por favor intenta nuevamente.');
      }
    } catch (error) {
      setSubmitMessage('Error al enviar la solicitud. Por favor intenta nuevamente.');
    }

    setIsSubmitting(false);
  };

  const beneficios = [
    'Análisis completo de tu situación financiera actual',
    'Estrategia de inversión personalizada según tu perfil',
    'Recomendaciones específicas de activos y mercados',
    'Plan de acción con objetivos claros y medibles',
    'Seguimiento por email durante 30 días',
    'Acceso a materiales educativos exclusivos'
  ];

  const proceso = [
    {
      paso: 1,
      titulo: 'Solicitud',
      descripcion: 'Completas el formulario con tu información básica'
    },
    {
      paso: 2,
      titulo: 'Coordinación',
      descripcion: 'Te contactamos para agendar la sesión'
    },
    {
      paso: 3,
      titulo: 'Sesión de 60 min',
      descripcion: 'Videollamada de análisis y recomendaciones'
    },
    {
      paso: 4,
      titulo: 'Plan de acción',
      descripcion: 'Recibes documento con estrategia personalizada'
    }
  ];

  return (
    <>
      <Head>
        <title>Consultorio Financiero | Nahuel Lozano</title>
        <meta name="description" content="Sesiones individuales de consultoría financiera personalizada. Optimiza tu estrategia de inversión con asesoría profesional." />
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
                <h1 className={styles.heroTitle}>Consultorio Financiero</h1>
                <p className={styles.heroSubtitle}>
                  Sesiones individuales de consultoría personalizada para optimizar 
                  tu estrategia de inversión y maximizar tus resultados.
                </p>
                <div className={styles.heroPrice}>
                  <span className={styles.price}>$199</span>
                  <span className={styles.priceDescription}>Sesión de 60 minutos</span>
                </div>
              </div>
              <div className={styles.heroVideo}>
                <VideoPlayerMux 
                  playbackId="consultorio-financiero-explicacion"
                  className={styles.video}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Beneficios */}
        <section className={styles.beneficios}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>¿Qué incluye tu sesión?</h2>
              <div className={styles.beneficiosGrid}>
                {beneficios.map((beneficio, index) => (
                  <motion.div
                    key={index}
                    className={styles.beneficioItem}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className={styles.beneficioIcon} />
                    <span>{beneficio}</span>
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
              <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
              <div className={styles.procesoSteps}>
                {proceso.map((step, index) => (
                  <motion.div
                    key={index}
                    className={styles.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className={styles.stepNumber}>{step.paso}</div>
                    <h3>{step.titulo}</h3>
                    <p>{step.descripcion}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Formulario */}
        <section className={styles.formulario}>
          <div className="container">
            <motion.div
              className={styles.formularioContent}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.formularioHeader}>
                <h2>Solicita tu consulta personalizada</h2>
                <p>Completa el formulario y te contactaremos dentro de 24 horas</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre completo *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="patrimonioActual">Patrimonio aproximado *</label>
                    <select
                      id="patrimonioActual"
                      name="patrimonioActual"
                      value={formData.patrimonioActual}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona un rango</option>
                      <option value="0-10k">$0 - $10,000</option>
                      <option value="10k-50k">$10,000 - $50,000</option>
                      <option value="50k-100k">$50,000 - $100,000</option>
                      <option value="100k-500k">$100,000 - $500,000</option>
                      <option value="500k+">Más de $500,000</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="experiencia">Experiencia en inversiones *</label>
                    <select
                      id="experiencia"
                      name="experiencia"
                      value={formData.experiencia}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona tu nivel</option>
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="fechaPreferida">Fecha preferida</label>
                    <input
                      type="date"
                      id="fechaPreferida"
                      name="fechaPreferida"
                      value={formData.fechaPreferida}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="objetivos">Objetivos de inversión *</label>
                  <textarea
                    id="objetivos"
                    name="objetivos"
                    value={formData.objetivos}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe tus objetivos financieros principales"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="consulta">Consulta específica</label>
                  <textarea
                    id="consulta"
                    name="consulta"
                    value={formData.consulta}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="¿Hay algo específico que te gustaría tratar en la sesión?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Consulta'}
                </button>

                {submitMessage && (
                  <div className={styles.message}>
                    {submitMessage}
                  </div>
                )}
              </form>
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
              <h2>¿Tienes preguntas?</h2>
              <p>Contáctanos directamente para resolver cualquier duda</p>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <Mail size={20} />
                  <span>consultorio@lozanonahuel.com</span>
                </div>
                <div className={styles.contactItem}>
                  <Phone size={20} />
                  <span>+598 99 123 456</span>
                </div>
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