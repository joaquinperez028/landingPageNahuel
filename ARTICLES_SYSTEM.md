# 📚 Sistema de Artículos para Informes

## 🎯 Descripción General

El sistema de artículos permite dividir informes largos en secciones más manejables y organizadas. Cada informe puede contener hasta **10 artículos**, cada uno con su propio título, contenido y orden de visualización.

## ✨ Características Principales

### 🔧 **Para Administradores**
- **Crear artículos**: Agregar hasta 10 artículos por informe
- **Gestionar orden**: Asignar orden de visualización (1-10)
- **Control de publicación**: Publicar o mantener como borrador
- **Edición**: Modificar título, contenido y estado
- **Eliminación**: Remover artículos con reordenamiento automático

### 👥 **Para Usuarios**
- **Navegación intuitiva**: Navegar entre artículos con botones anterior/siguiente
- **Lista desplegable**: Vista rápida de todos los artículos disponibles
- **Sidebar interactivo**: Lista de artículos siempre visible
- **Tiempo de lectura**: Información de duración por artículo y total

## 🏗️ Estructura Técnica

### **Modelo de Datos (MongoDB)**
```typescript
interface Article {
  _id: string;
  title: string;           // Título del artículo
  content: string;         // Contenido HTML del artículo
  order: number;           // Orden de visualización (1-10)
  isPublished: boolean;    // Estado de publicación
  readTime: number;        // Tiempo de lectura estimado
  createdAt: Date;         // Fecha de creación
}

interface Report {
  // ... campos existentes
  articles: Article[];     // Array de artículos
}
```

### **Endpoints API**
- `POST /api/admin/reports/[id]/articles` - Crear nuevo artículo
- `GET /api/admin/reports/[id]/articles` - Obtener artículos del informe
- `PUT /api/admin/reports/[id]/articles` - Actualizar artículo existente
- `DELETE /api/admin/reports/[id]/articles` - Eliminar artículo

## 🚀 Cómo Usar el Sistema

### **1. Crear Artículos (Admin)**

1. **Acceder a la gestión de informes**:
   - Ir a `/admin/reports`
   - Hacer clic en "📚 Gestionar Artículos" en el informe deseado

2. **Agregar nuevo artículo**:
   - Completar título del artículo
   - Escribir contenido (soporta HTML)
   - Asignar orden (1-10)
   - Decidir si publicar inmediatamente

3. **Gestionar artículos existentes**:
   - Ver lista de artículos creados
   - Eliminar artículos no deseados
   - Ver tiempo de lectura calculado automáticamente

### **2. Visualizar Artículos (Usuarios)**

1. **Navegación principal**:
   - Botones "Anterior" y "Siguiente" para moverse entre artículos
   - Contador de posición actual (ej: "Artículo 2 de 5")

2. **Lista desplegable**:
   - Botón "📚 Lista de Artículos" para mostrar/ocultar
   - Vista rápida de todos los artículos con títulos y tiempos

3. **Sidebar derecho**:
   - Lista siempre visible de artículos
   - Artículo activo resaltado
   - Navegación rápida por clic

## 🎨 Interfaz de Usuario

### **Panel de Administración**
```
┌─────────────────────────────────────────────────────────┐
│ 📚 Gestionar Artículos: [Título del Informe]          │
├─────────────────────────────────────────────────────────┤
│ ➕ Agregar Nuevo Artículo                              │
│ ├─ Título del Artículo *                               │
│ ├─ Orden * (1-10)                                     │
│ ├─ Contenido del Artículo *                            │
│ └─ ☑️ Publicar inmediatamente                         │
├─────────────────────────────────────────────────────────┤
│ 📋 Artículos Existentes (3)                           │
│ ├─ Artículo 1: Introducción [Publicado] [Eliminar]    │
│ ├─ Artículo 2: Análisis Técnico [Publicado] [Eliminar]│
│ └─ Artículo 3: Conclusiones [Borrador] [Eliminar]     │
└─────────────────────────────────────────────────────────┘
```

### **Vista de Usuario**
```
┌─────────────────────────────────────────────────────────┐
│ 📚 Artículos del Informe                               │
│ [📋 Lista de Artículos]                               │
├─────────────────────────────────────────────────────────┤
│ [← Anterior] Artículo 2 de 5 [Siguiente →]           │
├─────────────────────────────────────────────────────────┤
│ Artículo 2: Análisis Técnico                          │
│ [Contenido del artículo...]                           │
│ Tiempo de lectura: 3 min | Publicado: 15/12/2024      │
└─────────────────────────────────────────────────────────┘
```

## 🔒 Validaciones y Seguridad

### **Límites del Sistema**
- **Máximo 10 artículos** por informe
- **Orden único** (no puede haber dos artículos con el mismo orden)
- **Contenido requerido** para título y cuerpo
- **Solo administradores** pueden gestionar artículos

### **Validaciones Automáticas**
- **Tiempo de lectura**: Calculado automáticamente (1 min por 1000 caracteres)
- **Reordenamiento**: Al eliminar artículos, se reordenan automáticamente
- **Integridad**: Verificación de que el informe existe antes de modificar

## 📱 Responsividad

### **Desktop (>1024px)**
- Layout de dos columnas (contenido + sidebar)
- Navegación horizontal entre artículos
- Lista de artículos siempre visible en sidebar

### **Tablet (768px - 1024px)**
- Layout de una columna
- Sidebar se mueve arriba del contenido
- Navegación adaptada para pantallas medianas

### **Mobile (<768px)**
- Navegación vertical entre artículos
- Lista desplegable optimizada para touch
- Botones de navegación apilados verticalmente

## 🎯 Casos de Uso

### **Informes Largos de Análisis**
- **Artículo 1**: Resumen ejecutivo
- **Artículo 2**: Contexto del mercado
- **Artículo 3**: Análisis técnico
- **Artículo 4**: Recomendaciones
- **Artículo 5**: Conclusiones

### **Series de Contenido**
- **Artículo 1**: Introducción al tema
- **Artículo 2**: Conceptos básicos
- **Artículo 3**: Aplicaciones prácticas
- **Artículo 4**: Casos de estudio
- **Artículo 5**: Próximos pasos

### **Contenido Educativo**
- **Artículo 1**: Teoría
- **Artículo 2**: Ejemplos
- **Artículo 3**: Ejercicios
- **Artículo 4**: Soluciones
- **Artículo 5**: Recursos adicionales

## 🚀 Beneficios del Sistema

### **Para Administradores**
- ✅ **Mejor organización** del contenido largo
- ✅ **Control granular** sobre la publicación
- ✅ **Facilidad de edición** por secciones
- ✅ **Reutilización** de contenido existente

### **Para Usuarios**
- ✅ **Lectura más cómoda** en secciones manejables
- ✅ **Navegación intuitiva** entre partes del informe
- ✅ **Mejor experiencia** en dispositivos móviles
- ✅ **Control del progreso** de lectura

### **Para el Sistema**
- ✅ **Mejor rendimiento** al cargar contenido por partes
- ✅ **SEO mejorado** con contenido estructurado
- ✅ **Analytics granular** por sección del informe
- ✅ **Escalabilidad** para informes de cualquier tamaño

## 🔧 Mantenimiento y Monitoreo

### **Métricas Recomendadas**
- **Artículos más leídos** por informe
- **Tiempo de lectura promedio** por artículo
- **Tasa de abandono** entre artículos
- **Navegación más común** (secuencial vs. aleatoria)

### **Tareas de Mantenimiento**
- **Revisar artículos** con bajo engagement
- **Optimizar contenido** de artículos largos
- **Reordenar artículos** según feedback de usuarios
- **Limpiar artículos** obsoletos o duplicados

## 📚 Próximas Mejoras

### **Funcionalidades Planificadas**
- 🔄 **Draft automático** de artículos en progreso
- 📊 **Analytics avanzados** por artículo
- 🔗 **Enlaces internos** entre artículos
- 📱 **Notificaciones push** para nuevos artículos
- 🎨 **Temas personalizables** por artículo

### **Integraciones Futuras**
- 📧 **Newsletter automático** con artículos destacados
- 🔍 **Búsqueda avanzada** dentro de artículos
- 📚 **Biblioteca de artículos** reutilizables
- 🤖 **IA para sugerir** orden de artículos

---

## 📞 Soporte

Para dudas o problemas con el sistema de artículos:
- **Documentación técnica**: Revisar este archivo
- **Problemas de API**: Verificar logs del servidor
- **Errores de UI**: Revisar consola del navegador
- **Sugerencias**: Crear issue en el repositorio

---

*Sistema desarrollado para mejorar la experiencia de lectura de informes largos y complejos.* 