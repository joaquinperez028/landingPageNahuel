import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ClassCalendar.module.css';

interface ClassEvent {
  date: Date; // Cambio: ahora es una fecha completa en lugar de solo el día
  time: string;
  title: string;
  id: string;
}

interface ClassCalendarProps {
  events?: ClassEvent[];
  onDateSelect?: (date: Date, events: ClassEvent[]) => void;
  isAdmin?: boolean;
}

const ClassCalendar: React.FC<ClassCalendarProps> = ({ 
  events = [], 
  onDateSelect,
  isAdmin = false 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convertir domingo (0) a 6, lunes (1) a 0, etc.
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (day: number) => {
    // Comparar fechas completas: año, mes y día
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleDateClick = (day: number) => {
    if (isAdmin && onDateSelect) {
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(day);
      onDateSelect(selectedDate, dayEvents);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Espacios vacíos para los días antes del primer día del mes
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={styles.emptyDay}></div>
      );
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const hasEvents = dayEvents.length > 0;

      days.push(
        <div 
          key={day} 
          className={`${styles.calendarDay} ${hasEvents ? styles.hasEvents : ''} ${isAdmin ? styles.adminMode : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <div className={styles.dayNumber}>{day}</div>
          {hasEvents && (
            <div className={styles.eventsContainer}>
              {dayEvents.map((event, index) => (
                <div key={event.id || index} className={styles.eventItem}>
                  <div className={styles.eventTime}>{event.time}</div>
                  <div className={styles.eventTitle}>{event.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <h3 className={styles.calendarTitle}>Calendario de clases</h3>
      </div>

      <div className={styles.calendarContent}>
        <div className={styles.monthNavigation}>
          <button 
            className={styles.navButton}
            onClick={() => navigateMonth('prev')}
            aria-label="Mes anterior"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h4 className={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]}
          </h4>
          
          <button 
            className={styles.navButton}
            onClick={() => navigateMonth('next')}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className={styles.calendarGrid}>
          <div className={styles.dayHeaders}>
            {dayNames.map(day => (
              <div key={day} className={styles.dayHeader}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {renderCalendarDays()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCalendar;
