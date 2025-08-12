import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import styles from '../../styles/SwingTrading.module.css';

interface TrainingData {
  contenido: {
    modulos: number;
    lecciones: number;
    certificacion: boolean;
    nivelAcceso: string;
  };
}

interface ProgramModule {
  module: number;
  title: string;
  duration: string;
  lessons: number;
  topics: string[];
  description: string;
}

interface ProgramSectionProps {
  training: TrainingData;
  program: ProgramModule[];
}

const ProgramSection: React.FC<ProgramSectionProps> = ({ training, program }) => {
  return (
    <section className={styles.programSection}>
      <div className={styles.container}>
        <motion.h2 
          className={styles.sectionTitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Programa Completo
        </motion.h2>
        <motion.p 
          className={styles.sectionDescription}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {training.contenido.modulos} módulos progresivos con {training.contenido.lecciones} lecciones prácticas
        </motion.p>
        
        <div className={styles.programGrid}>
          {program.map((module, index) => (
            <motion.div 
              key={module.module}
              className={styles.moduleCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.moduleHeader}>
                <div className={styles.moduleNumber}>
                  <BookOpen size={24} />
                  <span>Módulo {module.module}</span>
                </div>
                <div className={styles.moduleMeta}>
                  <span className={styles.moduleDuration}>
                    <Clock size={16} />
                    {module.duration}
                  </span>
                  <span className={styles.moduleLessons}>
                    {module.lessons} lecciones
                  </span>
                </div>
              </div>
              
              <div className={styles.moduleContent}>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
                <p className={styles.moduleDescription}>{module.description}</p>
                
                <div className={styles.moduleTopics}>
                  <h4>Temas principales:</h4>
                  <ul>
                    {module.topics.map((topic, topicIndex) => (
                      <li key={topicIndex}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramSection; 