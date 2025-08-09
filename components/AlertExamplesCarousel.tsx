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

  // Mostrar 3 ejemplos a la vez
  const getVisibleExamples = () => {
    if (examples.length <= 3) return examples;
    
    const visibleExamples = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % examples.length;
      visibleExamples.push(examples[index]);
    }
    return visibleExamples;
  };

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselContainer}>
        {/* Navigation Arrows */}
        {examples.length > 3 && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={goToPrevious}
              aria-label="Ejemplos anteriores"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={goToNext}
              aria-label="Siguientes ejemplos"
            >
              <ChevronRight size={24} />
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
              <div className={styles.alertsGrid}>
                {getVisibleExamples().map((example, index) => (
                  <div key={`${example.id}-${index}`} className={styles.alertCard}>
                    {/* Chart Background */}
                    <div className={styles.chartBackground}>
                      <div className={styles.chartLines}></div>
                      <div className={styles.candlesticks}></div>
                    </div>
                    
                    {/* Header */}
                    <div className={styles.alertHeader}>
                      <h3 className={styles.alertTitle}>{example.title}</h3>
                    </div>

                    {/* Description */}
                    <div className={styles.alertDescription}>
                      <p>{example.description}</p>
                    </div>

                    {/* Trading Details */}
                    <div className={styles.tradingDetails}>
                      <div className={styles.priceItem}>
                        <span className={styles.priceLabel}>💰 Precio de entrada:</span>
                        <span className={styles.priceValue}>{example.entryPrice}</span>
                      </div>
                      <div className={styles.priceItem}>
                        <span className={styles.priceLabel}>💸 Precio de salida:</span>
                        <span className={styles.priceValue}>{example.exitPrice}</span>
                      </div>
                      <div className={styles.profitItem}>
                        <span className={styles.profitLabel}>📊 Rendimiento:</span>
                        <span className={styles.profitValue}>{example.profitPercentage}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={styles.statusFooter}>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(example.status) }}
                      >
                        {example.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AlertExamplesCarousel;
