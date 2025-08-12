import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Loader } from 'lucide-react';
import styles from '@/styles/SwingTrading.module.css';

interface TrainingData {
  tipo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  metricas: {
    rentabilidad: string;
    estudiantesActivos: string;
    entrenamientosRealizados: string;
    satisfaccion: string;
  };
  contenido: {
    modulos: number;
    lecciones: number;
    certificacion: boolean;
    nivelAcceso: string;
  };
}

interface HeroSectionProps {
  training: TrainingData;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
  };
  startDateText: string;
  isEnrolled: boolean;
  checkingEnrollment: boolean;
  isProcessingPayment: boolean;
  onEnroll: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  training,
  countdown,
  startDateText,
  isEnrolled,
  checkingEnrollment,
  isProcessingPayment,
  onEnroll
}) => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Swing Trading
            </h1>
            <p className={styles.heroDescription}>
              {training.descripcion}
            </p>
            
            <div className={styles.startDate}>
              Fecha de inicio: {startDateText}
            </div>
            
            <div className={styles.countdownContainer}>
              <div className={styles.countdownBox}>
                <span className={styles.countdownNumber}>{countdown.days}</span>
                <span className={styles.countdownLabel}>Días</span>
              </div>
              <div className={styles.countdownBox}>
                <span className={styles.countdownNumber}>{countdown.hours}</span>
                <span className={styles.countdownLabel}>Horas</span>
              </div>
              <div className={styles.countdownBox}>
                <span className={styles.countdownNumber}>{countdown.minutes}</span>
                <span className={styles.countdownLabel}>Minutos</span>
              </div>
            </div>
            <button 
              onClick={onEnroll}
              className={styles.enrollButton}
              disabled={checkingEnrollment || isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader size={20} className={styles.spinner} />
                  Procesando...
                </>
              ) : (
                <>
                  Inscribirme Ahora &gt;
                </>
              )}
            </button>
          </div>
          <div className={styles.heroVideo}>
            <div className={styles.videoContainer}>
              <div className={styles.videoPlayer}>
                <div className={styles.videoPlaceholder}>
                  <div className={styles.playButton}>
                    <PlayCircle size={60} />
                  </div>
                </div>
                <div className={styles.videoControls}>
                  <div className={styles.videoProgress}>
                    <span className={styles.currentTime}>2:21</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill}></div>
                    </div>
                    <span className={styles.totalTime}>20:00</span>
                  </div>
                  <div className={styles.controlButtons}>
                    <button className={styles.controlBtn}>⏮</button>
                    <button className={styles.controlBtn}>⏯</button>
                    <button className={styles.controlBtn}>⏭</button>
                    <button className={styles.controlBtn}>🔊</button>
                    <button className={styles.controlBtn}>⚙️</button>
                    <button className={styles.controlBtn}>⛶</button>
                    <button className={styles.controlBtn}>⛶</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection; 