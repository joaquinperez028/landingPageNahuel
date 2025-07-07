import React, { useState, useEffect, useCallback } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import toast from 'react-hot-toast';
import {
  PlayCircle,
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  FileText,
  Image,
  Youtube,
  FileDown,
  Star,
  Clock,
  Target,
  GripVertical,
  Upload,
  Eye,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/googleAuth';
import styles from '../../styles/AdminLecciones.module.css';
import ImageUploader from '../../components/ImageUploader';
import PDFUploader from '../../components/PDFUploader';
import { verifyAdminAccess } from '@/lib/adminAuth';
import { motion } from 'framer-motion';

// Interfaces para archivos de Cloudinary
interface CloudinaryImage {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface CloudinaryPDF {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  bytes: number;
  pages?: number;
}

interface LessonContent {
  id: string;
  type: 'youtube' | 'pdf' | 'image' | 'text' | 'html';
  orden: number;
  title?: string;
  content: {
    youtubeId?: string;
    youtubeTitle?: string;
    youtubeDuration?: string;
    // Campos legacy de URL (mantener para compatibilidad)
    pdfUrl?: string;
    pdfTitle?: string;
    pdfSize?: string;
    imageUrl?: string;
    imageAlt?: string;
    imageCaption?: string;
    // Nuevos campos para archivos de Cloudinary
    pdfFile?: CloudinaryPDF;
    imageFile?: CloudinaryImage;
    text?: string;
    html?: string;
    description?: string;
    notes?: string;
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
  estadisticas: {
    visualizaciones: number;
    completados: number;
    tiempoPromedioVisualizacion: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AdminLeccionesProps {
  session: any;
}

const AdminLecciones: React.FC<AdminLeccionesProps> = ({ session }) => {
  const [lecciones, setLecciones] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    tipo: 'all',
    modulo: 'all',
    dificultad: 'all',
    activa: 'all'
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    modulo: 1,
    numeroLeccion: 1,
    duracionEstimada: 0,
    contenido: [] as LessonContent[],
    objetivos: [''],
    recursos: [] as {
      titulo: string;
      url: string;
      tipo: 'enlace' | 'descarga' | 'referencia';
    }[],
    tipoEntrenamiento: 'TradingFundamentals' as 'TradingFundamentals' | 'DowJones',
    dificultad: 'Básico' as 'Básico' | 'Intermedio' | 'Avanzado',
    esGratuita: false,
    requiereSuscripcion: true,
    orden: 1,
    activa: true
  });

  // Cargar lecciones
  const cargarLecciones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filtros.tipo !== 'all' && { tipo: filtros.tipo }),
        ...(filtros.modulo !== 'all' && { modulo: filtros.modulo }),
        ...(filtros.activa !== 'all' && { activa: filtros.activa }),
        ...(searchTerm && { search: searchTerm }),
        limit: '100'
      });

      const response = await fetch(`/api/lessons?${params}`);
      const data = await response.json();

      if (data.success) {
        setLecciones(data.data.lecciones);
      } else {
        toast.error('Error al cargar lecciones');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar lecciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLecciones();
  }, [filtros, searchTerm]);

  // Crear nueva lección
  const crearLeccion = async () => {
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lección creada exitosamente');
        setShowCreateModal(false);
        resetForm();
        cargarLecciones();
      } else {
        toast.error(data.error || 'Error al crear lección');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear lección');
    }
  };

  // Actualizar lección
  const actualizarLeccion = async () => {
    if (!editingLesson) return;

    try {
      const response = await fetch(`/api/lessons/${editingLesson._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lección actualizada exitosamente');
        setEditingLesson(null);
        resetForm();
        cargarLecciones();
      } else {
        toast.error(data.error || 'Error al actualizar lección');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar lección');
    }
  };

  // Eliminar lección
  const eliminarLeccion = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la lección "${titulo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lección eliminada exitosamente');
        cargarLecciones();
      } else {
        toast.error(data.error || 'Error al eliminar lección');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar lección');
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      modulo: 1,
      numeroLeccion: 1,
      duracionEstimada: 0,
      contenido: [],
      objetivos: [''],
      recursos: [] as {
        titulo: string;
        url: string;
        tipo: 'enlace' | 'descarga' | 'referencia';
      }[],
      tipoEntrenamiento: 'TradingFundamentals',
      dificultad: 'Básico',
      esGratuita: false,
      requiereSuscripcion: true,
      orden: 1,
      activa: true
    });
  };

  // Cargar datos para edición
  const cargarParaEdicion = (leccion: Lesson) => {
    setFormData({
      titulo: leccion.titulo,
      descripcion: leccion.descripcion,
      modulo: leccion.modulo,
      numeroLeccion: leccion.numeroLeccion,
      duracionEstimada: leccion.duracionEstimada,
      contenido: leccion.contenido,
      objetivos: leccion.objetivos.length ? leccion.objetivos : [''],
      recursos: leccion.recursos,
      tipoEntrenamiento: leccion.tipoEntrenamiento,
      dificultad: leccion.dificultad,
      esGratuita: leccion.esGratuita,
      requiereSuscripcion: leccion.requiereSuscripcion,
      orden: leccion.orden,
      activa: leccion.activa
    });
    setEditingLesson(leccion);
  };

  // Agregar contenido
  const agregarContenido = (tipo: LessonContent['type']) => {
    const nuevoContenido: LessonContent = {
      id: Date.now().toString(),
      type: tipo,
      orden: 0, // Se calculará en el callback
      title: '',
      content: {}
    };

    setFormData(prevFormData => ({
      ...prevFormData,
      contenido: [...prevFormData.contenido, { ...nuevoContenido, orden: prevFormData.contenido.length + 1 }]
    }));
  };

  // Actualizar contenido
  const actualizarContenido = (id: string, campo: string, valor: any) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      contenido: prevFormData.contenido.map(item =>
        item.id === id
          ? {
              ...item,
              [campo]: campo === 'content' 
                ? { ...item.content, ...valor }
                : valor
            }
          : item
      )
    }));
  };

  // Eliminar contenido
  const eliminarContenido = (id: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      contenido: prevFormData.contenido.filter(item => item.id !== id)
    }));
  };

  // Reordenar contenido
  const reordenarContenido = (fromIndex: number, toIndex: number) => {
    setFormData(prevFormData => {
      const nuevosContenidos = [...prevFormData.contenido];
      const [elementoMovido] = nuevosContenidos.splice(fromIndex, 1);
      nuevosContenidos.splice(toIndex, 0, elementoMovido);
      
      return {
        ...prevFormData,
        contenido: nuevosContenidos.map((item, index) => ({ ...item, orden: index + 1 }))
      };
    });
  };

  // Funciones para manejar uploads de archivos
  const handlePDFUploaded = (contentId: string, pdfData: CloudinaryPDF) => {
    actualizarContenido(contentId, 'content', {
      pdfFile: pdfData,
      pdfUrl: pdfData.secure_url, // Mantener compatibilidad
      pdfTitle: pdfData.public_id.split('/').pop() || 'PDF subido'
    });
    toast.success('PDF subido exitosamente');
  };

  const handleImageUploaded = (contentId: string, imageData: CloudinaryImage) => {
    actualizarContenido(contentId, 'content', {
      imageFile: imageData,
      imageUrl: imageData.secure_url, // Mantener compatibilidad
      imageAlt: 'Imagen subida'
    });
    toast.success('Imagen subida exitosamente');
  };

  const handleUploadError = (error: string) => {
    toast.error(`Error subiendo archivo: ${error}`);
  };

  return (
    <>
      <Head>
        <title>Gestión de Lecciones - Panel Admin</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <BookOpen size={32} />
              Gestión de Lecciones
            </h1>
            <p className={styles.subtitle}>
              Crea y gestiona el contenido de los entrenamientos
            </p>
          </div>

          <div className={styles.headerRight}>
            <button
              onClick={() => setShowCreateModal(true)}
              className={styles.createButton}
            >
              <Plus size={20} />
              Nueva Lección
            </button>
          </div>
        </div>

        {/* Controles y Filtros */}
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar lecciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filters}>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
            >
              <option value="all">Todos los tipos</option>
              <option value="TradingFundamentals">Trading Fundamentals</option>
              <option value="DowJones">Dow Jones</option>
            </select>

            <select
              value={filtros.modulo}
              onChange={(e) => setFiltros({...filtros, modulo: e.target.value})}
            >
              <option value="all">Todos los módulos</option>
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>Módulo {num}</option>
              ))}
            </select>

            <select
              value={filtros.dificultad}
              onChange={(e) => setFiltros({...filtros, dificultad: e.target.value})}
            >
              <option value="all">Todas las dificultades</option>
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>

            <select
              value={filtros.activa}
              onChange={(e) => setFiltros({...filtros, activa: e.target.value})}
            >
              <option value="all">Todos los estados</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </div>
        </div>

        {/* Lista de Lecciones */}
        <div className={styles.leccionesList}>
          {loading ? (
            <div className={styles.loading}>Cargando lecciones...</div>
          ) : lecciones.length === 0 ? (
            <div className={styles.empty}>
              <BookOpen size={48} />
              <h3>No hay lecciones</h3>
              <p>Crea la primera lección para comenzar</p>
            </div>
          ) : (
            lecciones.map((leccion) => (
              <motion.div
                key={leccion._id}
                className={styles.leccionCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <div className={styles.leccionHeader}>
                  <div className={styles.leccionInfo}>
                    <div className={styles.leccionMeta}>
                      <span className={styles.leccionTipo}>
                        {leccion.tipoEntrenamiento === 'TradingFundamentals' ? 'TF' : 'DJ'}
                      </span>
                      <span className={styles.leccionModulo}>
                        Módulo {leccion.modulo}.{leccion.numeroLeccion}
                      </span>
                      <span className={`${styles.leccionDificultad} ${styles[leccion.dificultad.toLowerCase()]}`}>
                        {leccion.dificultad}
                      </span>
                    </div>
                    <h3 className={styles.leccionTitulo}>{leccion.titulo}</h3>
                    <p className={styles.leccionDescripcion}>{leccion.descripcion}</p>
                  </div>

                  <div className={styles.leccionStats}>
                    <div className={styles.stat}>
                      <Eye size={16} />
                      <span>{leccion.estadisticas.visualizaciones}</span>
                    </div>
                    <div className={styles.stat}>
                      <Clock size={16} />
                      <span>{leccion.duracionEstimada}min</span>
                    </div>
                    <div className={styles.stat}>
                      <FileText size={16} />
                      <span>{leccion.contenido.length}</span>
                    </div>
                  </div>

                  <div className={styles.leccionActions}>
                    <button
                      onClick={() => cargarParaEdicion(leccion)}
                      className={styles.editButton}
                      title="Editar lección"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => eliminarLeccion(leccion._id, leccion.titulo)}
                      className={styles.deleteButton}
                      title="Eliminar lección"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.leccionContent}>
                  <div className={styles.leccionObjetivos}>
                    <strong>Objetivos:</strong>
                    <ul>
                      {leccion.objetivos.slice(0, 3).map((objetivo, index) => (
                        <li key={index}>{objetivo}</li>
                      ))}
                      {leccion.objetivos.length > 3 && (
                        <li>... y {leccion.objetivos.length - 3} más</li>
                      )}
                    </ul>
                  </div>

                  {leccion.contenido.length > 0 && (
                    <div className={styles.contentPreview}>
                      <strong>Contenido:</strong>
                      <div className={styles.contentTypes}>
                        {leccion.contenido.map((content, index) => (
                          <span key={index} className={`${styles.contentType} ${styles[content.type]}`}>
                            {content.type === 'youtube' && <Youtube size={14} />}
                            {content.type === 'pdf' && <FileDown size={14} />}
                            {content.type === 'image' && <Image size={14} />}
                            {content.type === 'text' && <FileText size={14} />}
                            {content.type === 'html' && <FileText size={14} />}
                            {content.title || content.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.leccionFooter}>
                  <span className={`${styles.status} ${leccion.activa ? styles.active : styles.inactive}`}>
                    {leccion.activa ? 'Activa' : 'Inactiva'}
                  </span>
                  <span className={styles.fechaActualizacion}>
                    Actualizada: {new Date(leccion.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Modal de Crear/Editar Lección */}
        {(showCreateModal || editingLesson) && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
              <div className={styles.modalHeader}>
                <h2>{editingLesson ? 'Editar Lección' : 'Nueva Lección'}</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingLesson(null);
                    resetForm();
                  }}
                  className={styles.closeButton}
                >
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalContent}>
                {/* Información Básica */}
                <div className={styles.formSection}>
                  <h3>Información Básica</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Título</label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                        placeholder="Título de la lección"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Descripción</label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        placeholder="Descripción de la lección"
                        rows={3}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Tipo de Entrenamiento</label>
                        <select
                          value={formData.tipoEntrenamiento}
                          onChange={(e) => setFormData({...formData, tipoEntrenamiento: e.target.value as any})}
                        >
                          <option value="TradingFundamentals">Trading Fundamentals</option>
                          <option value="DowJones">Dow Jones</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Módulo</label>
                        <select
                          value={formData.modulo}
                          onChange={(e) => setFormData({...formData, modulo: parseInt(e.target.value)})}
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <option key={num} value={num}>Módulo {num}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Número de Lección</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.numeroLeccion}
                          onChange={(e) => setFormData({...formData, numeroLeccion: parseInt(e.target.value)})}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Duración (minutos)</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.duracionEstimada}
                          onChange={(e) => setFormData({...formData, duracionEstimada: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Dificultad</label>
                        <select
                          value={formData.dificultad}
                          onChange={(e) => setFormData({...formData, dificultad: e.target.value as any})}
                        >
                          <option value="Básico">Básico</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Orden</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.orden}
                          onChange={(e) => setFormData({...formData, orden: parseInt(e.target.value)})}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>
                          <input
                            type="checkbox"
                            checked={formData.esGratuita}
                            onChange={(e) => setFormData({...formData, esGratuita: e.target.checked})}
                          />
                          Lección gratuita
                        </label>
                      </div>

                      <div className={styles.formGroup}>
                        <label>
                          <input
                            type="checkbox"
                            checked={formData.activa}
                            onChange={(e) => setFormData({...formData, activa: e.target.checked})}
                          />
                          Lección activa
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objetivos */}
                <div className={styles.formSection}>
                  <h3>Objetivos de Aprendizaje</h3>
                  {formData.objetivos.map((objetivo, index) => (
                    <div key={index} className={styles.objetivoItem}>
                      <input
                        type="text"
                        value={objetivo}
                        onChange={(e) => {
                          const nuevosObjetivos = [...formData.objetivos];
                          nuevosObjetivos[index] = e.target.value;
                          setFormData({...formData, objetivos: nuevosObjetivos});
                        }}
                        placeholder={`Objetivo ${index + 1}`}
                      />
                      {formData.objetivos.length > 1 && (
                        <button
                          onClick={() => {
                            const nuevosObjetivos = formData.objetivos.filter((_, i) => i !== index);
                            setFormData({...formData, objetivos: nuevosObjetivos});
                          }}
                          className={styles.removeButton}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setFormData({...formData, objetivos: [...formData.objetivos, '']})}
                    className={styles.addButton}
                  >
                    <Plus size={16} />
                    Agregar Objetivo
                  </button>
                </div>

                {/* Contenido */}
                <div className={styles.formSection}>
                  <h3>Contenido de la Lección</h3>
                  
                  <div className={styles.contentButtons}>
                    <button
                      onClick={() => agregarContenido('youtube')}
                      className={styles.contentButton}
                    >
                      <Youtube size={16} />
                      Video YouTube
                    </button>
                    <button
                      onClick={() => agregarContenido('text')}
                      className={styles.contentButton}
                    >
                      <FileText size={16} />
                      Texto
                    </button>
                    <button
                      onClick={() => agregarContenido('pdf')}
                      className={styles.contentButton}
                    >
                      <FileDown size={16} />
                      PDF
                    </button>
                    <button
                      onClick={() => agregarContenido('image')}
                      className={styles.contentButton}
                    >
                      <Image size={16} />
                      Imagen
                    </button>
                  </div>

                  <div className={styles.contentList}>
                    {formData.contenido.map((item, index) => (
                      <div key={item.id} className={styles.contentItem}>
                        <div className={styles.contentItemHeader}>
                          <div className={styles.contentItemInfo}>
                            <GripVertical size={16} className={styles.dragHandle} />
                            <span className={`${styles.contentType} ${styles[item.type]}`}>
                              {item.type === 'youtube' && <Youtube size={16} />}
                              {item.type === 'pdf' && <FileDown size={16} />}
                              {item.type === 'image' && <Image size={16} />}
                              {item.type === 'text' && <FileText size={16} />}
                              {item.type}
                            </span>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => actualizarContenido(item.id, 'title', e.target.value)}
                              placeholder="Título del contenido"
                              className={styles.contentTitle}
                            />
                          </div>
                          <button
                            onClick={() => eliminarContenido(item.id)}
                            className={styles.removeContentButton}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className={styles.contentItemBody}>
                          {/* YouTube */}
                          {item.type === 'youtube' && (
                            <div className={styles.youtubeContent}>
                              <input
                                type="text"
                                value={item.content.youtubeId || ''}
                                onChange={(e) => actualizarContenido(item.id, 'content', { youtubeId: e.target.value })}
                                placeholder="ID del video de YouTube"
                              />
                              <input
                                type="text"
                                value={item.content.youtubeTitle || ''}
                                onChange={(e) => actualizarContenido(item.id, 'content', { youtubeTitle: e.target.value })}
                                placeholder="Título del video"
                              />
                              <input
                                type="text"
                                value={item.content.youtubeDuration || ''}
                                onChange={(e) => actualizarContenido(item.id, 'content', { youtubeDuration: e.target.value })}
                                placeholder="Duración (ej: 15:30)"
                              />
                            </div>
                          )}

                          {/* PDF */}
                          {item.type === 'pdf' && (
                            <div className={styles.pdfContent}>
                              {!item.content.pdfFile ? (
                                <div className={styles.uploadSection}>
                                  <PDFUploader
                                    onPDFUploaded={(pdfData) => handlePDFUploaded(item.id, pdfData)}
                                    onUploadStart={() => console.log('Subiendo PDF...')}
                                    onUploadProgress={(progress) => console.log(`Progreso: ${progress}%`)}
                                    onError={handleUploadError}
                                    buttonText="Subir PDF"
                                  />
                                </div>
                              ) : (
                                <div className={styles.uploadedFile}>
                                  <div className={styles.fileInfo}>
                                    <FileDown size={20} />
                                    <div className={styles.fileDetails}>
                                      <p className={styles.fileName}>
                                        {item.content.pdfFile.public_id.split('/').pop()}
                                      </p>
                                      <p className={styles.fileSize}>
                                        {Math.round(item.content.pdfFile.bytes / 1024)} KB
                                        {item.content.pdfFile.pages && ` • ${item.content.pdfFile.pages} páginas`}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      actualizarContenido(item.id, 'content', {
                                        pdfFile: undefined,
                                        pdfUrl: '',
                                        pdfTitle: ''
                                      });
                                    }}
                                    className={styles.removeFileButton}
                                  >
                                    <Trash2 size={16} />
                                    Eliminar
                                  </button>
                                </div>
                              )}
                              <input
                                type="text"
                                value={item.content.pdfTitle || ''}
                                onChange={(e) => actualizarContenido(item.id, 'content', { pdfTitle: e.target.value })}
                                placeholder="Título del PDF"
                                className={styles.titleInput}
                              />
                            </div>
                          )}

                          {/* Imagen */}
                          {item.type === 'image' && (
                            <div className={styles.imageContent}>
                              {!item.content.imageFile ? (
                                <div className={styles.uploadSection}>
                                  <ImageUploader
                                    onImageUploaded={(imageData) => handleImageUploaded(item.id, imageData)}
                                    onUploadStart={() => console.log('Subiendo imagen...')}
                                    onUploadProgress={(progress) => console.log(`Progreso: ${progress}%`)}
                                    onError={handleUploadError}
                                    maxFiles={1}
                                    multiple={false}
                                    buttonText="Subir Imagen"
                                  />
                                </div>
                              ) : (
                                <div className={styles.uploadedFile}>
                                  <div className={styles.imagePreview}>
                                    <img 
                                      src={item.content.imageFile.secure_url} 
                                      alt="Vista previa"
                                      className={styles.previewImage}
                                    />
                                  </div>
                                  <div className={styles.fileInfo}>
                                    <Image size={20} />
                                    <div className={styles.fileDetails}>
                                      <p className={styles.fileName}>
                                        {item.content.imageFile.public_id.split('/').pop()}
                                      </p>
                                      <p className={styles.fileSize}>
                                        {item.content.imageFile.width} × {item.content.imageFile.height} •{' '}
                                        {Math.round(item.content.imageFile.bytes / 1024)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      actualizarContenido(item.id, 'content', {
                                        imageFile: undefined,
                                        imageUrl: '',
                                        imageAlt: '',
                                        imageCaption: ''
                                      });
                                    }}
                                    className={styles.removeFileButton}
                                  >
                                    <Trash2 size={16} />
                                    Eliminar
                                  </button>
                                </div>
                              )}
                              <input
                                type="text"
                                value={item.content.imageAlt || ''}
                                onChange={(e) => actualizarContenido(item.id, 'content', { imageAlt: e.target.value })}
                                placeholder="Texto alternativo"
                                className={styles.titleInput}
                              />
                              <input
                                type="text"
                                value={item.content.imageCaption || ''}
                                onChange={(e) => actualizarContenido(item.id, 'content', { imageCaption: e.target.value })}
                                placeholder="Descripción de la imagen"
                                className={styles.titleInput}
                              />
                            </div>
                          )}

                          {/* Texto */}
                          {item.type === 'text' && (
                            <div className={styles.textContent}>
                              <textarea
                                value={item.content.text || ''}
                                onChange={(e) => actualizarContenido(item.id, 'content', { text: e.target.value })}
                                placeholder="Contenido de texto"
                                rows={6}
                              />
                            </div>
                          )}

                          {/* Descripción opcional */}
                          <textarea
                            value={item.content.description || ''}
                            onChange={(e) => actualizarContenido(item.id, 'content', { description: e.target.value })}
                            placeholder="Descripción o notas adicionales (opcional)"
                            className={styles.contentDescription}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingLesson(null);
                      resetForm();
                    }}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingLesson ? actualizarLeccion : crearLeccion}
                    className={styles.saveButton}
                  >
                    <Save size={16} />
                    {editingLesson ? 'Actualizar' : 'Crear'} Lección
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

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

  return {
    props: {
      session: adminCheck.user
    },
  };
};

export default AdminLecciones; 