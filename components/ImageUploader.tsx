import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadedImage {
  assetId: string;
  url: string;
  caption?: string;
  file?: File;
}

interface ImageUploaderProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  allowCaptions?: boolean;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  maxImages = 5,
  allowCaptions = true,
  className = ''
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validar límite de imágenes
    if (images.length + files.length > maxImages) {
      setErrors([`Solo puedes subir un máximo de ${maxImages} imágenes`]);
      return;
    }

    // Validar cada archivo
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        newErrors.push(`${file.name} no es una imagen válida`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        newErrors.push(`${file.name} es demasiado grande (máximo 10MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    uploadFiles(validFiles);

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (files: File[]) => {
    const fileIds = files.map(f => f.name + Date.now());
    setUploading(prev => [...prev, ...fileIds]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = fileIds[i];

      try {
        console.log('📤 Subiendo imagen:', file.name);

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error subiendo imagen');
        }

        const result = await response.json();
        
        const newImage: UploadedImage = {
          assetId: result.assetId,
          url: result.imageUrl,
          caption: '',
          file
        };

        setImages(prev => {
          const updated = [...prev, newImage];
          onImagesChange(updated);
          return updated;
        });

        console.log('✅ Imagen subida exitosamente:', result.assetId);

      } catch (error) {
        console.error('❌ Error subiendo imagen:', error);
        setErrors(prev => [...prev, `Error subiendo ${file.name}: ${(error as Error).message}`]);
      } finally {
        setUploading(prev => prev.filter(id => id !== fileId));
      }
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  };

  const updateCaption = (index: number, caption: string) => {
    const updated = images.map((img, i) => 
      i === index ? { ...img, caption } : img
    );
    setImages(updated);
    onImagesChange(updated);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <div className={`image-uploader ${className}`}>
      <style jsx>{`
        .image-uploader {
          width: 100%;
        }

        .upload-area {
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--bg-secondary);
        }

        .upload-area:hover {
          border-color: var(--primary-color);
          background: var(--bg-tertiary);
        }

        .upload-area.dragging {
          border-color: var(--primary-color);
          background: var(--bg-tertiary);
        }

        .upload-icon {
          margin: 0 auto 1rem;
          color: var(--text-muted);
        }

        .upload-text {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .upload-hint {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .hidden-input {
          display: none;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .image-item {
          position: relative;
          background: var(--bg-secondary);
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .image-preview {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }

        .image-loading {
          width: 100%;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          color: var(--text-muted);
        }

        .remove-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .remove-button:hover {
          background: rgba(239, 68, 68, 1);
        }

        .caption-input {
          width: 100%;
          padding: 0.5rem;
          border: none;
          border-top: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .caption-input:focus {
          outline: none;
          border-top-color: var(--primary-color);
        }

        .errors {
          margin-top: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          padding: 1rem;
        }

        .error-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .error-item:last-child {
          margin-bottom: 0;
        }

        .clear-errors {
          background: none;
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .progress-indicator {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
      `}</style>

      {/* Área de subida */}
      <div
        className="upload-area"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="upload-icon" size={48} />
        <p className="upload-text">
          Haz clic para seleccionar imágenes o arrastra y suelta
        </p>
        <p className="upload-hint">
          PNG, JPG, GIF, WEBP hasta 10MB • Máximo {maxImages} imágenes
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden-input"
      />

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="images-grid">
          {images.map((image, index) => (
            <div key={`${image.assetId}-${index}`} className="image-item">
              <img
                src={image.url}
                alt={`Imagen ${index + 1}`}
                className="image-preview"
              />
              
              <button
                className="remove-button"
                onClick={() => removeImage(index)}
                title="Eliminar imagen"
              >
                <X size={14} />
              </button>

              {allowCaptions && (
                <input
                  type="text"
                  placeholder="Descripción de la imagen..."
                  value={image.caption || ''}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  className="caption-input"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Imágenes cargando */}
      {uploading.length > 0 && (
        <div className="images-grid">
          {uploading.map((fileId) => (
            <div key={fileId} className="image-item">
              <div className="image-loading">
                <div style={{ textAlign: 'center' }}>
                  <div className="loading-spinner"></div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    Subiendo...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, index) => (
            <div key={index} className="error-item">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ))}
          <button className="clear-errors" onClick={clearErrors}>
            Limpiar errores
          </button>
        </div>
      )}

      {/* Indicador de progreso */}
      {images.length > 0 && (
        <div className="progress-indicator">
          <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#10b981' }} />
          {images.length} de {maxImages} imágenes subidas
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 