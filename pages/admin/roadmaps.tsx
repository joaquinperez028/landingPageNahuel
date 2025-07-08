import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import {
  Map,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  BookOpen,
  Clock,
  Target,
  AlertCircle,
  RefreshCw,
  Loader
} from 'lucide-react';
import { GetServerSideProps } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import styles from '../../styles/AdminRoadmaps.module.css';

interface RoadmapTopic {
  titulo: string;
  descripcion?: string;
}

interface RoadmapModule {
  id: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  lecciones: number;
  temas: RoadmapTopic[];
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
  prerequisito?: number;
  orden: number;
  activo: boolean;
}

interface Roadmap {
  _id: string;
  nombre: string;
  descripcion: string;
  tipoEntrenamiento: 'TradingFundamentals' | 'DowJones' | 'General';
  modulos: RoadmapModule[];
  activo: boolean;
  orden: number;
  metadatos: {
    totalLecciones: number;
    totalHoras: number;
    autor: string;
    version: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AdminRoadmapsProps {
  session: any;
}

const AdminRoadmaps: React.FC<AdminRoadmapsProps> = ({ session }) => {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  
  // Estados para manejo de errores
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipoEntrenamiento: 'TradingFundamentals' as 'TradingFundamentals' | 'DowJones' | 'General',
    modulos: [] as RoadmapModule[],
    activo: true,
    orden: 1
  });

  // Cargar roadmaps
  useEffect(() => {
    fetchRoadmaps();
  }, [selectedType, searchTerm]);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.set('tipo', selectedType);
      if (searchTerm) params.set('search', searchTerm);

      const response = await fetch(`/api/roadmaps?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRoadmaps(data.data.roadmaps || []);
      } else {
        toast.error('Error al cargar roadmaps');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (formData.orden < 1) {
      errors.orden = 'El orden debe ser mayor a 0';
    }

    // Validar módulos
    formData.modulos.forEach((modulo, index) => {
      if (!modulo.titulo.trim()) {
        errors[`modulo_${index}_titulo`] = 'El título del módulo es obligatorio';
      }
      if (!modulo.descripcion.trim()) {
        errors[`modulo_${index}_descripcion`] = 'La descripción del módulo es obligatoria';
      }
      if (!modulo.duracion.trim()) {
        errors[`modulo_${index}_duracion`] = 'La duración es obligatoria';
      }
      if (modulo.lecciones < 1) {
        errors[`modulo_${index}_lecciones`] = 'Debe tener al menos 1 lección';
      }
      if (modulo.temas.length === 0) {
        errors[`modulo_${index}_temas`] = 'El módulo debe tener al menos 1 tema';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Crear roadmap
  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Roadmap creado exitosamente');
        setShowCreateModal(false);
        resetForm();
        fetchRoadmaps();
      } else {
        setSubmitError(data.error || 'Error al crear roadmap');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editar roadmap
  const handleEdit = async () => {
    if (!editingRoadmap || !validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`/api/roadmaps/${editingRoadmap._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Roadmap actualizado exitosamente');
        setEditingRoadmap(null);
        resetForm();
        fetchRoadmaps();
      } else {
        setSubmitError(data.error || 'Error al actualizar roadmap');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar roadmap
  const handleDelete = async (roadmapId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este roadmap?')) return;

    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Roadmap eliminado exitosamente');
        fetchRoadmaps();
      } else {
        toast.error(data.error || 'Error al eliminar roadmap');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  // Abrir modal de edición
  const openEditModal = (roadmap: Roadmap) => {
    setEditingRoadmap(roadmap);
    setFormData({
      nombre: roadmap.nombre,
      descripcion: roadmap.descripcion,
      tipoEntrenamiento: roadmap.tipoEntrenamiento,
      modulos: roadmap.modulos,
      activo: roadmap.activo,
      orden: roadmap.orden
    });
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipoEntrenamiento: 'TradingFundamentals',
      modulos: [],
      activo: true,
      orden: 1
    });
    setFormErrors({});
    setSubmitError('');
  };

  // Cerrar modales
  const closeModals = () => {
    setShowCreateModal(false);
    setEditingRoadmap(null);
    resetForm();
  };

  // Agregar módulo
  const addModule = () => {
    const newModule: RoadmapModule = {
      id: formData.modulos.length + 1,
      titulo: '',
      descripcion: '',
      duracion: '',
      lecciones: 1,
      temas: [{ titulo: '' }],
      dificultad: 'Básico',
      orden: formData.modulos.length + 1,
      activo: true
    };
    setFormData(prev => ({
      ...prev,
      modulos: [...prev.modulos, newModule]
    }));
  };

  // Remover módulo
  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.filter((_, i) => i !== index)
    }));
  };

  // Actualizar módulo
  const updateModule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.map((modulo, i) => 
        i === index ? { ...modulo, [field]: value } : modulo
      )
    }));
  };

  // Agregar tema a módulo
  const addTopicToModule = (moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.map((modulo, i) => 
        i === moduleIndex 
          ? { ...modulo, temas: [...modulo.temas, { titulo: '' }] }
          : modulo
      )
    }));
  };

  // Remover tema de módulo
  const removeTopicFromModule = (moduleIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.map((modulo, i) => 
        i === moduleIndex 
          ? { ...modulo, temas: modulo.temas.filter((_, j) => j !== topicIndex) }
          : modulo
      )
    }));
  };

  // Actualizar tema de módulo
  const updateTopicInModule = (moduleIndex: number, topicIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.map((modulo, i) => 
        i === moduleIndex 
          ? {
              ...modulo,
              temas: modulo.temas.map((tema, j) => 
                j === topicIndex ? { ...tema, [field]: value } : tema
              )
            }
          : modulo
      )
    }));
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtener color del tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TradingFundamentals':
        return 'tradingfundamentals';
      case 'DowJones':
        return 'dowjones';
      case 'General':
        return 'general';
      default:
        return 'general';
    }
  };

  // Filtrar roadmaps
  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const matchesSearch = roadmap.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         roadmap.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || roadmap.tipoEntrenamiento === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <Head>
        <title>Gestión de Roadmaps - Admin</title>
        <meta name="description" content="Panel de administración para gestionar roadmaps de aprendizaje" />
      </Head>

      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <Map size={32} />
              Gestión de Roadmaps
            </h1>
            <p className={styles.subtitle}>
              Crea y gestiona los roadmaps de aprendizaje para cada entrenamiento
            </p>
          </div>

          <div className={styles.headerRight}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={styles.select}
            >
              <option value="all">Todos los tipos</option>
              <option value="TradingFundamentals">Trading Fundamentals</option>
              <option value="DowJones">Dow Jones</option>
              <option value="General">General</option>
            </select>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              <Plus size={16} />
              Nuevo Roadmap
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar roadmaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de roadmaps */}
        <div className={styles.roadmapsList}>
          {loading ? (
            <div className={styles.loading}>
              <Loader className={styles.spinning} size={32} />
              Cargando roadmaps...
            </div>
          ) : filteredRoadmaps.length === 0 ? (
            <div className={styles.empty}>
              <Map size={64} />
              <h3>No hay roadmaps</h3>
              <p>Crea tu primer roadmap para comenzar</p>
            </div>
          ) : (
            filteredRoadmaps.map((roadmap) => (
              <div key={roadmap._id} className={styles.roadmapCard}>
                <div className={styles.roadmapHeader}>
                  <div className={styles.roadmapInfo}>
                    <div className={styles.roadmapMeta}>
                      <span className={`${styles.typeTag} ${styles[getTypeColor(roadmap.tipoEntrenamiento)]}`}>
                        {roadmap.tipoEntrenamiento}
                      </span>
                      <span className={styles.orderTag}>
                        Orden: {roadmap.orden}
                      </span>
                    </div>
                    <h3 className={styles.roadmapTitle}>{roadmap.nombre}</h3>
                    <p className={styles.roadmapDescription}>{roadmap.descripcion}</p>
                    <div className={styles.roadmapStats}>
                      <div className={styles.stat}>
                        <BookOpen size={16} />
                        {roadmap.modulos.length} módulos
                      </div>
                      <div className={styles.stat}>
                        <Target size={16} />
                        {roadmap.metadatos.totalLecciones} lecciones
                      </div>
                      <div className={styles.stat}>
                        <Clock size={16} />
                        {roadmap.metadatos.totalHoras} horas
                      </div>
                    </div>
                  </div>
                  <div className={styles.roadmapActions}>
                    <button
                      onClick={() => openEditModal(roadmap)}
                      className={styles.editButton}
                      title="Editar roadmap"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(roadmap._id)}
                      className={styles.deleteButton}
                      title="Eliminar roadmap"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.roadmapFooter}>
                  <span className={`${styles.status} ${roadmap.activo ? styles.active : styles.inactive}`}>
                    {roadmap.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className={styles.lastUpdate}>
                    Actualizado: {formatDate(roadmap.updatedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de crear/editar */}
        {(showCreateModal || editingRoadmap) && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
              <div className={styles.modalHeader}>
                <h2>{editingRoadmap ? 'Editar Roadmap' : 'Crear Nuevo Roadmap'}</h2>
                <button onClick={closeModals} className={styles.closeButton}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalContent}>
                {/* Error global */}
                {submitError && (
                  <div className={styles.errorBanner}>
                    <AlertCircle size={20} />
                    <span>{submitError}</span>
                    <button 
                      onClick={() => setSubmitError('')}
                      className={styles.closeErrorButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Información básica */}
                <div className={styles.formSection}>
                  <h3>Información Básica</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Nombre del Roadmap</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className={formErrors.nombre ? styles.fieldError : ''}
                        placeholder="Ej: Trading Fundamentals Master"
                      />
                      {formErrors.nombre && (
                        <div className={styles.errorMessage}>{formErrors.nombre}</div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tipo de Entrenamiento</label>
                      <select
                        value={formData.tipoEntrenamiento}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          tipoEntrenamiento: e.target.value as any 
                        }))}
                        className={formErrors.tipoEntrenamiento ? styles.fieldError : ''}
                      >
                        <option value="TradingFundamentals">Trading Fundamentals</option>
                        <option value="DowJones">Dow Jones</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Descripción</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                      className={formErrors.descripcion ? styles.fieldError : ''}
                      placeholder="Describe el objetivo y contenido del roadmap..."
                      rows={3}
                    />
                    {formErrors.descripcion && (
                      <div className={styles.errorMessage}>{formErrors.descripcion}</div>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Orden</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.orden}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          orden: parseInt(e.target.value) || 1 
                        }))}
                        className={formErrors.orden ? styles.fieldError : ''}
                      />
                      {formErrors.orden && (
                        <div className={styles.errorMessage}>{formErrors.orden}</div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Estado</label>
                      <select
                        value={formData.activo ? 'true' : 'false'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          activo: e.target.value === 'true' 
                        }))}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Módulos */}
                <div className={styles.formSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Módulos ({formData.modulos.length})</h3>
                    <button
                      type="button"
                      onClick={addModule}
                      className={styles.addButton}
                    >
                      <Plus size={16} />
                      Agregar Módulo
                    </button>
                  </div>

                  <div className={styles.modulesList}>
                    {formData.modulos.map((modulo, moduleIndex) => (
                      <div key={moduleIndex} className={styles.moduleCard}>
                        <div className={styles.moduleHeader}>
                          <h4>Módulo {modulo.id}</h4>
                          <button
                            type="button"
                            onClick={() => removeModule(moduleIndex)}
                            className={styles.removeButton}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className={styles.moduleContent}>
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label>Título del Módulo</label>
                              <input
                                type="text"
                                value={modulo.titulo}
                                onChange={(e) => updateModule(moduleIndex, 'titulo', e.target.value)}
                                className={formErrors[`modulo_${moduleIndex}_titulo`] ? styles.fieldError : ''}
                                placeholder="Ej: Introducción al Trading"
                              />
                              {formErrors[`modulo_${moduleIndex}_titulo`] && (
                                <div className={styles.errorMessage}>
                                  {formErrors[`modulo_${moduleIndex}_titulo`]}
                                </div>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Dificultad</label>
                              <select
                                value={modulo.dificultad}
                                onChange={(e) => updateModule(moduleIndex, 'dificultad', e.target.value)}
                              >
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                              </select>
                            </div>
                          </div>

                          <div className={styles.formGroup}>
                            <label>Descripción del Módulo</label>
                            <textarea
                              value={modulo.descripcion}
                              onChange={(e) => updateModule(moduleIndex, 'descripcion', e.target.value)}
                              className={formErrors[`modulo_${moduleIndex}_descripcion`] ? styles.fieldError : ''}
                              placeholder="Describe lo que se aprenderá en este módulo..."
                              rows={2}
                            />
                            {formErrors[`modulo_${moduleIndex}_descripcion`] && (
                              <div className={styles.errorMessage}>
                                {formErrors[`modulo_${moduleIndex}_descripcion`]}
                              </div>
                            )}
                          </div>

                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label>Duración</label>
                              <input
                                type="text"
                                value={modulo.duracion}
                                onChange={(e) => updateModule(moduleIndex, 'duracion', e.target.value)}
                                className={formErrors[`modulo_${moduleIndex}_duracion`] ? styles.fieldError : ''}
                                placeholder="Ej: 3 horas"
                              />
                              {formErrors[`modulo_${moduleIndex}_duracion`] && (
                                <div className={styles.errorMessage}>
                                  {formErrors[`modulo_${moduleIndex}_duracion`]}
                                </div>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Número de Lecciones</label>
                              <input
                                type="number"
                                min="1"
                                value={modulo.lecciones}
                                onChange={(e) => updateModule(moduleIndex, 'lecciones', parseInt(e.target.value) || 1)}
                                className={formErrors[`modulo_${moduleIndex}_lecciones`] ? styles.fieldError : ''}
                              />
                              {formErrors[`modulo_${moduleIndex}_lecciones`] && (
                                <div className={styles.errorMessage}>
                                  {formErrors[`modulo_${moduleIndex}_lecciones`]}
                                </div>
                              )}
                            </div>

                            <div className={styles.formGroup}>
                              <label>Prerequisito (ID Módulo)</label>
                              <input
                                type="number"
                                min="0"
                                value={modulo.prerequisito || ''}
                                onChange={(e) => updateModule(moduleIndex, 'prerequisito', 
                                  e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Opcional"
                              />
                            </div>
                          </div>

                          {/* Temas del módulo */}
                          <div className={styles.temasSection}>
                            <div className={styles.temasHeader}>
                              <label>Temas ({modulo.temas.length})</label>
                              <button
                                type="button"
                                onClick={() => addTopicToModule(moduleIndex)}
                                className={styles.addTopicButton}
                              >
                                <Plus size={12} />
                                Agregar Tema
                              </button>
                            </div>

                            <div className={styles.temasList}>
                              {modulo.temas.map((tema, topicIndex) => (
                                <div key={topicIndex} className={styles.temaItem}>
                                  <input
                                    type="text"
                                    value={tema.titulo}
                                    onChange={(e) => updateTopicInModule(moduleIndex, topicIndex, 'titulo', e.target.value)}
                                    placeholder="Título del tema"
                                  />
                                  <input
                                    type="text"
                                    value={tema.descripcion || ''}
                                    onChange={(e) => updateTopicInModule(moduleIndex, topicIndex, 'descripcion', e.target.value)}
                                    placeholder="Descripción (opcional)"
                                    className={styles.descriptionInput}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeTopicFromModule(moduleIndex, topicIndex)}
                                    className={styles.removeTopicButton}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {formErrors[`modulo_${moduleIndex}_temas`] && (
                              <div className={styles.errorMessage}>
                                {formErrors[`modulo_${moduleIndex}_temas`]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeModals}
                  className={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={editingRoadmap ? handleEdit : handleCreate}
                  className={styles.saveButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className={styles.spinning} />
                      {editingRoadmap ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingRoadmap ? 'Actualizar' : 'Crear'}
                    </>
                  )}
                </button>
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
      session: adminCheck.session
    },
  };
};

export default AdminRoadmaps; 