# 📧 Sistema de Email Unificado - Nahuel Lozano Trading

## Descripción

Este documento explica el sistema unificado de envío de emails para todas las funcionalidades de la plataforma de Nahuel Lozano Trading, incluyendo notificaciones de alertas, confirmaciones de reservas, emails masivos y formularios de contacto.

## ✅ Centralización Completada

El sistema ha sido **completamente unificado** en `lib/emailService.ts`, reemplazando y consolidando:
- ✅ `lib/smtp.ts` (eliminado)
- ✅ `lib/emailNotifications.ts` (actualizado para usar el sistema unificado)
- ✅ APIs de contacto, notificaciones, envío masivo y meeting links
- ✅ Sistema automático de notificaciones de alertas

## Variables de Entorno en Vercel

Agrega las siguientes variables en tu panel de Vercel:

### 🔧 Configuración SMTP (Requeridas)

1. Ve a tu proyecto en Vercel
2. Accede a **Settings** > **Environment Variables**
3. Agrega las siguientes variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion
```

### 📧 Configuración del Remitente (Opcionales)

```
EMAIL_FROM_NAME=Nahuel Lozano Trading
EMAIL_FROM_ADDRESS=noreply@lozanonahuel.com
```

> **Importante**: Después de agregar las variables, redeploy tu aplicación en Vercel para que los cambios tomen efecto.

## Funcionalidades del Sistema Unificado

### 🔔 Notificaciones Automáticas de Alertas

- **Cuándo se envían**: Automáticamente cuando se crea una alerta (TraderCall, SmartMoney, CashFlow)
- **A quién se envían**: Solo a usuarios suscritos al tipo específico de alerta
- **Qué incluyen**: Detalles de la alerta, botón de acción, información del símbolo
- **Plantillas**: Sistema de plantillas dinámicas con variables {variable}

### 📅 Confirmaciones de Reservas

- **Entrenamientos**: Email automático al confirmar entrenamiento
- **Asesorías**: Email automático al confirmar asesoría
- **Admin**: Notificación al admin sobre nuevas reservas
- **Meeting Links**: Envío de links de reunión con información completa

### 📧 Emails Masivos

- **Tipos**: General, promocional, alertas, newsletter
- **Destinatarios**: Todos los usuarios, suscriptores, admins, o lista personalizada
- **Plantillas**: Sistema de plantillas especializadas por tipo

### 📬 Formulario de Contacto

- **Email al admin**: Con información completa del contacto
- **Email al usuario**: Confirmación automática de recepción
- **Respuesta rápida**: Botón directo para responder al cliente

## Configuración por Proveedores

### 📧 Gmail (Recomendado para desarrollo)

**Variables en Vercel:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion_gmail
```

**Pasos para configurar Gmail:**
1. Activa la autenticación en 2 pasos en tu cuenta Google
2. Ve a **Gestión de la cuenta Google** > **Seguridad** > **Contraseñas de aplicaciones**
3. Crea una contraseña de aplicación específica para "Mail"
4. Usa esa contraseña (16 caracteres) en la variable `SMTP_PASS`

### 📧 SendGrid (Recomendado para producción)

**Variables en Vercel:**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu_sendgrid_api_key
```

### 📧 Mailgun (Alternativa profesional)

**Variables en Vercel:**
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tu-dominio.mailgun.org
SMTP_PASS=tu_mailgun_smtp_password
```

## APIs Actualizadas

### ✅ Sistema Completamente Migrado

Todos los siguientes endpoints ahora usan el sistema unificado:

- `POST /api/contact` - Formulario de contacto
- `POST /api/admin/email/bulk` - Emails masivos
- `POST /api/admin/send-meeting-link` - Links de reunión
- `POST /api/notifications/send` - Notificaciones manuales
- `POST /api/alerts/create` - Notificaciones automáticas de alertas

### 🔄 Funciones Centralizadas

El archivo `lib/emailService.ts` incluye:

```typescript
// Funciones principales
sendEmail(options: EmailOptions)
sendBulkEmails(options: BulkEmailOptions)
verifyEmailConfiguration()
getEmailServiceStatus()

// Plantillas unificadas
createEmailTemplate(options)
generateAlertEmailTemplate(notification, user)
createTrainingConfirmationTemplate(userEmail, userName, details)
createAdvisoryConfirmationTemplate(userEmail, userName, details)
createAdminNotificationTemplate(bookingDetails)
createWelcomeEmailTemplate(options)
createPromotionalEmailTemplate(options)
```

## Filtrado por Suscripciones

El sistema respeta automáticamente las suscripciones de los usuarios:
- **alertas_trader**: Recibe emails de alertas TraderCall
- **alertas_smart**: Recibe emails de alertas SmartMoney  
- **alertas_cashflow**: Recibe emails de alertas CashFlow
- **notificaciones_sistema**: Recibe notificaciones del sistema
- **notificaciones_promociones**: Recibe emails promocionales
- **notificaciones_actualizaciones**: Recibe updates del sistema

## Modo Simulación

Si las variables de entorno no están configuradas en Vercel:
- El sistema funciona en modo simulación
- Los emails aparecen en los logs de la consola de Vercel
- No se envían emails reales
- La funcionalidad de notificaciones web sigue funcionando

## Plantillas Profesionales

Todas las plantillas incluyen:
- **Header**: Branding con gradientes profesionales
- **Saludo personalizado**: Usando el nombre del usuario
- **Contenido estructurado**: Con secciones y call-to-actions
- **Footer**: Links a perfil y configuración
- **Responsive**: Funciona en móviles y desktop
- **Accesibilidad**: Colores y contrastes apropiados

## Monitoreo y Logs

Los logs del servidor mostrarán:
- ✅ Emails enviados exitosamente
- ❌ Errores de envío detallados
- 📧 Usuarios que tienen emails desactivados
- 🔔 Creación de notificaciones automáticas
- 📊 Estadísticas de envío masivo

Para ver los logs en Vercel:
1. Ve a tu proyecto en Vercel
2. Accede a **Functions** > **View Function Logs**
3. Filtra por las funciones API que manejan emails

## Métricas y Analytics

El sistema proporciona métricas detalladas:
- Emails enviados por tipo
- Tasas de éxito/fallo
- Usuarios suscritos por categoría
- Actividad de notificaciones en tiempo real

## Troubleshooting

### 🔍 Variables no reconocidas

- Verifica que las variables estén configuradas en Vercel
- Asegúrate de haber redeployado después de agregar las variables
- Verifica que las variables estén disponibles en el environment correcto

### 🔍 Error: "Authentication failed"

- Gmail: Usa contraseña de aplicación, no tu contraseña normal
- Verifica que la cuenta de Gmail tenga 2FA activado
- SendGrid: Verifica que tu API Key tenga permisos de envío

### 🔍 Emails no llegan

- Verifica la bandeja de spam
- Confirma que el usuario esté suscrito al tipo de email
- Revisa que el usuario tenga emails activados en preferencias
- Verifica los logs de Vercel para errores de envío

## Próximos Pasos Recomendados

1. **Configurar dominio personalizado** para emails profesionales
2. **Implementar tracking** de apertura de emails
3. **Agregar unsubscribe** directo desde el email
4. **Integrar con servicios de analytics** de email
5. **Implementar rate limiting** avanzado para prevenir spam

## Ventajas del Sistema Unificado

✅ **Centralización**: Todo el sistema de emails en un solo lugar
✅ **Consistencia**: Todas las plantillas siguen el mismo diseño
✅ **Mantenibilidad**: Cambios se reflejan en toda la plataforma
✅ **Escalabilidad**: Fácil agregar nuevos tipos de emails
✅ **Configuración**: Una sola configuración SMTP para todo
✅ **Monitoreo**: Logs unificados y métricas centralizadas
✅ **Performance**: Optimizado para envío masivo y individual
✅ **Flexibilidad**: Soporte para múltiples proveedores SMTP

El sistema está completamente operativo y listo para producción. 🚀 