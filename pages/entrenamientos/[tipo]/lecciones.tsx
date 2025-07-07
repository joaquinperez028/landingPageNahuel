import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  PlayCircle,
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  Lock,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText,
  Image,
  Youtube,
  FileDown,
  Star,
  Settings
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/LeccionesViewer.module.css';

interface LessonContent {
  id: string;
  type: 'youtube' | 'pdf' | 'image' | 'text' | 'html';
  orden: number;
  title?: string;
  content: {
    youtubeId?: string;
    youtubeTitle?: string;
    youtubeDuration?: string;
    pdfUrl?: string;
    pdfTitle?: string;
    imageUrl?: string;
    imageAlt?: string;
    imageCaption?: string;
    text?: string;
    html?: string;
    description?: string;
  };
}

interface Lesson {
  _id: string;
  titulo: string;
  descripcion: string;
  modulo: number;
  numeroLeccion: number;
  duracionEstimada: number;
  contenido: LessonContent[];
  objetivos: string[];
  recursos: {
    titulo: string;
    url: string;
    tipo: 'enlace' | 'descarga' | 'referencia';
  }[];
  tipoEntrenamiento: 'TradingFundamentals' | 'DowJones';
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
  esGratuita: boolean;
  requiereSuscripcion: boolean;
  orden: number;
  activa: boolean;
}

interface LeccionesViewerProps {
  lecciones: Lesson[];
  tipoEntrenamiento: string;
  userTrainings: string[]; // Array de tipos de entrenamientos que tiene el usuario
}

const LeccionesViewer: React.FC<LeccionesViewerProps> = ({ 
  lecciones, 
  tipoEntrenamiento,
  userTrainings 
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const currentLesson = lecciones[currentLessonIndex];

  // Verificar acceso a lección
  const hasAccessToLesson = (lesson: Lesson) => {
    if (lesson.esGratuita) return true;
    if (!lesson.requiereSuscripcion) return true;
    
    // Verificar si el usuario tiene el entrenamiento asignado
    return session && userTrainings.includes(lesson.tipoEntrenamiento);
  };

  // Marcar lección como completada
  const markLessonCompleted = async (lessonId: string) => {
    try {
      // API call para marcar como completada
      const response = await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonId,
          action: 'complete'
        })
      });

      if (response.ok) {
        setCompletedLessons(prev => new Set([...Array.from(prev), lessonId]));
        toast.success('Lección completada');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Navegar entre lecciones
  const goToLesson = (index: number) => {
    if (index >= 0 && index < lecciones.length) {
      setCurrentLessonIndex(index);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < lecciones.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  // Renderizar contenido por tipo
  const renderContent = (content: LessonContent) => {
    const hasAccess = hasAccessToLesson(currentLesson);

    if (!hasAccess) {
      return (
        <div className={styles.lockedContent}>
          <Lock size={48} />
          <h3>Contenido Bloqueado</h3>
          <p>Necesitas suscribirte para acceder a esta lección</p>
        </div>
      );
    }

    switch (content.type) {
      case 'youtube':
        return (
          <div className={styles.youtubePlayer}>
            <div className={styles.videoWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${content.content.youtubeId}`}
                title={content.content.youtubeTitle || content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {content.content.youtubeTitle && (
              <div className={styles.videoInfo}>
                <h4>{content.content.youtubeTitle}</h4>
                {content.content.youtubeDuration && (
                  <span className={styles.duration}>
                    <Clock size={16} />
                    {content.content.youtubeDuration}
                  </span>
                )}
              </div>
            )}
            {content.content.description && (
              <p className={styles.contentDescription}>{content.content.description}</p>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className={styles.pdfContent}>
            <div className={styles.pdfHeader}>
              <FileDown size={24} />
              <div>
                <h4>{content.content.pdfTitle || content.title}</h4>
                {content.content.description && (
                  <p>{content.content.description}</p>
                )}
              </div>
            </div>
            <div className={styles.pdfActions}>
              <a 
                href={content.content.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.pdfButton}
              >
                <ExternalLink size={16} />
                Ver PDF
              </a>
              <a 
                href={content.content.pdfUrl} 
                download
                className={styles.pdfButton}
              >
                <Download size={16} />
                Descargar
              </a>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className={styles.imageContent}>
            <img 
              src={content.content.imageUrl}
              alt={content.content.imageAlt || content.title}
              className={styles.contentImage}
            />
            {content.content.imageCaption && (
              <p className={styles.imageCaption}>{content.content.imageCaption}</p>
            )}
            {content.content.description && (
              <p className={styles.contentDescription}>{content.content.description}</p>
            )}
          </div>
        );

      case 'text':
        return (
          <div className={styles.textContent}>
            {content.title && <h4>{content.title}</h4>}
            <div className={styles.textBody}>
              {content.content.text?.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            {content.content.description && (
              <p className={styles.contentDescription}>{content.content.description}</p>
            )}
          </div>
        );

      case 'html':
        return (
          <div className={styles.htmlContent}>
            {content.title && <h4>{content.title}</h4>}
            <div 
              className={styles.htmlBody}
              dangerouslySetInnerHTML={{ __html: content.content.html || '' }}
            />
            {content.content.description && (
              <p className={styles.contentDescription}>{content.content.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>
          {currentLesson?.titulo} - {tipoEntrenamiento === 'TradingFundamentals' ? 'Trading Fundamentals' : 'Dow Jones'}
        </title>
        <meta name="description" content={currentLesson?.descripcion} />
      </Head>

      <Navbar />

      <div className={styles.container}>
        {/* Sidebar con lista de lecciones */}
        <div className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <div className={styles.sidebarHeader}>
            <h3>
              {tipoEntrenamiento === 'TradingFundamentals' ? 'Trading Fundamentals' : 'Dow Jones'}
            </h3>
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={styles.sidebarToggle}
            >
              {showSidebar ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className={styles.lessonsList}>
            {lecciones.map((lesson, index) => {
              const isCurrentLesson = index === currentLessonIndex;
              const isCompleted = completedLessons.has(lesson._id);
              const hasAccess = hasAccessToLesson(lesson);

              return (
                <motion.div
                  key={lesson._id}
                  className={`${styles.lessonItem} ${isCurrentLesson ? styles.lessonItemActive : ''}`}
                  onClick={() => hasAccess && goToLesson(index)}
                  whileHover={hasAccess ? { x: 4 } : {}}
                >
                  <div className={styles.lessonItemHeader}>
                    <div className={styles.lessonItemMeta}>
                      <span className={styles.lessonNumber}>
                        {lesson.modulo}.{lesson.numeroLeccion}
                      </span>
                      <div className={styles.lessonItemStatus}>
                        {!hasAccess && <Lock size={14} />}
                        {isCompleted && <CheckCircle size={14} />}
                      </div>
                    </div>
                    <span className={styles.lessonDuration}>
                      <Clock size={12} />
                      {lesson.duracionEstimada}min
                    </span>
                  </div>
                  <h4 className={styles.lessonItemTitle}>{lesson.titulo}</h4>
                  <div className={styles.lessonItemProgress}>
                    <div 
                      className={styles.progressBar}
                      style={{ 
                        width: isCompleted ? '100%' : isCurrentLesson ? '50%' : '0%' 
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Contenido principal */}
        <div className={styles.mainContent}>
          {currentLesson ? (
            <>
              {/* Header de la lección */}
              <div className={styles.lessonHeader}>
                <div className={styles.lessonHeaderLeft}>
                  <div className={styles.lessonMeta}>
                    <span className={styles.moduleTag}>
                      Módulo {currentLesson.modulo}
                    </span>
                    <span className={styles.lessonNumber}>
                      Lección {currentLesson.numeroLeccion}
                    </span>
                    <span className={`${styles.difficultyTag} ${styles[currentLesson.dificultad.toLowerCase()]}`}>
                      {currentLesson.dificultad}
                    </span>
                    {/* Botón de administración solo para admins */}
                    {session?.user?.role === 'admin' && (
                      <a
                        href={`/admin/lecciones?tipo=${tipoEntrenamiento}`}
                        className={styles.adminButton}
                        title="Administrar lecciones"
                      >
                        <Settings size={16} />
                        Admin
                      </a>
                    )}
                  </div>
                  <h1 className={styles.lessonTitle}>{currentLesson.titulo}</h1>
                  <p className={styles.lessonDescription}>{currentLesson.descripcion}</p>
                  
                  {/* Objetivos */}
                  {currentLesson.objetivos.length > 0 && (
                    <div className={styles.objectives}>
                      <h3>
                        <Target size={20} />
                        Objetivos de Aprendizaje
                      </h3>
                      <ul>
                        {currentLesson.objetivos.map((objetivo, index) => (
                          <li key={index}>
                            <CheckCircle size={16} />
                            {objetivo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className={styles.lessonHeaderRight}>
                  <div className={styles.lessonStats}>
                    <div className={styles.stat}>
                      <Clock size={20} />
                      <span>{currentLesson.duracionEstimada} min</span>
                    </div>
                    <div className={styles.stat}>
                      <FileText size={20} />
                      <span>{currentLesson.contenido.length} elementos</span>
                    </div>
                  </div>
                  
                  {hasAccessToLesson(currentLesson) && (
                    <button
                      onClick={() => markLessonCompleted(currentLesson._id)}
                      className={styles.completeButton}
                      disabled={completedLessons.has(currentLesson._id)}
                    >
                      {completedLessons.has(currentLesson._id) ? (
                        <>
                          <CheckCircle size={16} />
                          Completada
                        </>
                      ) : (
                        <>
                          <Star size={16} />
                          Marcar como Completada
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Contenido de la lección */}
              <div className={styles.lessonContent}>
                {currentLesson.contenido
                  .sort((a, b) => a.orden - b.orden)
                  .map((content, index) => (
                    <motion.div
                      key={content.id}
                      className={styles.contentSection}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {content.title && (
                        <h3 className={styles.contentTitle}>
                          {content.type === 'youtube' && <Youtube size={20} />}
                          {content.type === 'pdf' && <FileDown size={20} />}
                          {content.type === 'image' && <Image size={20} />}
                          {content.type === 'text' && <FileText size={20} />}
                          {content.type === 'html' && <FileText size={20} />}
                          {content.title}
                        </h3>
                      )}
                      {renderContent(content)}
                    </motion.div>
                  ))}
              </div>

              {/* Recursos adicionales */}
              {currentLesson.recursos.length > 0 && hasAccessToLesson(currentLesson) && (
                <div className={styles.resources}>
                  <h3>Recursos Adicionales</h3>
                  <div className={styles.resourcesList}>
                    {currentLesson.recursos.map((recurso, index) => (
                      <a
                        key={index}
                        href={recurso.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.resourceItem} ${styles[recurso.tipo]}`}
                      >
                        {recurso.tipo === 'descarga' && <Download size={16} />}
                        {recurso.tipo === 'enlace' && <ExternalLink size={16} />}
                        {recurso.tipo === 'referencia' && <BookOpen size={16} />}
                        <span>{recurso.titulo}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Navegación entre lecciones */}
              <div className={styles.lessonNavigation}>
                <button
                  onClick={goToPreviousLesson}
                  disabled={currentLessonIndex === 0}
                  className={styles.navButton}
                >
                  <ChevronLeft size={20} />
                  Lección Anterior
                </button>

                <span className={styles.lessonProgress}>
                  {currentLessonIndex + 1} de {lecciones.length}
                </span>

                <button
                  onClick={goToNextLesson}
                  disabled={currentLessonIndex === lecciones.length - 1}
                  className={styles.navButton}
                >
                  Siguiente Lección
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noLesson}>
              <BookOpen size={48} />
              <h3>No hay lecciones disponibles</h3>
              <p>Este entrenamiento aún no tiene lecciones publicadas.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { tipo } = context.query;

  // Validar tipo de entrenamiento
  if (!tipo || !['TradingFundamentals', 'DowJones'].includes(tipo as string)) {
    return {
      notFound: true
    };
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Obtener lecciones del tipo específico
    const leccionesResponse = await fetch(`${baseUrl}/api/lessons?tipo=${tipo}&activa=true&limit=100`);
    
    if (!leccionesResponse.ok) {
      throw new Error('Error fetching lessons');
    }
    
    const leccionesData = await leccionesResponse.json();

    // Intentar obtener entrenamientos del usuario si está autenticado
    let userTrainings: string[] = [];
    
    try {
      // Obtener session del contexto
      const { getServerSession } = await import('next-auth/next');
      const { authOptions } = await import('@/lib/googleAuth');
      const session = await getServerSession(context.req, context.res, authOptions);
      
      if (session?.user?.email) {
        // Buscar usuario directamente en la BD para obtener entrenamientos
        const { default: connectDB } = await import('@/lib/mongodb');
        const { default: User } = await import('@/models/User');
        
        await connectDB();
        const usuario = await User.findOne({ email: session.user.email });
        
        if (usuario && usuario.entrenamientos) {
          // Extraer tipos de entrenamientos activos
          for (const entrenamiento of usuario.entrenamientos) {
            if (entrenamiento.activo) {
              userTrainings.push(entrenamiento.tipo);
            }
          }
        }
      }
    } catch (userError) {
      console.error('Error fetching user trainings:', userError);
      // Continuar sin entrenamientos de usuario si hay error
    }
    
    return {
      props: {
        lecciones: leccionesData.data.lecciones || [],
        tipoEntrenamiento: tipo,
        userTrainings: userTrainings
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    return {
      props: {
        lecciones: [],
        tipoEntrenamiento: tipo,
        userTrainings: []
      }
    };
  }
};

export default LeccionesViewer; 