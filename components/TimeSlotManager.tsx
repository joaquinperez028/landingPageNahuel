import React, { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import styles from '@/styles/TimeSlotManager.module.css';

interface TimeSlot {
  id: string;
  time: string;
  duration: number;
}

interface TimeSlotManagerProps {
  timeSlots: TimeSlot[];
  onTimeSlotsChange: (slots: TimeSlot[]) => void;
}

const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({
  timeSlots,
  onTimeSlotsChange
}) => {
  const [newTime, setNewTime] = useState('14:00');
  const [newDuration, setNewDuration] = useState(60);

  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30'
  ];

  const durationOptions = [
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' }
  ];

  const addTimeSlot = () => {
    // Verificar que no exista ya un horario a esa hora
    const exists = timeSlots.some(slot => slot.time === newTime);
    if (exists) {
      alert('Ya existe un horario a esa hora');
      return;
    }

    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      time: newTime,
      duration: newDuration
    };

    onTimeSlotsChange([...timeSlots, newSlot]);
    setNewTime('14:00'); // Reset a un horario común
  };

  const removeTimeSlot = (id: string) => {
    onTimeSlotsChange(timeSlots.filter(slot => slot.id !== id));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <Clock size={20} />
          Horarios Disponibles
        </h4>
        <p className={styles.subtitle}>
          Agrega los horarios específicos para cada día
        </p>
      </div>

      <div className={styles.addSection}>
        <div className={styles.inputGroup}>
          <label>Hora:</label>
          <select
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className={styles.timeSelect}
          >
            {availableTimes.map(time => (
              <option key={time} value={time}>
                {formatTime(time)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Duración:</label>
          <select
            value={newDuration}
            onChange={(e) => setNewDuration(parseInt(e.target.value))}
            className={styles.durationSelect}
          >
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addTimeSlot}
          className={styles.addButton}
          disabled={timeSlots.some(slot => slot.time === newTime)}
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {timeSlots.length > 0 && (
        <div className={styles.slotsList}>
          <h5>Horarios configurados:</h5>
          <div className={styles.slotsGrid}>
            {timeSlots.map(slot => (
              <div key={slot.id} className={styles.slotItem}>
                <div className={styles.slotInfo}>
                  <span className={styles.slotTime}>{formatTime(slot.time)}</span>
                  <span className={styles.slotDuration}>{formatDuration(slot.duration)}</span>
                </div>
                <button
                  onClick={() => removeTimeSlot(slot.id)}
                  className={styles.removeButton}
                  title="Eliminar horario"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {timeSlots.length === 0 && (
        <div className={styles.emptyState}>
          <Clock size={48} />
          <p>No hay horarios configurados</p>
          <span>Agrega horarios usando el formulario de arriba</span>
        </div>
      )}
    </div>
  );
};

export default TimeSlotManager; 