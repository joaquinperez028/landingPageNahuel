import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, Settings, Video, List, Grid, PlayCircle, BarChart3, Layout, Trash2, Plus, Bell, MessageCircle } from 'lucide-react';
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
  statistics: {
    visible: boolean;
    backgroundColor: string;
    textColor: string;
    stats: Array<{
      id: string;
      number: string;
      label: string;
      color: string;
      icon?: string;
      order: number;
    }>;
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
  alertExamples: {
    traderCall: Array<{
      id: string;
      title: string;
      description: string;
      entryPrice: string;
      exitPrice: string;
      profit: string;
      profitPercentage: string;
      riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
      status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
      country: string;
      ticker: string;
      order: number;
    }>;
    smartMoney: Array<{
      id: string;
      title: string;
      description: string;
      entryPrice: string;
      exitPrice: string;
      profit: string;
      profitPercentage: string;
      riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
      status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
      country: string;
      ticker: string;
      order: number;
    }>;
    cashFlow: Array<{
      id: string;
      title: string;
      description: string;
      entryPrice: string;
      exitPrice: string;
      profit: string;
      profitPercentage: string;
      riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
      status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
      country: string;
      ticker: string;
      order: number;
    }>;
  };
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category: 'trader-call' | 'smart-money' | 'cash-flow' | 'general';
    order: number;
    visible: boolean;
  }>;
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

  const handleServiceVideoUrlChange = (servicio: 'alertas' | 'entrenamientos' | 'asesorias', url: string) => {
    const videoId = extractYouTubeId(url);
    setConfig(prev => ({
      ...prev,
      serviciosVideos: {
        ...prev.serviciosVideos,
        [servicio]: {
          ...prev.serviciosVideos[servicio],
          youtubeId: videoId
        }
      }
    }));
  };

  const handleStatisticsChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        [field]: value
      }
    }));
  };

  const handleStatChange = (statId: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        stats: prev.statistics.stats.map(stat => 
          stat.id === statId ? { ...stat, [field]: value } : stat
        )
      }
    }));
  };

  const addStat = () => {
    const newStat = {
      id: `stat-${Date.now()}`,
      number: '+100',
      label: 'Nueva Métrica',
      color: '#ffffff',
      icon: '📊',
      order: config.statistics.stats.length + 1
    };
    
    setConfig(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        stats: [...prev.statistics.stats, newStat]
      }
    }));
  };

  const removeStat = (statId: string) => {
    setConfig(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        stats: prev.statistics.stats.filter(stat => stat.id !== statId)
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

  // Funciones para manejar ejemplos de alertas
  const addAlertExample = (category: 'traderCall' | 'smartMoney' | 'cashFlow') => {
    const newExample = {
      id: `example-${Date.now()}`,
      title: 'Alerta de Compra',
      description: 'Detectamos oportunidad al superar al superar el día lo SMA200 y EMA50...',
      entryPrice: 'USD $132.31',
      exitPrice: 'USD $230.25 ($203.64)',
      profit: '$75.00',
      profitPercentage: '+5.89%',
      riskLevel: 'MEDIO' as const,
      status: 'CERRADO TP1' as const,
      country: 'United States',
      ticker: 'AAPL',
      order: config.alertExamples[category].length + 1
    };
    
    setConfig(prev => ({
      ...prev,
      alertExamples: {
        ...prev.alertExamples,
        [category]: [...prev.alertExamples[category], newExample]
      }
    }));
  };

  const removeAlertExample = (category: 'traderCall' | 'smartMoney' | 'cashFlow', exampleId: string) => {
    setConfig(prev => ({
      ...prev,
      alertExamples: {
        ...prev.alertExamples,
        [category]: prev.alertExamples[category].filter(example => example.id !== exampleId)
      }
    }));
  };

  const handleAlertExampleChange = (category: 'traderCall' | 'smartMoney' | 'cashFlow', exampleId: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      alertExamples: {
        ...prev.alertExamples,
        [category]: prev.alertExamples[category].map(example => 
          example.id === exampleId ? { ...example, [field]: value } : example
        )
      }
    }));
  };

  // Funciones para manejar FAQs
  const addFaq = () => {
    const newFaq = {
      id: `faq-${Date.now()}`,
      question: '¿Qué es Trader Call?',
      answer: 'Trader Call es un servicio de suscripción de alertas de trading...',
      category: 'trader-call' as const,
      order: config.faqs.length + 1,
      visible: true
    };
    
    setConfig(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFaq]
    }));
  };

  const removeFaq = (faqId: string) => {
    setConfig(prev => ({
      ...prev,
      faqs: prev.faqs.filter(faq => faq.id !== faqId)
    }));
  };

  const handleFaqChange = (faqId: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      faqs: prev.faqs.map(faq => 
        faq.id === faqId ? { ...faq, [field]: value } : faq
      )
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
                <PlayCircle size={24} />
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
                    Pega la URL completa del video de YouTube para la sección de aprendizaje
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
                  <span>Repetir video</span>
                </label>
              </div>
            </div>

            {/* Configuración de Videos de Servicios */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Video size={24} />
                <h2>Videos de Servicios</h2>
              </div>
              
              {/* Video de Alertas */}
              <div className={styles.serviceVideoGroup}>
                <h3>📊 Alertas de Trading</h3>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="alertasVideoUrl">URL del Video de YouTube</label>
                    <input
                      type="text"
                      id="alertasVideoUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      onChange={(e) => handleServiceVideoUrlChange('alertas', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="alertasVideoId">ID del Video</label>
                    <input
                      type="text"
                      id="alertasVideoId"
                      value={config.serviciosVideos.alertas.youtubeId}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          alertas: { ...prev.serviciosVideos.alertas, youtubeId: e.target.value }
                        }
                      }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="alertasVideoTitle">Título del Video</label>
                    <input
                      type="text"
                      id="alertasVideoTitle"
                      value={config.serviciosVideos.alertas.title}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          alertas: { ...prev.serviciosVideos.alertas, title: e.target.value }
                        }
                      }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="alertasVideoDescription">Descripción</label>
                    <textarea
                      id="alertasVideoDescription"
                      value={config.serviciosVideos.alertas.description}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          alertas: { ...prev.serviciosVideos.alertas, description: e.target.value }
                        }
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
                      checked={config.serviciosVideos.alertas.autoplay}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          alertas: { ...prev.serviciosVideos.alertas, autoplay: e.target.checked }
                        }
                      }))}
                    />
                    <span>Reproducir automáticamente</span>
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.serviciosVideos.alertas.muted}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          alertas: { ...prev.serviciosVideos.alertas, muted: e.target.checked }
                        }
                      }))}
                    />
                    <span>Silenciar por defecto</span>
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.serviciosVideos.alertas.loop}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          alertas: { ...prev.serviciosVideos.alertas, loop: e.target.checked }
                        }
                      }))}
                    />
                    <span>Repetir video</span>
                  </label>
                </div>
              </div>

              {/* Video de Entrenamientos */}
              <div className={styles.serviceVideoGroup}>
                <h3>📚 Entrenamientos</h3>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="entrenamientosVideoUrl">URL del Video de YouTube</label>
                    <input
                      type="text"
                      id="entrenamientosVideoUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      onChange={(e) => handleServiceVideoUrlChange('entrenamientos', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="entrenamientosVideoId">ID del Video</label>
                    <input
                      type="text"
                      id="entrenamientosVideoId"
                      value={config.serviciosVideos.entrenamientos.youtubeId}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          entrenamientos: { ...prev.serviciosVideos.entrenamientos, youtubeId: e.target.value }
                        }
                      }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="entrenamientosVideoTitle">Título del Video</label>
                    <input
                      type="text"
                      id="entrenamientosVideoTitle"
                      value={config.serviciosVideos.entrenamientos.title}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          entrenamientos: { ...prev.serviciosVideos.entrenamientos, title: e.target.value }
                        }
                      }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="entrenamientosVideoDescription">Descripción</label>
                    <textarea
                      id="entrenamientosVideoDescription"
                      value={config.serviciosVideos.entrenamientos.description}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          entrenamientos: { ...prev.serviciosVideos.entrenamientos, description: e.target.value }
                        }
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
                      checked={config.serviciosVideos.entrenamientos.autoplay}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          entrenamientos: { ...prev.serviciosVideos.entrenamientos, autoplay: e.target.checked }
                        }
                      }))}
                    />
                    <span>Reproducir automáticamente</span>
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.serviciosVideos.entrenamientos.muted}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          entrenamientos: { ...prev.serviciosVideos.entrenamientos, muted: e.target.checked }
                        }
                      }))}
                    />
                    <span>Silenciar por defecto</span>
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.serviciosVideos.entrenamientos.loop}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          entrenamientos: { ...prev.serviciosVideos.entrenamientos, loop: e.target.checked }
                        }
                      }))}
                    />
                    <span>Repetir video</span>
                  </label>
                </div>
              </div>

              {/* Video de Asesorías */}
              <div className={styles.serviceVideoGroup}>
                <h3>💼 Asesorías</h3>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="asesoriasVideoUrl">URL del Video de YouTube</label>
                    <input
                      type="text"
                      id="asesoriasVideoUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      onChange={(e) => handleServiceVideoUrlChange('asesorias', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="asesoriasVideoId">ID del Video</label>
                    <input
                      type="text"
                      id="asesoriasVideoId"
                      value={config.serviciosVideos.asesorias.youtubeId}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          asesorias: { ...prev.serviciosVideos.asesorias, youtubeId: e.target.value }
                        }
                      }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="asesoriasVideoTitle">Título del Video</label>
                    <input
                      type="text"
                      id="asesoriasVideoTitle"
                      value={config.serviciosVideos.asesorias.title}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          asesorias: { ...prev.serviciosVideos.asesorias, title: e.target.value }
                        }
                      }))}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="asesoriasVideoDescription">Descripción</label>
                    <textarea
                      id="asesoriasVideoDescription"
                      value={config.serviciosVideos.asesorias.description}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          asesorias: { ...prev.serviciosVideos.asesorias, description: e.target.value }
                        }
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
                      checked={config.serviciosVideos.asesorias.autoplay}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          asesorias: { ...prev.serviciosVideos.asesorias, autoplay: e.target.checked }
                        }
                      }))}
                    />
                    <span>Reproducir automáticamente</span>
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.serviciosVideos.asesorias.muted}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          asesorias: { ...prev.serviciosVideos.asesorias, muted: e.target.checked }
                        }
                      }))}
                    />
                    <span>Silenciar por defecto</span>
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.serviciosVideos.asesorias.loop}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        serviciosVideos: {
                          ...prev.serviciosVideos,
                          asesorias: { ...prev.serviciosVideos.asesorias, loop: e.target.checked }
                        }
                      }))}
                    />
                    <span>Repetir video</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Configuración de Estadísticas */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <BarChart3 size={24} />
                <h2>Estadísticas/Métricas</h2>
              </div>
              
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.statistics.visible}
                      onChange={(e) => handleStatisticsChange('visible', e.target.checked)}
                    />
                    <span>Mostrar sección de estadísticas</span>
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="statsBackgroundColor">Color de fondo</label>
                  <input
                    type="color"
                    id="statsBackgroundColor"
                    value={config.statistics.backgroundColor}
                    onChange={(e) => handleStatisticsChange('backgroundColor', e.target.value)}
                    className={styles.colorInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="statsTextColor">Color del texto</label>
                  <input
                    type="color"
                    id="statsTextColor"
                    value={config.statistics.textColor}
                    onChange={(e) => handleStatisticsChange('textColor', e.target.value)}
                    className={styles.colorInput}
                  />
                </div>
              </div>

              <div className={styles.statsSection}>
                <div className={styles.statsList}>
                  <h3>Métricas Configuradas</h3>
                  {config.statistics.stats.sort((a, b) => a.order - b.order).map((stat, index) => (
                    <div key={stat.id} className={styles.statItem}>
                      <div className={styles.statHeader}>
                        <span className={styles.statNumber}>#{stat.order}</span>
                        <button
                          type="button"
                          onClick={() => removeStat(stat.id)}
                          className={styles.removeStat}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className={styles.statFields}>
                        <div className={styles.formGroup}>
                          <label>Número/Valor</label>
                          <input
                            type="text"
                            value={stat.number}
                            onChange={(e) => handleStatChange(stat.id, 'number', e.target.value)}
                            placeholder="+2900"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Etiqueta</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                            placeholder="Estudiantes"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Icono (opcional)</label>
                          <input
                            type="text"
                            value={stat.icon || ''}
                            onChange={(e) => handleStatChange(stat.id, 'icon', e.target.value)}
                            placeholder="📊"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Color</label>
                          <input
                            type="color"
                            value={stat.color}
                            onChange={(e) => handleStatChange(stat.id, 'color', e.target.value)}
                            className={styles.colorInput}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Orden</label>
                          <input
                            type="number"
                            value={stat.order}
                            onChange={(e) => handleStatChange(stat.id, 'order', parseInt(e.target.value))}
                            className={styles.input}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addStat}
                  className={styles.addStatButton}
                >
                  <Plus size={16} />
                  Agregar Métrica
                </button>
              </div>
            </div>

            {/* Configuración de Secciones */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Layout size={24} />
                <h2>Configuración de Secciones</h2>
              </div>

              <div className={styles.sectionControls}>
                <div className={styles.sectionControl}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.servicios.visible}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        servicios: { ...prev.servicios, visible: e.target.checked }
                      }))}
                    />
                    <span>Mostrar sección de servicios</span>
                  </label>
                  <input
                    type="number"
                    value={config.servicios.orden}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      servicios: { ...prev.servicios, orden: parseInt(e.target.value) }
                    }))}
                    className={styles.orderInput}
                    min="1"
                  />
                </div>

                <div className={styles.sectionControl}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={config.cursos.visible}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        cursos: { ...prev.cursos, visible: e.target.checked }
                      }))}
                    />
                    <span>Mostrar sección de cursos</span>
                  </label>
                  <input
                    type="number"
                    value={config.cursos.orden}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      cursos: { ...prev.cursos, orden: parseInt(e.target.value) }
                    }))}
                    className={styles.orderInput}
                    min="1"
                  />
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

            {/* Configuración de Ejemplos de Alertas */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Bell size={24} />
                <h2>Ejemplos de Alertas</h2>
                <p>Administra los ejemplos que se muestran en cada servicio de alertas</p>
              </div>

              {/* Trader Call Examples */}
              <div className={styles.alertExamplesGroup}>
                <h3>📊 Trader Call</h3>
                <div className={styles.alertExamplesList}>
                  {config.alertExamples?.traderCall?.sort((a, b) => a.order - b.order).map((example, index) => (
                    <div key={example.id} className={styles.alertExampleItem}>
                      <div className={styles.alertExampleHeader}>
                        <span className={styles.exampleNumber}>#{example.order}</span>
                        <button
                          type="button"
                          onClick={() => removeAlertExample('traderCall', example.id)}
                          className={styles.removeExample}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className={styles.alertExampleFields}>
                        <div className={styles.formGroup}>
                          <label>Título</label>
                          <input
                            type="text"
                            value={example.title}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'title', e.target.value)}
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Descripción</label>
                          <textarea
                            value={example.description}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'description', e.target.value)}
                            className={styles.textarea}
                            rows={2}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>País de Origen</label>
                          <input
                            type="text"
                            value={example.country}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'country', e.target.value)}
                            placeholder="United States"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Ticker</label>
                          <input
                            type="text"
                            value={example.ticker}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'ticker', e.target.value)}
                            placeholder="AAPL"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Precio de Entrada</label>
                          <input
                            type="text"
                            value={example.entryPrice}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'entryPrice', e.target.value)}
                            placeholder="USD $132.31"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Precio de Salida</label>
                          <input
                            type="text"
                            value={example.exitPrice}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'exitPrice', e.target.value)}
                            placeholder="USD $230.25 ($203.64)"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Take Profit 1</label>
                          <input
                            type="text"
                            value={example.profit}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'profit', e.target.value)}
                            placeholder="$75.00"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Rendimiento</label>
                          <input
                            type="text"
                            value={example.profitPercentage}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'profitPercentage', e.target.value)}
                            placeholder="+5.89%"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Nivel de Riesgo</label>
                          <select
                            value={example.riskLevel}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'riskLevel', e.target.value)}
                            className={styles.input}
                          >
                            <option value="BAJO">BAJO</option>
                            <option value="MEDIO">MEDIO</option>
                            <option value="ALTO">ALTO</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Estado</label>
                          <select
                            value={example.status}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'status', e.target.value)}
                            className={styles.input}
                          >
                            <option value="CERRADO TP1">CERRADO TP1</option>
                            <option value="CERRADO TP1 Y SL">CERRADO TP1 Y SL</option>
                            <option value="CERRADO SL">CERRADO SL</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Orden</label>
                          <input
                            type="number"
                            value={example.order}
                            onChange={(e) => handleAlertExampleChange('traderCall', example.id, 'order', parseInt(e.target.value))}
                            className={styles.input}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addAlertExample('traderCall')}
                  className={styles.addExampleButton}
                >
                  <Plus size={16} />
                  Agregar Ejemplo Trader Call
                </button>
              </div>

              {/* Smart Money Examples */}
              <div className={styles.alertExamplesGroup}>
                <h3>🎯 Smart Money</h3>
                <div className={styles.alertExamplesList}>
                  {config.alertExamples?.smartMoney?.sort((a, b) => a.order - b.order).map((example, index) => (
                    <div key={example.id} className={styles.alertExampleItem}>
                      <div className={styles.alertExampleHeader}>
                        <span className={styles.exampleNumber}>#{example.order}</span>
                        <button
                          type="button"
                          onClick={() => removeAlertExample('smartMoney', example.id)}
                          className={styles.removeExample}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className={styles.alertExampleFields}>
                        <div className={styles.formGroup}>
                          <label>Título</label>
                          <input
                            type="text"
                            value={example.title}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'title', e.target.value)}
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Descripción</label>
                          <textarea
                            value={example.description}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'description', e.target.value)}
                            className={styles.textarea}
                            rows={2}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>País de Origen</label>
                          <input
                            type="text"
                            value={example.country}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'country', e.target.value)}
                            placeholder="United States"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Ticker</label>
                          <input
                            type="text"
                            value={example.ticker}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'ticker', e.target.value)}
                            placeholder="TSLA"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Precio de Entrada</label>
                          <input
                            type="text"
                            value={example.entryPrice}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'entryPrice', e.target.value)}
                            placeholder="USD $132.31"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Precio de Salida</label>
                          <input
                            type="text"
                            value={example.exitPrice}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'exitPrice', e.target.value)}
                            placeholder="USD $230.25 ($203.64)"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Take Profit 1</label>
                          <input
                            type="text"
                            value={example.profit}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'profit', e.target.value)}
                            placeholder="$75.00"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Rendimiento</label>
                          <input
                            type="text"
                            value={example.profitPercentage}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'profitPercentage', e.target.value)}
                            placeholder="+15.89%"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Nivel de Riesgo</label>
                          <select
                            value={example.riskLevel}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'riskLevel', e.target.value)}
                            className={styles.input}
                          >
                            <option value="BAJO">BAJO</option>
                            <option value="MEDIO">MEDIO</option>
                            <option value="ALTO">ALTO</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Estado</label>
                          <select
                            value={example.status}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'status', e.target.value)}
                            className={styles.input}
                          >
                            <option value="CERRADO TP1">CERRADO TP1</option>
                            <option value="CERRADO TP1 Y SL">CERRADO TP1 Y SL</option>
                            <option value="CERRADO SL">CERRADO SL</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Orden</label>
                          <input
                            type="number"
                            value={example.order}
                            onChange={(e) => handleAlertExampleChange('smartMoney', example.id, 'order', parseInt(e.target.value))}
                            className={styles.input}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addAlertExample('smartMoney')}
                  className={styles.addExampleButton}
                >
                  <Plus size={16} />
                  Agregar Ejemplo Smart Money
                </button>
              </div>

              {/* Cash Flow Examples */}
              <div className={styles.alertExamplesGroup}>
                <h3>💰 Cash Flow</h3>
                <div className={styles.alertExamplesList}>
                  {config.alertExamples?.cashFlow?.sort((a, b) => a.order - b.order).map((example, index) => (
                    <div key={example.id} className={styles.alertExampleItem}>
                      <div className={styles.alertExampleHeader}>
                        <span className={styles.exampleNumber}>#{example.order}</span>
                        <button
                          type="button"
                          onClick={() => removeAlertExample('cashFlow', example.id)}
                          className={styles.removeExample}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className={styles.alertExampleFields}>
                        <div className={styles.formGroup}>
                          <label>Título</label>
                          <input
                            type="text"
                            value={example.title}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'title', e.target.value)}
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Descripción</label>
                          <textarea
                            value={example.description}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'description', e.target.value)}
                            className={styles.textarea}
                            rows={2}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>País de Origen</label>
                          <input
                            type="text"
                            value={example.country}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'country', e.target.value)}
                            placeholder="United States"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Ticker</label>
                          <input
                            type="text"
                            value={example.ticker}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'ticker', e.target.value)}
                            placeholder="SPY"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Precio de Entrada</label>
                          <input
                            type="text"
                            value={example.entryPrice}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'entryPrice', e.target.value)}
                            placeholder="USD $132.31"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Precio de Salida</label>
                          <input
                            type="text"
                            value={example.exitPrice}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'exitPrice', e.target.value)}
                            placeholder="USD $230.25 ($203.64)"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Take Profit 1</label>
                          <input
                            type="text"
                            value={example.profit}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'profit', e.target.value)}
                            placeholder="$75.00"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Rendimiento</label>
                          <input
                            type="text"
                            value={example.profitPercentage}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'profitPercentage', e.target.value)}
                            placeholder="+19.73%"
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Nivel de Riesgo</label>
                          <select
                            value={example.riskLevel}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'riskLevel', e.target.value)}
                            className={styles.input}
                          >
                            <option value="BAJO">BAJO</option>
                            <option value="MEDIO">MEDIO</option>
                            <option value="ALTO">ALTO</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Estado</label>
                          <select
                            value={example.status}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'status', e.target.value)}
                            className={styles.input}
                          >
                            <option value="CERRADO TP1">CERRADO TP1</option>
                            <option value="CERRADO TP1 Y SL">CERRADO TP1 Y SL</option>
                            <option value="CERRADO SL">CERRADO SL</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Orden</label>
                          <input
                            type="number"
                            value={example.order}
                            onChange={(e) => handleAlertExampleChange('cashFlow', example.id, 'order', parseInt(e.target.value))}
                            className={styles.input}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addAlertExample('cashFlow')}
                  className={styles.addExampleButton}
                >
                  <Plus size={16} />
                  Agregar Ejemplo Cash Flow
                </button>
              </div>
            </div>

            {/* Configuración de FAQs */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <MessageCircle size={24} />
                <h2>Preguntas Frecuentes (FAQs)</h2>
                <p>Administra las preguntas frecuentes que se muestran en los servicios</p>
              </div>

              <div className={styles.faqsList}>
                {config.faqs?.sort((a, b) => a.order - b.order).map((faq, index) => (
                  <div key={faq.id} className={styles.faqItem}>
                    <div className={styles.faqHeader}>
                      <span className={styles.faqNumber}>#{faq.order}</span>
                      <button
                        type="button"
                        onClick={() => removeFaq(faq.id)}
                        className={styles.removeFaq}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className={styles.faqFields}>
                      <div className={styles.formGroup}>
                        <label>Pregunta</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)}
                          placeholder="¿Qué es Trader Call?"
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Respuesta</label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(faq.id, 'answer', e.target.value)}
                          placeholder="Trader Call es un servicio de suscripción..."
                          className={styles.textarea}
                          rows={4}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Categoría</label>
                        <select
                          value={faq.category}
                          onChange={(e) => handleFaqChange(faq.id, 'category', e.target.value)}
                          className={styles.input}
                        >
                          <option value="trader-call">Trader Call</option>
                          <option value="smart-money">Smart Money</option>
                          <option value="cash-flow">Cash Flow</option>
                          <option value="general">General</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Orden</label>
                        <input
                          type="number"
                          value={faq.order}
                          onChange={(e) => handleFaqChange(faq.id, 'order', parseInt(e.target.value))}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={faq.visible}
                            onChange={(e) => handleFaqChange(faq.id, 'visible', e.target.checked)}
                          />
                          <span>Visible</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addFaq}
                className={styles.addFaqButton}
              >
                <Plus size={16} />
                Agregar FAQ
              </button>
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
        title: 'Cursos de Inversión',
        description: 'Aprende a invertir desde cero con nuestros cursos especializados',
        autoplay: false,
        muted: true,
        loop: false
      },
      serviciosVideos: {
        alertas: {
          youtubeId: 'dQw4w9WgXcQ',
          title: 'Video de Alertas',
          description: 'Descubre cómo funcionan nuestras alertas de trading',
          autoplay: false,
          muted: true,
          loop: false
        },
        entrenamientos: {
          youtubeId: 'dQw4w9WgXcQ',
          title: 'Video de Entrenamientos',
          description: 'Conoce nuestros programas de formación especializados',
          autoplay: false,
          muted: true,
          loop: false
        },
        asesorias: {
          youtubeId: 'dQw4w9WgXcQ',
          title: 'Video de Asesorías',
          description: 'Asesorías personalizadas para optimizar tu portafolio',
          autoplay: false,
          muted: true,
          loop: false
        }
      },
      statistics: {
        visible: true,
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        stats: [
          { id: 'estudiantes', number: '+2900', label: 'Estudiantes', color: '#ffffff', order: 1 },
          { id: 'formaciones', number: '+15', label: 'Formaciones', color: '#ffffff', order: 2 },
          { id: 'horas', number: '+70', label: 'Horas de contenido', color: '#ffffff', order: 3 },
          { id: 'satisfaccion', number: '98%', label: 'Satisfacción', color: '#ffffff', order: 4 }
        ]
      },
      servicios: { orden: 1, visible: true },
      cursos: { orden: 2, visible: true, destacados: [] },
      alertExamples: {
        traderCall: [],
        smartMoney: [],
        cashFlow: []
      },
      faqs: []
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
            title: 'Cursos de Inversión',
            description: 'Aprende a invertir desde cero con nuestros cursos especializados',
            autoplay: false,
            muted: true,
            loop: false
          },
          serviciosVideos: {
            alertas: {
              youtubeId: 'dQw4w9WgXcQ',
              title: 'Video de Alertas',
              description: 'Descubre cómo funcionan nuestras alertas de trading',
              autoplay: false,
              muted: true,
              loop: false
            },
            entrenamientos: {
              youtubeId: 'dQw4w9WgXcQ',
              title: 'Video de Entrenamientos',
              description: 'Conoce nuestros programas de formación especializados',
              autoplay: false,
              muted: true,
              loop: false
            },
            asesorias: {
              youtubeId: 'dQw4w9WgXcQ',
              title: 'Video de Asesorías',
              description: 'Asesorías personalizadas para optimizar tu portafolio',
              autoplay: false,
              muted: true,
              loop: false
            }
          },
          statistics: {
            visible: true,
            backgroundColor: '#7c3aed',
            textColor: '#ffffff',
            stats: [
              { id: 'estudiantes', number: '+2900', label: 'Estudiantes', color: '#ffffff', order: 1 },
              { id: 'formaciones', number: '+15', label: 'Formaciones', color: '#ffffff', order: 2 },
              { id: 'horas', number: '+70', label: 'Horas de contenido', color: '#ffffff', order: 3 },
              { id: 'satisfaccion', number: '98%', label: 'Satisfacción', color: '#ffffff', order: 4 }
            ]
          },
          servicios: { orden: 1, visible: true },
          cursos: { orden: 2, visible: true, destacados: [] },
          alertExamples: {
            traderCall: [],
            smartMoney: [],
            cashFlow: []
          },
          faqs: []
        },
        entrenamientos: []
      },
    };
  }
}; 