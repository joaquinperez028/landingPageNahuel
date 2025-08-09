import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/styles/AlertExamplesCarousel.module.css';

interface AlertExample {
  id: string;
  title: string;
  description: string;
  entryPrice: string;
  exitPrice: string;
  profit: string;
  profitPercentage: string;
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  status: 'CERRADO TP1' | 'CERRADO TP1 Y SL' | 'CERRADO SL';
  country: string;
  ticker: string;
  order: number;
}

interface AlertExamplesCarouselProps {
  examples: AlertExample[];
  autoplay?: boolean;
  interval?: number;
}

const AlertExamplesCarousel: React.FC<AlertExamplesCarouselProps> = ({ 
  examples, 
  autoplay = true, 
  interval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!autoplay || examples.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === examples.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, examples.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? examples.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === examples.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'BAJO': return '#10b981';
      case 'MEDIO': return '#f59e0b';
      case 'ALTO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CERRADO TP1': return '#10b981';
      case 'CERRADO TP1 Y SL': return '#059669';
      case 'CERRADO SL': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (examples.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay ejemplos de alertas disponibles</p>
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselContainer}>
        {/* Navigation Arrows */}
        {examples.length > 1 && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={goToPrevious}
              aria-label="Ejemplo anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={goToNext}
              aria-label="Siguiente ejemplo"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Slides */}
        <div className={styles.slidesWrapper}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className={styles.slide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className={styles.alertCard}>
                {/* Header */}
                <div className={styles.alertHeader}>
                  <div className={styles.alertTitle}>
                    <h3>{examples[currentIndex].title}</h3>
                    <div className={styles.alertMeta}>
                      <span className={styles.country}>{examples[currentIndex].country}</span>
                      <span className={styles.ticker}>{examples[currentIndex].ticker}</span>
                    </div>
                  </div>
                  <div className={styles.alertBadges}>
                    <span 
                      className={styles.riskBadge}
                      style={{ backgroundColor: getRiskColor(examples[currentIndex].riskLevel) }}
                    >
                      {examples[currentIndex].riskLevel}
                    </span>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(examples[currentIndex].status) }}
                    >
                      {examples[currentIndex].status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className={styles.alertDescription}>
                  <p>{examples[currentIndex].description}</p>
                </div>

                {/* Trading Details */}
                <div className={styles.tradingDetails}>
                  <div className={styles.priceSection}>
                    <div className={styles.priceItem}>
                      <span className={styles.priceLabel}>💰 Precio de entrada:</span>
                      <span className={styles.priceValue}>{examples[currentIndex].entryPrice}</span>
                    </div>
                    <div className={styles.priceItem}>
                      <span className={styles.priceLabel}>💸 Precio de salida:</span>
                      <span className={styles.priceValue}>{examples[currentIndex].exitPrice}</span>
                    </div>
                  </div>

                  <div className={styles.profitSection}>
                    <div className={styles.profitItem}>
                      <span className={styles.profitLabel}>⚡ Take Profit 1:</span>
                      <span className={styles.profitValue}>{examples[currentIndex].profit}</span>
                    </div>
                    <div className={styles.rendimientoItem}>
                      <span className={styles.rendimientoLabel}>📊 Rendimiento:</span>
                      <span className={styles.rendimientoValue}>{examples[currentIndex].profitPercentage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Navigation */}
        {examples.length > 1 && (
          <div className={styles.dotsContainer}>
            {examples.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir al ejemplo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertExamplesCarousel;
