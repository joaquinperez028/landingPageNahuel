import React, { useState } from 'react';
import { CheckCircle, Circle, Play, Clock, Book, Target } from 'lucide-react';
import styles from './TrainingRoadmap.module.css';

interface RoadmapModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  topics: string[];
  completed?: boolean;
  locked?: boolean;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  prerequisite?: number;
}

interface TrainingRoadmapProps {
  modules: RoadmapModule[];
  currentModule?: number;
  onModuleClick?: (moduleId: number) => void;
  showProgress?: boolean;
  completedModules?: number[];
}

const TrainingRoadmap: React.FC<TrainingRoadmapProps> = ({
  modules,
  currentModule = 1,
  onModuleClick,
  showProgress = true,
  completedModules = []
}) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const toggleModule = (moduleId: number) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico':
        return '#10b981';
      case 'Intermedio':
        return '#f59e0b';
      case 'Avanzado':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCompletionPercentage = () => {
    if (!showProgress) return 0;
    return Math.round((completedModules.length / modules.length) * 100);
  };

  const isModuleAccessible = (module: RoadmapModule) => {
    if (!module.prerequisite) return true;
    return completedModules.includes(module.prerequisite);
  };

  const getModuleStatus = (module: RoadmapModule) => {
    if (completedModules.includes(module.id)) return 'completed';
    if (module.id === currentModule) return 'current';
    if (!isModuleAccessible(module)) return 'locked';
    return 'available';
  };

  return (
    <div className={styles.roadmapContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Roadmap de Aprendizaje</h2>
        <p className={styles.description}>
          Progresión estructurada en {modules.length} módulos diseñados para llevarte 
          de principiante a trader avanzado
        </p>
        
        {showProgress && (
          <div className={styles.progressSection}>
            <div className={styles.progressInfo}>
              <span className={styles.progressLabel}>Progreso general:</span>
              <span className={styles.progressText}>
                {completedModules.length}/{modules.length} módulos completados
              </span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
            <span className={styles.progressPercentage}>
              {getCompletionPercentage()}%
            </span>
          </div>
        )}
      </div>

      <div className={styles.modulesList}>
        {modules.map((module, index) => {
          const status = getModuleStatus(module);
          const isExpanded = expandedModule === module.id;
          
          return (
            <div 
              key={module.id} 
              className={`${styles.moduleCard} ${styles[status]}`}
            >
              <div 
                className={styles.moduleHeader}
                onClick={() => toggleModule(module.id)}
              >
                <div className={styles.moduleLeft}>
                  <div className={styles.moduleIcon}>
                    {status === 'completed' && (
                      <CheckCircle size={24} className={styles.completedIcon} />
                    )}
                    {status === 'current' && (
                      <Play size={24} className={styles.currentIcon} />
                    )}
                    {status === 'locked' && (
                      <Circle size={24} className={styles.lockedIcon} />
                    )}
                    {status === 'available' && (
                      <Circle size={24} className={styles.availableIcon} />
                    )}
                  </div>
                  
                  <div className={styles.moduleInfo}>
                    <div className={styles.moduleTitleRow}>
                      <h3 className={styles.moduleTitle}>
                        Módulo {module.id}: {module.title}
                      </h3>
                      <span 
                        className={styles.difficultyBadge}
                        style={{ backgroundColor: getDifficultyColor(module.difficulty) }}
                      >
                        {module.difficulty}
                      </span>
                    </div>
                    <p className={styles.moduleDescription}>
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className={styles.moduleRight}>
                  <div className={styles.moduleStats}>
                    <div className={styles.statItem}>
                      <Clock size={16} />
                      <span>{module.duration}</span>
                    </div>
                    <div className={styles.statItem}>
                      <Book size={16} />
                      <span>{module.lessons} lecciones</span>
                    </div>
                  </div>
                  
                  <div className={styles.expandIcon}>
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.moduleContent}>
                  <div className={styles.topicsSection}>
                    <h4 className={styles.topicsTitle}>
                      <Target size={18} />
                      Temas a cubrir:
                    </h4>
                    <div className={styles.topicsList}>
                      {module.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className={styles.topicItem}>
                          <span className={styles.topicBullet}>•</span>
                          <span className={styles.topicText}>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {module.prerequisite && (
                    <div className={styles.prerequisiteSection}>
                      <p className={styles.prerequisiteText}>
                        <strong>Prerequisito:</strong> Completar Módulo {module.prerequisite}
                      </p>
                    </div>
                  )}

                  <div className={styles.moduleActions}>
                    {status === 'completed' && (
                      <button 
                        className={`${styles.actionButton} ${styles.completedButton}`}
                        onClick={() => onModuleClick?.(module.id)}
                      >
                        <CheckCircle size={16} />
                        Completado - Revisar
                      </button>
                    )}
                    
                    {status === 'current' && (
                      <button 
                        className={`${styles.actionButton} ${styles.currentButton}`}
                        onClick={() => onModuleClick?.(module.id)}
                      >
                        <Play size={16} />
                        Continuar Módulo
                      </button>
                    )}
                    
                    {status === 'available' && (
                      <button 
                        className={`${styles.actionButton} ${styles.availableButton}`}
                        onClick={() => onModuleClick?.(module.id)}
                      >
                        <Play size={16} />
                        Comenzar Módulo
                      </button>
                    )}
                    
                    {status === 'locked' && (
                      <button 
                        className={`${styles.actionButton} ${styles.lockedButton}`}
                        disabled
                      >
                        <Circle size={16} />
                        Bloqueado
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <CheckCircle size={16} className={styles.completedIcon} />
            <span>Completado</span>
          </div>
          <div className={styles.legendItem}>
            <Play size={16} className={styles.currentIcon} />
            <span>En Progreso</span>
          </div>
          <div className={styles.legendItem}>
            <Circle size={16} className={styles.availableIcon} />
            <span>Disponible</span>
          </div>
          <div className={styles.legendItem}>
            <Circle size={16} className={styles.lockedIcon} />
            <span>Bloqueado</span>
          </div>
        </div>
        
        <div className={styles.footerStats}>
          <p className={styles.statsText}>
            Total: {modules.reduce((acc, module) => acc + module.lessons, 0)} lecciones • {' '}
            {modules.reduce((acc, module) => {
              const hours = parseInt(module.duration.split(' ')[0]);
              return acc + (isNaN(hours) ? 0 : hours);
            }, 0)} horas de contenido
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainingRoadmap; 