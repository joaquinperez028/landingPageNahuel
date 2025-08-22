import React, { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import styles from '@/styles/TimeSlotManager.module.css';

interface TimeSlot {
  id: string;
  time: string;
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

  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00'
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
      time: newTime
    };

    onTimeSlotsChange([...timeSlots, newSlot]);
    // No resetear el horario para permitir agregar múltiples horarios seguidos
  };

  const removeTimeSlot = (id: string) => {
    onTimeSlotsChange(timeSlots.filter(slot => slot.id !== id));
  };

  const formatTime = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <Clock size={20} />
          Horarios Disponibles
        </h4>
        <p className={styles.subtitle}>
          Agrega los horarios específicos para cada día (duración: 1 hora)
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
                  <span className={styles.slotDuration}>1 hora</span>
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