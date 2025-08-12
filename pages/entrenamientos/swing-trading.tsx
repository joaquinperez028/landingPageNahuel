import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { toast } from 'react-hot-toast';
import { generateCircularAvatarDataURL } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import TrainingRoadmap from '@/components/TrainingRoadmap';
import ClassCalendar from '@/components/ClassCalendar';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Target,
  Award,
  PlayCircle,
  Calendar,
  User,
  Quote,
  Loader
} from 'lucide-react';
import styles from '@/styles/SwingTrading.module.css';

interface TrainingData {
  tipo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  metricas: {
    rentabilidad: string;
    estudiantesActivos: string;
    entrenamientosRealizados: string;
    satisfaccion: string;
  };
  contenido: {
    modulos: number;
    lecciones: number;
    certificacion: boolean;
    nivelAcceso: string;
  };
}

interface ProgramModule {
  module: number;
  title: string;
  duration: string;
  lessons: number;
  topics: string[];
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  results: string;
}

interface RoadmapModule {
  id: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  lecciones: number;
  temas: Array<{
    titulo: string;
    descripcion?: string;
  }>;
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
  prerequisito?: number;
  orden: number;
  activo: boolean;
}

interface TrainingDate {
  id: string;
  date: Date;
  time: string;
  title: string;
  isActive: boolean;
  createdBy: string;
}

interface TradingPageProps {
  training: TrainingData;
  program: ProgramModule[];
  testimonials: Testimonial[];
}

const SwingTradingPage: React.FC<TradingPageProps> = ({ 
  training,
  program, 
  testimonials
}) => {
  const { data: session } = useSession();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  
  // Estados para roadmaps dinámicos
  const [roadmapModules, setRoadmapModules] = useState<RoadmapModule[]>([]);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [roadmapError, setRoadmapError] = useState<string>('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    experienciaTrading: '',
    objetivos: '',
    nivelExperiencia: 'principiante',
    consulta: ''
  });

  // Estados para el countdown y fecha de inicio
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  const [startDateText, setStartDateText] = useState('11 de octubre a las 13 hs');
  
  // Estados para gestión de fechas de entrenamiento
  const [trainingDates, setTrainingDates] = useState<TrainingDate[]>([]);
  const [nextTrainingDate, setNextTrainingDate] = useState<TrainingDate | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Función para calcular el countdown basado en la fecha de inicio
  const calculateCountdown = (startDate: Date, startTime: string) => {
    const now = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const targetDate = new Date(startDate);
    targetDate.setHours(startHours, startMinutes, 0, 0);
    
    const diff = targetDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        nombre: session.user.name || '',
        email: session.user.email || ''
      }));
      
      // Verificar si el usuario ya está inscrito
      checkEnrollmentStatus();
    }
  }, [session]);

  // Cargar roadmaps dinámicos
  useEffect(() => {
    fetchRoadmaps();
  }, []);

  // Cargar fechas de entrenamiento y verificar admin
  useEffect(() => {
    loadTrainingDates();
    
    // Verificar si el usuario es admin
    if (session?.user?.email) {
      setIsAdmin(session.user.email === 'joaquinperez028@gmail.com' || session.user.email === 'franco.l.varela99@gmail.com');
    }
  }, [session]);

  // Countdown timer dinámico basado en la próxima fecha de entrenamiento
  useEffect(() => {
    const updateCountdown = () => {
      if (nextTrainingDate) {
        const newCountdown = calculateCountdown(nextTrainingDate.date, nextTrainingDate.time);
        setCountdown(newCountdown);
        
        // Actualizar texto de fecha de inicio
        const formattedDate = nextTrainingDate.date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long'
        });
        setStartDateText(`${formattedDate} a las ${nextTrainingDate.time} hs`);
      } else {
        // Fallback si no hay próxima fecha
        const defaultDate = new Date('2024-10-11T13:00:00.000Z');
        const defaultTime = '13:00';
        const newCountdown = calculateCountdown(defaultDate, defaultTime);
        setCountdown(newCountdown);
        setStartDateText('Próximamente - Fechas por confirmar');
      }
    };

    // Actualizar countdown inicial
    updateCountdown();

    // Actualizar cada minuto
    const timer = setInterval(updateCountdown, 60000);

    return () => clearInterval(timer);
  }, [nextTrainingDate]);

  // Efecto para actualizar la próxima fecha cuando pasa el tiempo
  useEffect(() => {
    const checkForNextDate = () => {
      const nextDate = findNextTrainingDate(trainingDates);
      if (nextDate !== nextTrainingDate) {
        setNextTrainingDate(nextDate);
      }
    };

    // Verificar cada hora si hay que actualizar la próxima fecha
    const timer = setInterval(checkForNextDate, 3600000); // 1 hora

    return () => clearInterval(timer);
  }, [trainingDates, nextTrainingDate]);

  const fetchRoadmaps = async () => {
    try {
      setLoadingRoadmap(true);
      setRoadmapError('');
      
      const response = await fetch('/api/roadmaps/tipo/SwingTrading');
      const data = await response.json();
      
      if (data.success && data.data.roadmaps.length > 0) {
        // Tomar el primer roadmap activo
        const activeRoadmap = data.data.roadmaps.find((r: any) => r.activo) || data.data.roadmaps[0];
        
        if (activeRoadmap) {
          // Cargar módulos independientes del roadmap
          const modulesResponse = await fetch(`/api/modules/roadmap/${activeRoadmap._id}`);
          const modulesData = await modulesResponse.json();
          
          if (modulesData.success && modulesData.data.modules.length > 0) {
            // Transformar módulos para ser compatibles con TrainingRoadmap
            const transformedModules = modulesData.data.modules.map((module: any) => ({
              id: module._id,
              titulo: module.nombre,
              descripcion: module.descripcion,
              duracion: module.duracion,
              lecciones: module.lecciones,
              temas: module.temas,
              dificultad: module.dificultad,
              prerequisito: module.prerequisito?._id,
              orden: module.orden,
              activo: module.activo
            }));
            
            setRoadmapModules(transformedModules);
          } else {
            setRoadmapError('Este roadmap aún no tiene módulos creados. Contacta al administrador.');
          }
        } else {
          setRoadmapError('No se encontró un roadmap activo para Swing Trading');
        }
      } else {
        setRoadmapError('No se encontraron roadmaps para Swing Trading');
      }
    } catch (error) {
      console.error('Error al cargar roadmaps:', error);
      setRoadmapError('Error al cargar el roadmap de aprendizaje');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!session?.user?.email) return;
    
    setCheckingEnrollment(true);
    try {
      const response = await fetch('/api/user/entrenamientos');
      if (response.ok) {
        const data = await response.json();
        const hasSwingTrading = data.data.tiposDisponibles.includes('SwingTrading');
        setIsEnrolled(hasSwingTrading);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  // Función para encontrar la próxima fecha de entrenamiento
  const findNextTrainingDate = (dates: TrainingDate[]): TrainingDate | null => {
    const now = new Date();
    const futureDates = dates
      .filter(date => date.isActive && date.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return futureDates.length > 0 ? futureDates[0] : null;
  };

  // Función auxiliar para obtener el inicio de la semana (domingo)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Función para cargar fechas de entrenamiento (simplificada)
  const loadTrainingDates = async () => {
    try {
      console.log('📅 Cargando fechas específicas de Swing Trading...');
      
      const response = await fetch('/api/training-dates/SwingTrading');
      const data = await response.json();
      
      if (data.success && data.dates) {
        const dates = data.dates.map((date: any) => ({
          ...date,
          date: new Date(date.date)
        }));
        
        console.log('✅ Fechas cargadas:', dates.length);
        
        setTrainingDates(dates);
        const nextDate = findNextTrainingDate(dates);
        setNextTrainingDate(nextDate);
        
        // Actualizar el countdown y texto de fecha
        if (nextDate) {
          const dateOptions: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long' 
          };
          const formattedDate = nextDate.date.toLocaleDateString('es-ES', dateOptions);
          setStartDateText(`${formattedDate} a las ${nextDate.time} hs`);
        } else {
          setStartDateText('Próximamente - Fechas por confirmar');
        }
      } else {
        console.log('📭 No hay fechas específicas configuradas');
        setTrainingDates([]);
        setNextTrainingDate(null);
        setStartDateText('Próximamente - Fechas por confirmar');
      }
      
    } catch (error) {
      console.error('❌ Error cargando fechas:', error);
      setTrainingDates([]);
      setNextTrainingDate(null);
      setStartDateText('Próximamente - Fechas por confirmar');
    }
  };

  // Función para que el admin agregue una nueva fecha
  const handleAddTrainingDate = async (date: Date, time: string, title: string) => {
    if (!isAdmin) return;

    const newDate: TrainingDate = {
      id: `training-${Date.now()}`,
      date,
      time,
      title,
      isActive: true,
      createdBy: session?.user?.email || 'admin'
    };

    try {
      const response = await fetch('/api/training-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingType: 'SwingTrading',
          ...newDate
        })
      });

      if (response.ok) {
        const updatedDates = [...trainingDates, newDate];
        setTrainingDates(updatedDates);
        
        const nextDate = findNextTrainingDate(updatedDates);
        setNextTrainingDate(nextDate);
        
        toast.success('Fecha de entrenamiento agregada exitosamente');
      }
    } catch (error) {
      console.error('Error adding training date:', error);
      toast.error('Error al agregar la fecha');
    }
  };

  // Función para manejar selección de fechas en el calendario
  const handleCalendarDateSelect = (selectedDate: Date, existingEvents: any[]) => {
    if (!isAdmin) return;

    // Mostrar modal o form para agregar nueva fecha
    const time = prompt('Ingrese la hora (formato HH:MM):', '13:00');
    const title = prompt('Ingrese el título de la clase:', `Clase ${trainingDates.length + 1}`);
    
    if (time && title) {
      handleAddTrainingDate(selectedDate, time, title);
    }
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleEnroll = async () => {
    if (!session) {
      toast.error('Debes iniciar sesión primero para inscribirte');
      signIn('google');
      return;
    }
    
    if (isEnrolled) {
      // Si ya está inscrito, ir directamente a las lecciones
      window.location.href = '/entrenamientos/SwingTrading/lecciones';
      return;
    }
    
    // Iniciar proceso de pago con MercadoPago
    setIsProcessingPayment(true);
    
    try {
      const response = await fetch('/api/payments/mercadopago/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          type: 'training',
          service: 'SwingTrading',
          amount: 497,
          currency: 'USD'
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(data.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar el pago. Inténtalo nuevamente.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnrolling(true);

    try {
      const response = await fetch('/api/entrenamientos/inscribir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo: 'SwingTrading',
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || '¡Inscripción exitosa! Redirigiendo a las lecciones...');
        setShowEnrollForm(false);
        
        // Resetear formulario
        setFormData({
          nombre: session?.user?.name || '',
          email: session?.user?.email || '',
          telefono: '',
          experienciaTrading: '',
          objetivos: '',
          nivelExperiencia: 'principiante',
          consulta: ''
        });

        // Redirigir a las lecciones después de 2 segundos
        setTimeout(() => {
          window.location.href = data.data.redirectUrl;
        }, 2000);
      } else {
        if (response.status === 409) {
          // Ya está inscrito
          toast.success('Ya tienes acceso a este entrenamiento. Redirigiendo a las lecciones...');
          setTimeout(() => {
            window.location.href = '/entrenamientos/SwingTrading/lecciones';
          }, 1500);
        } else {
          toast.error(data.error || 'Error al procesar inscripción');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar inscripción. Inténtalo nuevamente.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleModuleClick = (moduleId: number) => {
    console.log(`Accediendo al módulo ${moduleId}`);
    // Aquí se implementaría la navegación al módulo específico
  };

  return (
    <>
      <Head>
        <title>Swing Trading - Entrenamiento Completo | Nahuel Lozano</title>
        <meta name="description" content="Experiencia de aprendizaje premium, personalizada y con acompañamiento constante, donde aprenderás a operar movimientos de varios días o semanas, identificando oportunidades con análisis técnico y estrategias que combinan precisión y paciencia" />
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
                  Swing Trading
                </h1>
                <p className={styles.heroDescription}>
                  Experiencia de aprendizaje premium, personalizada y con acompañamiento constante, donde aprenderás a operar movimientos de varios días o semanas, identificando oportunidades con análisis técnico y estrategias que combinan precisión y paciencia
                </p>
                
                <div className={styles.startDate}>
                  Fecha de inicio: {startDateText}
                </div>
                
                <div className={styles.countdownContainer}>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownNumber}>{countdown.days}</span>
                    <span className={styles.countdownLabel}>Días</span>
                  </div>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownNumber}>{countdown.hours}</span>
                    <span className={styles.countdownLabel}>Horas</span>
                  </div>
                  <div className={styles.countdownBox}>
                    <span className={styles.countdownNumber}>{countdown.minutes}</span>
                    <span className={styles.countdownLabel}>Minutos</span>
                  </div>
                </div>
                <button 
                  onClick={handleEnroll}
                  className={styles.enrollButton}
                  disabled={checkingEnrollment || isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader size={20} className={styles.spinner} />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Inscribirme Ahora &gt;
                    </>
                  )}
                </button>
              </div>
              <div className={styles.heroVideo}>
                <div className={styles.videoContainer}>
                  <div className={styles.videoPlayer}>
                    <div className={styles.videoPlaceholder}>
                      <div className={styles.playButton}>
                        <PlayCircle size={60} />
                      </div>
                    </div>
                    <div className={styles.videoControls}>
                      <div className={styles.videoProgress}>
                        <span className={styles.currentTime}>2:21</span>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill}></div>
                        </div>
                        <span className={styles.totalTime}>20:00</span>
                      </div>
                      <div className={styles.controlButtons}>
                        <button className={styles.controlBtn}>⏮</button>
                        <button className={styles.controlBtn}>⏯</button>
                        <button className={styles.controlBtn}>⏭</button>
                        <button className={styles.controlBtn}>🔊</button>
                        <button className={styles.controlBtn}>⚙️</button>
                        <button className={styles.controlBtn}>⛶</button>
                        <button className={styles.controlBtn}>⛶</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Info Cards Section */}
        <section className={styles.infoCardsSection}>
          <div className={styles.infoCardsContainer}>
            {/* Card 1: ¿Por qué realizar este entrenamiento? */}
            <motion.div 
              className={styles.infoCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className={styles.infoCardTitle}>
                ¿Por qué realizar este entrenamiento?
              </h3>
              <ul className={styles.infoCardList}>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>🎯</span>
                  <span className={styles.infoCardText}>Porque hay que aplicar el análisis correcto</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>✅</span>
                  <span className={styles.infoCardText}>Necesitás una estrategia efectiva</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>🔧</span>
                  <span className={styles.infoCardText}>Método probado con guía paso a paso</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>⏰</span>
                  <span className={styles.infoCardText}>Ahorras tiempo, dinero y energía</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>🚀</span>
                  <span className={styles.infoCardText}>Transforma la teoría en resultados</span>
                </li>
              </ul>
            </motion.div>

            {/* Card 2: ¿Para quién es esta experiencia? */}
            <motion.div 
              className={styles.infoCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className={styles.infoCardTitle}>
                ¿Para quién es esta experiencia?
              </h3>
              <ul className={styles.infoCardList}>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>📚</span>
                  <span className={styles.infoCardText}>Para quienes ya saben análisis técnico</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>✅</span>
                  <span className={styles.infoCardText}>Traders que buscan resultados sostenibles</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>📈</span>
                  <span className={styles.infoCardText}>Quienes operan sin una estrategia eficaz</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>💼</span>
                  <span className={styles.infoCardText}>Personas comprometidas con la disciplina</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>🧠</span>
                  <span className={styles.infoCardText}>Para los que quieran operar con criterio</span>
                </li>
              </ul>
            </motion.div>

            {/* Card 3: ¿Cómo es el entrenamiento? */}
            <motion.div 
              className={styles.infoCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className={styles.infoCardTitle}>
                ¿Cómo es el entrenamiento?
              </h3>
              <ul className={styles.infoCardList}>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>⏰</span>
                  <span className={styles.infoCardText}>3 meses de entrenamiento intensivo</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>💻</span>
                  <span className={styles.infoCardText}>Clases semanales y en vivo 100% online</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>🔍</span>
                  <span className={styles.infoCardText}>Espacio para análisis de dudas y evolución</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>📂</span>
                  <span className={styles.infoCardText}>Material descargable y herramientas útiles</span>
                </li>
                <li className={styles.infoCardItem}>
                  <span className={styles.infoCardIcon}>👥</span>
                  <span className={styles.infoCardText}>Grupo chico y con seguimiento constante</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className={styles.roadmapSection}>
          <div className={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {loadingRoadmap ? (
                <div className={styles.loadingContainer}>
                  <Loader size={40} className={styles.loadingSpinner} />
                  <p>Cargando roadmap de aprendizaje...</p>
                </div>
              ) : roadmapError ? (
                <div className={styles.errorContainer}>
                  <p className={styles.errorMessage}>{roadmapError}</p>
                </div>
              ) : roadmapModules.length > 0 ? (
                <TrainingRoadmap
                  modules={roadmapModules}
                  onModuleClick={handleModuleClick}
                  title="Roadmap de Swing Trading"
                  description="Progresión estructurada diseñada para llevarte de principiante a trader avanzado en Swing Trading"
                />
              ) : (
                <div className={styles.noRoadmapContainer}>
                  <p>No hay roadmap disponible para este entrenamiento.</p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Formulario de Inscripción Modal */}
        {showEnrollForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
              <div className={styles.modalHeader}>
                <h3>Inscripción a Swing Trading</h3>
                <button 
                  onClick={() => setShowEnrollForm(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitEnrollment} className={styles.enrollForm}>
                <div className={styles.formGroup}>
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Nivel de experiencia en trading</label>
                  <select
                    value={formData.nivelExperiencia}
                    onChange={(e) => setFormData({...formData, nivelExperiencia: e.target.value})}
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>¿Cuáles son tus objetivos con el trading?</label>
                  <textarea
                    value={formData.objetivos}
                    onChange={(e) => setFormData({...formData, objetivos: e.target.value})}
                    placeholder="Describe qué esperas lograr con este entrenamiento..."
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Experiencia previa (opcional)</label>
                  <textarea
                    value={formData.experienciaTrading}
                    onChange={(e) => setFormData({...formData, experienciaTrading: e.target.value})}
                    placeholder="Cuéntanos sobre tu experiencia previa en trading..."
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Consulta adicional (opcional)</label>
                  <textarea
                    value={formData.consulta}
                    onChange={(e) => setFormData({...formData, consulta: e.target.value})}
                    placeholder="¿Tienes alguna pregunta específica?"
                  />
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setShowEnrollForm(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isEnrolling}
                    className={styles.submitButton}
                  >
                    {isEnrolling ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Números con Datos Actualizables */}
        <section className={styles.metricsSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Números que Respaldan la Calidad
            </motion.h2>
            
            <div className={styles.metricsGrid}>
              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className={styles.metricIcon}>
                  <Users size={40} />
                </div>
                <h3 className={styles.metricNumber}>{training.metricas.estudiantesActivos}</h3>
                <p className={styles.metricLabel}>Estudiantes Formados</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.metricIcon}>
                  <Target size={40} />
                </div>
                <h3 className={styles.metricNumber}>{training.metricas.rentabilidad}</h3>
                <p className={styles.metricLabel}>Rentabilidad Promedio</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className={styles.metricIcon}>
                  <Star size={40} />
                </div>
                <h3 className={styles.metricNumber}>{training.metricas.satisfaccion}/5</h3>
                <p className={styles.metricLabel}>Satisfacción Promedio</p>
              </motion.div>

              <motion.div 
                className={styles.metricCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className={styles.metricIcon}>
                  <Award size={40} />
                </div>
                <h3 className={styles.metricNumber}>{training.metricas.entrenamientosRealizados}</h3>
                <p className={styles.metricLabel}>Entrenamientos Realizados</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Roadmap de Aprendizaje */}
        <section className={styles.roadmapSection}>
          <div className={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {loadingRoadmap ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Loader size={48} className="spinning" style={{ margin: '0 auto 1rem', color: '#3b82f6' }} />
                  <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Cargando roadmap de aprendizaje...</p>
                </div>
              ) : roadmapError ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error al cargar roadmap</h3>
                  <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{roadmapError}</p>
                  <button 
                    onClick={fetchRoadmaps}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      background: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : roadmapModules.length > 0 ? (
                <TrainingRoadmap
                  modules={roadmapModules}
                  onModuleClick={handleModuleClick}
                  title="Roadmap de Swing Trading"
                  description="Progresión estructurada desde principiante hasta trader competente"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                    Roadmap no disponible en este momento
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Calendario de Clases */}
        <section className={styles.calendarSection}>
          <div className={styles.container}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <ClassCalendar
                events={trainingDates.map(trainingDate => ({
                  date: trainingDate.date.getDate(),
                  time: `${trainingDate.time}hs`,
                  title: trainingDate.title,
                  id: trainingDate.id
                }))}
                isAdmin={isAdmin}
                onDateSelect={handleCalendarDateSelect}
              />
            </motion.div>
          </div>
        </section>

        {/* Testimonios */}
        <section className={styles.testimonialsSection}>
          <div className={styles.container}>
            <motion.div
              className={styles.testimonialsCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.testimonialsContent}>
                <div className={styles.testimonialItem}>
                  <div className={styles.testimonialAvatar}>
                    <span className={styles.testimonialInitial}>C</span>
                  </div>
                  <div className={styles.testimonialInfo}>
                    <h4 className={styles.testimonialName}>Carlos Mendoza</h4>
                    <div className={styles.testimonialRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={styles.testimonialStar} />
                      ))}
                    </div>
                    <p className={styles.testimonialText}>
                      "Las alertas de Nahuel me han ayudado a incrementar mi cuenta un 25% en los últimos 6 meses."
                    </p>
                  </div>
                </div>

                <div className={styles.testimonialItem}>
                  <div className={styles.testimonialAvatar} style={{backgroundColor: '#ef4444'}}>
                    <span className={styles.testimonialInitial}>A</span>
                  </div>
                  <div className={styles.testimonialInfo}>
                    <h4 className={styles.testimonialName}>Ana Laura Quiroga</h4>
                    <div className={styles.testimonialRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={styles.testimonialStar} />
                      ))}
                    </div>
                    <p className={styles.testimonialText}>
                      "Los cursos de análisis técnico son realmente muy buenos y didácticos. 100% recomendables!"
                    </p>
                  </div>
                </div>

                <div className={styles.testimonialItem}>
                  <div className={styles.testimonialAvatar} style={{backgroundColor: '#22c55e'}}>
                    <span className={styles.testimonialInitial}>T</span>
                  </div>
                  <div className={styles.testimonialInfo}>
                    <h4 className={styles.testimonialName}>Tamara Rodriguez</h4>
                    <div className={styles.testimonialRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={styles.testimonialStar} />
                      ))}
                    </div>
                    <p className={styles.testimonialText}>
                      "Las recomendaciones que brindan en las asesorías a 1 a 1 son muy buenas. Estoy muy conforme"
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation arrows */}
              <div className={styles.testimonialsNavigation}>
                <button className={styles.testimonialNavButton}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className={styles.testimonialNavButton}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Programa Detallado */}
        <section className={styles.programSection}>
          <div className={styles.container}>
            <motion.h2 
              className={styles.sectionTitle}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Programa Completo
            </motion.h2>
            <motion.p 
              className={styles.sectionDescription}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {training.contenido.modulos} módulos progresivos con {training.contenido.lecciones} lecciones prácticas
            </motion.p>
            
            <div className={styles.programGrid}>
              {program.map((module, index) => (
                <motion.div 
                  key={module.module}
                  className={styles.moduleCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.moduleHeader}>
                    <div className={styles.moduleNumber}>
                      <BookOpen size={24} />
                      <span>Módulo {module.module}</span>
                    </div>
                    <div className={styles.moduleMeta}>
                      <span className={styles.moduleDuration}>
                        <Clock size={16} />
                        {module.duration}
                      </span>
                      <span className={styles.moduleLessons}>
                        {module.lessons} lecciones
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.moduleContent}>
                    <h3 className={styles.moduleTitle}>{module.title}</h3>
                    <p className={styles.moduleDescription}>{module.description}</p>
                    
                    <div className={styles.moduleTopics}>
                      <h4>Temas principales:</h4>
                      <ul>
                        {module.topics.map((topic, topicIndex) => (
                          <li key={topicIndex}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        {testimonials && testimonials.length > 0 && (
          <section className={styles.testimoniosSection}>
            <div className={styles.container}>
              <motion.h2 
                className={styles.sectionTitle}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Testimonios de Estudiantes
              </motion.h2>
              <motion.p 
                className={styles.sectionDescription}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Resultados reales de estudiantes que transformaron su trading
              </motion.p>
              
              <div className={styles.testimoniosCarousel}>
                <Carousel 
                  items={testimonials.map((testimonial, index) => (
                    <div key={index} className={styles.testimonioCard}>
                      <div className={styles.testimonioHeader}>
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className={styles.testimonioFoto}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = generateCircularAvatarDataURL(testimonial.name, '#3b82f6', '#ffffff', 80);
                          }}
                        />
                        <div className={styles.testimonioInfo}>
                          <h4 className={styles.testimonioNombre}>{testimonial.name}</h4>
                          <span className={styles.testimonioRole}>{testimonial.role}</span>
                          <div className={styles.testimonioRating}>
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} size={16} fill="currentColor" />
                            ))}
                          </div>
                          <span className={styles.testimonioResultado}>{testimonial.results}</span>
                        </div>
                      </div>
                      <p className={styles.testimonioComentario}>"{testimonial.content}"</p>
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

        {/* Call to Action Final */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <motion.div 
              className={styles.ctaContent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.ctaTitle}>
                ¿Listo para Transformar tu Trading?
              </h2>
              <p className={styles.ctaDescription}>
                Únete a los {training.metricas.estudiantesActivos}+ estudiantes que ya están aplicando 
                estas estrategias exitosamente.
              </p>
              <div className={styles.ctaPrice}>
                <span className={styles.ctaPriceAmount}>${training.precio} USD</span>
                <span className={styles.ctaPriceDescription}>
                  Programa completo • Acceso de por vida • Certificación incluida
                </span>
              </div>
              <button 
                onClick={handleEnroll}
                className={styles.ctaButton}
                disabled={checkingEnrollment}
              >
                <Users size={20} />
                {checkingEnrollment 
                  ? 'Verificando...' 
                  : isEnrolled 
                    ? 'Ir a las Lecciones' 
                    : 'Comenzar Ahora'
                }
                <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Obtener datos del entrenamiento desde la API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/entrenamientos/SwingTrading`);
    
    if (!response.ok) {
      throw new Error('Error fetching training data');
    }
    
    const data = await response.json();
    
    return {
      props: {
        training: data.data.training,
        program: data.data.program,
        testimonials: data.data.testimonials
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Datos de fallback en caso de error
    return {
      props: {
        training: {
          tipo: 'SwingTrading',
          nombre: 'Swing Trading',
          descripcion: 'Experiencia de aprendizaje premium, personalizada y con acompañamiento constante, donde aprenderás a operar movimientos de varios días o semanas, identificando oportunidades con análisis técnico y estrategias que combinan precisión y paciencia',
          precio: 497,
          duracion: 40,
          metricas: {
            rentabilidad: '120%',
            estudiantesActivos: '850',
            entrenamientosRealizados: '150',
            satisfaccion: '4.8'
          },
          contenido: {
            modulos: 12,
            lecciones: 85,
            certificacion: true,
            nivelAcceso: 'Básico a Intermedio'
          }
        },
        program: [],
        testimonials: []
      }
    };
  }
};

export default SwingTradingPage; 