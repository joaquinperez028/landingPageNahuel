import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { useSession, signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Star,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import styles from '@/styles/ConsultorioFinanciero.module.css';

interface ConsultorioPageProps {
  testimonios: Array<{
    nombre: string;
    foto: string;
    comentario: string;
    resultado: string;
    rating: number;
  }>;
  proximosTurnos: Array<{
    fecha: string;
    horarios: string[];
    disponibles: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const ConsultorioFinancieroPage: React.FC<ConsultorioPageProps> = ({ 
  testimonios, 
  proximosTurnos, 
  faqs 
}) => {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleDateSelect = (fecha: string) => {
    setSelectedDate(fecha);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleTimeSelect = (horario: string) => {
    setSelectedTime(horario);
  };

  const handleSacarTurno = () => {
    if (!session) {
      setShowLoginAlert(true);
      return;
    }

    if (!selectedDate) {
      alert('Por favor selecciona una fecha para tu consulta');
      return;
    }

    if (!selectedTime) {
      alert('Por favor selecciona un horario para tu consulta');
      return;
    }

    // Redirect to payment with selected date and time
    const paymentUrl = `/pago/consultorio-financiero?fecha=${encodeURIComponent(selectedDate)}&hora=${encodeURIComponent(selectedTime)}`;
    window.location.href = paymentUrl;
  };

  const handleLogin = () => {
    signIn('google');
    setShowLoginAlert(false);
  };

  return (
    <>
      <Head>
        <title>Consultorio Financiero - Consulta Individual Personalizada | Nahuel Lozano</title>
        <meta name="description" content="Sesión individual de 60 minutos para optimizar tu estrategia de inversión. Análisis personalizado, recomendaciones específicas y plan de acción detallado." />
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
                  Consultorio Financiero
                  <span className={styles.heroSubtitle}>Consulta Individual Personalizada</span>
                </h1>
                <p className={styles.heroDescription}>
                  Sesión one-on-one de 60 minutos para analizar tu situación financiera 
                  y diseñar una estrategia de inversión personalizada según tu perfil de riesgo y objetivos.
                </p>
                <div className={styles.heroPricing}>
                  <div className={styles.priceCard}>
                    <span className={styles.priceAmount}>$199 USD</span>
                    <span className={styles.priceDescription}>Sesión de 60 minutos</span>
                    <span className={styles.priceIncludes}>Incluye seguimiento por 30 días</span>
                  </div>
                </div>
                <div className={styles.heroFeatures}>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Análisis completo de tu portafolio actual</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Estrategia personalizada según tu perfil</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <CheckCircle size={20} />
                    <span>Plan de acción con objetivos claros</span>
                  </div>
                </div>
              </div>
              <div className={styles.heroVideo}>
                <div className={styles.videoContainer}>
                  {/* Placeholder de video explicativo */}
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.placeholderIcon}>🩺</div>
                    <h3 className={styles.placeholderTitle}>Video: Explicación de la Asesoría</h3>
                    <p className={styles.placeholderText}>
                      Descubre cómo una sesión de Consultorio Financiero puede transformar tu estrategia de inversión
                    </p>
                    <div className={styles.placeholderFeatures}>
                      <span>📊 Análisis Personalizado</span>
                      <span>🎯 Estrategia Específica</span>
                      <span>📈 Plan de Acción</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonios Carrusel */}
        <section className={styles.testimoniosSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Testimonios
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Resultados reales de clientes que transformaron sus finanzas
            </motion.p>
            
            <div className={styles.testimoniosCarousel}>
              <Carousel 
                items={testimonios.map((testimonio, index) => (
                  <div key={index} className={styles.testimonioCard}>
                    <div className={styles.testimonioHeader}>
                      <img 
                        src={testimonio.foto} 
                        alt={testimonio.nombre}
                        className={styles.testimonioFoto}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/80x80/3b82f6/ffffff?text=${testimonio.nombre.charAt(0)}`;
                        }}
                      />
                      <div className={styles.testimonioInfo}>
                        <h4 className={styles.testimonioNombre}>{testimonio.nombre}</h4>
                        <div className={styles.testimonioRating}>
                          {[...Array(testimonio.rating)].map((_, i) => (
                            <Star key={i} size={16} fill="currentColor" />
                          ))}
                        </div>
                        <span className={styles.testimonioResultado}>{testimonio.resultado}</span>
                      </div>
                    </div>
                    <p className={styles.testimonioComentario}>"{testimonio.comentario}"</p>
                  </div>
                ))}
                autoplay={true}
                showDots={true}
                className={styles.testimoniosCarouselWrapper}
              />
            </div>
          </div>
        </section>

        {/* Próximos Turnos */}
        <section className={styles.turnosSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Próximos Turnos
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Selecciona la fecha y horario que mejor se adapte a tu agenda
            </motion.p>
            
            <div className={styles.calendarioContainer}>
              {/* Selector de Fechas */}
              <div className={styles.fechasGrid}>
                {proximosTurnos.map((turno, index) => (
                  <motion.div 
                    key={index}
                    className={`${styles.fechaCard} ${selectedDate === turno.fecha ? styles.fechaSelected : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleDateSelect(turno.fecha)}
                  >
                    <div className={styles.fechaHeader}>
                      <Calendar size={20} />
                      <span className={styles.fecha}>{turno.fecha}</span>
                    </div>
                    <span className={styles.disponibles}>
                      {turno.disponibles} turnos disponibles
                    </span>
                    <div className={styles.horariosPreview}>
                      {turno.horarios.slice(0, 3).map((horario, idx) => (
                        <span key={idx} className={styles.horarioChip}>{horario}</span>
                      ))}
                      {turno.horarios.length > 3 && (
                        <span className={styles.horarioMas}>+{turno.horarios.length - 3}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Selector de Horarios */}
              {selectedDate && (
                <motion.div 
                  className={styles.horariosSection}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className={styles.horariosTitle}>
                    Horarios disponibles para {selectedDate}
                  </h3>
                  <div className={styles.horariosGrid}>
                    {proximosTurnos
                      .find(turno => turno.fecha === selectedDate)
                      ?.horarios.map((horario, index) => (
                        <button
                          key={index}
                          className={`${styles.horarioButton} ${selectedTime === horario ? styles.horarioSelected : ''}`}
                          onClick={() => handleTimeSelect(horario)}
                        >
                          <Clock size={16} />
                          {horario}
                        </button>
                      ))
                    }
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Sacar Turno */}
        <section className={styles.sacarTurnoSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.sacarTurnoCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={styles.turnoInfo}>
                <h3 className={styles.turnoTitle}>¿Listo para tu consulta?</h3>
                <p className={styles.turnoDescription}>
                  {selectedDate && selectedTime ? (
                    <>
                      Has seleccionado: <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>
                    </>
                  ) : (
                    'Selecciona una fecha y horario para proceder con el pago'
                  )}
                </p>
                
                {session ? (
                  <button 
                    className={styles.sacarTurnoButton}
                    onClick={handleSacarTurno}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Confirmar y Pagar
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <div className={styles.loginRequired}>
                    <div className={styles.loginMessage}>
                      <AlertCircle size={20} />
                      <span>Necesitas una cuenta para agendar tu consulta</span>
                    </div>
                    <button 
                      className={styles.loginButton}
                      onClick={handleLogin}
                    >
                      <User size={20} />
                      Iniciar Sesión para Continuar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Preguntas Frecuentes */}
        <section className={styles.faqSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Preguntas Frecuentes
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Resolvemos las dudas más comunes sobre el Consultorio Financiero
            </motion.p>
            
            <div className={styles.faqContainer}>
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  className={styles.faqItem}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button 
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    {openFaq === index ? 
                      <ChevronUp size={20} /> : 
                      <ChevronDown size={20} />
                    }
                  </button>
                  
                  {openFaq === index && (
                    <motion.div 
                      className={styles.faqAnswer}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
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
  const testimonios = [
    {
      nombre: 'Ana Martínez',
      foto: '/testimonios/ana-martinez.jpg',
      comentario: 'La sesión de consultorio cambió completamente mi forma de invertir. Nahuel me ayudó a definir una estrategia clara y ahora veo resultados consistentes.',
      resultado: '+127% en 8 meses',
      rating: 5
    },
    {
      nombre: 'Carlos Rivera',
      foto: '/testimonios/carlos-rivera.jpg',
      comentario: 'Excelente asesoría. Me dio recomendaciones específicas que implementé inmediatamente. Mi portafolio está mucho más diversificado y rentable.',
      resultado: '+89% en 6 meses',
      rating: 5
    },
    {
      nombre: 'Sofía González',
      foto: '/testimonios/sofia-gonzalez.jpg',
      comentario: 'La mejor inversión que hice fue esta consulta. Nahuel me enseñó a manejar el riesgo y a maximizar mis retornos de forma inteligente.',
      resultado: '+156% en 12 meses',
      rating: 5
    },
    {
      nombre: 'Miguel Torres',
      foto: '/testimonios/miguel-torres.jpg',
      comentario: 'Increíble nivel de detalle y personalización. Recibí un plan específico para mi situación que realmente funciona.',
      resultado: '+78% en 4 meses',
      rating: 5
    }
  ];

  const proximosTurnos = [
    {
      fecha: 'Lunes 18 de Marzo',
      horarios: ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'],
      disponibles: 5
    },
    {
      fecha: 'Martes 19 de Marzo',
      horarios: ['10:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM'],
      disponibles: 6
    },
    {
      fecha: 'Miércoles 20 de Marzo',
      horarios: ['11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'],
      disponibles: 4
    },
    {
      fecha: 'Jueves 21 de Marzo',
      horarios: ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'],
      disponibles: 6
    },
    {
      fecha: 'Viernes 22 de Marzo',
      horarios: ['10:00 AM', '12:00 PM', '2:00 PM'],
      disponibles: 3
    }
  ];

  const faqs = [
    {
      question: '¿Qué incluye exactamente la sesión de 60 minutos?',
      answer: 'La sesión incluye: análisis completo de tu situación financiera actual, evaluación de tu perfil de riesgo, recomendaciones específicas de inversión, plan de acción detallado y seguimiento por email durante 30 días.'
    },
    {
      question: '¿Cómo se realiza la consulta?',
      answer: 'La consulta se realiza por videollamada de Google Meet. Te enviaremos el enlace por email 24 horas antes de tu sesión agendada.'
    },
    {
      question: '¿Qué necesito preparar para la sesión?',
      answer: 'Te recomendamos tener a mano información sobre tus inversiones actuales, ingresos, gastos y objetivos financieros. Te enviaremos un formulario previo para optimizar el tiempo de la consulta.'
    },
    {
      question: '¿Puedo reprogramar mi sesión?',
      answer: 'Sí, puedes reprogramar tu sesión hasta 24 horas antes del horario agendado sin costo adicional. Para cambios con menos de 24 horas se aplica una tarifa de $25 USD.'
    },
    {
      question: '¿Qué pasa después de la sesión?',
      answer: 'Dentro de las 48 horas recibirás un documento PDF con el resumen de la sesión, recomendaciones específicas y tu plan de acción personalizado. Además, tendrás seguimiento por email durante 30 días.'
    },
    {
      question: '¿Ofrecen garantía de satisfacción?',
      answer: 'Sí, si no estás satisfecho con tu sesión, te devolvemos el 100% de tu dinero sin preguntas, siempre que lo solicites dentro de las primeras 24 horas después de la consulta.'
    },
    {
      question: '¿En qué zona horaria se manejan los horarios?',
      answer: 'Todos los horarios están en zona horaria Argentina (GMT-3). Durante la reserva puedes especificar tu zona horaria para coordinar mejor la sesión.'
    },
    {
      question: '¿Puedo tener sesiones de seguimiento?',
      answer: 'Sí, ofrecemos sesiones de seguimiento a precio reducido ($149 USD) para clientes que ya tuvieron su primera consulta. Estas sesiones son de 45 minutos y se enfocan en ajustar la estrategia.'
    }
  ];

  return {
    props: {
      testimonios,
      proximosTurnos,
      faqs
    }
  };
};

export default ConsultorioFinancieroPage; 