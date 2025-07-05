# 📧 Configuración de Email para Notificaciones de Alertas

## Descripción

Este documento explica cómo configurar el envío de emails para las notificaciones automáticas de alertas de trading en **Vercel**.

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

**Pasos para configurar SendGrid:**
1. Crea una cuenta en [SendGrid](https://sendgrid.com/)
2. Verifica tu dominio de envío
3. Genera una API Key
4. Usa `apikey` como usuario y tu API Key como contraseña

### 📧 Mailgun (Alternativa profesional)

**Variables en Vercel:**
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@tu-dominio.mailgun.org
SMTP_PASS=tu_mailgun_smtp_password
```

### 📧 Outlook/Hotmail

**Variables en Vercel:**
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu_email@outlook.com
SMTP_PASS=tu_password
```

## Funcionalidad Implementada

### ✅ Envío de Emails Automático

- **Cuándo se envían**: Cuando se crea una alerta (TraderCall, SmartMoney, CashFlow)
- **A quién se envían**: Solo a usuarios suscritos al tipo específico de alerta
- **Qué incluyen**: Detalles de la alerta, botón de acción, información del símbolo

### 🎯 Filtrado por Suscripciones

El sistema respeta las suscripciones de los usuarios:
- **alertas_trader**: Recibe emails de alertas TraderCall
- **alertas_smart**: Recibe emails de alertas SmartMoney  
- **alertas_cashflow**: Recibe emails de alertas CashFlow
- **Preferencias de email**: Los usuarios pueden desactivar emails en su perfil

### 🔧 Modo Simulación

Si las variables de entorno no están configuradas en Vercel:
- El sistema funciona en modo simulación
- Los emails aparecen en los logs de la consola de Vercel
- No se envían emails reales
- La funcionalidad de notificaciones web sigue funcionando

## Plantilla de Email

La plantilla incluye:
- **Header**: Branding con gradientes
- **Saludo personalizado**: Usando el nombre del usuario
- **Detalles de la alerta**: Símbolo, acción, precio
- **Botón de acción**: Redirige a la página de alertas
- **Footer**: Links a perfil y configuración
- **Responsive**: Funciona en móviles y desktop

## Configuración en Vercel

### 1. Agregar Variables de Entorno

1. Ve a tu proyecto en Vercel
2. Accede a **Settings** > **Environment Variables**
3. Agrega cada variable individualmente:
   - **Name**: `SMTP_HOST`
   - **Value**: `smtp.gmail.com`
   - **Environment**: Production, Preview, Development (selecciona todos)

### 2. Redeploy

Después de agregar las variables:
1. Ve a **Deployments**
2. Haz clic en **Redeploy** en el último deployment
3. O haz un nuevo commit para trigger un nuevo deployment

### 3. Verificar Configuración

En los logs de Vercel verás:
```
📧 Transportador de email configurado correctamente
✅ Configuración de email verificada correctamente
```

## Pruebas

### Verificar en Desarrollo Local

Si quieres probar localmente, crea un archivo `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion
EMAIL_FROM_NAME=Nahuel Lozano Trading
EMAIL_FROM_ADDRESS=noreply@lozanonahuel.com
```

### Probar en Producción

1. Configura las variables en Vercel
2. Redeploy la aplicación
3. Crea una alerta desde el panel admin
4. Verifica que los usuarios suscritos reciban el email
5. Revisa los logs de Vercel para confirmar el envío

## Troubleshooting

### 🔍 Variables no reconocidas

- Verifica que las variables estén configuradas en Vercel
- Asegúrate de haber redeployado después de agregar las variables
- Verifica que las variables estén disponibles en el environment correcto

### 🔍 Error: "Authentication failed"

- Gmail: Usa contraseña de aplicación, no tu contraseña normal
- Verifica que la cuenta de Gmail tenga 2FA activado
- SendGrid: Verifica que tu API Key tenga permisos de envío

### 🔍 Error: "Connection timeout"

- Verifica el SMTP_HOST y SMTP_PORT
- Algunos providers usan puertos diferentes (465 para SSL)
- Vercel puede tener restricciones de red, considera usar servicios como SendGrid

### 🔍 Emails no llegan

- Verifica la bandeja de spam
- Confirma que el usuario esté suscrito al tipo de alerta
- Revisa que el usuario tenga emails activados en preferencias
- Verifica los logs de Vercel para errores de envío

## Monitoreo en Vercel

Los logs del servidor mostrarán:
- ✅ Emails enviados exitosamente
- ❌ Errores de envío
- 📧 Usuarios que tienen emails desactivados
- 🔔 Creación de notificaciones automáticas

Para ver los logs:
1. Ve a tu proyecto en Vercel
2. Accede a **Functions** > **View Function Logs**
3. Filtra por las funciones API que manejan alertas

## Recomendaciones de Producción

### 🚀 Para Producción

1. **Usa SendGrid o Mailgun** en lugar de Gmail
2. **Configura un dominio personalizado** para emails profesionales
3. **Implementa rate limiting** para evitar spam
4. **Monitorea métricas** de delivery y bounce rates

### 🔒 Seguridad

- Nunca hardcodees credenciales en el código
- Usa API Keys con permisos mínimos necesarios
- Rota regularmente las credenciales
- Monitorea uso anómalo de email

### 📊 Métricas

Considera agregar tracking de:
- Emails enviados por día
- Tasas de apertura
- Bounces y errores
- Usuarios que marcan como spam

## Próximos Pasos

1. **Configurar dominio personalizado** para emails profesionales
2. **Implementar tracking** de apertura de emails
3. **Crear plantillas** para diferentes tipos de notificaciones
4. **Agregar unsubscribe** directo desde el email
5. **Integrar con servicios de analytics** de email 