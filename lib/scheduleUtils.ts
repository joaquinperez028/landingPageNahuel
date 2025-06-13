/**
 * Utilidades para gestión de horarios y validación de conflictos
 */

export interface ScheduleSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: 'asesoria' | 'entrenamiento';
  title?: string;
}

/**
 * Convierte una hora en formato HH:MM a minutos desde medianoche
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convierte minutos desde medianoche a formato HH:MM
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calcula la duración en minutos entre dos horas
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Si endTime es menor que startTime, asumimos que cruza medianoche
  if (endMinutes < startMinutes) {
    return (24 * 60) - startMinutes + endMinutes;
  }
  
  return endMinutes - startMinutes;
}

/**
 * Verifica si dos horarios tienen conflicto considerando período de gracia
 */
export function hasScheduleConflict(
  newSchedule: ScheduleSlot,
  existingSchedule: ScheduleSlot,
  graceMinutes: number = 30
): boolean {
  // Solo verificar conflictos en el mismo día
  if (newSchedule.dayOfWeek !== existingSchedule.dayOfWeek) {
    return false;
  }

  const newStart = timeToMinutes(newSchedule.startTime);
  const newEnd = timeToMinutes(newSchedule.endTime);
  
  const existingStart = timeToMinutes(existingSchedule.startTime);
  const existingEnd = timeToMinutes(existingSchedule.endTime);

  // Agregar período de gracia al horario existente
  const existingEndWithGrace = existingEnd + graceMinutes;
  const existingStartWithGrace = existingStart - graceMinutes;

  // Verificar si hay solapamiento
  const hasOverlap = (
    (newStart >= existingStartWithGrace && newStart < existingEndWithGrace) ||
    (newEnd > existingStartWithGrace && newEnd <= existingEndWithGrace) ||
    (newStart <= existingStartWithGrace && newEnd >= existingEndWithGrace)
  );

  return hasOverlap;
}

/**
 * Encuentra todos los conflictos para un nuevo horario
 */
export function findScheduleConflicts(
  newSchedule: ScheduleSlot,
  existingSchedules: ScheduleSlot[],
  graceMinutes: number = 30
): ScheduleSlot[] {
  return existingSchedules.filter(existing => 
    hasScheduleConflict(newSchedule, existing, graceMinutes)
  );
}

/**
 * Genera sugerencias de horarios disponibles
 */
export function suggestAvailableSlots(
  dayOfWeek: number,
  duration: number,
  existingSchedules: ScheduleSlot[],
  graceMinutes: number = 30,
  startHour: number = 8,
  endHour: number = 20
): string[] {
  const suggestions: string[] = [];
  const daySchedules = existingSchedules.filter(s => s.dayOfWeek === dayOfWeek);
  
  // Generar slots cada 30 minutos
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endMinutes = timeToMinutes(startTime) + duration;
      
      // Verificar que no exceda el horario de trabajo
      if (endMinutes > timeToMinutes(`${endHour}:00`)) {
        continue;
      }
      
      const endTime = minutesToTime(endMinutes);
      
      const testSchedule: ScheduleSlot = {
        dayOfWeek,
        startTime,
        endTime,
        type: 'asesoria' // Tipo genérico para la prueba
      };
      
      // Verificar si hay conflictos
      const conflicts = findScheduleConflicts(testSchedule, daySchedules, graceMinutes);
      
      if (conflicts.length === 0) {
        suggestions.push(startTime);
      }
    }
  }
  
  return suggestions;
}

/**
 * Valida si un horario propuesto es válido
 */
export function validateScheduleSlot(
  newSchedule: ScheduleSlot,
  existingSchedules: ScheduleSlot[],
  graceMinutes: number = 30
): {
  isValid: boolean;
  conflicts: ScheduleSlot[];
  suggestions: string[];
  message: string;
} {
  const conflicts = findScheduleConflicts(newSchedule, existingSchedules, graceMinutes);
  const duration = calculateDuration(newSchedule.startTime, newSchedule.endTime);
  
  if (conflicts.length === 0) {
    return {
      isValid: true,
      conflicts: [],
      suggestions: [],
      message: 'Horario disponible'
    };
  }
  
  const suggestions = suggestAvailableSlots(
    newSchedule.dayOfWeek,
    duration,
    existingSchedules,
    graceMinutes
  );
  
  const conflictDetails = conflicts.map(c => 
    `${c.title || c.type} (${c.startTime} - ${c.endTime})`
  ).join(', ');
  
  return {
    isValid: false,
    conflicts,
    suggestions: suggestions.slice(0, 5), // Mostrar solo las primeras 5 sugerencias
    message: `Conflicto con: ${conflictDetails}. Período de gracia: ${graceMinutes} minutos.`
  };
} 