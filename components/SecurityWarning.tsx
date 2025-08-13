import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SecurityWarningProps {
  message?: string;
  duration?: number;
}

const SecurityWarning: React.FC<SecurityWarningProps> = ({ 
  message = "Acción no permitida por seguridad", 
  duration = 3000 
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState(message);

  useEffect(() => {
    const handleSecurityViolation = (e: Event) => {
      let violationMessage = message;
      
      // Detectar el tipo de violación
      if (e.type === 'contextmenu') {
        violationMessage = "Click derecho deshabilitado por seguridad";
      } else if (e.type === 'keydown') {
        violationMessage = "Combinación de teclas no permitida";
      } else if (e.type === 'dragstart') {
        violationMessage = "Arrastrar elementos no está permitido";
      }
      
      setWarningMessage(violationMessage);
      setShowWarning(true);
      
      // Ocultar después del tiempo especificado
      setTimeout(() => {
        setShowWarning(false);
      }, duration);
    };

    // Escuchar eventos de seguridad
    document.addEventListener('contextmenu', handleSecurityViolation);
    document.addEventListener('keydown', handleSecurityViolation);
    document.addEventListener('dragstart', handleSecurityViolation);

    return () => {
      document.removeEventListener('contextmenu', handleSecurityViolation);
      document.removeEventListener('keydown', handleSecurityViolation);
      document.removeEventListener('dragstart', handleSecurityViolation);
    };
  }, [message, duration]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
      <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg border border-red-700 max-w-sm">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">{warningMessage}</p>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityWarning; 