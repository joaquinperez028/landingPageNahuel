// Interfaces para la estructura antigua (más flexible)
interface OldRoadmapModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  topics: string[];
  completed?: boolean;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  prerequisite?: number;
}

// Interfaces para la nueva estructura
interface NewRoadmapTopic {
  titulo: string;
  descripcion?: string;
}

interface NewRoadmapModule {
  id: number;
  titulo: string;
  descripcion: string;
  duracion: string;
  lecciones: number;
  temas: NewRoadmapTopic[];
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
  prerequisito?: number;
  orden: number;
  activo: boolean;
}

/**
 * Convierte roadmap de la estructura antigua a la nueva
 */
export function convertToNewRoadmapStructure(oldModules: any[]): NewRoadmapModule[] {
  return oldModules.map((oldModule, index) => ({
    id: oldModule.id,
    titulo: oldModule.title,
    descripcion: oldModule.description,
    duracion: oldModule.duration,
    lecciones: oldModule.lessons,
    temas: oldModule.topics.map((topic: string) => ({
      titulo: topic,
      descripcion: undefined
    })),
    dificultad: oldModule.difficulty,
    prerequisito: oldModule.prerequisite,
    orden: index + 1,
    activo: true
  }));
} 