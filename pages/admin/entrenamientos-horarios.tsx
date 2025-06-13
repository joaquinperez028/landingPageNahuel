import { GetServerSideProps } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Users,
  BookOpen,
  Settings,
  AlertCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import styles from '@/styles/AdminHorarios.module.css';
import { toast } from 'react-hot-toast';

interface TrainingSchedule {
  _id: string;
  title: string;
  description: string;
  type: 'trading' | 'advanced';
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  startTime: string;
  endTime: string;
  maxParticipants: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleFormData {
  title: string;
  description: string;
  type: 'trading' | 'advanced';
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  isActive: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  conflicts: any[];
  suggestions: string[];
  graceMinutes: number;
}

const DAYS_OF_WEEK = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

const TRAINING_TYPES = [
  { value: 'trading', label: 'Trading Básico', color: 'from-blue-500 to-cyan-500' },
  { value: 'advanced', label: 'Trading Avanzado', color: 'from-purple-500 to-pink-500' }
];

export default function EntrenamientosHorariosPage() {
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TrainingSchedule | null>(null);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [graceMinutes, setGraceMinutes] = useState(30);
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    description: '',
    type: 'trading',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    maxParticipants: 20,
    isActive: true
  });

  // Cargar horarios de entrenamientos
  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📅 Cargando horarios de entrenamientos...');
      
      const response = await fetch('/api/trainings/schedule');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Horarios cargados:', data);
        setSchedules(data.schedules || []);
      } else {
        console.error('❌ Error al cargar horarios:', response.status);
      }
    } catch (error) {
      console.error('💥 Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar horario cuando cambien los datos del formulario
  useEffect(() => {
    if (showForm && formData.startTime && formData.endTime && formData.dayOfWeek !== undefined) {
      validateSchedule();
    }
  }, [formData.dayOfWeek, formData.startTime, formData.endTime, graceMinutes, showForm]);

  const validateSchedule = async () => {
    try {
      setValidating(true);

      const response = await fetch('/api/admin/schedules/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          type: 'entrenamiento',
          title: formData.title || formData.type,
          graceMinutes,
          excludeId: editingSchedule?._id
        })
      });

      const data = await response.json();
      
      if (response.ok && data.validation) {
        setValidation(data.validation);
      } else {
        console.warn('Error en validación:', data);
        setValidation(null);
      }
    } catch (error) {
      console.error('Error al validar horario:', error);
      setValidation(null);
    } finally {
      setValidating(false);
    }
  };

  // Crear o actualizar horario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar validación antes de enviar
    if (validation && !validation.isValid) {
      toast.error('No se puede crear el horario debido a conflictos. Revisa las sugerencias.');
      return;
    }
    
    try {
      console.log('💾 Guardando horario...', formData);
      
      const url = editingSchedule 
        ? `/api/trainings/schedule/${editingSchedule._id}`
        : '/api/trainings/schedule';
      
      const method = editingSchedule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Horario guardado:', data);
        
        // Recargar horarios
        fetchSchedules();
        
        // Resetear formulario
        setShowForm(false);
        setEditingSchedule(null);
        setFormData({
          title: '',
          description: '',
          type: 'trading',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '10:00',
          maxParticipants: 20,
          isActive: true
        });
        
        toast.success('✅ Horario guardado exitosamente');
      } else {
        const errorData = await response.json();
        console.error('❌ Error al guardar:', errorData);
        toast.error(`❌ Error: ${errorData.message || 'No se pudo guardar el horario'}`);
      }
    } catch (error) {
      console.error('💥 Error al guardar horario:', error);
      toast.error('💥 Error al guardar el horario');
    }
  };

  // Eliminar horario
  const handleDelete = async (scheduleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando horario:', scheduleId);
      
      const response = await fetch(`/api/trainings/schedule/${scheduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('✅ Horario eliminado');
        fetchSchedules();
        toast.success('✅ Horario eliminado exitosamente');
      } else {
        console.error('❌ Error al eliminar horario');
        toast.error('❌ Error al eliminar el horario');
      }
    } catch (error) {
      console.error('💥 Error al eliminar horario:', error);
      toast.error('💥 Error al eliminar el horario');
    }
  };

  // Editar horario
  const handleEdit = (schedule: TrainingSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description,
      type: schedule.type,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxParticipants: schedule.maxParticipants,
      isActive: schedule.isActive
    });
    setShowForm(true);
  };

  // Cancelar edición
  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setFormData({
      title: '',
      description: '',
      type: 'trading',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      maxParticipants: 20,
      isActive: true
    });
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const applySuggestion = (suggestion: string) => {
    // Calcular duración actual
    const currentStart = formData.startTime.split(':').map(Number);
    const currentEnd = formData.endTime.split(':').map(Number);
    const currentDuration = (currentEnd[0] * 60 + currentEnd[1]) - (currentStart[0] * 60 + currentStart[1]);
    
    // Aplicar nueva hora de inicio
    const [newHour, newMinute] = suggestion.split(':').map(Number);
    const newEndMinutes = newHour * 60 + newMinute + currentDuration;
    const newEndHour = Math.floor(newEndMinutes / 60);
    const newEndMin = newEndMinutes % 60;
    
    setFormData({
      ...formData,
      startTime: suggestion,
      endTime: `${newEndHour.toString().padStart(2, '0')}:${newEndMin.toString().padStart(2, '0')}`
    });
  };

  return (
    <>
      <Head>
        <title>Horarios de Entrenamientos - Admin</title>
        <meta name="description" content="Gestión de horarios para entrenamientos de trading" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <h1 className={styles.title}>Horarios de Entrenamientos</h1>
              <p className={styles.subtitle}>
                Gestiona los horarios para entrenamientos de trading básico y avanzado
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                <Link href="/admin/dashboard" style={{ color: '#b0b0b0', textDecoration: 'none' }}>
                  ← Volver al Dashboard
                </Link>
                <button
                  onClick={() => setShowForm(true)}
                  className={styles.addButton}
                >
                  <Plus size={20} />
                  Nuevo Horario
                </button>
              </div>
            </div>

            {/* Formulario */}
            {showForm && (
              <div className={styles.formOverlay}>
                <motion.div
                  className={styles.formContainer}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.formHeader}>
                    <h3>{editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}</h3>
                    <button onClick={handleCancel} className={styles.closeButton}>
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Título</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ej: Trading Básico - Mañana"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Tipo de Entrenamiento</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'trading' | 'advanced' })}
                          required
                        >
                          {TRAINING_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Día de la Semana</label>
                        <select
                          value={formData.dayOfWeek}
                          onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                          required
                        >
                          {DAYS_OF_WEEK.map((day, index) => (
                            <option key={index} value={index}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Hora de Inicio</label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Hora de Fin</label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Máximo Participantes</label>
                        <input
                          type="number"
                          value={formData.maxParticipants}
                          onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                          min="1"
                          max="100"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Período de gracia (minutos)</label>
                        <select
                          value={graceMinutes}
                          onChange={(e) => setGraceMinutes(parseInt(e.target.value))}
                        >
                          <option value={15}>15 minutos</option>
                          <option value={30}>30 minutos</option>
                          <option value={60}>1 hora</option>
                          <option value={120}>2 horas</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        Horario activo
                      </label>
                    </div>

                    {/* Validación de conflictos */}
                    {validating && (
                      <div style={{ 
                        padding: '1rem', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderRadius: '0.5rem', 
                        marginBottom: '1rem',
                        color: '#3b82f6'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} />
                          Validando horario...
                        </div>
                      </div>
                    )}

                    {validation && (
                      <div style={{ 
                        padding: '1rem', 
                        background: validation.isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        borderRadius: '0.5rem', 
                        marginBottom: '1rem',
                        color: validation.isValid ? '#22c55e' : '#ef4444'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          {validation.isValid ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                          <strong>{validation.isValid ? 'Horario disponible' : 'Conflicto detectado'}</strong>
                        </div>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{validation.message}</p>
                        
                        {validation.suggestions.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: '500' }}>
                              Horarios sugeridos:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {validation.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => applySuggestion(suggestion)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '0.25rem',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={styles.formActions}>
                      <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className={styles.saveButton}
                        disabled={validation ? !validation.isValid : false}
                        style={{
                          opacity: validation && !validation.isValid ? 0.5 : 1,
                          cursor: validation && !validation.isValid ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Save size={16} />
                        {editingSchedule ? 'Actualizar' : 'Crear'} Horario
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Lista de Horarios */}
            <div className={styles.schedulesContainer}>
              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <p>Cargando horarios...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className={styles.empty}>
                  <Calendar size={48} />
                  <h3>No hay horarios configurados</h3>
                  <p>Crea el primer horario para entrenamientos</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className={styles.addButton}
                  >
                    <Plus size={20} />
                    Crear Primer Horario
                  </button>
                </div>
              ) : (
                <div className={styles.schedulesGrid}>
                  {schedules.map((schedule, index) => (
                    <motion.div
                      key={schedule._id}
                      className={`${styles.scheduleCard} ${!schedule.isActive ? styles.inactive : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={styles.scheduleHeader}>
                        <div className={styles.scheduleDay}>
                          <h3>{schedule.title}</h3>
                          <span>{TRAINING_TYPES.find(t => t.value === schedule.type)?.label}</span>
                        </div>
                        <div className={styles.scheduleActions}>
                          <button
                            onClick={() => handleEdit(schedule)}
                            className={styles.editButton}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className={styles.deleteButton}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.scheduleInfo}>
                        <div className={styles.scheduleTime}>
                          <Clock size={16} />
                          <span>
                            {DAYS_OF_WEEK[schedule.dayOfWeek]} - {schedule.startTime} a {schedule.endTime}
                          </span>
                        </div>
                        <div className={styles.scheduleDuration}>
                          <Users size={16} />
                          <span>Máximo {schedule.maxParticipants} participantes</span>
                        </div>
                      </div>

                      {schedule.description && (
                        <p className={styles.scheduleDescription}>{schedule.description}</p>
                      )}

                      <div className={`${styles.scheduleStatus} ${schedule.isActive ? styles.active : styles.inactive}`}>
                        {schedule.isActive ? 'Activo' : 'Inactivo'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log('🔍 [ENTRENAMIENTOS-HORARIOS] Verificando acceso de admin...');
  
  try {
    const verification = await verifyAdminAccess(context);
    
    if (!verification.isAdmin) {
      console.log('❌ [ENTRENAMIENTOS-HORARIOS] Acceso denegado');
      return {
        redirect: {
          destination: verification.redirectTo || '/',
          permanent: false,
        },
      };
    }

    console.log('✅ [ENTRENAMIENTOS-HORARIOS] Acceso confirmado');
    
    return {
      props: {
        user: verification.user,
      },
    };

  } catch (error) {
    console.error('💥 [ENTRENAMIENTOS-HORARIOS] Error:', error);
    
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
}; 