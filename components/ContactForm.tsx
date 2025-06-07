import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, Send, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from '@/styles/ContactForm.module.css';

interface ContactFormProps {
  /** @param isOpen - Controla si el modal está abierto */
  isOpen: boolean;
  /** @param onClose - Función para cerrar el modal */
  onClose: () => void;
}

interface FormData {
  subject: string;
  message: string;
}

interface FormErrors {
  subject?: string;
  message?: string;
  general?: string;
}

/**
 * Modal de formulario de contacto con protecciones anti-spam
 * Permite a usuarios autenticados enviar mensajes al administrador
 */
const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);

  // Resetear formulario al cerrar
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({ subject: '', message: '' });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Validación de campos
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar asunto
    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es obligatorio';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'El asunto debe tener al menos 5 caracteres';
    } else if (formData.subject.length > 100) {
      newErrors.subject = 'El asunto no puede exceder 100 caracteres';
    }

    // Validar mensaje
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio';
    } else if (formData.message.length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    } else if (formData.message.length > 2000) {
      newErrors.message = 'El mensaje no puede exceder 2000 caracteres';
    }

    // Validar patrones sospechosos (básico)
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /onclick/i,
      /onload/i,
      /eval\(/i,
      /document\./i,
      /window\./i
    ];

    const combinedText = `${formData.subject} ${formData.message}`.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(combinedText)) {
        newErrors.general = 'El contenido contiene caracteres no permitidos';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Control de rate limiting (cliente)
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const minWaitTime = 30000; // 30 segundos

    if (timeSinceLastSubmission < minWaitTime) {
      const remainingTime = Math.ceil((minWaitTime - timeSinceLastSubmission) / 1000);
      setErrors({
        general: `Por favor espera ${remainingTime} segundos antes de enviar otro mensaje`
      });
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error específico del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Limpiar error general si existía
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar que el usuario esté autenticado
    if (!session?.user?.email) {
      toast.error('Debes iniciar sesión para enviar un mensaje');
      return;
    }

    // Validaciones
    if (!validateForm() || !checkRateLimit()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          timestamp: Date.now() // Para validación adicional en servidor
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Mensaje enviado correctamente');
        setLastSubmissionTime(Date.now());
        onClose();
      } else {
        throw new Error(data.error || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error al enviar mensaje de contacto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('rate limit')) {
        setErrors({ general: 'Has enviado demasiados mensajes. Intenta más tarde.' });
      } else {
        setErrors({ general: errorMessage });
      }
      
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>Contactar</h2>
            <p className={styles.subtitle}>
              Envía tu mensaje directamente al administrador
            </p>
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Usuario info */}
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              {session?.user?.image && (
                <img 
                  src={session.user.image} 
                  alt="Usuario" 
                  className={styles.userAvatar}
                />
              )}
              <div>
                <p className={styles.userName}>{session?.user?.name}</p>
                <p className={styles.userEmail}>{session?.user?.email}</p>
              </div>
            </div>
            <div className={styles.securityBadge}>
              <Shield size={16} />
              <span>Conexión segura</span>
            </div>
          </div>

          {/* Error general */}
          {errors.general && (
            <div className={styles.errorAlert}>
              <AlertTriangle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Asunto */}
          <div className={styles.inputGroup}>
            <label htmlFor="subject" className={styles.label}>
              Asunto *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
              placeholder="Describe brevemente tu consulta..."
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.subject && (
              <span className={styles.errorText}>{errors.subject}</span>
            )}
            <div className={styles.charCount}>
              {formData.subject.length}/100
            </div>
          </div>

          {/* Mensaje */}
          <div className={styles.inputGroup}>
            <label htmlFor="message" className={styles.label}>
              Mensaje *
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
              placeholder="Escribe tu mensaje detallado aquí..."
              rows={6}
              maxLength={2000}
              disabled={isSubmitting}
            />
            {errors.message && (
              <span className={styles.errorText}>{errors.message}</span>
            )}
            <div className={styles.charCount}>
              {formData.message.length}/2000
            </div>
          </div>

          {/* Security note */}
          <div className={styles.securityNote}>
            <CheckCircle size={14} />
            <span>
              Tu mensaje será enviado de forma segura y confidencial al administrador.
              No incluyas información sensible como contraseñas.
            </span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar Mensaje
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm; 