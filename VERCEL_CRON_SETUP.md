# Configuración de Cron Job en Vercel para Notificaciones de Suscripciones

## 📋 Resumen
Este documento explica cómo configurar un cron job en Vercel para automatizar el envío de notificaciones de vencimiento de suscripciones.

## 🚀 Opción 1: Cron Job Nativo de Vercel (Recomendado)

### Paso 1: Crear archivo vercel.json
Crea un archivo `vercel.json` en la raíz del proyecto:

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Explicación del schedule:**
- `0 9 * * *` = Todos los días a las 9:00 AM (hora de Argentina)
- Puedes ajustar según tu zona horaria:
  - `0 12 * * *` = 12:00 PM UTC (9:00 AM Argentina)
  - `0 8 * * *` = 8:00 AM UTC (5:00 AM Argentina)

### Paso 2: Configurar Variable de Entorno
En el dashboard de Vercel, agrega la variable de entorno:

```
CRON_SECRET_TOKEN=tu_token_secreto_aqui_123456
```

**Recomendaciones para el token:**
- Usa al menos 32 caracteres
- Combina letras, números y símbolos
- Ejemplo: `cron_mp_2024_xyz_789_abc_def_ghi`

### Paso 3: Deploy
Haz commit y push de los cambios:

```bash
git add vercel.json
git commit -m "feat: agregar cron job para notificaciones de suscripciones"
git push
```

## 🔄 Opción 2: Cron Job Externo (Alternativa)

Si prefieres usar un servicio externo, puedes usar:

### Cron-job.org
1. Ve a https://cron-job.org
2. Crea una cuenta gratuita
3. Agrega un nuevo cron job:
   - **URL:** `https://tu-dominio.vercel.app/api/cron/subscription-notifications`
   - **Schedule:** Diario a las 9:00 AM
   - **Headers:** `Authorization: Bearer tu_token_secreto_aqui_123456`

### UptimeRobot
1. Ve a https://uptimerobot.com
2. Crea un "Monitor" tipo "HTTP(s)"
3. Configura:
   - **URL:** `https://tu-dominio.vercel.app/api/cron/subscription-notifications`
   - **Method:** POST
   - **Headers:** `Authorization: Bearer tu_token_secreto_aqui_123456`

## 🧪 Testing del Cron Job

### Test Manual
Puedes probar manualmente el endpoint:

```bash
curl -X POST https://tu-dominio.vercel.app/api/cron/subscription-notifications \
  -H "Authorization: Bearer tu_token_secreto_aqui_123456" \
  -H "Content-Type: application/json"
```

### Test desde el Admin Panel
1. Ve a `/admin/subscriptions`
2. En la sección "Notificaciones de Suscripciones"
3. Haz clic en "Procesar Notificaciones"

## 📊 Monitoreo

### Logs de Vercel
1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a "Functions" → "Functions Logs"
4. Busca logs del endpoint `/api/cron/subscription-notifications`

### Verificar Funcionamiento
1. Crea una suscripción de prueba que expire en 1 día
2. Espera al día siguiente a las 9:00 AM
3. Verifica que se envió el email de advertencia
4. Al día siguiente, verifica que se envió el email de expiración

## ⚙️ Configuración Avanzada

### Múltiples Horarios
Si quieres enviar notificaciones en diferentes horarios:

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-notifications",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/subscription-notifications",
      "schedule": "0 18 * * *"
    }
  ]
}
```

### Diferentes Zonas Horarias
Para usuarios en diferentes zonas horarias, puedes crear múltiples cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-notifications?timezone=America/Argentina/Buenos_Aires",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/subscription-notifications?timezone=America/Mexico_City",
      "schedule": "0 7 * * *"
    }
  ]
}
```

## 🔒 Seguridad

### Token de Seguridad
- Nunca compartas el `CRON_SECRET_TOKEN`
- Usa un token diferente para desarrollo y producción
- Rota el token periódicamente

### Rate Limiting
El endpoint incluye protección básica contra spam, pero considera agregar rate limiting adicional si es necesario.

## 🐛 Troubleshooting

### Error 401 Unauthorized
- Verifica que el `CRON_SECRET_TOKEN` esté configurado correctamente
- Asegúrate de que el header `Authorization` esté presente

### Error 500 Internal Server Error
- Revisa los logs de Vercel
- Verifica que las variables de entorno de email estén configuradas
- Asegúrate de que la conexión a MongoDB funcione

### No se envían emails
- Verifica la configuración de email en `lib/emailService.ts`
- Revisa que las credenciales de SMTP estén correctas
- Verifica que no haya suscripciones que necesiten notificación

## 📈 Métricas

El sistema registra automáticamente:
- Número de advertencias enviadas
- Número de notificaciones de expiración enviadas
- Errores y excepciones
- Timestamp de cada ejecución

Puedes ver estas métricas en los logs de Vercel o agregar un sistema de analytics más avanzado.

## ✅ Checklist de Implementación

- [ ] Crear archivo `vercel.json` con la configuración del cron
- [ ] Configurar `CRON_SECRET_TOKEN` en Vercel
- [ ] Hacer deploy de los cambios
- [ ] Probar el endpoint manualmente
- [ ] Crear una suscripción de prueba
- [ ] Verificar que se envíen las notificaciones
- [ ] Monitorear los logs por unos días
- [ ] Documentar cualquier problema encontrado

## 🎯 Próximos Pasos

Una vez que el cron job esté funcionando:

1. **Analytics:** Implementar métricas más detalladas
2. **Personalización:** Permitir que los usuarios configuren sus preferencias de notificación
3. **Multi-idioma:** Agregar soporte para diferentes idiomas en los emails
4. **Notificaciones Push:** Implementar notificaciones push además de email
5. **Renovación Automática:** Agregar opción de renovación automática de suscripciones
