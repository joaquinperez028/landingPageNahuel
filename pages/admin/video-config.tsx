import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Video, 
  PlayCircle, 
  Settings, 
  Eye, 
  RefreshCw, 
  Globe,
  Bell,
  BookOpen,
  MessageCircle,
  FileVideo,
  Search,
  Filter,
  Grid,
  List,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import styles from '@/styles/Admin.module.css';

interface VideoConfig {
  heroVideo: {
    youtubeId: string;
    title: string;
    description: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  };
  learningVideo: {
    youtubeId: string;
    title: string;
    description: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  };
  serviciosVideos: {
    alertas: {
      youtubeId: string;
      title: string;
      description: string;
      autoplay: boolean;
      muted: boolean;
      loop: boolean;
    };
    entrenamientos: {
      youtubeId: string;
      title: string;
      description: string;
      autoplay: boolean;
      muted: boolean;
      loop: boolean;
    };
    asesorias: {
      youtubeId: string;
      title: string;
      description: string;
      autoplay: boolean;
      muted: boolean;
      loop: boolean;
    };
  };
}

interface VideoSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'main' | 'services' | 'learning';
  path: string;
}

const VideoConfig: React.FC<{ initialConfig: VideoConfig }> = ({ initialConfig }) => {
  const [config, setConfig] = useState<VideoConfig>(initialConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('heroVideo');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string>('');

  // Definir todas las secciones de videos
  const videoSections: VideoSection[] = [
    {
      id: 'heroVideo',
      title: 'Video Principal (Hero)',
      description: 'Video de presentación en la página principal',
      icon: <Globe size={20} />,
      color: '#ef4444',
      category: 'main',
      path: '/'
    },
    {
      id: 'learningVideo',
      title: 'Video de Aprendizaje',
      description: 'Video en la sección de cursos',
      icon: <BookOpen size={20} />,
      color: '#3b82f6',
      category: 'learning',
      path: '/'
    },
    {
      id: 'serviciosVideos.alertas',
      title: 'Video de Alertas',
      description: 'Video promocional de alertas de trading',
      icon: <Bell size={20} />,
      color: '#10b981',
      category: 'services',
      path: '/'
    },
    {
      id: 'serviciosVideos.entrenamientos',
      title: 'Video de Entrenamientos',
      description: 'Video promocional de entrenamientos',
      icon: <BookOpen size={20} />,
      color: '#8b5cf6',
      category: 'services',
      path: '/'
    },
    {
      id: 'serviciosVideos.asesorias',
      title: 'Video de Asesorías',
      description: 'Video promocional de asesorías',
      icon: <MessageCircle size={20} />,
      color: '#f59e0b',
      category: 'services',
      path: '/'
    }
  ];

  // Función para extraer YouTube ID de una URL
  const extractYouTubeId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url; // Si no coincide con ningún patrón, asumir que ya es un ID
  };

  // Función para generar URL de preview
  const generatePreviewUrl = (youtubeId: string) => {
    return `https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=1&loop=0&controls=1`;
  };

  // Función para obtener el valor de un video por path
  const getVideoByPath = (path: string) => {
    const pathParts = path.split('.');
    let current: any = config;
    
    for (const part of pathParts) {
      current = current[part];
    }
    
    return current;
  };

  // Función para actualizar un video por path
  const updateVideoByPath = (path: string, updates: any) => {
    const pathParts = path.split('.');
    setConfig(prev => {
      const newConfig = { ...prev };
      let current: any = newConfig;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = { ...current[pathParts[pathParts.length - 1]], ...updates };
      return newConfig;
    });
  };

  const handleInputChange = (path: string, field: string, value: any) => {
    updateVideoByPath(path, { [field]: value });
  };

  const handleYouTubeUrlChange = (path: string, url: string) => {
    const youtubeId = extractYouTubeId(url);
    handleInputChange(path, 'youtubeId', youtubeId);
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Configuración de videos guardada exitosamente');
      } else {
        toast.error('❌ Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestVideo = (youtubeId: string) => {
    if (youtubeId) {
      window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
    }
  };

  const handleCopyId = async (youtubeId: string) => {
    try {
      await navigator.clipboard.writeText(youtubeId);
      setCopiedId(youtubeId);
      toast.success('✅ ID copiado al portapapeles');
      setTimeout(() => setCopiedId(''), 2000);
    } catch (error) {
      toast.error('❌ Error al copiar');
    }
  };

  const handleCopyUrl = async (youtubeId: string) => {
    try {
      const url = `https://www.youtube.com/watch?v=${youtubeId}`;
      await navigator.clipboard.writeText(url);
      toast.success('✅ URL copiada al portapapeles');
    } catch (error) {
      toast.error('❌ Error al copiar');
    }
  };

  // Filtrar secciones según búsqueda y categoría
  const filteredSections = videoSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || section.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedVideo = getVideoByPath(selectedSection);
  const selectedSectionInfo = videoSections.find(s => s.id === selectedSection);

  return (
    <>
      <Head>
        <title>Configuración Completa de Videos - Admin</title>
        <meta name="description" content="Gestiona todos los videos de YouTube del sitio web" />
      </Head>

      <div className={styles.adminContainer}>
        <div className={styles.header}>
          <button 
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className={styles.title}>
            <Video size={32} />
            Gestión Completa de Videos
          </h1>
          <p className={styles.subtitle}>
            Configura todos los videos de YouTube del sitio web desde un solo lugar
          </p>
        </div>

        <div className={styles.content}>
          {/* Controles de Filtrado y Vista */}
          <motion.div 
            className={styles.controlsSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.controlsGrid}>
              {/* Búsqueda */}
              <div className={styles.searchContainer}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* Filtro por categoría */}
              <div className={styles.filterContainer}>
                <Filter size={20} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Todas las categorías</option>
                  <option value="main">Videos principales</option>
                  <option value="services">Videos de servicios</option>
                  <option value="learning">Videos de aprendizaje</option>
                </select>
              </div>

              {/* Modo de vista */}
              <div className={styles.viewModeContainer}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Lista de Videos */}
          <motion.div 
            className={`${styles.videosContainer} ${viewMode === 'grid' ? styles.gridView : styles.listView}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {filteredSections.map((section) => {
              const video = getVideoByPath(section.id);
              const hasVideo = video?.youtubeId?.trim();
              
              return (
                <motion.div
                  key={section.id}
                  className={`${styles.videoCard} ${selectedSection === section.id ? styles.selected : ''}`}
                  onClick={() => setSelectedSection(section.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.videoCardHeader}>
                    <div 
                      className={styles.videoIcon}
                      style={{ backgroundColor: `${section.color}20`, color: section.color }}
                    >
                      {section.icon}
                    </div>
                    <div className={styles.videoStatus}>
                      {hasVideo ? (
                        <CheckCircle size={16} color="#10b981" />
                      ) : (
                        <AlertCircle size={16} color="#ef4444" />
                      )}
                    </div>
                  </div>

                  <div className={styles.videoCardContent}>
                    <h3 className={styles.videoCardTitle}>{section.title}</h3>
                    <p className={styles.videoCardDescription}>{section.description}</p>
                    
                    <div className={styles.videoCardInfo}>
                      <span className={styles.videoCardId}>
                        ID: {hasVideo ? video.youtubeId : 'No configurado'}
                      </span>
                      <span className={styles.videoCardCategory}>
                        {section.category === 'main' && 'Principal'}
                        {section.category === 'services' && 'Servicio'}
                        {section.category === 'learning' && 'Aprendizaje'}
                      </span>
                    </div>

                    {hasVideo && (
                      <div className={styles.videoCardActions}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestVideo(video.youtubeId);
                          }}
                          className={styles.actionButton}
                          title="Probar video"
                        >
                          <PlayCircle size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId(video.youtubeId);
                          }}
                          className={styles.actionButton}
                          title="Copiar ID"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(video.youtubeId);
                          }}
                          className={styles.actionButton}
                          title="Copiar URL"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Panel de Configuración */}
          {selectedSectionInfo && (
            <motion.div 
              className={styles.configPanel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={styles.configPanelHeader}>
                <div 
                  className={styles.configPanelIcon}
                  style={{ backgroundColor: `${selectedSectionInfo.color}20`, color: selectedSectionInfo.color }}
                >
                  {selectedSectionInfo.icon}
                </div>
                <div>
                  <h2 className={styles.configPanelTitle}>{selectedSectionInfo.title}</h2>
                  <p className={styles.configPanelDescription}>{selectedSectionInfo.description}</p>
                </div>
              </div>

              <div className={styles.configPanelContent}>
                {/* Configuración del Video */}
                <div className={styles.configSection}>
                  <h3>Configuración del Video</h3>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="youtubeUrl">URL de YouTube:</label>
                    <input
                      id="youtubeUrl"
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={selectedVideo?.youtubeId ? `https://www.youtube.com/watch?v=${selectedVideo.youtubeId}` : ''}
                      onChange={(e) => handleYouTubeUrlChange(selectedSection, e.target.value)}
                      className={styles.input}
                    />
                    <small>Pega la URL completa de YouTube o solo el ID del video</small>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="videoTitle">Título del Video:</label>
                    <input
                      id="videoTitle"
                      type="text"
                      value={selectedVideo?.title || ''}
                      onChange={(e) => handleInputChange(selectedSection, 'title', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="videoDescription">Descripción:</label>
                    <textarea
                      id="videoDescription"
                      value={selectedVideo?.description || ''}
                      onChange={(e) => handleInputChange(selectedSection, 'description', e.target.value)}
                      className={styles.textarea}
                      rows={3}
                    />
                  </div>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={selectedVideo?.autoplay || false}
                        onChange={(e) => handleInputChange(selectedSection, 'autoplay', e.target.checked)}
                      />
                      <span>Autoplay</span>
                    </label>

                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={selectedVideo?.muted || false}
                        onChange={(e) => handleInputChange(selectedSection, 'muted', e.target.checked)}
                      />
                      <span>Muted (Silenciado)</span>
                    </label>

                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={selectedVideo?.loop || false}
                        onChange={(e) => handleInputChange(selectedSection, 'loop', e.target.checked)}
                      />
                      <span>Loop (Repetir)</span>
                    </label>
                  </div>
                </div>

                {/* Vista Previa */}
                <div className={styles.previewSection}>
                  <h3>Vista Previa</h3>
                  
                  {selectedVideo?.youtubeId ? (
                    <div className={styles.videoPreview}>
                      <iframe
                        src={generatePreviewUrl(selectedVideo.youtubeId)}
                        title={selectedVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.previewIframe}
                      />
                    </div>
                  ) : (
                    <div className={styles.noVideo}>
                      <Video size={48} color="#6b7280" />
                      <p>No hay video configurado</p>
                      <small>Ingresa una URL de YouTube para ver la vista previa</small>
                    </div>
                  )}

                  <div className={styles.videoInfo}>
                    <h4>Información del Video</h4>
                    <p><strong>ID:</strong> {selectedVideo?.youtubeId || 'No configurado'}</p>
                    <p><strong>Título:</strong> {selectedVideo?.title || 'No configurado'}</p>
                    <p><strong>Configuración:</strong></p>
                    <ul>
                      <li>Autoplay: {selectedVideo?.autoplay ? '✅ Sí' : '❌ No'}</li>
                      <li>Muted: {selectedVideo?.muted ? '✅ Sí' : '❌ No'}</li>
                      <li>Loop: {selectedVideo?.loop ? '✅ Sí' : '❌ No'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Acciones */}
          <motion.div 
            className={styles.actionsSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className={styles.sectionTitle}>
              <Settings size={24} />
              Acciones
            </h2>

            <div className={styles.actionsGrid}>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={styles.primaryButton}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={20} className={styles.spinner} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar Todos los Videos
                  </>
                )}
              </button>

              <Link href="/" className={styles.secondaryButton}>
                <Eye size={20} />
                Ver Sitio Web
              </Link>

              <Link href="/admin/dashboard" className={styles.secondaryButton}>
                <ArrowLeft size={20} />
                Volver al Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const verification = await verifyAdminAccess(context);
  
  if (!verification.isAdmin) {
    return {
      redirect: {
        destination: verification.redirectTo || '/',
        permanent: false,
      },
    };
  }

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/site-config`);
    const data = await response.json();

    if (data.success) {
      return {
        props: {
          initialConfig: {
            heroVideo: data.config.heroVideo,
            learningVideo: data.config.learningVideo,
            serviciosVideos: data.config.serviciosVideos
          }
        },
      };
    } else {
      return {
        props: {
          initialConfig: {
            heroVideo: {
              youtubeId: '',
              title: 'Video de Presentación',
              description: 'Conoce más sobre nuestros servicios de trading',
              autoplay: true,
              muted: true,
              loop: true
            },
            learningVideo: {
              youtubeId: '',
              title: 'Cursos de Inversión',
              description: 'Aprende a invertir desde cero con nuestros cursos especializados',
              autoplay: false,
              muted: true,
              loop: false
            },
            serviciosVideos: {
              alertas: {
                youtubeId: '',
                title: 'Video de Alertas',
                description: 'Descubre cómo funcionan nuestras alertas de trading',
                autoplay: false,
                muted: true,
                loop: false
              },
              entrenamientos: {
                youtubeId: '',
                title: 'Video de Entrenamientos',
                description: 'Conoce nuestros programas de formación especializados',
                autoplay: false,
                muted: true,
                loop: false
              },
              asesorias: {
                youtubeId: '',
                title: 'Video de Asesorías',
                description: 'Asesorías personalizadas para optimizar tu portafolio',
                autoplay: false,
                muted: true,
                loop: false
              }
            }
          }
        },
      };
    }
  } catch (error) {
    console.error('Error fetching site config:', error);
    return {
      props: {
        initialConfig: {
          heroVideo: {
            youtubeId: '',
            title: 'Video de Presentación',
            description: 'Conoce más sobre nuestros servicios de trading',
            autoplay: true,
            muted: true,
            loop: true
          },
          learningVideo: {
            youtubeId: '',
            title: 'Cursos de Inversión',
            description: 'Aprende a invertir desde cero con nuestros cursos especializados',
            autoplay: false,
            muted: true,
            loop: false
          },
          serviciosVideos: {
            alertas: {
              youtubeId: '',
              title: 'Video de Alertas',
              description: 'Descubre cómo funcionan nuestras alertas de trading',
              autoplay: false,
              muted: true,
              loop: false
            },
            entrenamientos: {
              youtubeId: '',
              title: 'Video de Entrenamientos',
              description: 'Conoce nuestros programas de formación especializados',
              autoplay: false,
              muted: true,
              loop: false
            },
            asesorias: {
              youtubeId: '',
              title: 'Video de Asesorías',
              description: 'Asesorías personalizadas para optimizar tu portafolio',
              autoplay: false,
              muted: true,
              loop: false
            }
          }
        }
      },
    };
  }
};

export default VideoConfig; 