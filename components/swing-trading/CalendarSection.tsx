import React from 'react';
import { motion } from 'framer-motion';
import ClassCalendar from '../ClassCalendar';
import styles from '../../styles/SwingTrading.module.css';

interface TrainingDate {
  id: string;
  date: Date;
  time: string;
  title: string;
  isActive: boolean;
  createdBy: string;
}

interface CalendarSectionProps {
  trainingDates: TrainingDate[];
  isAdmin: boolean;
  onDateSelect: (selectedDate: Date, existingEvents: any[]) => void;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  trainingDates,
  isAdmin,
  onDateSelect
}) => {
  return (
    <section className={styles.calendarSection}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <ClassCalendar
            events={trainingDates.map(trainingDate => ({
              date: trainingDate.date,
              time: `${trainingDate.time}hs`,
              title: trainingDate.title,
              id: trainingDate.id
            }))}
            isAdmin={isAdmin}
            onDateSelect={onDateSelect}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CalendarSection; 