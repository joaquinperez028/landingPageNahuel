import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoPriceUpdateReturn {
  isActive: boolean;
  lastUpdate: Date | null;
  nextUpdate: Date | null;
  startAutoUpdate: () => void;
  stopAutoUpdate: () => void;
  forceUpdate: () => void;
  error: string | null;
}

/**
 * ✅ NUEVO: Hook para actualización automática de precios (alternativa gratuita a cron jobs)
 * 
 * Características:
 * - Actualiza precios cada 10 minutos
 * - Funciona solo cuando el usuario está en la página
 * - Persiste en localStorage
 * - Maneja errores y reintentos
 */
export const useAutoPriceUpdate = (
  updateFunction: () => Promise<void>,
  intervalMinutes: number = 10
): UseAutoPriceUpdateReturn => {
  const [isActive, setIsActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  /**
   * ✅ NUEVO: Función para actualizar precios
   */
  const updatePrices = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      console.log(`🔄 Actualizando precios automáticamente...`);
      setError(null);
      
      await updateFunction();
      
      const now = new Date();
      setLastUpdate(now);
      setNextUpdate(new Date(now.getTime() + intervalMinutes * 60 * 1000));
      
      console.log(`✅ Precios actualizados exitosamente a las ${now.toLocaleTimeString()}`);
      
      // ✅ NUEVO: Guardar en localStorage
      localStorage.setItem('lastPriceUpdate', now.toISOString());
      localStorage.setItem('nextPriceUpdate', new Date(now.getTime() + intervalMinutes * 60 * 1000).toISOString());
      
    } catch (err: any) {
      const errorMessage = `Error actualizando precios: ${err.message}`;
      console.error(`❌ ${errorMessage}`);
      setError(errorMessage);
      
      // ✅ NUEVO: Reintentar en 2 minutos si falla
      setTimeout(() => {
        if (isActiveRef.current) {
          updatePrices();
        }
      }, 2 * 60 * 1000);
    }
  }, [updateFunction, intervalMinutes]);

  /**
   * ✅ NUEVO: Iniciar actualización automática
   */
  const startAutoUpdate = useCallback(() => {
    if (isActiveRef.current) return;

    console.log(`🚀 Iniciando actualización automática de precios cada ${intervalMinutes} minutos`);
    
    isActiveRef.current = true;
    setIsActive(true);
    
    // ✅ NUEVO: Ejecutar inmediatamente la primera vez
    updatePrices();
    
    // ✅ NUEVO: Configurar intervalo
    intervalRef.current = setInterval(updatePrices, intervalMinutes * 60 * 1000);
    
    // ✅ NUEVO: Guardar estado en localStorage
    localStorage.setItem('autoPriceUpdateActive', 'true');
    localStorage.setItem('autoPriceUpdateInterval', intervalMinutes.toString());
    
    // ✅ NUEVO: Configurar listener para cuando la página vuelve a ser visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActiveRef.current) {
        console.log('📱 Página visible, verificando si necesita actualización...');
        const lastUpdateStr = localStorage.getItem('lastPriceUpdate');
        if (lastUpdateStr) {
          const lastUpdateTime = new Date(lastUpdateStr);
          const timeSinceLastUpdate = Date.now() - lastUpdateTime.getTime();
          const shouldUpdate = timeSinceLastUpdate >= intervalMinutes * 60 * 1000;
          
          if (shouldUpdate) {
            console.log('⏰ Ha pasado mucho tiempo, actualizando precios...');
            updatePrices();
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // ✅ NUEVO: Limpiar listener cuando se detenga
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updatePrices, intervalMinutes]);

  /**
   * ✅ NUEVO: Detener actualización automática
   */
  const stopAutoUpdate = useCallback(() => {
    console.log('⏹️ Deteniendo actualización automática de precios');
    
    isActiveRef.current = false;
    setIsActive(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // ✅ NUEVO: Limpiar localStorage
    localStorage.removeItem('autoPriceUpdateActive');
    localStorage.removeItem('autoPriceUpdateInterval');
    localStorage.removeItem('lastPriceUpdate');
    localStorage.removeItem('nextPriceUpdate');
    
    setNextUpdate(null);
  }, []);

  /**
   * ✅ NUEVO: Forzar actualización manual
   */
  const forceUpdate = useCallback(() => {
    console.log('🔨 Forzando actualización manual de precios');
    updatePrices();
  }, [updatePrices]);

  /**
   * ✅ NUEVO: Restaurar estado desde localStorage al montar
   */
  useEffect(() => {
    const wasActive = localStorage.getItem('autoPriceUpdateActive') === 'true';
    const savedInterval = localStorage.getItem('autoPriceUpdateInterval');
    const lastUpdateStr = localStorage.getItem('lastPriceUpdate');
    const nextUpdateStr = localStorage.getItem('nextPriceUpdate');
    
    if (wasActive && savedInterval) {
      const interval = parseInt(savedInterval);
      if (interval === intervalMinutes) {
        console.log('🔄 Restaurando actualización automática desde localStorage');
        
        if (lastUpdateStr) {
          setLastUpdate(new Date(lastUpdateStr));
        }
        
        if (nextUpdateStr) {
          setNextUpdate(new Date(nextUpdateStr));
        }
        
        // ✅ NUEVO: Iniciar automáticamente si la página se recarga
        startAutoUpdate();
      }
    }
  }, [intervalMinutes, startAutoUpdate]);

  /**
   * ✅ NUEVO: Limpiar al desmontar
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isActive,
    lastUpdate,
    nextUpdate,
    startAutoUpdate,
    stopAutoUpdate,
    forceUpdate,
    error,
  };
}; 