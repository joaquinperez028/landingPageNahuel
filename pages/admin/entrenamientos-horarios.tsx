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
  Settings
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import styles from '@/styles/AdminHorarios.module.css';

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

  // Crear o actualizar horario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        
        alert('✅ Horario guardado exitosamente');
      } else {
        const errorData = await response.json();
        console.error('❌ Error al guardar:', errorData);
        alert(`❌ Error: ${errorData.message || 'No se pudo guardar el horario'}`);
      }
    } catch (error) {
      console.error('💥 Error al guardar horario:', error);
      alert('💥 Error al guardar el horario');
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
        alert('✅ Horario eliminado exitosamente');
      } else {
        console.error('❌ Error al eliminar horario');
        alert('❌ Error al eliminar el horario');
      }
    } catch (error) {
      console.error('💥 Error al eliminar horario:', error);
      alert('💥 Error al eliminar el horario');
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

                    <div className={styles.formActions}>
                      <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                        Cancelar
                      </button>
                      <button type="submit" className={styles.saveButton}>
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