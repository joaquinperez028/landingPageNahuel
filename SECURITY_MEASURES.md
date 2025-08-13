# Medidas de Seguridad Implementadas

## Resumen
Se han implementado medidas de seguridad para proteger el contenido del sitio web, especialmente los informes y las imágenes, contra descargas no autorizadas y filtraciones.

## Medidas Implementadas

### 1. Protección de Informes por Rol de Usuario

#### Para Usuarios Normales:
- **Sin botones de descarga**: Los usuarios normales no pueden descargar informes
- **Sin botones de compartir**: Los usuarios normales no pueden compartir informes
- **Acceso de solo lectura**: Solo pueden ver el contenido en el navegador

#### Para Administradores:
- **Botones de descarga**: Pueden descargar informes como archivos HTML
- **Botones de compartir**: Pueden compartir enlaces a informes
- **Acceso completo**: Control total sobre el contenido

### 2. Protección Global del Sitio

#### Click Derecho Deshabilitado:
- Se previene el menú contextual en todo el sitio
- Protege contra "Guardar imagen como..."
- Protege contra "Ver código fuente"

#### Combinaciones de Teclas Bloqueadas:
- `Ctrl + S` (Guardar página)
- `Ctrl + P` (Imprimir)
- `F12` (Herramientas de desarrollador)
- `Ctrl + U` (Ver código fuente)
- `Ctrl + Shift + I` (Inspector)
- `Ctrl + Shift + C` (Inspector de elementos)
- `Ctrl + F5` / `Ctrl + R` (Recargar)

#### Protección de Imágenes:
- **Arrastrar deshabilitado**: No se pueden arrastrar imágenes
- **Selección deshabilitada**: No se puede seleccionar contenido
- **Eventos de mouse bloqueados**: Click derecho y arrastrar
- **CSS de protección**: `user-select: none`, `pointer-events: none`

### 3. Componentes de Seguridad

#### `SecurityProtection` (Global):
- Hook personalizado que aplica todas las protecciones
- Se ejecuta en `_app.tsx` para cubrir todo el sitio
- Observador de mutaciones para proteger contenido dinámico

#### `SecurityWarning`:
- Muestra advertencias cuando se detectan intentos de violación
- Mensajes específicos según el tipo de acción bloqueada
- Aparece en la esquina superior derecha

#### `useSecurityProtection` Hook:
- Protección centralizada y reutilizable
- Observador de DOM para contenido dinámico
- Limpieza automática de event listeners

### 4. Protección CSS Global

#### Estilos Aplicados:
```css
img {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}
```

#### Clases de Protección:
- `.content-protected`: Para contenido específico que necesita protección
- `.interactive`: Para imágenes que necesitan interacción (excepción)

### 5. Protección en Páginas Específicas

#### Páginas de Informes (`/reports/[id]`):
- Verificación de rol de usuario en `getServerSideProps`
- Botones de acción solo para administradores
- Protección de imágenes de portada y galería

#### Páginas de Alertas:
- Protección de imágenes en tarjetas de informes
- Event handlers específicos para cada imagen
- Estilos inline de protección

#### Sistema de Notificaciones:
- **Página de Notificaciones (`/notificaciones`)**: Verificación de rol para enlaces a informes
- **NotificationDropdown**: Protección de enlaces a informes en el dropdown
- **API de Rol**: Endpoint `/api/users/role` para verificar permisos
- **Enlaces Seguros**: Función `handleReportLink` que bloquea acceso a informes para usuarios normales

## Archivos Modificados

### Componentes Principales:
- `pages/_app.tsx` - Protección global
- `pages/reports/[id].tsx` - Protección de informes
- `pages/alertas/trader-call.tsx` - Protección de imágenes
- `pages/alertas/smart-money-new.tsx` - Protección de imágenes
- `pages/notificaciones.tsx` - Protección de enlaces a informes
- `components/NotificationDropdown.tsx` - Protección de enlaces a informes

### Hooks y Utilidades:
- `hooks/useSecurityProtection.ts` - Hook principal de seguridad
- `components/SecurityWarning.tsx` - Componente de advertencias

### APIs:
- `pages/api/users/role.ts` - API para verificar rol de usuario

### Estilos:
- `styles/globals.css` - Protección CSS global
- `styles/ReportView.module.css` - Estilos para botones de admin

## Consideraciones Técnicas

### Limitaciones:
- Las protecciones son del lado del cliente
- Usuarios técnicamente avanzados pueden eludirlas
- No reemplaza la seguridad del servidor

### Mejores Prácticas:
- Protección en capas (cliente + servidor)
- Logs de intentos de violación
- Monitoreo continuo

### Mantenimiento:
- Revisar regularmente las protecciones
- Actualizar según nuevas amenazas
- Probar en diferentes navegadores

## Uso para Administradores

### Para Habilitar Descarga/Compartir:
1. Verificar que el usuario tenga rol `admin`
2. Los botones aparecen automáticamente
3. Funcionalidad integrada en la interfaz

### Para Deshabilitar Protecciones (Desarrollo):
1. Comentar el componente `SecurityProtection` en `_app.tsx`
2. Remover estilos de protección en `globals.css`
3. Restaurar para producción

## Monitoreo y Logs

### Eventos Registrados:
- Intentos de click derecho
- Combinaciones de teclas bloqueadas
- Intentos de arrastrar elementos

### Ubicación de Logs:
- Console del navegador (desarrollo)
- Logs del servidor (producción)
- Componente `SecurityWarning` (visual)

## Próximas Mejoras

### Sugeridas:
- Watermarking de imágenes
- Protección de capturas de pantalla
- Rate limiting para intentos de violación
- Notificaciones al admin sobre intentos sospechosos
- Protección contra herramientas de desarrollador más avanzadas 