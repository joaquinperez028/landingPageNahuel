import { useState, useCallback } from 'react';

interface CloudinaryUrlOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
  gravity?: string;
  page?: number;
  density?: number;
}

interface UseCloudinaryUrlsReturn {
  // Generar URLs
  generateImageUrl: (publicId: string, options?: CloudinaryUrlOptions) => Promise<string>;
  generatePDFUrl: (publicId: string, options?: CloudinaryUrlOptions) => Promise<string>;
  generateDownloadUrl: (publicId: string) => Promise<string>;
  generateViewUrl: (publicId: string) => Promise<string>;
  
  // Estado
  loading: boolean;
  error: string | null;
  
  // Utilidades
  clearError: () => void;
}

/**
 * ✅ NUEVO: Hook seguro para generar URLs de Cloudinary
 * 
 * Este hook usa la API segura del backend en lugar de importar
 * directamente las funciones de Cloudinary, evitando exponer
 * la lógica interna o credenciales
 */
export const useCloudinaryUrls = (): UseCloudinaryUrlsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ NUEVO: Función base para llamar a la API segura
   */
  const callCloudinaryAPI = useCallback(async (
    action: string, 
    publicId: string, 
    options?: CloudinaryUrlOptions
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cloudinary/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          publicId,
          options
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      if (!data.success || !data.url) {
        throw new Error('Respuesta inválida de la API');
      }

      return data.url;

    } catch (err: any) {
      const errorMessage = `Error generando URL de Cloudinary: ${err.message}`;
      setError(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ✅ NUEVO: Generar URL de imagen optimizada
   */
  const generateImageUrl = useCallback(async (
    publicId: string, 
    options?: CloudinaryUrlOptions
  ): Promise<string> => {
    return callCloudinaryAPI('image', publicId, options);
  }, [callCloudinaryAPI]);

  /**
   * ✅ NUEVO: Generar URL de PDF
   */
  const generatePDFUrl = useCallback(async (
    publicId: string, 
    options?: CloudinaryUrlOptions
  ): Promise<string> => {
    return callCloudinaryAPI('pdf', publicId, options);
  }, [callCloudinaryAPI]);

  /**
   * ✅ NUEVO: Generar URL de descarga
   */
  const generateDownloadUrl = useCallback(async (
    publicId: string
  ): Promise<string> => {
    return callCloudinaryAPI('download', publicId);
  }, [callCloudinaryAPI]);

  /**
   * ✅ NUEVO: Generar URL de visualización
   */
  const generateViewUrl = useCallback(async (
    publicId: string
  ): Promise<string> => {
    return callCloudinaryAPI('view', publicId);
  }, [callCloudinaryAPI]);

  /**
   * ✅ NUEVO: Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateImageUrl,
    generatePDFUrl,
    generateDownloadUrl,
    generateViewUrl,
    loading,
    error,
    clearError,
  };
};

/**
 * ✅ NUEVO: Hook para generar URL de imagen específica
 */
export const useCloudinaryImageUrl = (publicId: string, options?: CloudinaryUrlOptions) => {
  const { generateImageUrl, loading, error } = useCloudinaryUrls();
  
  const getUrl = useCallback(async () => {
    if (!publicId) return null;
    return generateImageUrl(publicId, options);
  }, [publicId, options, generateImageUrl]);

  return {
    getUrl,
    loading,
    error,
  };
};

/**
 * ✅ NUEVO: Hook para generar URL de PDF específica
 */
export const useCloudinaryPDFUrl = (publicId: string, options?: CloudinaryUrlOptions) => {
  const { generatePDFUrl, generateDownloadUrl, generateViewUrl, loading, error } = useCloudinaryUrls();
  
  const getViewUrl = useCallback(async () => {
    if (!publicId) return null;
    return generatePDFUrl(publicId, options);
  }, [publicId, options, generatePDFUrl]);

  const getDownloadUrl = useCallback(async () => {
    if (!publicId) return null;
    return generateDownloadUrl(publicId);
  }, [publicId, generateDownloadUrl]);

  const getDirectViewUrl = useCallback(async () => {
    if (!publicId) return null;
    return generateViewUrl(publicId);
  }, [publicId, generateViewUrl]);

  return {
    getViewUrl,
    getDownloadUrl,
    getDirectViewUrl,
    loading,
    error,
  };
}; 