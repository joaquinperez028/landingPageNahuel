import { useLoginTracker } from '@/hooks/useLoginTracker';

/**
 * Componente que trackea y actualiza el último login del usuario
 * Se debe incluir en _app.tsx para que funcione globalmente
 */
export default function LoginTracker() {
  useLoginTracker();
  
  // Este componente no renderiza nada, solo ejecuta el hook
  return null;
} 