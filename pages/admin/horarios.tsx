import React, { useState, useEffect } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Save,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/AdminHorarios.module.css';

interface TrainingSchedule {
  _id: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  duration: number;
  type: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewSchedule {
  dayOfWeek: number;
  hour: number;
  minute: number;
  duration: number;
  type: string;
  activo: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  conflicts: any[];
  suggestions: string[];
  graceMinutes: number;
}

const AdminHorariosPage = () => {
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TrainingSchedule | null>(null);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [graceMinutes, setGraceMinutes] = useState(30);
  const [formData, setFormData] = useState<NewSchedule>({
    dayOfWeek: 1,
    hour: 19,
    minute: 0,
    duration: 180,
    type: 'intensivo',
    activo: true
  });

  const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' }
  ];

  const trainingTypes = [
    'intensivo',
    'fundamentals',
    'advanced',
    'workshop',
    'masterclass'
  ];

  useEffect(() => {
    loadSchedules();
  }, []);

  // Validar horario cuando cambien los datos del formulario
  useEffect(() => {
    if (showForm && (formData.dayOfWeek !== undefined && formData.hour !== undefined && formData.minute !== undefined && formData.duration)) {
      validateSchedule();
    }
  }, [formData.dayOfWeek, formData.hour, formData.minute, formData.duration, graceMinutes, showForm]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trainings/schedule');
      const data = await response.json();
      
      if (response.ok) {
        setSchedules(data.schedules || []);
      } else {
        toast.error('Error al cargar horarios');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const validateSchedule = async () => {
    try {
      setValidating(true);
      
      const startTime = `${formData.hour.toString().padStart(2, '0')}:${formData.minute.toString().padStart(2, '0')}`;
      const endHour = Math.floor((formData.hour * 60 + formData.minute + formData.duration) / 60);
      const endMinute = (formData.hour * 60 + formData.minute + formData.duration) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      const response = await fetch('/api/admin/schedules/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dayOfWeek: formData.dayOfWeek,
          startTime,
          endTime,
          type: 'asesoria', // Tipo fijo para asesorías
          title: formData.type,
          graceMinutes,
          excludeId: editingSchedule?._id // Excluir el horario actual al editar
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar validación antes de enviar
    if (validation && !validation.isValid) {
      toast.error('No se puede crear el horario debido a conflictos. Revisa las sugerencias.');
      return;
    }
    
    try {
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

      const data = await response.json();

      if (response.ok) {
        toast.success(editingSchedule ? 'Horario actualizado' : 'Horario creado');
        await loadSchedules();
        resetForm();
      } else {
        toast.error(data.error || 'Error al guardar horario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar horario');
    }
  };

  const handleEdit = (schedule: TrainingSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      dayOfWeek: schedule.dayOfWeek,
      hour: schedule.hour,
      minute: schedule.minute,
      duration: schedule.duration,
      type: schedule.type,
      activo: schedule.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trainings/schedule/${scheduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Horario eliminado');
        await loadSchedules();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Error al eliminar horario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar horario');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setValidation(null);
    setFormData({
      dayOfWeek: 1,
      hour: 19,
      minute: 0,
      duration: 180,
      type: 'intensivo',
      activo: true
    });
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  return (
    <>
      <Head>
        <title>Gestión de Horarios - Panel Admin</title>
        <meta name="description" content="Panel de administración para gestionar horarios de entrenamiento" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.header}
          >
            <h1 className={styles.title}>Gestión de Horarios de Entrenamiento</h1>
            <p className={styles.subtitle}>
              Configura los días y horarios disponibles para entrenamientos
            </p>
            
            <button
              onClick={() => setShowForm(true)}
              className={styles.addButton}
            >
              <Plus size={20} />
              Agregar Horario
            </button>
          </motion.div>

          {/* Formulario */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.formOverlay}
            >
              <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                  <h3>{editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}</h3>
                  <button onClick={resetForm} className={styles.closeButton}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Día de la semana</label>
                      <select
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({...formData, dayOfWeek: parseInt(e.target.value)})}
                        required
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Hora</label>
                      <select
                        value={formData.hour}
                        onChange={(e) => setFormData({...formData, hour: parseInt(e.target.value)})}
                        required
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Minutos</label>
                      <select
                        value={formData.minute}
                        onChange={(e) => setFormData({...formData, minute: parseInt(e.target.value)})}
                        required
                      >
                        <option value={0}>00</option>
                        <option value={30}>30</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Duración (minutos)</label>
                      <input
                        type="number"
                        min="30"
                        max="480"
                        step="30"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tipo de entrenamiento</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        required
                      >
                        {trainingTypes.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
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

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={formData.activo}
                          onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                        />
                        Activo
                      </label>
                    </div>
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
                                onClick={() => {
                                  const [hour, minute] = suggestion.split(':').map(Number);
                                  setFormData({...formData, hour, minute});
                                }}
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
                    <button type="button" onClick={resetForm} className={styles.cancelButton}>
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
                      {editingSchedule ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Lista de horarios */}
          <div className={styles.schedulesContainer}>
            {loading ? (
              <div className={styles.loading}>Cargando horarios...</div>
            ) : schedules.length === 0 ? (
              <div className={styles.empty}>
                <AlertCircle size={48} />
                <h3>No hay horarios configurados</h3>
                <p>Agrega el primer horario de entrenamiento para comenzar</p>
              </div>
            ) : (
              <div className={styles.schedulesGrid}>
                {schedules.map((schedule) => (
                  <motion.div
                    key={schedule._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${styles.scheduleCard} ${!schedule.activo ? styles.inactive : ''}`}
                  >
                    <div className={styles.scheduleHeader}>
                      <div className={styles.scheduleDay}>
                        <Calendar size={20} />
                        {daysOfWeek.find(d => d.value === schedule.dayOfWeek)?.label}
                      </div>
                      <div className={styles.scheduleActions}>
                        <button
                          onClick={() => handleEdit(schedule)}
                          className={styles.editButton}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule._id)}
                          className={styles.deleteButton}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.scheduleInfo}>
                      <div className={styles.scheduleTime}>
                        <Clock size={16} />
                        {formatTime(schedule.hour, schedule.minute)}
                      </div>
                      <div className={styles.scheduleDuration}>
                        Duración: {formatDuration(schedule.duration)}
                      </div>
                      <div className={styles.scheduleType}>
                        Tipo: {schedule.type}
                      </div>
                      <div className={`${styles.scheduleStatus} ${schedule.activo ? styles.active : styles.inactive}`}>
                        {schedule.activo ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const verification = await verifyAdminAccess(context);
  
  if (!verification.isAdmin) {
    return {
      redirect: {
        destination: verification.redirectTo || '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: verification.user,
    },
  };
};

export default AdminHorariosPage; 