# 🎬 Sistema de Configuración Completa de Videos

## 📋 Descripción General

El sistema de configuración de videos permite gestionar fácilmente **todos los videos de YouTube** que se muestran en el sitio web desde una sola interfaz. Actualmente soporta **5 tipos de videos**:

### 🎯 Videos Soportados

1. **Video Principal (Hero Section)**
   - Ubicación: Página principal, sección hero
   - Configuración por defecto: Autoplay ✅, Muted ✅, Loop ✅
   - Uso: Video de presentación de la empresa

2. **Video de Aprendizaje**
   - Ubicación: Sección "Aprende a invertir desde cero"
   - Configuración por defecto: Autoplay ❌, Muted ✅, Loop ❌
   - Uso: Video promocional de cursos

3. **Video de Alertas**
   - Ubicación: Sección de servicios - Alertas
   - Configuración por defecto: Autoplay ❌, Muted ✅, Loop ❌
   - Uso: Video promocional de alertas de trading

4. **Video de Entrenamientos**
   - Ubicación: Sección de servicios - Entrenamientos
   - Configuración por defecto: Autoplay ❌, Muted ✅, Loop ❌
   - Uso: Video promocional de entrenamientos

5. **Video de Asesorías**
   - Ubicación: Sección de servicios - Asesorías
   - Configuración por defecto: Autoplay ❌, Muted ✅, Loop ❌
   - Uso: Video promocional de asesorías

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **🎛️ Gestión Centralizada**: Interfaz unificada para todos los videos
- **🔍 Búsqueda y Filtrado**: Encuentra videos rápidamente por categoría
- **📱 Vista Adaptativa**: Modo grid y lista para diferentes pantallas
- **👁️ Vista Previa en Tiempo Real**: Ve el video antes de guardar
- **⚙️ Configuración Avanzada**: Autoplay, muted, loop para cada video
- **📋 Acciones Rápidas**: Probar, copiar ID, copiar URL
- **🔄 Script de Línea de Comandos**: Configuraciones masivas y rápidas
- **✅ Validación Inteligente**: Soporta múltiples formatos de YouTube
- **🎨 Interfaz Moderna**: Diseño responsive con animaciones suaves
- **📊 Estado Visual**: Indicadores de configuración por video

### 🎯 Videos Soportados

1. **Video Principal (Hero)**
   - Ubicación: Página principal, sección hero
   - Configuración por defecto: Autoplay ✅, Muted ✅, Loop ✅
   - Uso: Video de presentación de la empresa

2. **Video de Aprendizaje**
   - Ubicación: Sección "Aprende a invertir desde cero"
   - Configuración por defecto: Autoplay ❌, Muted ✅, Loop ❌
   - Uso: Video promocional de cursos

## 🛠️ Cómo Usar

### 1. Desde el Panel de Administración

1. **Acceder al panel**: Ve a `/admin/dashboard` e inicia sesión como administrador
2. **Ir a Configuración de Videos**: Haz clic en "Configuración de Videos"
3. **Configurar video**:
   - Pega la URL de YouTube en el campo correspondiente
   - Ajusta título y descripción
   - Configura opciones (autoplay, muted, loop)
   - Ve la vista previa en tiempo real
4. **Guardar**: Haz clic en "Guardar Configuración"

### 2. Desde Línea de Comandos

```bash
# Ver configuración actual
node scripts/test-video-config.js get

# Configurar videos individuales
node scripts/test-video-config.js set-hero https://www.youtube.com/watch?v=TU_VIDEO_ID
node scripts/test-video-config.js set-learning https://youtu.be/TU_VIDEO_ID
node scripts/test-video-config.js set-alertas https://www.youtube.com/watch?v=TU_VIDEO_ID
node scripts/test-video-config.js set-entrenamientos https://youtu.be/TU_VIDEO_ID
node scripts/test-video-config.js set-asesorias https://www.youtube.com/watch?v=TU_VIDEO_ID

# Configurar todos los videos con la misma URL
node scripts/test-video-config.js set-all https://www.youtube.com/watch?v=TU_VIDEO_ID

# Restablecer configuración por defecto
node scripts/test-video-config.js reset

# Probar configuración
node scripts/test-video-config.js test
```

### 3. URLs Soportadas

El sistema acepta múltiples formatos de URLs de YouTube:

```
✅ https://www.youtube.com/watch?v=dQw4w9WgXcQ
✅ https://youtu.be/dQw4w9WgXcQ
✅ https://www.youtube.com/embed/dQw4w9WgXcQ
✅ dQw4w9WgXcQ (solo el ID)
```

## 📁 Estructura de Archivos

```
📁 pages/admin/
  └── video-config.tsx          # Página de configuración web

📁 scripts/
  └── test-video-config.js      # Script de línea de comandos

📁 styles/
  └── Admin.module.css          # Estilos para la interfaz

📁 models/
  └── SiteConfig.ts             # Modelo de base de datos

📁 pages/api/
  └── site-config.ts            # API para guardar configuración
```

## 🗄️ Estructura de Base de Datos

### Modelo SiteConfig

```typescript
interface SiteConfig {
  heroVideo: {
    youtubeId: string;
    title: string;
    description: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  };
  learningVideo: {
    youtubeId: string;
    title: string;
    description: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  };
  // ... otros campos
}
```

## 🎨 Interfaz de Usuario

### Características de la UI

- **Diseño responsive**: Funciona en desktop y móvil
- **Vista previa en tiempo real**: Ve el video antes de guardar
- **Validación visual**: Indicadores de estado
- **Animaciones suaves**: Transiciones con Framer Motion
- **Feedback inmediato**: Notificaciones de éxito/error

### Secciones de la Interfaz

1. **🎛️ Controles de Filtrado**
   - Barra de búsqueda por título/descripción
   - Filtro por categoría (Principal, Servicios, Aprendizaje)
   - Modo de vista (Grid/Lista)

2. **📋 Lista de Videos**
   - Tarjetas con información de cada video
   - Indicadores visuales de estado (configurado/no configurado)
   - Acciones rápidas (probar, copiar ID, copiar URL)
   - Selección para editar

3. **⚙️ Panel de Configuración**
   - Formulario completo para el video seleccionado
   - Vista previa en tiempo real
   - Configuración de opciones (autoplay, muted, loop)
   - Información detallada del video

4. **🚀 Acciones Globales**
   - Guardar todos los cambios
   - Ver sitio web
   - Volver al admin

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas

```env
MONGODB_URI=mongodb://localhost:27017/tu_base_de_datos
NEXTAUTH_URL=http://localhost:3000
```

### Dependencias

```json
{
  "framer-motion": "^10.0.0",
  "lucide-react": "^0.263.0",
  "react-hot-toast": "^2.4.0"
}
```

## 🧪 Testing

### Pruebas Manuales

1. **Configurar video principal**:
   ```bash
   node scripts/test-video-config.js set-hero https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

2. **Verificar en el sitio**:
   - Ve a la página principal
   - Verifica que el video se muestre correctamente
   - Prueba las opciones (autoplay, muted, loop)

3. **Probar desde admin panel**:
   - Accede a `/admin/video-config`
   - Cambia la URL del video
   - Verifica la vista previa
   - Guarda y verifica en el sitio

### Casos de Prueba

- ✅ URL completa de YouTube
- ✅ URL corta de YouTube
- ✅ Solo ID del video
- ✅ URLs inválidas (debe mostrar error)
- ✅ Configuración de opciones (autoplay, muted, loop)
- ✅ Vista previa en tiempo real
- ✅ Guardado exitoso
- ✅ Persistencia en base de datos
- ✅ Búsqueda y filtrado por categoría
- ✅ Modo de vista grid/lista
- ✅ Acciones rápidas (probar, copiar)
- ✅ Configuración masiva desde línea de comandos
- ✅ Restablecimiento de configuración por defecto

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Video no se muestra**
   - Verifica que el ID de YouTube sea correcto
   - Asegúrate de que el video sea público
   - Revisa la consola del navegador para errores

2. **Error al guardar**
   - Verifica la conexión a MongoDB
   - Revisa los logs del servidor
   - Asegúrate de tener permisos de administrador

3. **Vista previa no funciona**
   - Verifica que el iframe tenga permisos
   - Revisa las políticas de seguridad del navegador
   - Prueba con un video diferente

### Logs de Debug

```bash
# Ver logs del servidor
npm run dev

# Ver configuración actual
node scripts/test-video-config.js get

# Probar conexión a MongoDB
node scripts/test-video-config.js test
```

## 🔄 Flujo de Trabajo

### Para Administradores

1. **Obtener URL del video** de YouTube
2. **Acceder al dashboard** de administración (`/admin/dashboard`)
3. **Ir a Configuración de Videos**
4. **Pegar la URL** en el campo correspondiente
5. **Ajustar configuración** (título, descripción, opciones)
6. **Ver vista previa** para confirmar
7. **Guardar configuración**
8. **Verificar en el sitio** web

### Para Desarrolladores

1. **Modificar configuración** desde línea de comandos
2. **Probar cambios** localmente
3. **Subir a producción** con `npm run build`
4. **Verificar funcionamiento** en producción

## 📈 Mejoras Futuras

### Funcionalidades Planificadas

- [ ] **🎬 Galería de Videos**: Múltiples videos por sección
- [ ] **👤 Videos Personalizados**: Diferentes videos según el usuario
- [ ] **📊 Analytics de Videos**: Métricas de reproducción y engagement
- [ ] **⚡ Optimización Automática**: Compresión y formatos optimizados
- [ ] **💾 Backup de Configuración**: Exportar/importar configuraciones
- [ ] **🔔 Notificaciones Inteligentes**: Alertas cuando videos no están disponibles
- [ ] **🎨 Temas de Video**: Diferentes estilos visuales para los reproductores
- [ ] **📱 A/B Testing**: Probar diferentes videos para optimizar conversión
- [ ] **🌐 Videos Multilingües**: Soporte para diferentes idiomas
- [ ] **📈 Métricas Avanzadas**: Tiempo de visualización, clics, etc.

### Optimizaciones Técnicas

- [ ] **Caché de configuración**: Reducir consultas a la base de datos
- [ ] **Validación de videos**: Verificar que videos existan
- [ ] **Lazy loading**: Cargar videos solo cuando sean visibles
- [ ] **CDN para videos**: Mejorar velocidad de carga

## 📞 Soporte

### Contacto

- **Desarrollador**: Nahuel Lozano
- **Email**: [tu-email@ejemplo.com]
- **Documentación**: Este archivo

### Recursos Adicionales

- [Documentación de YouTube API](https://developers.google.com/youtube)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0 