import { useEffect } from 'react';

/**
 * Hook personalizado para aplicar protecciones de seguridad
 * - Deshabilita click derecho
 * - Previene combinaciones de teclas no deseadas
 * - Protege imágenes contra descarga
 * - Previene arrastrar elementos
 */
export const useSecurityProtection = () => {
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventKeyCombinations = (e: KeyboardEvent) => {
      // Prevenir combinaciones de teclas que podrían usarse para descargar o inspeccionar
      if (
        (e.ctrlKey && e.key === 's') || // Ctrl+S (guardar)
        (e.ctrlKey && e.key === 'p') || // Ctrl+P (imprimir)
        e.key === 'F12' || // F12 (dev tools)
        (e.ctrlKey && e.key === 'u') || // Ctrl+U (ver código fuente)
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I (dev tools)
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C (inspector)
        (e.ctrlKey && e.key === 'F5') || // Ctrl+F5 (recargar)
        (e.ctrlKey && e.key === 'r') // Ctrl+R (recargar)
      ) {
        e.preventDefault();
        return false;
      }
    };

    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const preventSelect = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Aplicar protecciones globales
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyCombinations);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('selectstart', preventSelect);
    document.addEventListener('mousedown', preventSelect);

    // Proteger todas las imágenes existentes
    const protectImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('contextmenu', preventContextMenu);
        img.addEventListener('dragstart', preventDrag);
        img.style.userSelect = 'none';
        (img.style as any).webkitUserSelect = 'none';
        (img.style as any).mozUserSelect = 'none';
        (img.style as any).msUserSelect = 'none';
        img.style.pointerEvents = 'none';
      });
    };

    // Proteger imágenes iniciales
    protectImages();

    // Observar cambios en el DOM para proteger nuevas imágenes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const images = element.querySelectorAll('img');
              images.forEach(img => {
                img.addEventListener('contextmenu', preventContextMenu);
                img.addEventListener('dragstart', preventDrag);
                img.style.userSelect = 'none';
                (img.style as any).webkitUserSelect = 'none';
                (img.style as any).mozUserSelect = 'none';
                (img.style as any).msUserSelect = 'none';
                img.style.pointerEvents = 'none';
              });
            }
          });
        }
      });
    });

    // Observar cambios en el body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Limpiar event listeners al desmontar
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyCombinations);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('mousedown', preventSelect);
      observer.disconnect();
    };
  }, []);
};

/**
 * Hook para proteger elementos específicos
 */
export const useElementProtection = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    element.addEventListener('contextmenu', preventContextMenu);
    element.addEventListener('dragstart', preventDrag);

    return () => {
      element.removeEventListener('contextmenu', preventContextMenu);
      element.removeEventListener('dragstart', preventDrag);
    };
  }, [elementRef]);
}; 