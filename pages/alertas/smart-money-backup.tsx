import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayerMux from '@/components/VideoPlayerMux';
import Carousel from '@/components/Carousel';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Activity, 
  Download, 
  BarChart3,
  CheckCircle,
  Star,
  Eye,
  DollarSign,
  Target
} from 'lucide-react';
import styles from '@/styles/SmartMoney.module.css';
import { useRouter } from 'next/router';

interface SmartMoneyPageProps {
  isSubscribed: boolean;
  metrics: {
    performance: string;
    activeUsers: string;
    alertsSent: string;
    accuracy: string;
  };
  historicalAlerts: Array<{
    date: string;
    symbol: string;
    flow: string;
    volume: string;
    result: string;
    movement: string;
  }>;
}

interface Alert {
  _id: string;
  symbol: string;
  action: string;
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  analysis: string;
  createdAt: string;
  status: 'active' | 'closed' | 'stopped';
  resultado?: number;
  currentPrice?: number;
  lastUpdate?: string;
  type: string;
}

interface Report {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  createdAt: string;
  summary?: string;
}

interface Activity {
  type: string;
  description: string;
  time: string;
  status?: string;
}

interface CommunityMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
}

// Vista No Suscripto
const NonSubscriberView: React.FC<{ metrics: any, historicalAlerts: any[] }> = ({ 
  metrics, 
  historicalAlerts 
}) => {
  const { data: session } = useSession();

  const handleSubscribe = () => {
    if (!session) {
      signIn('google');
    } else {
      window.location.href = '/payment/smart-money';
    }
  };

  const handleExportPDF = () => {
    console.log('Exportando PDF Smart Money...');
  };

  const exampleImages = [
    {
      src: '/alerts/smart-money-example-1.jpg',
      alt: 'Ejemplo de flujo Smart Money - Análisis SPY',
      title: 'Flujo Institucional SPY - Entrada Masiva',
      description: 'Detección de $2.3B en flujos institucionales hacia SPY'
    },
    {
      src: '/alerts/smart-money-example-2.jpg',
      alt: 'Ejemplo de flujo Smart Money - Análisis QQQ',
      title: 'Smart Money QQQ - Salida Coordinada',
      description: 'Identificación de salida institucional antes de corrección'
    },
    {
      src: '/alerts/smart-money-example-3.jpg',
      alt: 'Ejemplo de flujo Smart Money - Análisis Sectorial',
      title: 'Rotación Sectorial - Tech a Energy',
      description: 'Flujos institucionales mostrando rotación de sectores'
    }
  ];

  return (
    <div className={styles.nonSubscriberView}>
      {/* Hero Section con Video */}
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
                Smart Money
                <span className={styles.heroSubtitle}>Sigue los Movimientos Institucionales</span>
              </h1>
              <p className={styles.heroDescription}>
                Descubre hacia dónde se dirige el dinero institucional antes que el resto del mercado. 
                Nuestro análisis de flujos te permite seguir a los grandes fondos y aprovechar sus movimientos.
              </p>
              <div className={styles.heroFeatures}>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Detección de flujos institucionales en tiempo real</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Análisis de volumen y liquidez profesional</span>
                </div>
                <div className={styles.heroFeature}>
                  <CheckCircle size={20} />
                  <span>Identificación de manipulación del mercado</span>
                </div>
              </div>
            </div>
            <div className={styles.heroVideo}>
              <div className={styles.videoContainer}>
                {/* Placeholder de video mientras no tenemos uno real configurado */}
                <div className={styles.videoPlaceholder}>
                  <div className={styles.placeholderIcon}>🎥</div>
                  <h3 className={styles.placeholderTitle}>Video Explicativo Smart Money</h3>
                  <p className={styles.placeholderText}>
                    Aquí irá el video explicativo sobre cómo funciona nuestro análisis de flujos institucionales
                  </p>
                  <div className={styles.placeholderFeatures}>
                    <span>📊 Análisis de flujos</span>
                    <span>📈 Movimientos institucionales</span>
                    <span>🎯 Detección de manipulación</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sección de Métricas */}
      <section className={styles.metricsSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Números con Datos Actualizables
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
                <DollarSign size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.performance}</h3>
              <p className={styles.metricLabel}>% de Rendimiento del Último Año</p>
            </motion.div>

            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.metricIcon}>
                <Users size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.activeUsers}</h3>
              <p className={styles.metricLabel}>Usuarios Activos</p>
            </motion.div>

            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.metricIcon}>
                <Activity size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.alertsSent}</h3>
              <p className={styles.metricLabel}>Alertas Enviadas</p>
            </motion.div>

            <motion.div 
              className={styles.metricCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.metricIcon}>
                <Target size={40} />
              </div>
              <h3 className={styles.metricNumber}>{metrics.accuracy}</h3>
              <p className={styles.metricLabel}>Precisión de Detección</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Alertas Históricas */}
      <section className={styles.historySection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Alertas Históricas (Google Sheets)
          </motion.h2>
          <motion.p 
            className={styles.sectionDescription}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Visualización de algunas alertas y botón de descarga de PDF
          </motion.p>
          
          <motion.div 
            className={styles.historyTable}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.tableHeader}>
              <span>Fecha</span>
              <span>Símbolo</span>
              <span>Flujo</span>
              <span>Volumen</span>
              <span>Resultado</span>
              <span>Movimiento</span>
            </div>
            
            {historicalAlerts.slice(0, 8).map((alert, index) => (
              <motion.div 
                key={index}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span className={styles.tableCell}>{alert.date}</span>
                <span className={styles.tableCell}>{alert.symbol}</span>
                <span className={`${styles.tableCell} ${alert.flow === 'ENTRADA' ? styles.flowIn : styles.flowOut}`}>
                  {alert.flow}
                </span>
                <span className={styles.tableCell}>{alert.volume}</span>
                <span className={`${styles.tableCell} ${alert.result === 'CONFIRMADO' ? styles.confirmedResult : styles.pendingResult}`}>
                  {alert.result}
                </span>
                <span className={`${styles.tableCell} ${alert.movement.startsWith('+') ? styles.positiveMovement : styles.negativeMovement}`}>
                  {alert.movement}
                </span>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className={styles.exportActions}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button className={styles.exportButton} onClick={handleExportPDF}>
              <Download size={20} />
              Descargar Reporte PDF
            </button>
          </motion.div>
        </div>
      </section>

      {/* Imágenes con Ejemplo de Alertas */}
      <section className={styles.examplesSection}>
        <div className={styles.container}>
          <motion.h2 
            className={styles.sectionTitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Imágenes con Ejemplo de Alertas
          </motion.h2>
          <motion.p 
            className={styles.sectionDescription}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Carrusel de imágenes con informes y alertas de flujos institucionales
          </motion.p>
          
          <motion.div 
            className={styles.carouselContainer}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Carousel 
              items={exampleImages.map((image, index) => (
                <div key={index} className={styles.exampleCard}>
                  <img src={image.src} alt={image.alt} className={styles.exampleImage} />
                  <div className={styles.exampleContent}>
                    <h3 className={styles.exampleTitle}>{image.title}</h3>
                    <p className={styles.exampleDescription}>{image.description}</p>
                  </div>
                </div>
              ))}
              autoplay={true}
              interval={4500}
              showDots={true}
              showArrows={true}
              itemsPerView={1}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA de Suscripción */}
      <section className={styles.subscriptionSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.subscriptionCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.subscriptionContent}>
              <h2 className={styles.subscriptionTitle}>
                ¿Listo para Seguir el Smart Money?
              </h2>
              <p className={styles.subscriptionDescription}>
                Únete a {metrics.activeUsers} analistas que ya están siguiendo los movimientos institucionales para maximizar sus ganancias
              </p>
              <div className={styles.subscriptionFeatures}>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Detección de flujos en tiempo real vía email</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Análisis de volumen institucional detallado</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Identificación de manipulación del mercado</span>
                </div>
                <div className={styles.subscriptionFeature}>
                  <Star size={16} />
                  <span>Reportes semanales de flujos principales</span>
                </div>
              </div>
              <button 
                className={styles.subscribeButton}
                onClick={handleSubscribe}
              >
                {session ? 'Suscribirme Ahora' : 'Iniciar Sesión y Suscribirme'}
              </button>
              <p className={styles.subscriptionNote}>
                {!session && 'Si no tienes cuenta activa, la tenés que hacer primero antes de continuar'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Vista de suscriptor completa
const SubscriberView: React.FC = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<string>('normal');
  const [informes, setInformes] = useState<any[]>([]);
  const [loadingInformes, setLoadingInformes] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [creatingReport, setCreatingReport] = useState(false);

  // Verificar el rol del usuario
  useEffect(() => {
    const checkUserRole = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch(`/api/users/role?email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role || 'normal');
        }
      } catch (error) {
        console.error('Error verificando rol:', error);
      }
    };

    checkUserRole();
  }, [session]);

  // Función para cargar informes desde la API
  const loadInformes = async () => {
    setLoadingInformes(true);
    try {
      const response = await fetch('/api/reports/list?type=smart-money');
      if (response.ok) {
        const data = await response.json();
        setInformes(data.data?.reports || []);
        console.log('Informes cargados:', data.data?.reports?.length || 0);
      } else {
        console.error('Error al cargar informes:', response.status);
      }
    } catch (error) {
      console.error('Error al cargar informes:', error);
    } finally {
      setLoadingInformes(false);
    }
  };

  const openReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/view/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data.data);
      }
    } catch (error) {
      console.error('Error al cargar informe:', error);
    }
  };

  const handleCreateReport = async (formData: any) => {
    setCreatingReport(true);
    try {
      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...formData, category: 'smart-money'}),
      });

      if (response.ok) {
        const result = await response.json();
        const newReport = result.data;
        setInformes(prev => [newReport, ...prev]);
        setShowCreateReportModal(false);
        alert('Informe creado exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al crear informe:', error);
      alert('Error al crear el informe');
    } finally {
      setCreatingReport(false);
    }
  };

  // Cargar informes al montar el componente
  useEffect(() => {
    loadInformes();
  }, []);

  const renderDashboard = () => (
    <div className={styles.dashboardContent}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.sectionTitle}>Dashboard Smart Money</h2>
        <p className={styles.sectionDescription}>
          Panel de control para análisis de flujos institucionales
        </p>
      </div>
      
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>💰</div>
          <h3 className={styles.metricNumber}>+94.2%</h3>
          <p className={styles.metricLabel}>Rendimiento Anual</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>🔍</div>
          <h3 className={styles.metricNumber}>89.7%</h3>
          <p className={styles.metricLabel}>Precisión de Detección</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📊</div>
          <h3 className={styles.metricNumber}>+1,300</h3>
          <p className={styles.metricLabel}>Flujos Detectados</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👥</div>
          <h3 className={styles.metricNumber}>+500</h3>
          <p className={styles.metricLabel}>Usuarios Activos</p>
        </div>
      </div>
    </div>
  );

  const renderInformes = () => (
    <div className={styles.informesContent}>
      <div className={styles.informesHeader}>
        <h2 className={styles.sectionTitle}>Informes Smart Money</h2>
        {userRole === 'admin' && (
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateReportModal(true)}
            title="Crear nuevo informe"
          >
            + Crear Informe
          </button>
        )}
      </div>
      
      {loadingInformes ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <h3>Cargando informes...</h3>
        </div>
      ) : informes.length > 0 ? (
        <div className={styles.informesList}>
          {informes.map((informe) => (
            <div key={informe.id || informe._id} className={styles.informeCard}>
              <div className={styles.informeHeader}>
                <h3>{informe.title}</h3>
                <span className={styles.informeDate}>
                  {new Date(informe.publishedAt || informe.createdAt).toLocaleDateString('es-ES')}
                </span>
                {informe.isFeature && (
                  <span className={styles.featuredBadge}>⭐ Destacado</span>
                )}
              </div>
              
              <div className={styles.informeMeta}>
                <span className={styles.informeType}>
                  {informe.type === 'video' ? '🎥' : informe.type === 'analisis' ? '📊' : '📄'} 
                  {informe.type === 'video' ? 'Video' : informe.type === 'analisis' ? 'Análisis' : 'Informe'}
                </span>
                {informe.readTime && (
                  <span className={styles.readTime}>⏱️ {informe.readTime} min lectura</span>
                )}
                <span className={styles.views}>👁️ {informe.views} vistas</span>
              </div>

              <p className={styles.informeDescription}>
                {informe.summary}
              </p>

              {informe.tags && informe.tags.length > 0 && (
                <div className={styles.informeTags}>
                  {informe.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className={styles.tag}>#{tag}</span>
                  ))}
                </div>
              )}

              <div className={styles.informeActions}>
                <button 
                  className={styles.readButton}
                  onClick={() => openReport(informe.id || informe._id)}
                >
                  {informe.type === 'video' ? 'Ver Video' : 'Leer Informe'}
                </button>
                {informe.pdfUrl && (
                  <button className={styles.downloadButton}>
                    <Download size={16} />
                    Descargar PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h3>No hay informes disponibles</h3>
          <p>Los informes de Smart Money aparecerán aquí cuando estén disponibles.</p>
          {userRole === 'admin' && (
            <div className={styles.emptyActions}>
              <p className={styles.emptyHint}>
                Puedes crear el primer informe para comenzar.
              </p>
              <button 
                className={styles.emptyCreateButton}
                onClick={() => setShowCreateReportModal(true)}
              >
                Crear Primer Informe
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal para mostrar informe completo */}
      {selectedReport && (
        <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
          <div className={styles.reportModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.reportHeader}>
              <h2>{selectedReport.title}</h2>
              <button 
                className={styles.closeModal}
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.reportMeta}>
              <span>Por {selectedReport.author}</span>
              <span>{new Date(selectedReport.publishedAt || selectedReport.createdAt).toLocaleDateString('es-ES')}</span>
            </div>

            <div className={styles.reportContent}>
              {selectedReport.type === 'video' && selectedReport.videoMuxId ? (
                <div className={styles.videoContainer}>
                  <VideoPlayerMux 
                    playbackId={selectedReport.videoMuxId} 
                    autoplay={false}
                    className={styles.reportVideo}
                  />
                </div>
              ) : null}
              
              <div className={styles.reportText}>
                {selectedReport.content.split('\n').map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Sección de comentarios */}
              <ReportComments reportId={selectedReport.id || selectedReport._id} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear informe */}
      {showCreateReportModal && (
        <CreateReportModal 
          onClose={() => setShowCreateReportModal(false)}
          onSubmit={handleCreateReport}
          loading={creatingReport}
        />
      )}
    </div>
  );

  // Componente para los comentarios de informes
  const ReportComments = ({ reportId }: { reportId: string }) => {
    const { data: session } = useSession();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);

    // Cargar comentarios cuando se monta el componente
    useEffect(() => {
      if (reportId) {
        fetchComments();
      }
    }, [reportId]);

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/reports/comments?reportId=${reportId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Error cargando comentarios:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    const submitComment = async () => {
      if (!newComment.trim() || !session) return;
      
      setSubmittingComment(true);
      try {
        const commentData: any = {
          reportId,
          comment: newComment.trim()
        };

        if (replyingTo) {
          commentData.replyTo = {
            commentId: replyingTo._id || replyingTo.id,
            userName: replyingTo.userName,
            comment: replyingTo.comment
          };
        }

        const response = await fetch('/api/reports/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
        });

        if (response.ok) {
          const data = await response.json();
          setComments(prev => [...prev, data.comment]);
          setNewComment('');
          setReplyingTo(null);
        }
      } catch (error) {
        console.error('Error enviando comentario:', error);
      } finally {
        setSubmittingComment(false);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitComment();
      } else if (e.key === 'Escape') {
        setReplyingTo(null);
      }
    };

    const formatCommentTime = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays}d`;
      return date.toLocaleDateString('es-ES');
    };

    const getCharCountClass = () => {
      if (newComment.length >= 450) return 'error';
      if (newComment.length >= 400) return 'warning';
      return '';
    };

    return (
      <div className={styles.reportComments}>
        <div className={styles.commentsHeader}>
          <h3 className={styles.commentsTitle}>
            💬 Comentarios
            {comments.length > 0 && (
              <span className={styles.commentsCount}>{comments.length}</span>
            )}
          </h3>
        </div>

        {/* Formulario para nuevo comentario */}
        {session ? (
          <div className={styles.commentForm}>
            {replyingTo && (
              <div className={styles.commentReply}>
                <div className={styles.commentReplyUser}>
                  Respondiendo a @{replyingTo.userName}
                </div>
                <div className={styles.commentReplyText}>
                  {replyingTo.comment.length > 100 
                    ? `${replyingTo.comment.substring(0, 100)}...` 
                    : replyingTo.comment}
                </div>
                <button 
                  onClick={() => setReplyingTo(null)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ef4444', 
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  ✕ Cancelar respuesta
                </button>
              </div>
            )}
            
            <div className={styles.commentInputContainer}>
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name} 
                  className={styles.commentUserAvatar}
                />
              ) : (
                <div className={styles.commentUserPlaceholder}>
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className={styles.commentInputWrapper}>
                <textarea
                  className={styles.commentTextarea}
                  placeholder={replyingTo ? `Responder a ${replyingTo.userName}...` : "Escribe tu comentario..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  maxLength={500}
                />
                
                <div className={styles.commentActions}>
                  <span className={`${styles.commentCharCount} ${styles[getCharCountClass()]}`}>
                    {newComment.length}/500
                  </span>
                  
                  <button 
                    className={styles.commentSubmitButton}
                    onClick={submitComment}
                    disabled={!newComment.trim() || submittingComment || newComment.length > 500}
                  >
                    {submittingComment ? 'Enviando...' : (replyingTo ? 'Responder' : 'Comentar')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.commentForm}>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Debes iniciar sesión para comentar
            </p>
          </div>
        )}

        {/* Lista de comentarios */}
        {loadingComments ? (
          <div className={styles.commentsLoading}>
            <div>⏳ Cargando comentarios...</div>
          </div>
        ) : comments.length > 0 ? (
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment._id || comment.id} className={styles.comment}>
                {comment.replyTo && (
                  <div className={styles.commentReply}>
                    <div className={styles.commentReplyUser}>
                      @{comment.replyTo.userName}
                    </div>
                    <div className={styles.commentReplyText}>
                      {comment.replyTo.comment.length > 100 
                        ? `${comment.replyTo.comment.substring(0, 100)}...` 
                        : comment.replyTo.comment}
                    </div>
                  </div>
                )}
                
                <div className={styles.commentHeader}>
                  <div className={styles.commentUser}>
                    {comment.userImage ? (
                      <img 
                        src={comment.userImage} 
                        alt={comment.userName} 
                        className={styles.commentAvatar}
                      />
                    ) : (
                      <div className={styles.commentAvatarPlaceholder}>
                        {comment.userName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {comment.userName}
                  </div>
                  <span className={styles.commentTime}>
                    {formatCommentTime(comment.timestamp)}
                  </span>
                </div>
                
                <div className={styles.commentContent}>
                  {comment.comment}
                </div>
                
                {session && (
                  <button 
                    className={styles.commentReplyButton}
                    onClick={() => setReplyingTo(comment)}
                  >
                    ↩️ Responder
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.commentsEmpty}>
            <div className={styles.commentsEmptyIcon}>💬</div>
            <h4>Aún no hay comentarios</h4>
            <p>Sé el primero en comentar este informe</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.subscriberView}>
      <div className={styles.subscriberHeader}>
        <h1 className={styles.pageTitle}>Smart Money Dashboard</h1>
        <p className={styles.pageDescription}>
          Panel de control para seguimiento de flujos institucionales
        </p>
      </div>

      <div className={styles.subscriberContent}>
        <nav className={styles.subscriberNav}>
          <button 
            className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.navActive : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'informes' ? styles.navActive : ''}`}
            onClick={() => setActiveTab('informes')}
          >
            📄 Informes
          </button>
        </nav>

        <div className={styles.subscriberTabContent}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'informes' && renderInformes()}
        </div>
      </div>
    </div>
  );
};

const SmartMoneyPage: React.FC<SmartMoneyPageProps> = ({ 
  isSubscribed, 
  metrics, 
  historicalAlerts 
}) => {
  return (
    <>
      <Head>
        <title>Smart Money - Sigue los Movimientos Institucionales | Nahuel Lozano</title>
        <meta name="description" content="Descubre hacia dónde se dirige el dinero institucional antes que el resto del mercado. Análisis de flujos profesional para maximizar tus ganancias." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />
      
      <main className={styles.main}>
        {isSubscribed ? (
          <SubscriberView />
        ) : (
          <NonSubscriberView 
            metrics={metrics} 
            historicalAlerts={historicalAlerts} 
          />
        )}
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const metrics = {
    performance: '+94.2%',
    activeUsers: '+500',
    alertsSent: '+1,300',
    accuracy: '89.7%'
  };

  const historicalAlerts = [
    {
      date: '2024-01-15',
      symbol: 'SPY',
      flow: 'ENTRADA',
      volume: '$2.3B',
      result: 'CONFIRMADO',
      movement: '+8.4%'
    },
    {
      date: '2024-01-14',
      symbol: 'QQQ',
      flow: 'SALIDA',
      volume: '$1.8B',
      result: 'CONFIRMADO',
      movement: '-5.2%'
    },
    {
      date: '2024-01-12',
      symbol: 'IWM',
      flow: 'ENTRADA',
      volume: '$950M',
      result: 'CONFIRMADO',
      movement: '+12.1%'
    },
    {
      date: '2024-01-11',
      symbol: 'XLF',
      flow: 'ENTRADA',
      volume: '$1.2B',
      result: 'CONFIRMADO',
      movement: '+6.8%'
    },
    {
      date: '2024-01-10',
      symbol: 'XLK',
      flow: 'SALIDA',
      volume: '$2.1B',
      result: 'PENDIENTE',
      movement: '-2.3%'
    },
    {
      date: '2024-01-09',
      symbol: 'VTI',
      flow: 'ENTRADA',
      volume: '$3.4B',
      result: 'CONFIRMADO',
      movement: '+9.7%'
    },
    {
      date: '2024-01-08',
      symbol: 'EFA',
      flow: 'ENTRADA',
      volume: '$780M',
      result: 'CONFIRMADO',
      movement: '+4.5%'
    },
    {
      date: '2024-01-05',
      symbol: 'XLE',
      flow: 'SALIDA',
      volume: '$560M',
      result: 'CONFIRMADO',
      movement: '-7.8%'
    }
  ];

  return {
    props: {
      isSubscribed: false,
      metrics,
      historicalAlerts
    }
  };
};

// Componente modal para crear informe (igual al de trader-call)
const CreateReportModal = ({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'informe',
    summary: '',
    content: '',
    readTime: '',
    tags: '',
    author: 'Nahuel Lozano',
    isFeature: false,
    publishedAt: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Por favor completa al menos el título y el contenido');
      return;
    }

    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      readTime: formData.readTime ? parseInt(formData.readTime) : null,
      publishedAt: new Date(formData.publishedAt)
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.createReportModal}>
        <div className={styles.modalHeader}>
          <h2>Crear Nuevo Informe Smart Money</h2>
          <button 
            className={styles.closeModal}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.createReportForm}>
          <div className={styles.formGroup}>
            <label>Título del Informe</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Análisis de flujos institucionales..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tipo de Contenido</label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            >
              <option value="informe">Informe</option>
              <option value="analisis">Análisis</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Resumen</label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Breve descripción del contenido..."
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contenido Principal</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Contenido completo del informe..."
              rows={8}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Tiempo de Lectura (min)</label>
              <input
                type="number"
                value={formData.readTime}
                onChange={(e) => handleInputChange('readTime', e.target.value)}
                placeholder="5"
                min="1"
                max="60"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Autor</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Nahuel Lozano"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Tags (separados por comas)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="smart-money, flujos, institucional"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Fecha de Publicación</label>
              <input
                type="date"
                value={formData.publishedAt}
                onChange={(e) => handleInputChange('publishedAt', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isFeature}
                  onChange={(e) => handleInputChange('isFeature', e.target.checked.toString())}
                />
                <span>Informe Destacado</span>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Informe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartMoneyPage; 