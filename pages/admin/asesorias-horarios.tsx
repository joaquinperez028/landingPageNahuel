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
  DollarSign,
  Users
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/AdminHorarios.module.css';

interface AdvisorySchedule {
  _id: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  duration: number;
  type: 'ConsultorioFinanciero' | 'CuentaAsesorada';
  price: number;
  maxBookingsPerDay: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewAdvisorySchedule {
  dayOfWeek: number;
  hour: number;
  minute: number;
  duration: number;
  type: 'ConsultorioFinanciero' | 'CuentaAsesorada';
  price: number;
  maxBookingsPerDay: number;
  activo: boolean;
}

const AdminAsesoriasHorariosPage = () => {
  const [schedules, setSchedules] = useState<AdvisorySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AdvisorySchedule | null>(null);
  const [formData, setFormData] = useState<NewAdvisorySchedule>({
    dayOfWeek: 1,
    hour: 14,
    minute: 0,
    duration: 60,
    type: 'ConsultorioFinanciero',
    price: 199,
    maxBookingsPerDay: 3,
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

  const advisoryTypes = [
    { value: 'ConsultorioFinanciero', label: 'Consultorio Financiero', defaultPrice: 199 },
    { value: 'CuentaAsesorada', label: 'Cuenta Asesorada', defaultPrice: 999 }
  ];

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/asesorias/schedule');
      const data = await response.json();
      
      if (response.ok) {
        setSchedules(data.schedules || []);
      } else {
        toast.error('Error al cargar horarios de asesorías');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar horarios de asesorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSchedule 
        ? `/api/asesorias/schedule/${editingSchedule._id}`
        : '/api/asesorias/schedule';
      
      const method = editingSchedule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      toast.error('Error al guardar horario.');
    }
  };

  const handleEdit = (schedule: AdvisorySchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      dayOfWeek: schedule.dayOfWeek,
      hour: schedule.hour,
      minute: schedule.minute,
      duration: schedule.duration,
      type: schedule.type,
      price: schedule.price,
      maxBookingsPerDay: schedule.maxBookingsPerDay,
      activo: schedule.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/asesorias/schedule/${id}`, {
        method: 'DELETE',
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
    setFormData({
      dayOfWeek: 1,
      hour: 14,
      minute: 0,
      duration: 60,
      type: 'ConsultorioFinanciero',
      price: 199,
      maxBookingsPerDay: 3,
      activo: true
    });
  };

  const handleTypeChange = (type: 'ConsultorioFinanciero' | 'CuentaAsesorada') => {
    const selectedType = advisoryTypes.find(t => t.value === type);
    setFormData({
      ...formData,
      type,
      price: selectedType?.defaultPrice || 199
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
        <title>Gestión de Horarios de Asesorías - Panel Admin</title>
        <meta name="description" content="Panel de administración para gestionar horarios de asesorías" />
      </Head>

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.header}
          >
            <div className={styles.headerContent}>
              <h1 className={styles.title}>
                <Calendar size={32} />
                Gestión de Horarios de Asesorías
              </h1>
              <p className={styles.subtitle}>
                Configura los horarios disponibles para asesorías financieras
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className={styles.addButton}
            >
              <Plus size={20} />
              Nuevo Horario
            </button>
          </motion.div>

          {/* Formulario */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={styles.formContainer}
            >
              <div className={styles.formHeader}>
                <h3>{editingSchedule ? 'Editar Horario' : 'Nuevo Horario'}</h3>
                <button onClick={resetForm} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Tipo de Asesoría</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value as 'ConsultorioFinanciero' | 'CuentaAsesorada')}
                      required
                    >
                      {advisoryTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

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
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      required
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1.5 horas</option>
                      <option value={120}>2 horas</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Precio (ARS)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Máximo por día</label>
                    <select
                      value={formData.maxBookingsPerDay}
                      onChange={(e) => setFormData({...formData, maxBookingsPerDay: parseInt(e.target.value)})}
                      required
                    >
                      {Array.from({length: 10}, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} asesoría{i > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                      />
                      Horario activo
                    </label>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" onClick={resetForm} className={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    <Save size={16} />
                    {editingSchedule ? 'Actualizar' : 'Crear'} Horario
                  </button>
                </div>
              </form>
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
                <p>Agrega el primer horario de asesoría para comenzar</p>
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
                        {formatTime(schedule.hour, schedule.minute)} ({formatDuration(schedule.duration)})
                      </div>
                      
                      <div className={styles.scheduleType}>
                        <span className={`${styles.typeTag} ${styles[schedule.type]}`}>
                          {advisoryTypes.find(t => t.value === schedule.type)?.label}
                        </span>
                      </div>

                      <div className={styles.schedulePrice}>
                        <DollarSign size={16} />
                        ${schedule.price} ARS
                      </div>

                      <div className={styles.scheduleCapacity}>
                        <Users size={16} />
                        Máx. {schedule.maxBookingsPerDay} por día
                      </div>
                    </div>

                    {!schedule.activo && (
                      <div className={styles.inactiveLabel}>
                        Inactivo
                      </div>
                    )}
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
    props: {},
  };
};

export default AdminAsesoriasHorariosPage; 