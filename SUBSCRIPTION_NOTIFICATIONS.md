# 📧 Sistema de Notificaciones de Suscripciones

## 🎯 Descripción

Este sistema envía notificaciones automáticas por email a los usuarios cuando sus suscripciones están por vencer o han expirado.

## ⚙️ Configuración

### 1. Variables de Entorno

Agregar en `env.example` y configurar en Vercel:

```bash
# Cron Jobs (Optional - for automated subscription notifications)
CRON_SECRET_TOKEN=your_cron_secret_token_here
```

### 2. Configuración de Email

Asegúrate de que las variables de email estén configuradas:

```bash
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password
```

## 🔄 Funcionamiento

### Notificaciones Automáticas

El sistema envía dos tipos de notificaciones:

1. **⚠️ Advertencia (1 día antes)**
   - Se envía cuando la suscripción vence en 1 día
   - Incluye información sobre el servicio y días restantes
   - Botón para renovar suscripción

2. **❌ Notificación de Expiración**
   - Se envía el día que expira la suscripción
   - Informa que el acceso ha sido revocado
   - Botón para renovar y recuperar acceso

### Prevención de Duplicados

- El sistema verifica que no se envíen notificaciones duplicadas
- Solo envía una notificación por tipo por suscripción por día
- Registra todas las notificaciones enviadas en la base de datos

## 🛠️ Uso Manual

### Desde el Admin Panel

1. Ir a `/admin/subscriptions`
2. En la sección "📧 Notificaciones de Suscripciones":
   - **Procesar Notificaciones**: Ejecuta el envío de notificaciones pendientes
   - **Limpiar Antiguas**: Elimina notificaciones de más de 30 días

### API Endpoints

#### Procesar Notificaciones
```bash
POST /api/admin/subscription-notifications
Content-Type: application/json

{
  "action": "process"
}
```

#### Limpiar Notificaciones Antiguas
```bash
POST /api/admin/subscription-notifications
Content-Type: application/json

{
  "action": "cleanup"
}
```

#### Obtener Notificaciones Pendientes
```bash
GET /api/admin/subscription-notifications
```

## 🤖 Automatización con Cron Jobs

### Configuración en Vercel

1. **Crear un cron job** que ejecute cada hora:

```bash
# URL del endpoint
https://lozanonahuel.vercel.app/api/cron/subscription-notifications

# Método
POST

# Headers
Authorization: Bearer your_cron_secret_token_here
Content-Type: application/json

# Body (opcional)
{}
```

2. **Configurar en Vercel Dashboard**:
   - Ir a Functions > Cron Jobs
   - Crear nuevo cron job
   - Schedule: `0 * * * *` (cada hora)
   - URL: `/api/cron/subscription-notifications`

### Configuración Externa

Si usas un servicio externo como cron-job.org:

1. Crear cuenta en [cron-job.org](https://cron-job.org)
2. Agregar nueva tarea:
   - URL: `https://lozanonahuel.vercel.app/api/cron/subscription-notifications`
   - Método: POST
   - Headers: `Authorization: Bearer your_cron_secret_token_here`
   - Schedule: Cada hora

## 📊 Monitoreo

### Logs

El sistema genera logs detallados:

```
📧 [SUBSCRIPTION NOTIFICATIONS] Iniciando procesamiento...
📧 [SUBSCRIPTION NOTIFICATIONS] Encontradas X suscripciones para notificar
📧 [SUBSCRIPTION NOTIFICATIONS] Advertencia enviada a user@email.com para CashFlow
📧 [SUBSCRIPTION NOTIFICATIONS] Notificación registrada para user@email.com - CashFlow
📧 [SUBSCRIPTION NOTIFICATIONS] Procesamiento completado:
   - Advertencias enviadas: 2
   - Notificaciones de expiración enviadas: 1
   - Errores: 0
```

### Base de Datos

Las notificaciones se registran en la colección `subscriptionNotifications`:

```javascript
{
  userId: "user_id",
  userEmail: "user@email.com",
  userName: "Nombre Usuario",
  service: "CashFlow",
  expiryDate: "2024-01-15T00:00:00.000Z",
  daysLeft: 1,
  notificationType: "warning", // "warning" | "expired"
  sentAt: "2024-01-14T10:00:00.000Z",
  createdAt: "2024-01-14T10:00:00.000Z"
}
```

## 🧪 Pruebas

### Script de Prueba

Ejecutar el script de prueba:

```bash
node test-subscription-notifications.js
```

### Prueba Manual

1. Crear una suscripción de prueba que expire mañana
2. Ejecutar manualmente desde el admin panel
3. Verificar que se envíe el email de advertencia

## 🔧 Personalización

### Plantillas de Email

Las plantillas están en `lib/email-templates.ts`:

- `createSubscriptionExpiryWarningTemplate()`: Advertencia 1 día antes
- `createSubscriptionExpiredTemplate()`: Notificación de expiración

### Servicios Soportados

Los servicios configurados son:

- `TraderCall` → "Trader Call"
- `SmartMoney` → "Smart Money"  
- `CashFlow` → "Cash Flow"
- `TradingFundamentals` → "Trading Fundamentals"
- `DowJones` → "Dow Jones"

### URLs de Renovación

Cada servicio tiene su URL de renovación configurada en `lib/subscriptionNotifications.ts`.

## 🚨 Solución de Problemas

### Error: "Email no configurado"

Verificar variables de entorno SMTP en Vercel.

### Error: "No se envían emails"

1. Verificar configuración SMTP
2. Revisar logs de email service
3. Probar con `npm run dev` localmente

### Notificaciones duplicadas

1. Verificar colección `subscriptionNotifications` en MongoDB
2. Limpiar notificaciones antiguas
3. Revisar lógica de prevención de duplicados

### Cron job no funciona

1. Verificar URL del endpoint
2. Verificar token de autorización
3. Revisar logs de Vercel Functions

## 📝 Notas Importantes

- Las notificaciones se envían solo una vez por tipo por día
- El sistema limpia automáticamente notificaciones de más de 30 días
- Los emails incluyen botones de renovación directos
- El sistema es resistente a fallos y reintentos
