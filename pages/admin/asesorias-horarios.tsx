import React, { useState, useEffect } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { verifyAdminAccess } from '@/lib/adminAuth';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Calendar,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DateRangePicker from '@/components/DateRangePicker';
import TimeSlotManager from '@/components/TimeSlotManager';
import styles from '@/styles/AdminHorarios.module.css';

interface AdvisorySchedule {
  _id: string;
  date: string;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlot {
  id: string;
  time: string;
}

const AdminAsesoriasHorariosPage = () => {
  const [schedules, setSchedules] = useState<AdvisorySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Logs para debug
  useEffect(() => {
    console.log('🔄 Estado actualizado:');
    console.log('📅 startDate:', startDate);
    console.log('📅 endDate:', endDate);
    console.log('⏰ timeSlots:', timeSlots);
    console.log('🚫 isCreating:', isCreating);
  }, [startDate, endDate, timeSlots, isCreating]);

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

  const handleCreateSchedules = async () => {
    console.log('🔥 Botón clickeado - handleCreateSchedules');
    console.log('📅 startDate:', startDate);
    console.log('📅 endDate:', endDate);
    console.log('⏰ timeSlots:', timeSlots);
    
    if (!startDate || !endDate || timeSlots.length === 0) {
      console.log('❌ Validación fallida');
      toast.error('Por favor selecciona un rango de fechas y al menos un horario');
      return;
    }

    setIsCreating(true);
    let createdCount = 0;
    let errorCount = 0;

    try {
      // Generar todas las fechas en el rango
      const dates = [];
      const currentDate = new Date(startDate);
      const lastDate = new Date(endDate);

      while (currentDate <= lastDate) {
        // Solo incluir días de lunes a viernes (1-5)
        if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
          dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Crear horarios para cada fecha y cada slot de tiempo
      for (const date of dates) {
        for (const timeSlot of timeSlots) {
          try {
            const scheduleData = {
              date: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
              time: timeSlot.time,
              isAvailable: true,
              isBooked: false
            };

            const response = await fetch('/api/asesorias/schedule', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(scheduleData),
            });

            if (response.ok) {
              createdCount++;
            } else {
              const data = await response.json();
              if (response.status === 409) {
                // Horario ya existe, no es un error
                console.log(`Horario ya existe para ${date.toDateString()} a las ${timeSlot.time}`);
              } else {
                errorCount++;
                console.error('Error al crear horario:', data.error);
              }
            }
          } catch (error) {
            errorCount++;
            console.error('Error al crear horario:', error);
          }
        }
      }

      if (createdCount > 0) {
        toast.success(`Se crearon ${createdCount} horarios exitosamente`);
        if (errorCount > 0) {
          toast.error(`${errorCount} horarios no se pudieron crear`);
        }
        await loadSchedules();
        resetForm();
      } else if (errorCount > 0) {
        toast.error('No se pudo crear ningún horario');
      } else {
        toast.success('Los horarios ya existían para las fechas seleccionadas');
      }

    } catch (error) {
      console.error('Error general:', error);
      toast.error('Error al crear los horarios');
    } finally {
      setIsCreating(false);
    }
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
    setStartDate(null);
    setEndDate(null);
    setTimeSlots([]);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = () => {
    return '1 hora';
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
                Configura horarios disponibles para consultoría financiera
              </p>
            </div>
            <button
              onClick={() => {
                console.log('🔥 Abriendo formulario');
                setShowForm(true);
              }}
              className={styles.addButton}
            >
              <Plus size={20} />
              Crear Horarios
            </button>
          </motion.div>

          {/* Formulario de Creación */}
          {showForm && (
            <div className={styles.formOverlay}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={styles.formContainer}
              >
                <div className={styles.formHeader}>
                  <h3>Crear Horarios de Asesoría</h3>
                  <button onClick={resetForm} className={styles.closeButton}>
                    <X size={20} />
                  </button>
                </div>

                <div className={styles.formContent}>
                  {/* Selección de Rango de Fechas */}
                  <div className={styles.section}>
                    <h4>1. Selecciona el Rango de Fechas</h4>
                    <p className={styles.sectionDescription}>
                      Solo se crearán horarios para días laborables (lunes a viernes)
                    </p>
                    <DateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={setStartDate}
                      onEndDateChange={setEndDate}
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                    />
                  </div>

                  {/* Gestión de Horarios */}
                  <div className={styles.section}>
                    <h4>2. Configura los Horarios</h4>
                    <p className={styles.sectionDescription}>
                      Agrega los horarios específicos que estarán disponibles cada día
                    </p>
                    <TimeSlotManager
                      timeSlots={timeSlots}
                      onTimeSlotsChange={setTimeSlots}
                    />
                  </div>

                  {/* Resumen */}
                  {startDate && endDate && timeSlots.length > 0 && (
                    <div className={styles.summary}>
                      <h4>Resumen de la Configuración</h4>
                      <div className={styles.summaryContent}>
                        <div className={styles.summaryItem}>
                          <span>Rango de fechas:</span>
                          <span>{startDate.toLocaleDateString('es-ES')} - {endDate.toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span>Días laborables:</span>
                          <span>{timeSlots.length * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) / 7 * 5)} horarios</span>
                        </div>
                        <div className={styles.summaryItem}>
                          <span>Horarios por día:</span>
                          <span>{timeSlots.length} slots</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button type="button" onClick={resetForm} className={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔥 Botón clickeado directamente');
                      console.log('📅 startDate:', startDate);
                      console.log('📅 endDate:', endDate);
                      console.log('⏰ timeSlots:', timeSlots);
                      console.log('🚫 isCreating:', isCreating);
                      console.log('🔒 Botón deshabilitado:', !startDate || !endDate || timeSlots.length === 0 || isCreating);
                      handleCreateSchedules();
                    }}
                    disabled={!startDate || !endDate || timeSlots.length === 0 || isCreating}
                    className={styles.saveButton}
                  >
                    <Save size={16} />
                    {isCreating ? 'Creando...' : 'Crear Horarios'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Lista de Horarios Existentes */}
          <div className={styles.schedulesContainer}>
            <div className={styles.schedulesHeader}>
              <h3>Horarios Configurados</h3>
              <p>Horarios existentes en el sistema</p>
            </div>

            {loading ? (
              <div className={styles.loading}>Cargando horarios...</div>
            ) : schedules.length === 0 ? (
              <div className={styles.empty}>
                <AlertCircle size={48} />
                <h3>No hay horarios configurados</h3>
                <p>Usa el botón "Crear Horarios" para agregar el primer conjunto de horarios</p>
              </div>
            ) : (
              <div className={styles.schedulesGrid}>
                {schedules.map((schedule) => (
                  <motion.div
                    key={schedule._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${styles.scheduleCard} ${!schedule.isAvailable ? styles.unavailable : ''} ${schedule.isBooked ? styles.booked : ''}`}
                  >
                    <div className={styles.scheduleHeader}>
                      <div className={styles.scheduleDate}>
                        <Calendar size={20} />
                        {formatDate(schedule.date)}
                      </div>
                      <div className={styles.scheduleStatus}>
                        {schedule.isBooked ? (
                          <span className={styles.statusBooked}>
                            <CheckCircle size={16} />
                            Reservado
                          </span>
                        ) : schedule.isAvailable ? (
                          <span className={styles.statusAvailable}>
                            <Clock size={16} />
                            Disponible
                          </span>
                        ) : (
                          <span className={styles.statusUnavailable}>
                            <XCircle size={16} />
                            No disponible
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.scheduleDetails}>
                      <div className={styles.scheduleTime}>
                        <Clock size={16} />
                        {formatTime(schedule.time)}
                      </div>
                      <div className={styles.scheduleDuration}>
                        Duración: {formatDuration()}
                      </div>
                    </div>

                    <div className={styles.scheduleActions}>
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className={styles.deleteButton}
                        disabled={schedule.isBooked}
                        title={schedule.isBooked ? 'No se puede eliminar un horario reservado' : 'Eliminar horario'}
                      >
                        <Trash2 size={16} />
                      </button>
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
  const adminCheck = await verifyAdminAccess(context);
  
  if (!adminCheck.isAdmin) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default AdminAsesoriasHorariosPage; 