# Sistema de Video de Fondo

## Descripción General

Se ha implementado un sistema completo de video de fondo para la página de Consultorio Financiero. El sistema incluye:

- **Componente BackgroundVideo**: Componente reutilizable para videos de fondo
- **Integración en Consultorio Financiero**: Video de fondo en la sección hero
- **Estilos responsivos**: Adaptación automática a diferentes dispositivos
- **Controles opcionales**: Botones de play/pause y mute cuando se necesiten

## Componentes Implementados

### 1. BackgroundVideo.tsx

**Ubicación:** `components/BackgroundVideo.tsx`

**Características:**
- Reproducción automática en loop
- Mute automático por defecto
- Controles opcionales (play/pause, mute)
- Fallback a imagen poster si el video no carga
- Optimizado para dispositivos móviles
- Z-index configurado para no interferir con el contenido

**Props disponibles:**
```typescript
interface BackgroundVideoProps {
  videoSrc: string;           // Ruta al archivo de video
  posterSrc?: string;         // Imagen de respaldo
  className?: string;         // Clase CSS personalizada
  autoPlay?: boolean;         // Reproducción automática (default: true)
  muted?: boolean;            // Silenciado (default: true)
  loop?: boolean;             // Reproducción en loop (default: true)
  showControls?: boolean;     // Mostrar controles (default: false)
}
```

### 2. Integración en Consultorio Financiero

**Ubicación:** `pages/asesorias/consultorio-financiero.tsx`

**Implementación:**
```tsx
<BackgroundVideo 
  videoSrc="/videos/Diseño Web-LozanoNahuel-Asesorías-ConsultorioFinanciero.mp4"
  posterSrc="/images/trading-office.jpg"
  autoPlay={true}
  muted={true}
  loop={true}
  showControls={false}
  className={styles.backgroundVideo}
/>
```

## Estructura de Archivos

```
public/
├── videos/
│   ├── README.md                           # Instrucciones de uso
│   └── Diseño Web-LozanoNahuel-Asesorías-ConsultorioFinanciero.mp4      # Video principal (requerido)
├── images/
│   └── trading-office.jpg                  # Imagen de respaldo
└── components/
    ├── BackgroundVideo.tsx                 # Componente principal
    └── BackgroundVideo.example.tsx         # Ejemplos de uso
```

## Cómo Agregar el Video

### Paso 1: Preparar el Video
1. **Formato:** MP4
2. **Resolución:** 1920x1080 (Full HD) o superior
3. **Duración:** 10-30 segundos (se reproduce en loop)
4. **Tamaño:** Máximo 10MB para optimizar la carga
5. **Contenido:** Video relacionado con finanzas, trading, oficinas corporativas

### Paso 2: Colocar el Archivo
```bash
# Copiar el video al directorio correcto
cp tu-video.mp4 "public/videos/Diseño Web-LozanoNahuel-Asesorías-ConsultorioFinanciero.mp4"
```

### Paso 3: Verificar la Implementación
El video se reproducirá automáticamente como fondo de la sección hero.

## Estilos CSS

### Estilos Principales
```css
.heroSection {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  overflow: hidden;
}

.backgroundVideo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.heroOverlay {
  z-index: 1;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.25) 100%);
}

.heroContent {
  z-index: 3;
  /* resto de estilos... */
}
```

### Responsive Design
```css
@media (max-width: 768px) {
  .heroSection {
    min-height: 80vh;
    padding: 1rem 0;
  }
  
  .heroContent {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .heroSection {
    min-height: 70vh;
  }
}
```

## Uso en Otras Páginas

### Ejemplo Básico
```tsx
import BackgroundVideo from '@/components/BackgroundVideo';

export const MiPagina: React.FC = () => {
  return (
    <section className="hero-section">
      <BackgroundVideo 
        videoSrc="/videos/mi-video.mp4"
        posterSrc="/images/mi-imagen.jpg"
        autoPlay={true}
        muted={true}
        loop={true}
        showControls={false}
      />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Mi Título</h1>
        <p>Mi contenido...</p>
      </div>
    </section>
  );
};
```

### Ejemplo con Controles
```tsx
<BackgroundVideo 
  videoSrc="/videos/presentacion.mp4"
  posterSrc="/images/poster.jpg"
  autoPlay={false}
  muted={false}
  loop={true}
  showControls={true}
/>
```

## Optimizaciones Implementadas

### 1. Rendimiento
- **Lazy Loading:** El video se carga solo cuando es necesario
- **Compresión:** Recomendación de máximo 10MB
- **Formato MP4:** Compatible con todos los navegadores modernos

### 2. Accesibilidad
- **Controles de teclado:** Navegación por tab
- **Screen readers:** Labels descriptivos para controles
- **Fallback:** Imagen de respaldo si el video falla

### 3. Mobile-First
- **Responsive:** Se adapta a diferentes tamaños de pantalla
- **Touch-friendly:** Controles optimizados para dispositivos táctiles
- **Batería:** Reproducción automática deshabilitada en móviles si es necesario

## Troubleshooting

### Problema: Video no se reproduce
**Solución:**
1. Verificar que el archivo existe en `public/videos/`
2. Verificar que el nombre del archivo coincide exactamente
3. Verificar que el formato es MP4
4. Revisar la consola del navegador para errores

### Problema: Video se superpone al contenido
**Solución:**
1. Verificar que los z-index están configurados correctamente
2. El video debe tener `z-index: 0`
3. El overlay debe tener `z-index: 1`
4. El contenido debe tener `z-index: 3`

### Problema: Video no es responsivo
**Solución:**
1. Verificar que el CSS incluye `object-fit: cover`
2. Verificar que el contenedor tiene `overflow: hidden`
3. Verificar que los media queries están implementados

## Próximas Mejoras

### 1. Lazy Loading Inteligente
- Cargar video solo cuando esté en viewport
- Diferentes calidades según el dispositivo

### 2. WebM Support
- Agregar soporte para formato WebM (más eficiente)
- Fallback automático a MP4

### 3. Controles Avanzados
- Barra de progreso
- Velocidad de reproducción
- Pantalla completa

### 4. Analytics
- Tracking de reproducción
- Métricas de engagement
- A/B testing de diferentes videos

## Conclusión

El sistema de video de fondo está completamente implementado y listo para usar. Proporciona una experiencia visual atractiva mientras mantiene el rendimiento y la accesibilidad. El componente es reutilizable y puede implementarse fácilmente en otras páginas del sitio.

Para cualquier pregunta o problema, revisar la documentación del componente y los ejemplos proporcionados. 