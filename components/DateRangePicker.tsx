import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/styles/DateRangePicker.module.css';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año desde hoy
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Agregar días del mes anterior para completar la primera semana
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonth = new Date(year, month - 1, 0);
      const day = prevMonth.getDate() - startingDayOfWeek + i + 1;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    // Agregar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled: date < minDate || date > maxDate
      });
    }

    // Agregar días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = new Date(year, month + 1, day);
      days.push({
        date: nextMonth,
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    return days;
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isStartDate = (date: Date) => {
    return startDate && date.toDateString() === startDate.toDateString();
  };

  const isEndDate = (date: Date) => {
    return endDate && date.toDateString() === endDate.toDateString();
  };

  const handleDateClick = (date: Date) => {
    if (date < minDate || date > maxDate) return;

    if (!startDate || (startDate && endDate)) {
      // Primera selección o nueva selección
      onStartDateChange(date);
      onEndDateChange(null);
    } else {
      // Segunda selección
      if (date < startDate) {
        onEndDateChange(startDate);
        onStartDateChange(date);
      } else {
        onEndDateChange(date);
      }
    }
  };

  const handleDateHover = (date: Date) => {
    if (startDate && !endDate && date >= startDate) {
      setHoveredDate(date);
    }
  };

  const clearHover = () => setHoveredDate(null);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={prevMonth} className={styles.navButton}>
          <ChevronLeft size={20} />
        </button>
        <h3 className={styles.monthTitle}>{formatMonth(currentMonth)}</h3>
        <button onClick={nextMonth} className={styles.navButton}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={styles.weekdays}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className={styles.weekday}>{day}</div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              ${styles.day}
              ${!day.isCurrentMonth ? styles.otherMonth : ''}
              ${day.isDisabled ? styles.disabled : ''}
              ${isStartDate(day.date) ? styles.startDate : ''}
              ${isEndDate(day.date) ? styles.endDate : ''}
              ${isInRange(day.date) ? styles.inRange : ''}
              ${hoveredDate && day.date >= startDate! && day.date <= hoveredDate ? styles.hoverRange : ''}
            `}
            onClick={() => handleDateClick(day.date)}
            onMouseEnter={() => handleDateHover(day.date)}
            onMouseLeave={clearHover}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.startColor}`}></div>
          <span>Fecha inicio</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.endColor}`}></div>
          <span>Fecha fin</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.rangeColor}`}></div>
          <span>Rango seleccionado</span>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker; 