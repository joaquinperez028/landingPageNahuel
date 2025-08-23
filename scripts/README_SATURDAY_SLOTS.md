# 🗓️ Scripts para Generar Turnos de Sábados

Este directorio contiene scripts para generar automáticamente todos los turnos de asesorías para los sábados desde septiembre 2025 hasta 2027.

## 📋 Archivos Disponibles

### 1. `generate-saturday-slots.js` - Script Completo
- **Período**: Septiembre 2025 - Diciembre 2027
- **Días**: Todos los sábados
- **Horarios**: 10:00, 11:00, 12:00, 13:00, 14:00
- **Total estimado**: ~130+ sábados × 5 horarios = 650+ turnos

### 2. `generate-test-saturday-slots.js` - Script de Prueba
- **Período**: Septiembre 2025 - Octubre 2025
- **Días**: Solo sábados de estos 2 meses
- **Horarios**: 10:00, 11:00, 12:00, 13:00, 14:00
- **Total estimado**: ~8-9 sábados × 5 horarios = 40-45 turnos

## 🚀 Cómo Usar

### Opción 1: Prueba Primero (Recomendado)
```bash
# Generar solo algunos sábados para probar
node scripts/generate-test-saturday-slots.js
```

### Opción 2: Generar Todos los Sábados
```bash
# Generar TODOS los sábados hasta 2027
node scripts/generate-saturday-slots.js
```

## ⚙️ Configuración

### Variables Modificables en los Scripts:
```javascript
const START_YEAR = 2025;        // Año de inicio
const START_MONTH = 8;          // Mes de inicio (0-indexed: 8 = septiembre)
const END_YEAR = 2027;          // Año de fin
const START_HOUR = 10;          // Hora de inicio (10:00)
const END_HOUR = 15;            // Hora de fin (15:00 = hasta 14:00)
```

### Horarios Generados:
- **10:00** - 10:00 a 11:00
- **11:00** - 11:00 a 12:00  
- **12:00** - 12:00 a 13:00
- **13:00** - 13:00 a 14:00
- **14:00** - 14:00 a 15:00

## 📊 Qué Hace Cada Script

### 1. Genera Fechas de Sábados
- Calcula automáticamente todos los sábados en el rango especificado
- Salta automáticamente a la siguiente semana

### 2. Crea en AdvisorySchedule
- Modelo interno para administración
- Fecha como objeto Date
- Estado disponible y no reservado

### 3. Crea en AvailableSlot  
- Modelo público para reservas
- Fecha en formato DD/MM/YYYY
- Precio: $50,000 ARS
- Duración: 60 minutos
- Tipo: ConsultorioFinanciero

### 4. Evita Duplicados
- Verifica si ya existe antes de crear
- Salta turnos existentes automáticamente

## 🔍 Verificación

### Después de Ejecutar:
1. **Admin Panel**: Ve a `/admin/asesorias-horarios`
2. **Verifica**: Que aparezcan los sábados generados
3. **Consultorio**: Ve a `/asesorias/consultorio-financiero`
4. **Confirma**: Que los turnos aparezcan disponibles

### Logs del Script:
- Muestra cada sábado procesado
- Confirma cada turno creado
- Resumen final con totales
- Ejemplos de fechas generadas

## ⚠️ Consideraciones

### Antes de Ejecutar:
- ✅ Asegúrate de tener MongoDB corriendo
- ✅ Verifica que las variables de entorno estén configuradas
- ✅ Haz backup de la base de datos si es necesario

### Después de Ejecutar:
- 🔄 Los turnos aparecerán inmediatamente en el admin
- 🔄 Los turnos estarán disponibles para reservas
- 🔄 Puedes modificar/eliminar turnos individuales desde el admin

## 🛠️ Personalización

### Cambiar Horarios:
```javascript
const START_HOUR = 9;   // Empezar a las 9:00
const END_HOUR = 18;    // Terminar a las 18:00 (hasta 17:00)
```

### Cambiar Días:
```javascript
const SATURDAY = 6;     // 6 = sábado
// 0 = domingo, 1 = lunes, ..., 6 = sábado
```

### Cambiar Período:
```javascript
const START_YEAR = 2024;    // Empezar en 2024
const START_MONTH = 11;     // Empezar en diciembre (11)
const END_YEAR = 2026;      // Terminar en 2026
```

## 📝 Ejemplo de Salida

```
🚀 Iniciando generación de turnos de sábados...
📅 Período: Septiembre 2025 - Diciembre 2027
⏰ Horarios: 10:00, 11:00, 12:00, 13:00, 14:00
✅ Conectado a MongoDB
📅 Generando fechas de sábados...
📅 Encontrados 135 sábados en el rango

📅 Procesando sábado: 6/9/2025
  ✅ 10:00 - Creado en AdvisorySchedule (ID: 64f8a1b2c3d4e5f6a7b8c9d0)
  ✅ 10:00 - Creado en AvailableSlot (ID: 64f8a1b2c3d4e5f6a7b8c9d1)
  ✅ 11:00 - Creado en AdvisorySchedule (ID: 64f8a1b2c3d4e5f6a7b8c9d2)
  ✅ 11:00 - Creado en AvailableSlot (ID: 64f8a1b2c3d4e5f6a7b8c9d3)
  ...

🎉 Generación completada!
📊 Resumen:
   - Total de sábados: 135
   - Horarios por sábado: 5
   - Total de turnos creados: 675
   - Total de errores: 0
   - Turnos por sábado: 10:00, 11:00, 12:00, 13:00, 14:00
```

## 🆘 Solución de Problemas

### Error de Conexión:
```bash
# Verifica que MongoDB esté corriendo
# Verifica las variables de entorno
# Asegúrate de estar en el directorio correcto
```

### Error de Permisos:
```bash
# Verifica que tengas acceso de escritura a la base de datos
# Verifica que el usuario tenga permisos de admin
```

### Turnos No Aparecen:
```bash
# Ejecuta el script de sincronización desde el admin
# Verifica los logs del script para errores
# Confirma que se crearon en ambas colecciones
```

---

**💡 Recomendación**: Siempre ejecuta primero el script de prueba para verificar que todo funciona correctamente antes de generar todos los turnos. 