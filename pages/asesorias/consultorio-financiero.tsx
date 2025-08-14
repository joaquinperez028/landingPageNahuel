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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Maximize2,
  Settings
} from 'lucide-react';
import styles from '@/styles/ConsultorioFinanciero.module.css';
import { useBookings } from '@/hooks/useBookings';
import YouTubePlayer from '@/components/YouTubePlayer';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservedSlot, setReservedSlot] = useState<{date: string, time: string} | null>(null);

  // Cargar turnos dinámicos al montar el componente
  useEffect(() => {
    loadProximosTurnos();
  }, []);

  // **OPTIMIZACIÓN: Reducir verificación automática a 5 minutos y solo si es necesario**
  useEffect(() => {
    const interval = setInterval(() => {
      // Solo verificar si hay slots seleccionados o si es probable que cambien
      const shouldRefresh = selectedDate && selectedTime;
      if (shouldRefresh && !loading && !loadingTurnos) {
        console.log('🔄 Verificación automática de disponibilidad (5min)...');
        loadProximosTurnos(false); // No forzar en verificaciones automáticas
      }
    }, 300000); // **CAMBIO: 5 minutos en lugar de 30 segundos**

    return () => clearInterval(interval);
  }, [loading, loadingTurnos, selectedDate, selectedTime]);

  // **OPTIMIZACIÓN: Verificación de disponibilidad solo cuando es realmente necesario**
  useEffect(() => {
    // Solo verificar disponibilidad cuando se ha seleccionado completamente una cita
    if (selectedTime && selectedDate && proximosTurnos.length > 0) {
      // Debounce para evitar verificaciones excesivas
      const timeoutId = setTimeout(() => {
        checkRealTimeAvailability(selectedDate, selectedTime);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedTime, selectedDate]);

  // **OPTIMIZACIÓN: Limpiar estado solo cuando cambian los turnos significativamente**
  useEffect(() => {
    // Solo limpiar si realmente hay cambios
    if (proximosTurnos.length > 0) {
      setAvailabilityStatus({});
    }
  }, [proximosTurnos.length]); // Cambiar dependencia a length para evitar re-renders innecesarios

  const loadProximosTurnos = async (forceRefresh = false) => {
    try {
      setLoadingTurnos(true);
      console.log('🚀 Cargando turnos desde AvailableSlot...');
      
      // Usar la nueva API que lee directamente desde AvailableSlot
      const params = new URLSearchParams({
        serviceType: 'ConsultorioFinanciero',
        limit: '50'
      });
      
      // Con el nuevo sistema, no necesitamos caché ni timestamp
      const response = await fetch(`/api/turnos/available-slots?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const turnos = data.turnos || [];
        
        console.log(`✅ ${turnos.length} días con turnos disponibles cargados en ${data.responseTime || 'N/A'} (source: ${data.source || 'unknown'})`);
        
        setProximosTurnos(turnos);
        
        // Limpiar estado de disponibilidad al cargar nuevos turnos
        setAvailabilityStatus({});
      } else {
        console.error('❌ Error al cargar turnos:', data.error);
        setProximosTurnos([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar turnos:', error);
      setProximosTurnos([]);
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

  // Estado para verificación de disponibilidad en tiempo real
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{[key: string]: boolean}>({});

  // Verificar si el horario seleccionado sigue disponible
  const isSelectedTimeStillAvailable = () => {
    if (!selectedDate || !selectedTime) return true; // Si no hay selección, no mostrar error
    
    const key = `${selectedDate}-${selectedTime}`;
    
    // Si tenemos un estado de disponibilidad específico, usarlo
    if (availabilityStatus.hasOwnProperty(key)) {
      return availabilityStatus[key];
    }
    
    // Fallback: verificar en la lista de turnos
    const turnoSeleccionado = proximosTurnos.find(t => t.fecha === selectedDate);
    return turnoSeleccionado?.horarios.includes(selectedTime) || false;
  };

  // Función para verificar disponibilidad en tiempo real
  const checkRealTimeAvailability = async (fecha: string, horario: string) => {
    const key = `${fecha}-${horario}`;
    setIsCheckingAvailability(true);
    
    try {
      console.log(`🔍 Verificando disponibilidad: ${fecha} ${horario}`);
      
      const response = await fetch('/api/turnos/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          fecha,
          horario,
          tipo: 'advisory',
          servicioTipo: 'ConsultorioFinanciero'
        })
      });

      if (!response.ok) {
        console.error(`❌ Error en verificación: ${response.status}`);
        return false; // Si hay error, asumir que NO está disponible
      }

      const data = await response.json();
      
      console.log(`📊 Respuesta de verificación:`, data);
      
      setAvailabilityStatus(prev => ({
        ...prev,
        [key]: data.available
      }));

      console.log(`🔍 Verificación en tiempo real: ${fecha} ${horario} - ${data.available ? '✅ Disponible' : '❌ NO DISPONIBLE'}`);
      
      return data.available;
    } catch (error) {
      console.error('❌ Error al verificar disponibilidad:', error);
      return false; // En caso de error, asumir que NO está disponible
    } finally {
      setIsCheckingAvailability(false);
    }
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

    // **CORREGIDO: Parsear fecha en formato DD/MM/YYYY que viene de la API**
    let targetDate: Date;
    
    try {
      // Verificar si es formato DD/MM/YYYY (formato actual de la API)
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(selectedDate)) {
        const [day, month, year] = selectedDate.split('/').map(Number);
        targetDate = new Date(year, month - 1, day); // month es 0-indexed en JavaScript
        
        console.log(`📅 Fecha parseada desde DD/MM/YYYY: ${selectedDate} → ${targetDate.toISOString()}`);
      } 
      // Fallback: Formato español "Lun 23 Jun" (para compatibilidad)
      else if (/^\w{3} \d{1,2} \w{3}$/.test(selectedDate)) {
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
        
        targetDate = new Date(currentYear, monthIndex, day);
        
        // Si la fecha es anterior a hoy, asumir que es del próximo año
        if (targetDate < today) {
          targetDate.setFullYear(currentYear + 1);
        }
        
        console.log(`📅 Fecha parseada desde formato español: ${selectedDate} → ${targetDate.toISOString()}`);
      }
      // Formato no reconocido
      else {
        console.error('❌ Formato de fecha no reconocido:', selectedDate);
        alert('Error: Formato de fecha inválido');
        return;
      }
      
      // Verificar que la fecha sea válida
      if (isNaN(targetDate.getTime())) {
        console.error('❌ Fecha inválida después del parseo:', selectedDate);
        alert('Error: Fecha inválida');
        return;
      }
      
    } catch (error) {
      console.error('❌ Error al parsear fecha:', error);
      alert('Error: No se pudo procesar la fecha seleccionada');
      return;
    }
    
    // Agregar la hora seleccionada - CORREGIDO: Agregar 3 horas para UTC
    const [hour, minute] = selectedTime.split(':').map(Number);
    
    // SOLUCIÓN: Crear fecha UTC agregando 3 horas (Uruguay es UTC-3)
    // 16:00 local → 19:00 UTC para que Google Calendar muestre 16:00 local
    const utcDate = new Date(Date.UTC(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      hour + 3, // Agregar 3 horas para UTC
      minute,
      0,
      0
    ));

    console.log(`🎯 Fecha y hora final para reserva: ${utcDate.toISOString()}`);
    console.log(`📍 Hora local esperada: ${selectedTime}`);
    console.log(`📍 Hora UTC enviada: ${utcDate.getUTCHours()}:${String(utcDate.getUTCMinutes()).padStart(2, '0')}`);

    const bookingData = {
      type: 'advisory' as const,
      serviceType: 'ConsultorioFinanciero' as const,
      startDate: utcDate.toISOString(),
      duration: 60,
      price: 199,
      notes: `Reserva desde página de Consultorio Financiero - ${selectedDate} a las ${selectedTime}`
    };

    try {
      const booking = await createBooking(bookingData);

      if (booking) {
        console.log('✅ Reserva creada exitosamente');
        
        // ✅ SOLUCIÓN OPTIMIZADA: Actualización inmediata de la UI sin recargas múltiples
        console.log('🔄 Actualizando interfaz inmediatamente...');
        
        // Guardar datos de la reserva antes de limpiar la selección
        const reservedSlotData = { date: selectedDate, time: selectedTime };
        
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
        
        // Limpiar selección inmediatamente
        setSelectedDate('');
        setSelectedTime('');
        
        // ✅ NUEVO SISTEMA: Con AvailableSlot, no necesitamos invalidar caché
        // El horario ya fue marcado como no disponible en la base de datos
        console.log('✅ Horario marcado como no disponible en la base de datos');
        
        // ✅ MEJORADO: Una sola recarga para confirmar sincronización (opcional)
        setTimeout(async () => {
          console.log('🔄 Recarga de confirmación...');
          await loadProximosTurnos();
          console.log('✅ Confirmación de sincronización completada');
        }, 1000);
        
        // Mostrar modal de éxito inmediatamente
        setReservedSlot(reservedSlotData);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.log('❌ Error al crear la reserva:', error);
      
      // Si es un error de conflicto (409), recargar turnos para mostrar disponibilidad actualizada
      if (error.message?.includes('Horario no disponible') || error.message?.includes('409')) {
        console.log('🔄 Recargando turnos debido a conflicto...');
        
        // Recargar turnos inmediatamente con forzado de recarga
        await loadProximosTurnos(true);
        
        // El mensaje de error ya se mostró en el hook useBookings
        // Ahora el sistema mostrará automáticamente el mensaje rojo porque el turno ya no estará disponible
        console.log('⚠️ Turno ya no disponible, la UI se actualizará automáticamente');
      }
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
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>Consultorio Financiero</h1>
              <p className={styles.heroDescription}>
                Sesiones virtuales e individuales para analizar tu situación financiera actual y diseñar una estrategia de inversión personalizada según tu perfil de riesgo y objetivos.
              </p>
              <a href="#formulario-turno" className={styles.heroButtonGold}>
                Agendar Turno &gt;
              </a>
            </div>
            <div className={styles.heroVideo}>
              <div className={styles.videoContainer}>
                <YouTubePlayer
                  videoId="dQw4w9WgXcQ"
                  title="Consultorio Financiero - Introducción"
                  autoplay={false}
                  muted={true}
                  loop={false}
                  className={styles.videoPlayer}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sección Asesoramiento Personalizado */}
        <section className={styles.asesoramientoSection}>
          <div className={styles.asesoramientoContainer}>
            <div className={styles.asesoramientoImage}>
              <img 
                src="/logos/asesoria foto.png" 
                alt="Nahuel Lozano - Asesor Financiero"
                className={styles.nahuelImage}
              />
            </div>
          </div>
        </section>

        {/* Formulario de Reserva */}
        <section className={styles.reservaSection} id="formulario-turno">
          <div className={styles.reservaContainer}>
            <h2 className={styles.reservaTitle}>Próximos Turnos</h2>
            <p className={styles.reservaSubtitle}>
              Selecciona la fecha y hora que mejor se adapte a tu agenda. Sesiones de 60 minutos para un análisis completo de tu situación financiera.
            </p>
            
            <div className={styles.reservaCard}>
              <div className={styles.reservaContent}>
                {/* Calendario y Horarios */}
                <div className={styles.calendarioSection}>
                  <h3 className={styles.calendarioTitle}>Selecciona una fecha y hora</h3>
                  
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
                          <div 
                            key={index}
                            className={`${styles.fechaCard} ${selectedDate === turno.fecha ? styles.fechaSelected : ''}`}
                            onClick={() => handleDateSelect(turno.fecha)}
                          >
                            <div className={styles.fechaHeader}>
                              <Calendar size={20} />
                              <span className={styles.fecha}>{turno.fecha}</span>
                            </div>
                            <span className={styles.disponibles}>
                              {turno.disponibles} turnos disponibles
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Selector de Horarios */}
                      {selectedDate && (
                        <div className={styles.horariosSection}>
                          <h4 className={styles.horariosTitle}>
                            Horarios disponibles para {selectedDate}
                          </h4>
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
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Formulario de Datos */}
                <div className={styles.formularioSection}>
                  <h3 className={styles.formularioTitle}>Introduzca los detalles</h3>
                  
                  <form className={styles.formulario}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="nombre" className={styles.formLabel}>
                          Nombre *
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          className={styles.formInput}
                          defaultValue="Nahuel"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="apellido" className={styles.formLabel}>
                          Apellido *
                        </label>
                        <input
                          type="text"
                          id="apellido"
                          name="apellido"
                          className={styles.formInput}
                          defaultValue="Lozano"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                          Correo electrónico *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className={styles.formInput}
                          defaultValue="lozanonahuel@gmail.com"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="whatsapp" className={styles.formLabel}>
                          Número de Whatsapp *
                        </label>
                        <input
                          type="tel"
                          id="whatsapp"
                          name="whatsapp"
                          className={styles.formInput}
                          placeholder="+54 9 11 1234-5678"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="comoConociste" className={styles.formLabel}>
                          Donde o como conociste
                        </label>
                        <textarea
                          id="comoConociste"
                          name="comoConociste"
                          className={styles.formTextarea}
                          rows={3}
                          placeholder="Cuéntanos cómo llegaste a nosotros..."
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className={styles.precioSection}>
                      <span className={styles.precioLabel}>Valor de la consulta:</span>
                      <span className={styles.precioValor}>$50.000</span>
                    </div>
                    
                    {session ? (
                      <button 
                        type="button"
                        className={styles.confirmarButton}
                        onClick={handleSacarTurno}
                        disabled={!selectedDate || !selectedTime || loading}
                      >
                        {loading ? 'Procesando...' : 'Confirmar Turno >'}
                      </button>
                    ) : (
                      <div className={styles.loginRequired}>
                        <p>Necesitas iniciar sesión para reservar un turno</p>
                        <button 
                          type="button"
                          className={styles.loginButton}
                          onClick={handleLogin}
                        >
                          Iniciar Sesión
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recordatorio para Agendar Turno */}
        <section className={styles.recordatorioSection}>
          <div className={styles.recordatorioContainer}>
            <h2 className={styles.recordatorioTitle}>
              ¿Listo para llevar tus inversiones al siguiente nivel?
            </h2>
            <p className={styles.recordatorioSubtitle}>
              Únete a nuestra comunidad y comienza a construir tu libertad financiera
            </p>
            <a href="#formulario-turno" className={styles.recordatorioButton}>
              Agendar Turno {'>'}
            </a>
          </div>
        </section>

        {/* Recordatorio YouTube */}
        <section className={styles.youtubeSection}>
          <div className={styles.youtubeContainer}>
            <div className={styles.youtubeContent}>
              <div className={styles.youtubeText}>
                <h2 className={styles.youtubeTitle}>
                  ¡Sumate a nuestra comunidad
                  <br />
                  <span className={styles.youtubeHighlight}>en YouTube!</span>
                </h2>
                <p className={styles.youtubeSubtitle}>
                  No te pierdas nuestros últimos videos
                </p>
              </div>
              
              <div className={styles.youtubeVideoContainer}>
                <div className={styles.videoArrow}>
                  <ChevronLeft size={24} />
                </div>
                
                <div className={styles.videoPlayer}>
                  <YouTubePlayer
                    videoId="dQw4w9WgXcQ"
                    title="Consultorio Financiero - Testimonios"
                    autoplay={false}
                    muted={true}
                    loop={false}
                    className={styles.videoPlayer}
                  />
                </div>
                
                <div className={styles.videoArrow}>
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
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

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.successModal}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className={styles.modalHeader}>
              <div className={styles.successIcon}>✅</div>
              <h2 className={styles.modalTitle}>¡Reserva Confirmada!</h2>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.reservationDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>📅 Fecha:</span>
                  <span className={styles.detailValue}>{reservedSlot?.date}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>🕐 Hora:</span>
                  <span className={styles.detailValue}>{reservedSlot?.time}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>💼 Servicio:</span>
                  <span className={styles.detailValue}>Consultorio Financiero</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>💰 Precio:</span>
                  <span className={styles.detailValue}>$199 USD</span>
                </div>
              </div>
              
              <div className={styles.modalInfo}>
                <div className={styles.infoBox}>
                  <h4>📧 Próximos pasos:</h4>
                  <ul>
                    <li>Recibirás un email de confirmación con todos los detalles</li>
                    <li>El evento se agregó al calendario del administrador</li>
                    <li>Te contactaremos 24 horas antes con el link de la reunión</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setReservedSlot(null);
                }}
                className={styles.modalButton}
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}

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