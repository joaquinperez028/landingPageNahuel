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
  nombre: string;
  apellido: string;
  email: string;
  mensaje: string;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  email?: string;
  mensaje?: string;
  general?: string;
}

/**
 * Modal de formulario de contacto con protecciones anti-spam
 * Permite a usuarios autenticados enviar mensajes al administrador
 */
const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    mensaje: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);

  // Llenar formulario con datos del usuario al abrir
  React.useEffect(() => {
    if (isOpen && session?.user) {
      const userName = session.user.name || '';
      const nameParts = userName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        nombre: firstName,
        apellido: lastName,
        email: session.user.email || '',
        mensaje: ''
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, session]);

  // Validación de campos
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar mensaje (los otros campos vienen del sistema)
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio';
    } else if (formData.mensaje.length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    } else if (formData.mensaje.length > 2000) {
      newErrors.mensaje = 'El mensaje no puede exceder 2000 caracteres';
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

    const combinedText = `${formData.mensaje}`.toLowerCase();
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
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          mensaje: formData.mensaje.trim(),
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

          {/* Información del Usuario (Solo Lectura) */}
          <div className={styles.userInfoSection}>
            <h4 className={styles.userInfoTitle}>Información del Usuario</h4>
            
            <div className={styles.userInfoGrid}>
              <div className={styles.userInfoField}>
                <label className={styles.userInfoLabel}>Nombre</label>
                <div className={styles.userInfoValue}>{formData.nombre}</div>
              </div>
              
              <div className={styles.userInfoField}>
                <label className={styles.userInfoLabel}>Apellido</label>
                <div className={styles.userInfoValue}>{formData.apellido}</div>
              </div>
              
              <div className={styles.userInfoField}>
                <label className={styles.userInfoLabel}>Email</label>
                <div className={styles.userInfoValue}>{formData.email}</div>
              </div>
            </div>
          </div>

          {/* Mensaje */}
          <div className={styles.inputGroup}>
            <label htmlFor="mensaje" className={styles.label}>
              Mensaje *
            </label>
            <textarea
              id="mensaje"
              value={formData.mensaje}
              onChange={(e) => handleInputChange('mensaje', e.target.value)}
              className={`${styles.textarea} ${errors.mensaje ? styles.inputError : ''}`}
              placeholder="Escribe tu mensaje detallado aquí..."
              rows={6}
              maxLength={2000}
              disabled={isSubmitting}
            />
            {errors.mensaje && (
              <span className={styles.errorText}>{errors.mensaje}</span>
            )}
            <div className={styles.charCount}>
              {formData.mensaje.length}/2000
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
              disabled={isSubmitting || !formData.mensaje.trim()}
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