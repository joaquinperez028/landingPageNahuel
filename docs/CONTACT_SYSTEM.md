# 📧 Sistema de Contacto - Documentación

## 🎯 Resumen General

Sistema completo de contacto que permite a usuarios autenticados enviar mensajes al administrador a través de un formulario seguro y elegante. Incluye protecciones avanzadas anti-spam, rate limiting y notificaciones por email con diseño profesional.

---

## 🎨 **NUEVO: Email de Notificación Profesional**

### ✨ Características del Email Mejorado

El email que recibe el administrador ahora cuenta con:

1. **Diseño Premium Responsivo**:
   - Header con gradiente elegante (#667eea → #764ba2)
   - Tipografía moderna (Segoe UI)
   - Layout de 650px máximo con bordes redondeados
   - Sombras y efectos visuales profesionales

2. **Estructura Organizada**:
   - **Header**: Icono 📧, título principal y descripción
   - **Tarjeta de Usuario**: Información del remitente con grid responsivo
   - **Sección de Asunto**: Box destacado con borde azul
   - **Contenido del Mensaje**: Caja con comillas decorativas
   - **Timestamp**: Información de fecha/hora con estilo distintivo
   - **Footer de Respuesta**: Botón CTA para responder directamente

3. **Elementos Visuales Avanzados**:
   - Gradientes lineales en múltiples elementos
   - Pattern de textura sutil en el header
   - Bordes decorativos con gradientes
   - Íconos emoji para mejor UX
   - Efectos hover en botones (solo webmail)

4. **Información Detallada**:
   - Nombre completo del usuario
   - Email de contacto
   - Fecha y hora formateada en español
   - Asunto destacado visualmente
   - Contenido del mensaje con formato preservado

5. **Funcionalidad Mejorada**:
   - Botón "Responder Email" con mailto: prellenado
   - Subject automático: "Re: [asunto original]"
   - Instrucciones claras para responder
   - Nota de disclaimer sobre el email automático

---

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

## 🎨 Interfaz de Usuario

### Modal del Formulario
- **Diseño**: Modal centrado con overlay semi-transparente
- **Formulario responsivo** con validación en tiempo real
- **Información pre-cargada** del usuario autenticado
- **Contadores de caracteres** dinámicos
- **Estados de loading** con spinner animado
- **Mensajes de error/éxito** con toast notifications

### Estilos Optimizados
- **CSS liviano** para mejor rendimiento
- **Animaciones suaves** de entrada y salida
- **Mobile-first** responsive design
- **Accesibilidad** mejorada con contraste adecuado

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas
```env
# Email del administrador (destino de contactos)
ADMIN_EMAIL=admin@tudominio.com

# Configuración SMTP (ya existente en el proyecto)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app
```

### Endpoint API: `/api/contact`
- **Método**: POST únicamente
- **Autenticación**: Requerida (Google OAuth)
- **Rate Limiting**: 3 mensajes por 15 minutos por usuario
- **Validación**: Zod schema estricto
- **Sanitización**: DOMPurify para contenido

## 📊 Métricas de Seguridad

### Protecciones Implementadas

#### 1. **Rate Limiting Avanzado**
- ✅ **3 mensajes máximo cada 15 minutos**
- ✅ **Bloqueo de 30 minutos** si se excede el límite
- ✅ **Tracking por email de usuario** (no por IP)
- ✅ **Limpieza automática** del caché cada 5 minutos

#### 2. **Sanitización de Contenido** 
- ✅ **DOMPurify**: Elimina HTML/JavaScript malicioso
- ✅ **Validación de longitud**: 5-100 chars (asunto), 10-2000 chars (mensaje)
- ✅ **Escape de caracteres especiales** para prevenir inyecciones

#### 3. **Detección de Patrones Maliciosos**
- ✅ **XSS Patterns**: `<script>`, `javascript:`, `onclick=`, etc.
- ✅ **SQL Injection**: `UNION SELECT`, `DROP TABLE`, etc.
- ✅ **System Commands**: `rm -rf`, `wget`, `curl`, etc.
- ✅ **URLs Sospechosas**: bit.ly, tinyurl, etc.
- ✅ **Spam Indicators**: enlaces múltiples, ALL CAPS excesivo
- ✅ **Phishing Attempts**: palabras clave específicas

#### 4. **Validación de Email**
- ✅ **Formato válido**: Regex RFC 5322 compliant
- ✅ **Dominios temporales bloqueados**: 10minutemail, guerrillamail, etc.
- ✅ **Patrones sospechosos**: números excesivos, caracteres especiales

#### 5. **Sistema de Scoring**
- ✅ **Análisis de riesgo 0-100 puntos**
- ✅ **Bloqueo automático** si score > 30
- ✅ **Factores múltiples**: longitud, palabras prohibidas, patrones

## 🎛️ Funcionalidades del Sistema

### Para Usuarios Normales
1. **Acceso al formulario** desde botón "Contacto" en navbar
2. **Datos pre-cargados** desde sesión de Google
3. **Validación en tiempo real** con feedback visual
4. **Envío seguro** con confirmación de éxito

### Para Administradores  
1. **Notificación inmediata** por email con diseño profesional
2. **Información completa** del remitente y mensaje
3. **Botón de respuesta directa** con subject prellenado
4. **Tracking visual** del timestamp de recepción

## 🚀 **Flujo de Funcionamiento Actualizado**

1. **Usuario hace click** en "Contacto" → Modal se abre con datos precargados
2. **Completa formulario** → Validación en tiempo real (UX mejorada)
3. **Envía mensaje** → Validaciones de seguridad + Rate limiting
4. **API procesa** → Sanitización + análisis de patrones maliciosos
5. **Email enviado** → **NUEVO: Plantilla profesional con diseño moderno**
6. **Admin recibe** → **Email elegante con información organizada y botón de respuesta**
7. **Admin responde** → Click en botón abre cliente de email con datos prellenados

## 🎨 **Ejemplos Visuales del Email**

### Estructura del Email de Notificación:

```
┌─────────────────────────────────────────┐
│ 📧 Header con Gradiente Elegante        │
│    "Nuevo Mensaje de Contacto"         │
│    Subtitle descriptivo                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 👤 Información del Remitente           │
│ Grid: Nombre | Email | Fecha/Hora      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📋 Asunto del Mensaje                  │
│ Box destacado con borde azul           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 💬 Contenido del Mensaje               │
│ Caja con comillas decorativas          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ ⏰ Timestamp de recepción              │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Footer con instrucciones de respuesta  │
│ [Botón "Responder Email"]              │
│ Disclaimer sobre email automático      │
└─────────────────────────────────────────┘
```

## 🔍 Logs del Sistema

### Eventos Tracked
```bash
📧 Iniciando proceso de contacto...
✅ Usuario autenticado: user@example.com  
⚠️  Rate limit check: OK (1/3 mensajes)
🔍 Validación Zod: PASSED
🧹 Sanitización DOMPurify: COMPLETED
🛡️  Análisis de seguridad: Score 5/100 (SAFE)
📤 Enviando email a admin...
✅ Email enviado exitosamente con nuevo diseño
```

## 📱 Responsive Design

### Breakpoints del Email
- **Desktop (650px+)**: Layout completo con grid de 3 columnas
- **Tablet (600-649px)**: Grid adaptativo, padding reducido  
- **Mobile (< 600px)**: Grid de 1 columna, texto optimizado

### Compatibilidad de Email Clients
- ✅ **Gmail** (Web & Mobile)
- ✅ **Outlook** (2016+, Web)  
- ✅ **Apple Mail** (iOS & macOS)
- ✅ **Yahoo Mail**
- ✅ **Thunderbird**
- ⚠️ **Outlook 2010-2013** (gradientes limitados)

## 🛠️ Mantenimiento y Monitoreo

### Métricas Recomendadas
- **Tasa de entrega** de emails de contacto
- **Mensajes bloqueados** por spam
- **Rate limiting activado** por usuario
- **Patrones maliciosos detectados**

### Troubleshooting Común
1. **Email no llega**: Verificar ADMIN_EMAIL y configuración SMTP
2. **Rate limit muy estricto**: Ajustar RATE_LIMIT.maxRequests en contact.ts  
3. **False positives de spam**: Revisar palabras prohibidas en securityUtils.ts
4. **Email mal formateado**: Verificar compatibilidad con cliente de email específico

## 🎯 Próximas Mejoras Sugeridas

### Funcionalidades Futuras
- [ ] **Dashboard de mensajes** para admin (historial completo)
- [ ] **Respuestas automáticas** con templates
- [ ] **Categorización** de mensajes por tema
- [ ] **Integración con CRM** (HubSpot, Salesforce)
- [ ] **Analytics avanzados** de engagement
- [ ] **A/B testing** para diseños de email
- [ ] **Notificaciones push** para admin mobile

### Optimizaciones Técnicas
- [ ] **Caché Redis** para rate limiting distribuido
- [ ] **Queue system** para emails (Bull/Agenda)
- [ ] **Webhooks** de confirmación de entrega
- [ ] **Firma digital** para emails importantes

*Documentación actualizada: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}*
*Sistema de contacto v2.0 con notificaciones profesionales* 