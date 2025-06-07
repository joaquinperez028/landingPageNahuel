# 📧 Sistema de Contacto Seguro

## 🎯 Funcionalidades Implementadas

### ✅ Botón de Contacto en Navbar
- **Ubicación**: Barra de navegación principal
- **Diseño**: Botón verde con icono MessageCircle y texto "Contacto"
- **Responsive**: Se adapta a dispositivos móviles
- **Estados**: Hover, active y disabled con animaciones suaves

### ✅ Modal de Formulario Seguro
- **Campos**: Asunto (5-100 caracteres) y Mensaje (10-2000 caracteres)
- **Validación en tiempo real**: Contadores de caracteres y errores inline
- **Auto-completado**: Email y nombre del usuario autenticado
- **Diseño responsive**: Se adapta a todas las resoluciones

### ✅ Protecciones de Seguridad Avanzadas

#### 🔒 Validaciones Frontend
- Sanitización de input en tiempo real
- Detección de patrones sospechosos
- Rate limiting por usuario (máximo 3 mensajes cada 15 minutos)
- Validación de longitud y formato

#### 🛡️ Seguridad Backend (`/api/contact`)
- **Rate Limiting**: 3 mensajes máximo cada 15 minutos por usuario
- **Autenticación requerida**: Solo usuarios logueados pueden enviar
- **Sanitización DOMPurify**: Elimina todo HTML/JS malicioso
- **Detección de patrones maliciosos**:
  - Scripts (XSS, JavaScript, VBScript)
  - Inyección SQL básica
  - Comandos del sistema
  - URLs y enlaces sospechosos
  - Contenido spam típico
  - Patrones de phishing

#### 🔍 Sistema de Análisis de Contenido
- **Scoring de riesgo**: 0-100 puntos por contenido
- **Detección de spam**: Palabras prohibidas y patrones
- **Validación de email**: Bloqueo de emails temporales
- **Detección de bots**: Contenido generado automáticamente

---

## 🚀 Flujo de Funcionamiento

### 1. **Usuario hace click en "Contacto"**
```javascript
// Se abre modal con información pre-cargada
{
  userName: session.user.name,
  userEmail: session.user.email,
  isAuthenticated: true
}
```

### 2. **Usuario completa formulario**
- Validación en tiempo real
- Contadores de caracteres
- Prevención de caracteres maliciosos

### 3. **Envío al servidor**
```javascript
POST /api/contact
{
  subject: "Asunto sanitizado",
  message: "Mensaje sanitizado", 
  timestamp: Date.now()
}
```

### 4. **Procesamiento en backend**
```javascript
// Verificaciones de seguridad
✓ Autenticación válida
✓ Rate limiting OK
✓ Validación Zod schema
✓ Sanitización DOMPurify
✓ Análisis de patrones maliciosos
✓ Verificación anti-spam
```

### 5. **Envío de email al administrador**
```javascript
// Email formateado con información completa
To: process.env.ADMIN_EMAIL
Subject: [CONTACTO WEB] {asunto}
Content: {
  usuario: {nombre, email},
  fecha: timestamp,
  asunto: sanitizado,
  mensaje: sanitizado,
  notas: instrucciones_respuesta
}
```

---

## 📁 Archivos Implementados

### **Componentes Frontend**
- `components/ContactForm.tsx` - Modal de contacto
- `styles/ContactForm.module.css` - Estilos del modal

### **Backend API**
- `pages/api/contact.ts` - Endpoint principal
- `lib/securityUtils.ts` - Utilidades de seguridad

### **Navegación**
- `components/Navbar.tsx` - Botón de contacto agregado
- `styles/Navbar.module.css` - Estilos del botón

### **Dependencias Agregadas**
- `isomorphic-dompurify` - Sanitización de contenido
- `zod` - Validación de schemas (ya existía)

---

## ⚙️ Configuración Requerida

### Variables de Entorno
```bash
# Email del administrador (obligatorio)
ADMIN_EMAIL=admin@tudominio.com

# SMTP (ya configurado)
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password_app
```

### Permisos
- Solo usuarios **autenticados** pueden usar el contacto
- El formulario solo aparece si `session.user.email` existe

---

## 🔧 Configuración de Rate Limiting

### Límites Actuales
```javascript
const RATE_LIMIT = {
  maxRequests: 3,        // Máximo 3 mensajes
  windowMs: 15 * 60 * 1000,    // En 15 minutos
  blockDurationMs: 30 * 60 * 1000  // Bloqueo 30 min si excede
}
```

### Personalización
Para modificar los límites, edita `/pages/api/contact.ts`:

```javascript
// Más estricto para prevenir spam
const RATE_LIMIT = {
  maxRequests: 2,              // Solo 2 mensajes
  windowMs: 30 * 60 * 1000,    // En 30 minutos
  blockDurationMs: 60 * 60 * 1000  // Bloqueo 1 hora
}

// Más permisivo para desarrollo
const RATE_LIMIT = {
  maxRequests: 10,             // 10 mensajes
  windowMs: 5 * 60 * 1000,     // En 5 minutos
  blockDurationMs: 10 * 60 * 1000  // Bloqueo 10 min
}
```

---

## 🛠 Personalización de Seguridad

### Agregar Palabras Prohibidas
```javascript
// En lib/securityUtils.ts
const BLOCKED_WORDS = [
  // Agregar nuevas palabras
  'palabra_prohibida',
  'contenido_spam',
  // ...palabras existentes
];
```

### Modificar Patrones Maliciosos
```javascript
// Agregar nuevos patrones de detección
MALICIOUS_PATTERNS.custom = [
  /patron_personalizado/gi,
  /otro_patron_malicioso/gi,
];
```

### Ajustar Scoring de Riesgo
```javascript
// Modificar puntuación por tipo de amenaza
switch (category) {
  case 'scripts':
    riskScore += 50; // Más estricto
    break;
  case 'spam':
    riskScore += 5;  // Menos estricto
    break;
}
```

---

## 📊 Métricas y Logs

### Logs del Sistema
```bash
# Logs exitosos
✅ Mensaje de contacto enviado exitosamente

# Logs de seguridad
⚠️ Rate limit excedido para user@email.com
⚠️ Contenido sospechoso detectado: <patron>
❌ Usuario no autenticado
❌ Error de validación: [detalles]
```

### Monitoring Recomendado
1. **Alertas por volumen**: >10 mensajes/hora
2. **Alertas de seguridad**: Contenido malicioso detectado
3. **Monitoreo de rate limiting**: Usuarios bloqueados
4. **Uptime del endpoint**: `/api/contact` disponible

---

## 🔒 Mejoras de Seguridad Futuras

### 1. **CAPTCHA Avanzado**
```javascript
// Implementar Google reCAPTCHA v3
// Para contenido de riesgo medio/alto
if (securityReport.overallRisk !== 'low') {
  requireCaptcha = true;
}
```

### 2. **Rate Limiting con Redis**
```javascript
// Para producción con múltiples servidores
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

### 3. **Análisis de Sentimientos**
```javascript
// Detectar mensajes negativos/agresivos
import { analyzeSentiment } from 'sentiment-analysis-lib';
```

### 4. **Honeypot Fields**
```javascript
// Campos ocultos para detectar bots
<input type="text" name="honeypot" style={{display: 'none'}} />
```

---

## 🧪 Testing Manual

### ✅ Casos de Prueba Exitosos
1. **Usuario autenticado envía mensaje normal** → ✅ Enviado
2. **Usuario envía 3 mensajes rápido** → ⚠️ Rate limited
3. **Formulario con campos vacíos** → ❌ Validación
4. **Mensaje muy largo (>2000 chars)** → ❌ Límite excedido

### ⚠️ Casos de Prueba de Seguridad
1. **Contenido con `<script>alert('xss')</script>`** → 🛡️ Bloqueado
2. **SQL injection básico** → 🛡️ Detectado y bloqueado
3. **Usuario no autenticado** → 🔒 Acceso denegado
4. **Email temporal (10minutemail.com)** → 🚨 Flagged

---

## 📞 Soporte y Mantenimiento

### Monitoreo de Emails
- Revisar bandeja de `ADMIN_EMAIL` regularmente
- Configurar filtros para emails `[CONTACTO WEB]`
- Responder desde email personal del administrador

### Mantenimiento del Rate Limiting
- El mapa de rate limiting se limpia automáticamente cada 5 minutos
- En producción considerar usar Redis para persistencia

### Logs de Errores
- Revisar logs de Vercel Functions para errores 500
- Monitorear falsos positivos en detección de spam
- Ajustar patrones de seguridad según sea necesario

---

## 🎉 Resultado Final

✅ **Sistema de contacto completamente funcional y seguro**  
✅ **Protección anti-spam y anti-XSS robusta**  
✅ **Rate limiting efectivo contra bots**  
✅ **UI/UX moderno y responsive**  
✅ **Integración perfecta con el sistema existente**  

¡El sistema está listo para producción! 🚀 