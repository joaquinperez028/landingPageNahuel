import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export interface CloudinaryImage {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  caption?: string;
  order?: number;
}

interface ImageUploaderProps {
  onImageUploaded: (image: CloudinaryImage) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  allowedFormats?: string[];
  className?: string;
  buttonText?: string;
  multiple?: boolean;
}

export default function ImageUploader({
  onImageUploaded,
  onUploadStart,
  onUploadProgress,
  onError,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB por defecto
  allowedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  className = '',
  buttonText = 'Subir Imagen',
  multiple = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const uploadToCloudinary = async (file: File): Promise<CloudinaryImage> => {
    const formData = new FormData();
    formData.append('image', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setProgress(progress);
          onUploadProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
              resolve(response.data);
            } else {
              reject(new Error(response.error || 'Error desconocido'));
            }
          } catch (error) {
            reject(new Error('Error procesando respuesta del servidor'));
          }
        } else {
          reject(new Error(`Error HTTP: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir imagen'));
      });

      xhr.open('POST', '/api/upload/image');
      xhr.send(formData);
    });
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    onUploadStart?.();

    try {
      for (const file of files) {
        console.log('📤 Subiendo imagen:', file.name);
        
        const uploadedImage = await uploadToCloudinary(file);
        
        console.log('✅ Imagen subida exitosamente:', uploadedImage.public_id);
        
        onImageUploaded(uploadedImage);
      }
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': allowedFormats.map(format => `.${format}`)
    },
    maxFiles: multiple ? maxFiles : 1,
    maxSize: maxSizeBytes,
    multiple,
    disabled: uploading,
    onError: (error: any) => {
      console.error('❌ Error en dropzone:', error);
      onError?.(error.message);
    }
  });

  return (
    <div className={`image-uploader ${className}`}>
      <div
        {...getRootProps()}
        className={`
          dropzone
          ${isDragActive || dragActive ? 'active' : ''}
          ${uploading ? 'uploading' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        
        <div className="upload-content">
          {uploading ? (
            <div className="upload-progress">
              <div className="spinner"></div>
              <p>Subiendo imagen... {progress}%</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📸</div>
              <p className="upload-text">
                {isDragActive || dragActive
                  ? 'Suelta las imágenes aquí...'
                  : 'Arrastra imágenes aquí o haz clic para seleccionar'
                }
              </p>
              <button type="button" className="upload-button">
                {buttonText}
              </button>
              <p className="upload-info">
                Formatos: {allowedFormats.join(', ').toUpperCase()} | 
                Máximo: {Math.round(maxSizeBytes / (1024 * 1024))}MB
                {multiple && ` | Hasta ${maxFiles} archivos`}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .image-uploader {
          width: 100%;
        }

        .dropzone {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8fafc;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone:hover,
        .dropzone.active {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .dropzone.uploading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .upload-content {
          width: 100%;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-text {
          font-size: 1.1rem;
          color: #64748b;
          margin-bottom: 1rem;
        }

        .upload-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .upload-button:hover {
          background: #2563eb;
        }

        .upload-info {
          font-size: 0.875rem;
          color: #9ca3af;
          margin-top: 1rem;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .progress-bar {
          width: 200px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
} 