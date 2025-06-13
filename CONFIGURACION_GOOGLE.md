# 🔧 Configuración del Sistema de Autenticación No Invasivo

## ✅ Problema Solucionado

**ANTES:** El sistema pedía permisos de calendario a todos los usuarios, mostrando pantallas invasivas de Google.

**AHORA:** Los usuarios solo necesitan autenticación básica (email, nombre, foto). Solo el administrador maneja el calendario.

## 🔑 Variables de Entorno Necesarias

### Autenticación Básica (YA CONFIGURADAS)
```env
SMTP_USER=joaquinperez028@gmail.com
SMTP_PASSWORD=cnhc octh ipjw wony
ADMIN_EMAIL=joaquinperez028@gmail.com
GOOGLE_CALENDAR_ID=joaquinperez028@gmail.com
GOOGLE_CALENDAR_TIMEZONE=America/Montevideo
```

### Variables Faltantes para Google Calendar del Admin
```env
# Estos tokens permiten que el sistema cree eventos en TU calendario
# sin pedirle permisos a los usuarios
ADMIN_GOOGLE_ACCESS_TOKEN=ya29.a0AfH6SMC...
ADMIN_GOOGLE_REFRESH_TOKEN=1//04...
```

## 🚀 Cómo Obtener los Tokens de Admin

### Opción 1: Usar Google OAuth Playground (Recomendado)

1. Ve a: https://developers.google.com/oauthplayground/
2. En "Step 1", busca "Calendar API v3"
3. Selecciona: `https://www.googleapis.com/auth/calendar`
4. Click "Authorize APIs"
5. Inicia sesión con tu cuenta de admin (joaquinperez028@gmail.com)
6. Autoriza los permisos
7. En "Step 2", click "Exchange authorization code for tokens"
8. Copia los tokens:
   - `access_token` → `ADMIN_GOOGLE_ACCESS_TOKEN`
   - `refresh_token` → `ADMIN_GOOGLE_REFRESH_TOKEN`

### Opción 2: Crear Script de Autorización

```javascript
// auth-admin.js
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'TU_GOOGLE_CLIENT_ID',
  'TU_GOOGLE_CLIENT_SECRET',
  'http://localhost:3000/api/auth/callback/google'
);

const scopes = ['https://www.googleapis.com/auth/calendar'];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Ve a esta URL y autoriza:', url);
```

## 📧 Flujo del Sistema Actualizado

### Para Usuarios Normales:
1. ✅ Login con Google (solo email, nombre, foto)
2. ✅ Reserva entrenamiento/asesoría
3. ✅ Recibe email de confirmación profesional
4. ❌ NO se toca su calendario personal

### Para el Administrador:
1. ✅ Evento se crea automáticamente en TU calendario
2. ✅ Incluye email del usuario como invitado
3. ✅ Recordatorios automáticos configurados
4. ✅ Recibe notificación por email

## 🔒 Seguridad Mejorada

- **Usuarios:** Solo permisos básicos de Google (openid, email, profile)
- **Admin:** Tokens seguros en variables de entorno del servidor
- **Emails:** Sistema profesional con templates HTML
- **Calendario:** Solo el admin maneja eventos

## 🧪 Cómo Probar

1. Borra las cookies del navegador
2. Ve a tu sitio web
3. Intenta hacer login con Google
4. ✅ Debería pedir solo permisos básicos (no calendario)
5. Reserva un entrenamiento
6. ✅ Deberías recibir email de confirmación
7. ✅ El evento debería aparecer en tu calendario de admin

## 🚨 Si Aún Pide Permisos de Calendario

1. Verifica que `lib/googleAuth.ts` tenga:
   ```javascript
   scope: 'openid email profile', // SIN calendar
   ```

2. Borra completamente las cookies y cache del navegador

3. Revisa la consola de Google Cloud:
   - Ve a: https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Verifica que tu OAuth client esté configurado correctamente

## 📞 Soporte

Si necesitas ayuda con la configuración:
- Email: joaquinperez028@gmail.com
- El sistema de emails ya funciona perfectamente
- Solo falta configurar los tokens de Google Calendar del admin 