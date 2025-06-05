import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/styles/Carousel.module.css';

interface CarouselProps {
  /** @param items - Array de elementos React a mostrar */
  items: React.ReactNode[];
  /** @param autoplay - Reproducción automática */
  autoplay?: boolean;
  /** @param interval - Intervalo de autoplay en milisegundos */
  interval?: number;
  /** @param showDots - Mostrar indicadores de posición */
  showDots?: boolean;
  /** @param showArrows - Mostrar flechas de navegación */
  showArrows?: boolean;
  /** @param className - Clases CSS adicionales */
  className?: string;
  /** @param itemsPerView - Número de elementos visibles a la vez */
  itemsPerView?: number;
}

/**
 * Componente Carousel
 * Carrusel responsivo con autoplay y navegación manual
 */
const Carousel: React.FC<CarouselProps> = ({
  items,
  autoplay = false,
  interval = 3000,
  showDots = true,
  showArrows = true,
  className = '',
  itemsPerView = 1
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const totalSlides = Math.ceil(items.length / itemsPerView);

  // Función para ir al siguiente slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  // Función para ir al slide anterior
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  // Función para ir a un slide específico
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay
  useEffect(() => {
    if (isPlaying && autoplay && totalSlides > 1) {
      intervalRef.current = setInterval(nextSlide, interval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, autoplay, interval, totalSlides]);

  // Pausar autoplay al hacer hover
  const handleMouseEnter = () => {
    if (autoplay) {
      setIsPlaying(false);
    }
  };

  const handleMouseLeave = () => {
    if (autoplay) {
      setIsPlaying(true);
    }
  };

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('keydown', handleKeyDown);
      return () => carousel.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  // Obtener los elementos para el slide actual
  const getCurrentItems = () => {
    const startIndex = currentIndex * itemsPerView;
    return items.slice(startIndex, startIndex + itemsPerView);
  };

  if (items.length === 0) {
    return (
      <div className={`${styles.carousel} ${className}`}>
        <div className={styles.emptyState}>
          <p>No hay elementos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={carouselRef}
      className={`${styles.carousel} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="region"
      aria-label="Carrusel de contenido"
    >
      <div className={styles.carouselContainer}>
        {/* Flecha izquierda */}
        {showArrows && totalSlides > 1 && (
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={prevSlide}
            aria-label="Slide anterior"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Contenido del carousel */}
        <div className={styles.carouselContent}>
          <div
            className={styles.carouselTrack}
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              width: `${totalSlides * 100}%`
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div
                key={slideIndex}
                className={styles.slide}
                style={{ width: `${100 / totalSlides}%` }}
              >
                <div
                  className={styles.slideContent}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
                    gap: '1rem'
                  }}
                >
                  {items
                    .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                    .map((item, itemIndex) => (
                      <div key={itemIndex} className={styles.carouselItem}>
                        {item}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flecha derecha */}
        {showArrows && totalSlides > 1 && (
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={nextSlide}
            aria-label="Siguiente slide"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Indicadores de posición */}
      {showDots && totalSlides > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Contador de slides */}
      {totalSlides > 1 && (
        <div className={styles.counter}>
          {currentIndex + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
};

export default Carousel; 