# Sistema de Fechas de Asesoría

## Descripción

Este sistema permite gestionar fechas específicas de asesorías de manera similar al sistema de entrenamientos, pero manteniendo la integración con el sistema de reservas existente.

## Componentes del Sistema

### 1. Modelo de Datos

**Archivo:** `models/AdvisoryDate.ts`

```typescript
interface IAdvisoryDate {
  advisoryType: string; // 'ConsultorioFinanciero'
  date: Date; // Fecha específica de la asesoría
  time: string; // Hora en formato HH:MM
  title: string; // Título de la asesoría
  description?: string; // Descripción opcional
  isActive: boolean; // Si la fecha está activa
  isBooked: boolean; // Si ya fue reservado por un usuario
  createdBy: string; // Email del admin que creó la fecha
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. API Endpoints

#### GET `/api/advisory-dates/[advisoryType]`
- **Descripción:** Obtener fechas de asesoría activas
- **Parámetros:** `advisoryType` (ej: 'ConsultorioFinanciero')
- **Respuesta:** Lista de fechas ordenadas por fecha

#### POST `/api/advisory-dates/[advisoryType]`
- **Descripción:** Crear nueva fecha de asesoría (solo admin)
- **Body:** `{ date, time, title, description? }`
- **Respuesta:** Fecha creada

#### PUT `/api/advisory-dates/[advisoryType]`
- **Descripción:** Actualizar fecha de asesoría (solo admin)
- **Body:** `{ id, date, time, title, description? }`
- **Respuesta:** Fecha actualizada

#### DELETE `/api/advisory-dates/[advisoryType]`
- **Descripción:** Eliminar fecha de asesoría (solo admin)
- **Body:** `{ id }`
- **Respuesta:** Confirmación de eliminación

#### POST `/api/advisory-dates/[advisoryType]/book`
- **Descripción:** Marcar fecha como reservada
- **Body:** `{ advisoryDateId }`
- **Respuesta:** Fecha marcada como reservada

### 3. Páginas de Administración

#### `/admin/asesorias-fechas`
- **Descripción:** Gestión de fechas específicas de asesoría
- **Funcionalidades:**
  - Crear fechas individuales con título y descripción
  - Editar fechas existentes
  - Eliminar fechas (solo si no están reservadas)
  - Ver estado de reservas
  - Ordenar por fecha

### 4. Integración con Frontend

#### Página de Consultorio Financiero
- **Archivo:** `pages/asesorias/consultorio-financiero.tsx`
- **Cambios principales:**
  - Carga fechas desde `/api/advisory-dates/ConsultorioFinanciero`
  - Muestra fechas en `ClassCalendar` con formato idéntico a entrenamientos
  - Al seleccionar fecha, muestra detalles completos
  - Al reservar, marca la fecha como reservada automáticamente

## Diferencias con el Sistema Anterior

### Sistema Anterior (AdvisorySchedule)
- Creación por rangos de fechas
- Múltiples horarios por día
- Sin títulos personalizados
- Sistema de `AvailableSlot` para visualización

### Sistema Nuevo (AdvisoryDate)
- Creación de fechas individuales
- Un horario por fecha
- Títulos y descripciones personalizados
- Carga directa desde el modelo
- Integración con sistema de reservas existente

## Migración

### Script de Migración
**Archivo:** `scripts/migrate-advisory-dates.js`

```bash
node scripts/migrate-advisory-dates.js
```

Este script:
1. Lee todas las fechas disponibles de `AdvisorySchedule`
2. Crea fechas equivalentes en `AdvisoryDate`
3. Evita duplicados
4. Mantiene el estado de reservas

### Proceso de Migración
1. Ejecutar script de migración
2. Verificar fechas creadas en `/admin/asesorias-fechas`
3. Probar reservas en la página de consultorio
4. Mantener sistema anterior como respaldo

## Uso

### Para Administradores

1. **Crear Fechas:**
   - Ir a `/admin/asesorias-fechas`
   - Click en "Nueva Fecha"
   - Completar fecha, hora, título y descripción
   - Guardar

2. **Gestionar Fechas:**
   - Ver todas las fechas en la lista
   - Editar fechas no reservadas
   - Eliminar fechas no reservadas
   - Ver estado de reservas

### Para Usuarios

1. **Ver Fechas Disponibles:**
   - Ir a `/asesorias/consultorio-financiero`
   - Ver calendario con fechas disponibles
   - Seleccionar fecha de interés

2. **Reservar:**
   - Seleccionar fecha en el calendario
   - Ver detalles de la asesoría
   - Completar formulario
   - Confirmar reserva

## Ventajas del Nuevo Sistema

1. **Flexibilidad:** Fechas individuales con títulos personalizados
2. **Consistencia:** Mismo formato que entrenamientos
3. **Integración:** Mantiene sistema de reservas existente
4. **Escalabilidad:** Fácil agregar nuevos tipos de asesoría
5. **Control:** Mejor gestión de fechas específicas

## Mantenimiento

### Índices de Base de Datos
El modelo incluye índices optimizados:
- `{ advisoryType: 1, date: 1 }`
- `{ advisoryType: 1, isActive: 1 }`
- `{ advisoryType: 1, isBooked: 1 }`
- `{ date: 1, time: 1 }` (único)

### Validaciones
- Formato de hora: HH:MM
- Fechas futuras obligatorias
- Títulos requeridos
- Unicidad de fecha+hora

## Troubleshooting

### Problemas Comunes

1. **Fechas no aparecen en calendario:**
   - Verificar que `isActive: true`
   - Verificar que la fecha sea futura
   - Revisar logs de carga

2. **Error al reservar:**
   - Verificar que la fecha no esté ya reservada
   - Revisar logs de la API
   - Verificar permisos de usuario

3. **Fechas duplicadas:**
   - Ejecutar script de limpieza de índices
   - Verificar índice único de fecha+hora

### Logs Útiles
- `📅 Cargando fechas específicas de asesoría...`
- `✅ Fechas de asesoría cargadas: X`
- `🎯 Fecha de asesoría encontrada:`
- `✅ Fecha marcada como reservada exitosamente`
