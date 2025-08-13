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

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showWarning) {
        setShowWarning(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showWarning]);

  if (!showWarning) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={() => setShowWarning(false)}
    >
      <div 
        className="bg-gradient-to-br from-red-600 to-red-700 text-white p-10 rounded-3xl shadow-2xl border-2 border-red-500 max-w-lg mx-4 text-center animate-in zoom-in duration-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Efecto de brillo en el fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        
        <div className="relative flex flex-col items-center gap-8">
          {/* Icono de advertencia con animación */}
          <div className="flex items-center justify-center w-20 h-20 bg-red-800 rounded-full shadow-lg animate-pulse">
            <AlertTriangle size={40} className="text-white" />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">
              ⚠️ Advertencia de Seguridad
            </h3>
            <p className="text-xl font-semibold text-white drop-shadow">
              {warningMessage}
            </p>
            <p className="text-base text-red-100 leading-relaxed">
              Esta acción no está permitida por razones de seguridad del sitio. 
              Por favor, respeta las políticas de seguridad establecidas.
            </p>
          </div>
          
          <button
            onClick={() => setShowWarning(false)}
            className="px-8 py-4 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            aria-label="Cerrar advertencia de seguridad"
          >
            <X size={24} />
            Entendido
          </button>
          
          {/* Texto de ayuda */}
          <p className="text-xs text-red-200 mt-4">
            Presiona ESC o haz clic fuera para cerrar
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityWarning; 