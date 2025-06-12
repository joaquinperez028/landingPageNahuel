import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import styles from '@/styles/DateTimePicker.module.css';

interface DateTimePickerProps {
  onDateTimeSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  duration?: number; // duración en minutos
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  onDateTimeSelect,
  minDate = new Date(),
  maxDate,
  duration = 60
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Generar opciones de hora (cada 30 minutos)
  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    if (selectedTime) {
      const date = new Date(`${e.target.value}T${selectedTime}`);
      onDateTimeSelect(date);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(e.target.value);
    if (selectedDate) {
      const date = new Date(`${selectedDate}T${e.target.value}`);
      onDateTimeSelect(date);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.datePicker}>
        <Calendar className={styles.icon} />
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={minDate.toISOString().split('T')[0]}
          max={maxDate?.toISOString().split('T')[0]}
          className={styles.input}
        />
      </div>
      
      <div className={styles.timePicker}>
        <Clock className={styles.icon} />
        <select
          value={selectedTime}
          onChange={handleTimeChange}
          className={styles.select}
        >
          <option value="">Seleccionar hora</option>
          {timeSlots.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DateTimePicker; 