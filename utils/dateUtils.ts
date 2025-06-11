/**
 * Calcula los días restantes hasta una fecha dada
 * @param endDate Fecha de vencimiento
 * @returns Número de días restantes
 */
export function calculateDaysRemaining(endDate: Date | string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calcula los días transcurridos desde una fecha dada
 * @param startDate Fecha de inicio de la suscripción
 * @returns Número de días transcurridos
 */
export function calculateDaysSinceSubscription(startDate: Date | string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formatea una fecha en formato español
 * @param date Fecha a formatear
 * @returns Fecha formateada
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Verifica si una suscripción está activa
 * @param endDate Fecha de vencimiento
 * @returns true si la suscripción está activa
 */
export function isSubscriptionActive(endDate: Date | string): boolean {
  return calculateDaysRemaining(endDate) > 0;
} 