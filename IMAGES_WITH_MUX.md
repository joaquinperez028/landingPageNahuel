# 📸 Sistema de Imágenes con Mux

## 🎯 Resumen

Se ha implementado un sistema completo para subir y gestionar imágenes en los informes usando **Mux**, aprovechando el servicio que ya tienes contratado. Esto evita costos adicionales de servicios como Cloudinary.

## ✨ Funcionalidades Implementadas

### 1. **Subida de Imágenes**
- ✅ Solo administradores pueden subir imágenes
- ✅ Integración completa con Mux
- ✅ Validación de tipos de archivo (JPG, PNG, GIF, WEBP)
- ✅ Límite de tamaño: 10MB por imagen
- ✅ Optimización automática de URLs

### 2. **Tipos de Imágenes**
- **Imagen de Portada**: Una imagen principal para cada informe
- **Imágenes Adicionales**: Hasta 5 imágenes con descripciones

### 3. **Interfaz de Usuario**
- ✅ Componente drag & drop para subir imágenes
- ✅ Vista previa de imágenes subidas
- ✅ Campos de descripción para cada imagen
- ✅ Indicadores de progreso y manejo de errores

## 🔧 Configuración

### Variables de Entorno Requeridas
Asegúrate de tener configuradas estas variables en tu `.env.local`:

```env
MUX_TOKEN_ID=tu_token_id_de_mux
MUX_TOKEN_SECRET=tu_token_secret_de_mux
```

### Estructura de Archivos Creados

```
📁 lib/
  └── mux.ts                      # Funciones para manejar imágenes y videos con Mux

📁 pages/api/
  └── upload/
      └── image.ts                # API para subir imágenes

📁 components/
  └── ImageUploader.tsx           # Componente React para subir imágenes

📁 models/
  └── Report.ts                   # Modelo actualizado con campos de imágenes
```

## 🚀 Cómo Usar

### Para Administradores

1. **Crear un Informe con Imágenes**:
   - Ve a cualquier sección (Trader Call, Smart Money, Cash Flow)
   - Haz clic en "Crear Informe"
   - Sube una imagen de portada (opcional)
   - Agrega contenido del informe
   - Sube imágenes adicionales con descripciones
   - Guarda el informe

2. **Tipos de Imágenes Permitidos**:
   - ✅ JPG/JPEG
   - ✅ PNG  
   - ✅ GIF
   - ✅ WEBP
   - ❌ Otros formatos

### Para Usuarios Suscriptores

- ✅ Pueden ver todas las imágenes en los informes
- ✅ Las imágenes se cargan optimizadas desde Mux
- ✅ Responsive en todos los dispositivos

## 🔒 Seguridad y Permisos

### Restricciones Implementadas

```typescript
// Solo administradores pueden subir imágenes
if (user.role !== 'admin') {
  return res.status(403).json({ 
    error: 'Solo los administradores pueden subir imágenes.' 
  });
}
```

### Validaciones de Archivos

```typescript
// Validación de tipo y tamaño
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const maxSize = 10 * 1024 * 1024; // 10MB
```

## 📊 Estructura de Datos

### Modelo Report Actualizado

```typescript
interface IReport {
  // ... campos existentes ...
  imageUrl?: string;              // URL de imagen de portada
  imageMuxId?: string;           // Asset ID de Mux para portada
  images?: Array<{               // Array de imágenes adicionales
    assetId: string;
    url: string;
    caption?: string;
    order: number;
  }>;
}
```

### Flujo de Subida

```
Usuario selecciona imagen
       ↓
Validación en frontend
       ↓
Subida a /api/upload/image
       ↓
Validación de permisos
       ↓
Subida a Mux
       ↓
Retorna Asset ID y URL
       ↓
Se guarda en el informe
```

## 🎨 URLs de Imágenes Optimizadas

Las imágenes se sirven optimizadas usando el formato:

```
https://image.mux.com/{assetId}/thumbnail.jpg?width=800&height=600&fit_mode=crop&time=0
```

### Parámetros de Optimización
- **width**: Ancho de la imagen
- **height**: Alto de la imagen  
- **fit_mode**: `crop`, `preserve`, `fill`
- **time**: Frame para videos (0 para imágenes)

## 🛠️ APIs Disponibles

### POST `/api/upload/image`
Sube una imagen a Mux

**Permisos**: Solo administradores
**Content-Type**: `multipart/form-data`
**Campo**: `image`

**Respuesta**:
```json
{
  "success": true,
  "message": "Imagen subida exitosamente a Mux",
  "imageUrl": "https://image.mux.com/asset_id/thumbnail.jpg...",
  "assetId": "mux_asset_id"
}
```

### POST `/api/reports/create`
Crea un informe con imágenes

**Ejemplo**:
```json
{
  "title": "Análisis de Mercado",
  "content": "Contenido del informe...",
  "imageMuxId": "asset_id_portada",
  "images": [
    {
      "assetId": "asset_id_1",
      "caption": "Gráfico de tendencia",
      "order": 0
    }
  ]
}
```

## 🔍 Componente ImageUploader

### Propiedades

```typescript
interface ImageUploaderProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;           // Máximo de imágenes (default: 5)
  allowCaptions?: boolean;      // Permitir descripciones (default: true)
  className?: string;
}
```

### Uso

```tsx
<ImageUploader
  onImagesChange={handleImagesChange}
  maxImages={5}
  allowCaptions={true}
  className="my-uploader"
/>
```

## 💡 Beneficios

1. **Sin Costos Adicionales**: Usa Mux que ya tienes contratado
2. **Optimización Automática**: URLs optimizadas para diferentes tamaños
3. **CDN Global**: Entrega rápida worldwide via Mux
4. **Seguridad**: Solo administradores pueden subir
5. **UX Mejorada**: Drag & drop, previews, progreso

## 🚨 Consideraciones

1. **Límites de Mux**: Verifica los límites de tu plan de Mux
2. **Backup**: Considera hacer backup de los Asset IDs
3. **Eliminación**: Los assets en Mux se deben eliminar manualmente si es necesario

## 🎯 Próximos Pasos

Cuando quieras expandir las funcionalidades:

1. **Editor Visual**: Implementar un editor WYSIWYG que maneje imágenes
2. **Galerías**: Crear galerías de imágenes en los informes
3. **Redimensionado**: Diferentes tamaños según el contexto
4. **Watermarks**: Agregar marca de agua automáticamente

---

## ✅ Estado de Implementación

- ✅ Configuración de Mux para imágenes
- ✅ API de subida de imágenes  
- ✅ Componente ImageUploader
- ✅ Integración en modal de crear informe
- ✅ Modelo de datos actualizado
- ✅ Validaciones de seguridad
- ✅ Build exitoso sin errores

**¡El sistema está listo para usar!** 🚀 