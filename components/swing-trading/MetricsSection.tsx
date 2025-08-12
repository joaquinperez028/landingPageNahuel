import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Star, Award } from 'lucide-react';
import styles from '../../styles/SwingTrading.module.css';

interface TrainingData {
  metricas: {
    rentabilidad: string;
    estudiantesActivos: string;
    entrenamientosRealizados: string;
    satisfaccion: string;
  };
}

interface MetricsSectionProps {
  training: TrainingData;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ training }) => {
  return (
    <section className={styles.metricsSection}>
      <div className={styles.container} style={{ position: 'relative', zIndex: 2 }}>
        <motion.h2 
          className={styles.sectionTitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Números que Respaldan la Calidad
        </motion.h2>
        
        <div className={styles.metricsGrid}>
          <motion.div 
            className={styles.metricCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.metricIcon}>
              <Users size={40} />
            </div>
            <h3 className={styles.metricNumber}>{training.metricas.estudiantesActivos}</h3>
            <p className={styles.metricLabel}>Estudiantes Formados</p>
          </motion.div>

          <motion.div 
            className={styles.metricCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.metricIcon}>
              <Target size={40} />
            </div>
            <h3 className={styles.metricNumber}>{training.metricas.rentabilidad}</h3>
            <p className={styles.metricLabel}>Rentabilidad Promedio</p>
          </motion.div>

          <motion.div 
            className={styles.metricCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.metricIcon}>
              <Star size={40} />
            </div>
            <h3 className={styles.metricNumber}>{training.metricas.satisfaccion}/5</h3>
            <p className={styles.metricLabel}>Satisfacción Promedio</p>
          </motion.div>

          <motion.div 
            className={styles.metricCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.metricIcon}>
              <Award size={40} />
            </div>
            <h3 className={styles.metricNumber}>{training.metricas.entrenamientosRealizados}</h3>
            <p className={styles.metricLabel}>Entrenamientos Realizados</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MetricsSection; 