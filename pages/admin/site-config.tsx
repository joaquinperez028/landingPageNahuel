import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, Settings, List, Grid, BarChart3, Layout, Trash2, Plus, Bell, MessageCircle, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '@/styles/admin/SiteConfig.module.css';
import ImageUploader from '@/components/ImageUploader';

interface SiteConfig {
  _id?: string;
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
  // Nueva sección para fechas de inicio de entrenamientos
  trainingStartDates: {
    swingTrading: {
      startDate: Date;
      startTime: string;
      enabled: boolean;
    };
    dowJones: {
      startDate: Date;
      startTime: string;
      enabled: boolean;
    };
  };
  // Configuración de precios de entrenamientos
  trainingPrices: {
    swingTrading: number;
    dowJones: number;
  };
  alertExamples: {
    traderCall: Array<{
      id: string;
      title: string;
      description: string;
      chartImage?: string;
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
      chartImage?: string;
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
      chartImage?: string;
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
    category: 'trader-call' | 'smart-money' | 'general';
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
      const configToSend = {
        ...config
      };

      console.log('Enviando configuración:', JSON.stringify(configToSend, null, 2));

      // Guardar configuración del sitio
      const siteConfigResponse = await fetch('/api/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSend),
      });

      // Guardar precios de entrenamientos
      const trainingPricesResponse = await fetch('/api/admin/training-prices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          swingTrading: config.trainingPrices?.swingTrading || 10,
          dowJones: config.trainingPrices?.dowJones || 20
        }),
      });

      if (siteConfigResponse.ok && trainingPricesResponse.ok) {
        toast.success('Configuración actualizada correctamente');
      } else {
        const siteConfigError = await siteConfigResponse.json().catch(() => null);
        const trainingPricesError = await trainingPricesResponse.json().catch(() => null);
        
        console.error('Error responses:', { siteConfigError, trainingPricesError });
        
        if (!siteConfigResponse.ok) {
          toast.error(`Error al actualizar configuración del sitio: ${siteConfigError?.error || 'Error desconocido'}`);
        }
        if (!trainingPricesResponse.ok) {
          toast.error(`Error al actualizar precios de entrenamientos: ${trainingPricesError?.error || 'Error desconocido'}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsLoading(false);
    }
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

  const handleAutoUpdateMetrics = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Calculando métricas automáticas...');
      
      const response = await fetch('/api/admin/calculate-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Actualizar las métricas con los datos calculados
        setConfig(prev => ({
          ...prev,
          statistics: {
            ...prev.statistics,
            stats: data.metrics
          }
        }));
        
        toast.success('Métricas actualizadas con datos reales de la base de datos');
        console.log('📊 Resumen de métricas:', data.summary);
      } else {
        toast.error(data.error || 'Error al calcular métricas automáticas');
      }
    } catch (error) {
      console.error('Error al calcular métricas:', error);
      toast.error('Error al calcular métricas automáticas');
    } finally {
      setIsLoading(false);
    }
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

  // Funciones para manejar fechas de inicio de entrenamientos
  const handleTrainingStartDateChange = (trainingType: 'swingTrading' | 'dowJones', field: 'startDate' | 'startTime' | 'enabled', value: any) => {
    setConfig(prev => ({
      ...prev,
      trainingStartDates: {
        ...prev.trainingStartDates,
        [trainingType]: {
          ...prev.trainingStartDates[trainingType],
          [field]: value
        }
      }
    }));
  };

  const handleTrainingPriceChange = (trainingType: 'swingTrading' | 'dowJones', price: number) => {
    setConfig(prev => ({
      ...prev,
      trainingPrices: {
        ...prev.trainingPrices,
        [trainingType]: price
      }
    }));
  };

  // Función para formatear fecha para input de tipo date
  const formatDateForInput = (date: Date): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
                    <Link href="/admin/dashboard" className={styles.backButton}>
          <ArrowLeft size={20} />
          Volver al Dashboard
        </Link>
            <h1>Configuración del Sitio Web</h1>
            <p>Administra los elementos principales del landing page</p>
          </div>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            






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
                  <div className={styles.statsHeader}>
                    <h3>Métricas Configuradas</h3>
                    <button
                      type="button"
                      onClick={handleAutoUpdateMetrics}
                      disabled={isLoading}
                      className={styles.autoUpdateButton}
                    >
                      <BarChart3 size={16} />
                      {isLoading ? 'Calculando...' : 'Actualizar con Datos Reales'}
                    </button>
                  </div>
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

            {/* Fechas de Inicio de Entrenamientos */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Calendar size={24} />
                <h2>Fechas de Inicio de Entrenamientos</h2>
                <p>Configura las fechas de inicio y countdown para cada entrenamiento</p>
              </div>

              {/* Swing Trading */}
              <div className={styles.trainingDateGroup}>
                <h3>🎯 Swing Trading</h3>
                <div className={styles.trainingDateForm}>
                  <div className={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        checked={config.trainingStartDates?.swingTrading?.enabled ?? true}
                        onChange={(e) => handleTrainingStartDateChange('swingTrading', 'enabled', e.target.checked)}
                      />
                      Habilitar countdown
                    </label>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Fecha de Inicio</label>
                    <input
                      type="date"
                      value={formatDateForInput(config.trainingStartDates?.swingTrading?.startDate ?? new Date())}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        handleTrainingStartDateChange('swingTrading', 'startDate', date);
                      }}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Hora de Inicio</label>
                    <input
                      type="time"
                      value={config.trainingStartDates?.swingTrading?.startTime ?? '13:00'}
                      onChange={(e) => handleTrainingStartDateChange('swingTrading', 'startTime', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Dow Jones */}
              <div className={styles.trainingDateGroup}>
                <h3>📈 Dow Jones</h3>
                <div className={styles.trainingDateForm}>
                  <div className={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        checked={config.trainingStartDates?.dowJones?.enabled ?? true}
                        onChange={(e) => handleTrainingStartDateChange('dowJones', 'enabled', e.target.checked)}
                      />
                      Habilitar countdown
                    </label>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Fecha de Inicio</label>
                    <input
                      type="date"
                      value={formatDateForInput(config.trainingStartDates?.dowJones?.startDate ?? new Date())}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        handleTrainingStartDateChange('dowJones', 'startDate', date);
                      }}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Hora de Inicio</label>
                    <input
                      type="time"
                      value={config.trainingStartDates?.dowJones?.startTime ?? '14:00'}
                      onChange={(e) => handleTrainingStartDateChange('dowJones', 'startTime', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Precios de Entrenamientos */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <BarChart3 size={24} />
                <h2>Precios de Entrenamientos</h2>
                <p>Configura los precios en pesos argentinos para cada entrenamiento</p>
              </div>

              {/* Swing Trading */}
              <div className={styles.trainingPriceGroup}>
                <h3>🎯 Swing Trading</h3>
                <div className={styles.trainingPriceForm}>
                  <div className={styles.formGroup}>
                    <label>Precio (ARS)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.trainingPrices?.swingTrading ?? 10}
                      onChange={(e) => handleTrainingPriceChange('swingTrading', Number(e.target.value))}
                      className={styles.input}
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* Dow Jones */}
              <div className={styles.trainingPriceGroup}>
                <h3>📈 Dow Jones</h3>
                <div className={styles.trainingPriceForm}>
                  <div className={styles.formGroup}>
                    <label>Precio (ARS)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={config.trainingPrices?.dowJones ?? 20}
                      onChange={(e) => handleTrainingPriceChange('dowJones', Number(e.target.value))}
                      className={styles.input}
                      placeholder="20"
                    />
                  </div>
                </div>
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
                          <label>Imagen del Gráfico</label>
                          {example.chartImage && (
                            <div className={styles.currentImage}>
                              <img src={example.chartImage} alt="Gráfico actual" style={{ width: '100%', maxWidth: '200px', height: 'auto', marginBottom: '0.5rem', borderRadius: '8px' }} />
                              <button
                                type="button"
                                onClick={() => handleAlertExampleChange('traderCall', example.id, 'chartImage', '')}
                                className={styles.removeImageButton}
                              >
                                Eliminar imagen
                              </button>
                            </div>
                          )}
                          <ImageUploader
                            onImageUploaded={(image) => handleAlertExampleChange('traderCall', example.id, 'chartImage', image.secure_url)}
                            buttonText="Subir gráfico"
                            maxFiles={1}
                          />
                          <small className={styles.help}>
                            Sube una imagen del gráfico de trading para esta alerta
                          </small>
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
                          <label>Imagen del Gráfico</label>
                          {example.chartImage && (
                            <div className={styles.currentImage}>
                              <img src={example.chartImage} alt="Gráfico actual" style={{ width: '100%', maxWidth: '200px', height: 'auto', marginBottom: '0.5rem', borderRadius: '8px' }} />
                              <button
                                type="button"
                                onClick={() => handleAlertExampleChange('smartMoney', example.id, 'chartImage', '')}
                                className={styles.removeImageButton}
                              >
                                Eliminar imagen
                              </button>
                            </div>
                          )}
                          <ImageUploader
                            onImageUploaded={(image) => handleAlertExampleChange('smartMoney', example.id, 'chartImage', image.secure_url)}
                            buttonText="Subir gráfico"
                            maxFiles={1}
                          />
                          <small className={styles.help}>
                            Sube una imagen del gráfico de trading para esta alerta
                          </small>
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
                          <label>Imagen del Gráfico</label>
                          {example.chartImage && (
                            <div className={styles.currentImage}>
                              <img src={example.chartImage} alt="Gráfico actual" style={{ width: '100%', maxWidth: '200px', height: 'auto', marginBottom: '0.5rem', borderRadius: '8px' }} />
                              <button
                                type="button"
                                onClick={() => handleAlertExampleChange('cashFlow', example.id, 'chartImage', '')}
                                className={styles.removeImageButton}
                              >
                                Eliminar imagen
                              </button>
                            </div>
                          )}
                          <ImageUploader
                            onImageUploaded={(image) => handleAlertExampleChange('cashFlow', example.id, 'chartImage', image.secure_url)}
                            buttonText="Subir gráfico"
                            maxFiles={1}
                          />
                          <small className={styles.help}>
                            Sube una imagen del gráfico de trading para esta alerta
                          </small>
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
      trainingStartDates: {
        swingTrading: {
          startDate: new Date('2024-10-11T13:00:00.000Z'),
          startTime: '13:00',
          enabled: true
        },
        dowJones: {
          startDate: new Date('2024-11-01T14:00:00.000Z'),
          startTime: '14:00',
          enabled: true
        }
      },
      trainingPrices: {
        swingTrading: 10,
        dowJones: 20
      },
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

    // Obtener precios actuales de entrenamientos
    const trainingPricesResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/training-prices`);
    const trainingPrices = trainingPricesResponse.ok ? await trainingPricesResponse.json() : { prices: { swingTrading: 10, dowJones: 20 } };

    // Combinar configuración con precios actuales
    const finalConfig = {
      ...siteConfig,
      trainingPrices: trainingPrices.prices
    };

    return {
      props: {
        session: adminCheck.user,
        initialConfig: finalConfig,
        entrenamientos
      },
    };
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return {
      props: {
        session: adminCheck.user,
        initialConfig: {
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
          trainingStartDates: {
            swingTrading: {
              startDate: new Date('2024-10-11T13:00:00.000Z'),
              startTime: '13:00',
              enabled: true
            },
            dowJones: {
              startDate: new Date('2024-11-01T14:00:00.000Z'),
              startTime: '14:00',
              enabled: true
            }
          },
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