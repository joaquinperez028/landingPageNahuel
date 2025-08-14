# 🔗 Automatización de Google Meet - Nahuel Lozano Trading

## 📋 Descripción

Este documento explica el sistema de automatización de Google Meet implementado para las reservas de entrenamientos y asesorías. El sistema crea automáticamente links de Google Meet al momento de crear una reserva y los incluye en todos los emails de confirmación.

## ✅ Funcionalidades Implementadas

### 🔄 Creación Automática de Google Meet
- **Al crear reservas**: Se genera automáticamente un Google Meet al confirmar una reserva
- **Integración con Calendar**: El evento se crea en Google Calendar del administrador con el link de Meet
- **Base de datos**: Se guarda el link en el campo `meetingLink` de la reserva

### 📧 Emails Automáticos con Links
- **Confirmación al cliente**: Email con link de Meet incluido automáticamente
- **Notificación al admin**: Email con link de Meet y estado de la automatización
- **Plantillas actualizadas**: Todas las plantillas de email incluyen sección de Google Meet

### 🛠️ Panel de Administración
- **Gestión manual**: Interfaz para crear/actualizar links de Meet manualmente
- **Reservas pendientes**: Vista de reservas que no tienen link de Meet
- **Actualización en tiempo real**: Los cambios se reflejan inmediatamente

## 🚀 Cómo Funciona

### 1. Creación de Reserva
```typescript
// Al crear una reserva, automáticamente:
1. Se crea el evento en Google Calendar
2. Se genera el Google Meet automáticamente
3. Se guarda el link en la base de datos
4. Se envían emails con el link incluido
```

### 2. Flujo de Emails
```typescript
// Emails enviados automáticamente:
- Cliente: Recibe confirmación con link de Meet
- Admin: Recibe notificación con link de Meet
- Calendar: Evento actualizado con link de Meet
```

### 3. Gestión Manual
```typescript
// Panel de administración:
- Ver reservas sin Meet
- Crear Meet automáticamente
- Ingresar link manual
- Actualizar emails automáticamente
```

## 🔧 Configuración Requerida

### Variables de Entorno en Vercel

Agrega estas variables en tu panel de Vercel:

```bash
# Google Calendar API (Requeridas)
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
ADMIN_GOOGLE_ACCESS_TOKEN=tu_access_token
ADMIN_GOOGLE_REFRESH_TOKEN=tu_refresh_token
GOOGLE_CALENDAR_ID=primary
GOOGLE_CALENDAR_TIMEZONE=America/Montevideo

# Email (Requeridas)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion
ADMIN_EMAIL=admin@lozanonahuel.com
```

### Permisos de Google Calendar API

1. **Habilitar APIs**:
   - Google Calendar API
   - Google Meet API (para creación automática)

2. **Configurar OAuth**:
   - Scope: `https://www.googleapis.com/auth/calendar`
   - Tipo: Aplicación web
   - URIs autorizados: Tu dominio de Vercel

## 📁 Archivos Modificados/Creados

### Nuevos Archivos
- `pages/api/bookings/update-meet-link.ts` - API para actualizar links de Meet
- `components/GoogleMeetManager.tsx` - Componente de gestión de Meet
- `GOOGLE_MEET_AUTOMATION.md` - Este documento

### Archivos Modificados
- `lib/googleCalendar.ts` - Agregada creación automática de Meet
- `lib/emailService.ts` - Plantillas actualizadas con links de Meet
- `lib/emailNotifications.ts` - Interfaces actualizadas
- `pages/api/bookings/index.ts` - Integración con creación automática
- `models/Booking.ts` - Ya tenía campo `meetingLink`

## 🎯 Uso del Sistema

### Para Usuarios
1. **Reservar entrenamiento/asesoría**
2. **Recibir email automático** con link de Meet
3. **Unirse a la reunión** 5 minutos antes del horario

### Para Administradores
1. **Ver panel de gestión** en `/admin`
2. **Crear Meet automáticamente** para reservas pendientes
3. **Recibir notificaciones** con links de Meet incluidos
4. **Gestionar manualmente** si es necesario

### Para Desarrolladores
1. **Configurar variables** de entorno en Vercel
2. **Verificar permisos** de Google Calendar API
3. **Probar creación** de reservas
4. **Monitorear logs** en Vercel Functions

## 🔍 Monitoreo y Debugging

### Logs Importantes
```bash
# Creación de Meet
🔗 Creando Google Meet automáticamente...
✅ Google Meet creado exitosamente: https://meet.google.com/...

# Emails
📧 Enviando email de confirmación con link de Meet...
✅ Emails enviados exitosamente

# Calendar
✅ Evento creado con Google Meet: https://meet.google.com/...
```

### Errores Comunes
1. **Tokens expirados**: Renovar `ADMIN_GOOGLE_ACCESS_TOKEN`
2. **Permisos insuficientes**: Verificar scopes de Google Calendar API
3. **Email no configurado**: Verificar `ADMIN_EMAIL` en variables de entorno

## 🚨 Consideraciones de Seguridad

### Tokens de Google
- **Nunca exponer** tokens en el frontend
- **Usar variables** de entorno del servidor
- **Renovar tokens** periódicamente

### Links de Meet
- **Validar URLs** antes de guardar
- **Sanitizar inputs** en el panel de admin
- **Logs seguros** sin exponer información sensible

## 📈 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **Recordatorios automáticos** 24h antes con link de Meet
- [ ] **Integración con Zoom** como alternativa
- [ ] **Métricas de uso** de Google Meet
- [ ] **Notificaciones push** para recordatorios
- [ ] **Grabación automática** de sesiones

### Optimizaciones Técnicas
- [ ] **Cache de links** para evitar recreación
- [ ] **Retry automático** en caso de fallos
- [ ] **Webhooks** para actualizaciones en tiempo real
- [ ] **Analytics** de uso de Meet

## 📞 Soporte

Si necesitas ayuda con la configuración:

1. **Verificar variables** de entorno en Vercel
2. **Revisar logs** en Vercel Functions
3. **Probar creación** de reservas manualmente
4. **Contactar soporte** si persisten los problemas

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Estado**: ✅ Implementado y funcionando 