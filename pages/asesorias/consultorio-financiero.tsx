import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { useSession, signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { generateCircularAvatarDataURL } from '@/lib/utils';
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
import { useBookings } from '@/hooks/useBookings';

interface Testimonio {
  nombre: string;
  foto: string;
  comentario: string;
  resultado: string;
  rating: number;
}

interface TurnoDisponible {
  fecha: string;
  horarios: string[];
  disponibles: number;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ConsultorioPageProps {
  testimonios: Testimonio[];
  faqs: FAQ[];
}

const ConsultorioFinancieroPage: React.FC<ConsultorioPageProps> = ({ 
  testimonios, 
  faqs 
}) => {
  const { data: session } = useSession();
  const { createBooking, loading } = useBookings();
  const [proximosTurnos, setProximosTurnos] = useState<TurnoDisponible[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [loadingTurnos, setLoadingTurnos] = useState(true);

  // Cargar turnos dinámicos al montar el componente
  useEffect(() => {
    loadProximosTurnos();
  }, []);

  const loadProximosTurnos = async () => {
    try {
      setLoadingTurnos(true);
      console.log('🔄 Cargando turnos para Consultorio Financiero...');
      
      // Agregar timestamp para evitar caché
      const timestamp = new Date().getTime();
      const url = `/api/turnos/generate?type=advisory&advisoryType=ConsultorioFinanciero&maxSlotsPerDay=6&_t=${timestamp}`;
      console.log('📡 URL de la API:', url);
      
      const response = await fetch(url, {
        // Forzar recarga sin caché
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log('📊 Status de respuesta:', response.status);
      
      const data = await response.json();
      console.log('📅 Respuesta de turnos:', data);
      
      if (response.ok) {
        const turnos = data.turnos || [];
        setProximosTurnos(turnos);
        console.log(`✅ Cargados ${turnos.length} días con turnos disponibles`);
        console.log('📋 Turnos cargados:', turnos);
      } else {
        console.error('❌ Error al cargar turnos:', data.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar turnos:', error);
    } finally {
      setLoadingTurnos(false);
    }
  };

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

  const handleSacarTurno = async () => {
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

    // Convertir fecha y hora seleccionada a Date
    const turnoSeleccionado = proximosTurnos.find(t => t.fecha === selectedDate);
    if (!turnoSeleccionado) return;

    // Crear la fecha correcta basada en la selección del usuario
    // Necesitamos convertir el formato "Lun 23 Jun" a una fecha real
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Mapear nombres de meses
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Parsear la fecha seleccionada (formato: "Lun 23 Jun")
    const dateParts = selectedDate.split(' ');
    const day = parseInt(dateParts[1]);
    const monthName = dateParts[2];
    const monthIndex = monthNames.indexOf(monthName);
    
    if (monthIndex === -1) {
      alert('Error: Formato de fecha inválido');
      return;
    }
    
    // Crear la fecha objetivo
    const targetDate = new Date(currentYear, monthIndex, day);
    
    // Si la fecha es anterior a hoy, asumir que es del próximo año
    if (targetDate < today) {
      targetDate.setFullYear(currentYear + 1);
    }
    
    // Agregar la hora seleccionada
    const [hour, minute] = selectedTime.split(':').map(Number);
    targetDate.setHours(hour, minute, 0, 0);

    const bookingData = {
      type: 'advisory' as const,
      serviceType: 'ConsultorioFinanciero' as const,
      startDate: targetDate.toISOString(),
      duration: 60,
      price: 199,
      notes: `Reserva desde página de Consultorio Financiero - ${selectedDate} a las ${selectedTime}`
    };

    const booking = await createBooking(bookingData);

    if (booking) {
      console.log('✅ Reserva creada exitosamente, recargando turnos...');
      
      // Actualizar inmediatamente la UI removiendo el turno reservado
      setProximosTurnos(prevTurnos => 
        prevTurnos.map(turno => {
          if (turno.fecha === selectedDate) {
            const horariosActualizados = turno.horarios.filter(h => h !== selectedTime);
            return {
              ...turno,
              horarios: horariosActualizados,
              disponibles: horariosActualizados.length
            };
          }
          return turno;
        }).filter(turno => turno.disponibles > 0) // Remover días sin turnos disponibles
      );
      
      // Esperar un momento para que la base de datos se actualice
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar turnos para actualizar disponibilidad desde el servidor
      await loadProximosTurnos();
      setSelectedDate('');
      setSelectedTime('');
      console.log('🔄 Turnos recargados después de la reserva');
      
      // Mostrar mensaje de éxito
      alert(`¡Reserva confirmada para ${selectedDate} a las ${selectedTime}! 
      
Recibirás un email de confirmación con todos los detalles.
El evento se ha agregado al calendario del administrador.`);
    } else {
      console.log('❌ Error al crear la reserva');
    }
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

        {/* Testimonios Carrusel - Solo mostrar si hay testimonios */}
        {testimonios && testimonios.length > 0 && (
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
                            (e.target as HTMLImageElement).src = generateCircularAvatarDataURL(testimonio.nombre, '#3b82f6', '#ffffff', 80);
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
        )}

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
              {loadingTurnos ? (
                <div className={styles.loadingTurnos}>
                  <p>Cargando turnos disponibles...</p>
                </div>
              ) : proximosTurnos.length === 0 ? (
                <div className={styles.noTurnos}>
                  <p>No hay turnos disponibles en este momento. Intenta más tarde.</p>
                </div>
              ) : (
                <>
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
                </>
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

        {/* Preguntas Frecuentes - Solo mostrar si hay FAQs */}
        {faqs && faqs.length > 0 && (
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
        )}
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Cargar testimonios específicos para consultorio financiero
    const testimoniosResponse = await fetch(`${baseUrl}/api/testimonials?servicio=consultorio`);
    let testimonios: Testimonio[] = [];
    
    if (testimoniosResponse.ok) {
      const testimoniosData = await testimoniosResponse.json();
      testimonios = testimoniosData.testimonials || [];
    }

    // Cargar FAQs específicas para consultorio financiero
    const faqsResponse = await fetch(`${baseUrl}/api/faqs?categoria=consultorio`);
    let faqs: FAQ[] = [];
    
    if (faqsResponse.ok) {
      const faqsData = await faqsResponse.json();
      faqs = faqsData.faqs || [];
    }

    console.log(`✅ Cargados ${testimonios.length} testimonios y ${faqs.length} FAQs para consultorio`);

    return {
      props: {
        testimonios,
        faqs
      }
    };
  } catch (error) {
    console.error('❌ Error al cargar datos del consultorio:', error);
    
    // En caso de error, retornar arrays vacíos
    return {
      props: {
        testimonios: [],
        faqs: []
      }
    };
  }
};

export default ConsultorioFinancieroPage;