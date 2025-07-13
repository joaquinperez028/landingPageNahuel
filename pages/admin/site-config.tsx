import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, Settings, Video, List, Grid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '@/styles/admin/SiteConfig.module.css';

interface SiteConfig {
  _id?: string;
  heroVideo: {
    youtubeId: string;
    title: string;
    description: string;
    thumbnail?: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  };
  learningVideo: {
    youtubeId: string;
    title: string;
    description: string;
    thumbnail?: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  };
  servicios: {
    orden: number;
    visible: boolean;
  };
  cursos: {
    orden: number;
    visible: boolean;
    destacados: string[];
  };
}

interface Training {
  _id: string;
  nombre: string;
  tipo: string;
  activo: boolean;
}

interface AdminSiteConfigProps {
  session: any;
  initialConfig: SiteConfig;
  entrenamientos: Training[];
}

export default function AdminSiteConfig({ session, initialConfig, entrenamientos }: AdminSiteConfigProps) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success('Configuración actualizada correctamente');
      } else {
        toast.error('Error al actualizar la configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url;
  };

  const handleVideoUrlChange = (url: string) => {
    const videoId = extractYouTubeId(url);
    setConfig(prev => ({
      ...prev,
      heroVideo: {
        ...prev.heroVideo,
        youtubeId: videoId
      }
    }));
  };

  const handleLearningVideoUrlChange = (url: string) => {
    const videoId = extractYouTubeId(url);
    setConfig(prev => ({
      ...prev,
      learningVideo: {
        ...prev.learningVideo,
        youtubeId: videoId
      }
    }));
  };

  const toggleEntrenamientoDestacado = (entrenamientoId: string) => {
    setConfig(prev => ({
      ...prev,
      cursos: {
        ...prev.cursos,
        destacados: prev.cursos.destacados.includes(entrenamientoId)
          ? prev.cursos.destacados.filter(id => id !== entrenamientoId)
          : [...prev.cursos.destacados, entrenamientoId]
      }
    }));
  };

  return (
    <>
      <Head>
        <title>Configuración del Sitio Web - Admin</title>
        <meta name="description" content="Configurar elementos del sitio web" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/admin" className={styles.backButton}>
              <ArrowLeft size={20} />
              Volver al Admin
            </Link>
            <h1>Configuración del Sitio Web</h1>
            <p>Administra los elementos principales del landing page</p>
          </div>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* Configuración del Video Hero */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Video size={24} />
                <h2>Video Principal</h2>
              </div>
              
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label htmlFor="videoUrl">URL del Video de YouTube</label>
                  <input
                    type="text"
                    id="videoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    className={styles.input}
                  />
                  <small className={styles.help}>
                    Pega la URL completa del video de YouTube
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="videoId">ID del Video (extraído automáticamente)</label>
                  <input
                    type="text"
                    id="videoId"
                    value={config.heroVideo.youtubeId}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      heroVideo: { ...prev.heroVideo, youtubeId: e.target.value }
                    }))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="videoTitle">Título del Video</label>
                  <input
                    type="text"
                    id="videoTitle"
                    value={config.heroVideo.title}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      heroVideo: { ...prev.heroVideo, title: e.target.value }
                    }))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="videoDescription">Descripción</label>
                  <textarea
                    id="videoDescription"
                    value={config.heroVideo.description}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      heroVideo: { ...prev.heroVideo, description: e.target.value }
                    }))}
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
              </div>

              <div className={styles.checkboxGrid}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={config.heroVideo.autoplay}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      heroVideo: { ...prev.heroVideo, autoplay: e.target.checked }
                    }))}
                  />
                  <span>Reproducir automáticamente</span>
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={config.heroVideo.muted}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      heroVideo: { ...prev.heroVideo, muted: e.target.checked }
                    }))}
                  />
                  <span>Silenciar por defecto</span>
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={config.heroVideo.loop}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      heroVideo: { ...prev.heroVideo, loop: e.target.checked }
                    }))}
                  />
                  <span>Reproducir en bucle</span>
                </label>
              </div>

              {/* Preview del Video */}
              {config.heroVideo.youtubeId && (
                <div className={styles.videoPreview}>
                  <h3>Vista Previa</h3>
                  <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${config.heroVideo.youtubeId}`}
                    title={config.heroVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Configuración del Video de Aprendizaje */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Video size={24} />
                <h2>Video de Aprendizaje</h2>
              </div>
              
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label htmlFor="learningVideoUrl">URL del Video de YouTube</label>
                  <input
                    type="text"
                    id="learningVideoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => handleLearningVideoUrlChange(e.target.value)}
                    className={styles.input}
                  />
                  <small className={styles.help}>
                    Pega la URL completa del video de YouTube
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="learningVideoId">ID del Video (extraído automáticamente)</label>
                  <input
                    type="text"
                    id="learningVideoId"
                    value={config.learningVideo.youtubeId}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      learningVideo: { ...prev.learningVideo, youtubeId: e.target.value }
                    }))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="learningVideoTitle">Título del Video</label>
                  <input
                    type="text"
                    id="learningVideoTitle"
                    value={config.learningVideo.title}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      learningVideo: { ...prev.learningVideo, title: e.target.value }
                    }))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="learningVideoDescription">Descripción</label>
                  <textarea
                    id="learningVideoDescription"
                    value={config.learningVideo.description}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      learningVideo: { ...prev.learningVideo, description: e.target.value }
                    }))}
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
              </div>

              <div className={styles.checkboxGrid}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={config.learningVideo.autoplay}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      learningVideo: { ...prev.learningVideo, autoplay: e.target.checked }
                    }))}
                  />
                  <span>Reproducir automáticamente</span>
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={config.learningVideo.muted}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      learningVideo: { ...prev.learningVideo, muted: e.target.checked }
                    }))}
                  />
                  <span>Silenciar por defecto</span>
                </label>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={config.learningVideo.loop}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      learningVideo: { ...prev.learningVideo, loop: e.target.checked }
                    }))}
                  />
                  <span>Reproducir en bucle</span>
                </label>
              </div>

              {/* Preview del Video de Aprendizaje */}
              {config.learningVideo.youtubeId && (
                <div className={styles.videoPreview}>
                  <h3>Vista Previa del Video de Aprendizaje</h3>
                  <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${config.learningVideo.youtubeId}`}
                    title={config.learningVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Configuración de Secciones */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Settings size={24} />
                <h2>Configuración de Secciones</h2>
              </div>

              <div className={styles.sectionConfig}>
                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <List size={20} />
                    <h3>Servicios</h3>
                  </div>
                  <div className={styles.configControls}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={config.servicios.visible}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          servicios: { ...prev.servicios, visible: e.target.checked }
                        }))}
                      />
                      <span>Mostrar sección</span>
                    </label>
                    <div className={styles.formGroup}>
                      <label>Orden</label>
                      <input
                        type="number"
                        value={config.servicios.orden}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          servicios: { ...prev.servicios, orden: parseInt(e.target.value) }
                        }))}
                        className={styles.input}
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.configItem}>
                  <div className={styles.configHeader}>
                    <Grid size={20} />
                    <h3>Cursos</h3>
                  </div>
                  <div className={styles.configControls}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={config.cursos.visible}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          cursos: { ...prev.cursos, visible: e.target.checked }
                        }))}
                      />
                      <span>Mostrar sección</span>
                    </label>
                    <div className={styles.formGroup}>
                      <label>Orden</label>
                      <input
                        type="number"
                        value={config.cursos.orden}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          cursos: { ...prev.cursos, orden: parseInt(e.target.value) }
                        }))}
                        className={styles.input}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Entrenamientos Destacados */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Grid size={24} />
                <h2>Entrenamientos Destacados</h2>
                <p>Selecciona los entrenamientos que se mostrarán en el landing page</p>
              </div>

              <div className={styles.entrenamientosList}>
                {entrenamientos.map((entrenamiento) => (
                  <label key={entrenamiento._id} className={styles.entrenamientoItem}>
                    <input
                      type="checkbox"
                      checked={config.cursos.destacados.includes(entrenamiento._id)}
                      onChange={() => toggleEntrenamientoDestacado(entrenamiento._id)}
                    />
                    <div className={styles.entrenamientoInfo}>
                      <h4>{entrenamiento.nombre}</h4>
                      <span className={styles.entrenamientoTipo}>{entrenamiento.tipo}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={styles.previewButton}
              >
                {previewMode ? <EyeOff size={20} /> : <Eye size={20} />}
                {previewMode ? 'Ocultar Vista Previa' : 'Vista Previa'}
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                <Save size={20} />
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const adminCheck = await verifyAdminAccess(context);
  
  if (!adminCheck.isAdmin) {
    return {
      redirect: {
        destination: adminCheck.redirectTo || '/',
        permanent: false,
      },
    };
  }

  try {
    // Obtener configuración del sitio
    const siteConfigResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/site-config`);
    const siteConfig = siteConfigResponse.ok ? await siteConfigResponse.json() : {
      heroVideo: {
        youtubeId: 'dQw4w9WgXcQ',
        title: 'Video de Presentación',
        description: 'Conoce más sobre nuestros servicios de trading',
        autoplay: true,
        muted: true,
        loop: true
      },
      learningVideo: {
        youtubeId: 'dQw4w9WgXcQ',
        title: 'Video de Presentación',
        description: 'Conoce más sobre nuestros servicios de trading',
        autoplay: true,
        muted: true,
        loop: true
      },
      servicios: { orden: 1, visible: true },
      cursos: { orden: 2, visible: true, destacados: [] }
    };

    // Obtener entrenamientos
    const entrenamientosResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/entrenamientos`);
    const entrenamientos = entrenamientosResponse.ok ? await entrenamientosResponse.json() : [];

    return {
      props: {
        session: adminCheck.user,
        initialConfig: siteConfig,
        entrenamientos
      },
    };
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return {
      props: {
        session: adminCheck.user,
        initialConfig: {
          heroVideo: {
            youtubeId: 'dQw4w9WgXcQ',
            title: 'Video de Presentación',
            description: 'Conoce más sobre nuestros servicios de trading',
            autoplay: true,
            muted: true,
            loop: true
          },
          learningVideo: {
            youtubeId: 'dQw4w9WgXcQ',
            title: 'Video de Presentación',
            description: 'Conoce más sobre nuestros servicios de trading',
            autoplay: true,
            muted: true,
            loop: true
          },
          servicios: { orden: 1, visible: true },
          cursos: { orden: 2, visible: true, destacados: [] }
        },
        entrenamientos: []
      },
    };
  }
}; 