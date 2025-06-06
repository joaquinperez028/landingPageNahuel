# Configuración del Primer Administrador

## Resumen

Para usar el sistema de notificaciones de administrador, necesitas establecer al menos un usuario con rol `admin`. Te ofrecemos **3 métodos** para hacerlo.

## ⚠️ Requisitos Previos

1. **El usuario debe estar registrado**: El usuario que quieres promover debe haberse registrado al menos una vez en la aplicación (haber hecho login con Google).

2. **Base de datos conectada**: Asegúrate de que MongoDB esté funcionando y la aplicación conectada.

## 🔧 Método 1: Script de Línea de Comandos (Recomendado)

### Pasos:

1. **Asegúrate de que el usuario esté registrado** (que haya hecho login al menos una vez)

2. **Ejecuta el script**:
```bash
node scripts/setup-admin.js tu-email@gmail.com
```

### Ejemplo:
```bash
node scripts/setup-admin.js nahuel@ejemplo.com
```

### Resultado esperado:
```
✅ Conectado a MongoDB
🎉 ¡Usuario promovido a administrador exitosamente!
📧 Email: nahuel@ejemplo.com
👤 Nombre: Nahuel Lozano
🔧 Rol anterior: normal
🔧 Rol nuevo: admin

👥 Administradores actuales:
   - Nahuel Lozano (nahuel@ejemplo.com)
```

---

## 🌐 Método 2: Página Web de Configuración

### Pasos:

1. **Visita la página de setup**: 
   ```
   http://localhost:3000/setup-admin
   ```

2. **Inicia sesión** con Google (el usuario que será administrador)

3. **Completa el formulario**:
   - **Email**: Se autocompleta con tu email, o puedes cambiar por otro usuario registrado
   - **Código de seguridad**: Por defecto es `SETUP_FIRST_ADMIN_2024`

4. **Haz clic en "Configurar Administrador"**

### Nota:
- Esta página solo funciona si no hay administradores existentes
- Una vez configurado el primer admin, la página se deshabilitará automáticamente

---

## 🚀 Método 3: API Directa

### Usando cURL:

```bash
curl -X POST http://localhost:3000/api/admin/setup-first-admin \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "securityCode": "SETUP_FIRST_ADMIN_2024",
    "targetEmail": "tu-email@gmail.com"
  }'
```

### Usando Postman o similar:

- **URL**: `POST /api/admin/setup-first-admin`
- **Headers**: 
  - `Content-Type: application/json`
  - Incluir cookies de sesión (estar logueado)
- **Body**:
```json
{
  "securityCode": "SETUP_FIRST_ADMIN_2024",
  "targetEmail": "tu-email@gmail.com"
}
```

---

## 🔒 Configuración de Seguridad

### Variable de Entorno (Opcional)

Para mayor seguridad, puedes cambiar el código de setup en tu archivo `.env`:

```bash
ADMIN_SETUP_CODE=tu_codigo_super_secreto_2024
```

Si no estableces esta variable, se usará el código por defecto: `SETUP_FIRST_ADMIN_2024`

---

## ✅ Verificación

### Después de configurar el administrador:

1. **Recarga la página** o vuelve a hacer login

2. **Busca el menú de administrador** en el navbar:
   - Debe aparecer "Panel de Administración"
   - Debe aparecer "Gestión de Notificaciones"

3. **Visita la página de administración**:
   ```
   http://localhost:3000/admin/notifications
   ```

4. **Confirma el acceso**: Deberías ver la interfaz completa de gestión de notificaciones

---

## 🚨 Solución de Problemas

### Error: "Usuario no encontrado"
- **Causa**: El usuario no está registrado en la base de datos
- **Solución**: El usuario debe hacer login al menos una vez con Google

### Error: "Ya existen administradores"
- **Causa**: Ya hay usuarios con rol `admin` en el sistema
- **Solución**: Usar método manual o pedir a un admin existente que promueva usuarios

### Error: "Código de seguridad incorrecto"
- **Causa**: El código no coincide con `ADMIN_SETUP_CODE`
- **Solución**: Verificar la variable de entorno o usar el código por defecto

### Error: "No autorizado"
- **Causa**: No estás logueado
- **Solución**: Hacer login con Google primero

---

## 📝 Método Manual (Base de Datos)

Si todos los métodos anteriores fallan, puedes editar directamente en MongoDB:

### Con MongoDB Compass:
1. Conecta a tu base de datos
2. Ve a la colección `users`
3. Encuentra el usuario por email
4. Cambia el campo `role` de `"normal"` a `"admin"`

### Con MongoDB Shell:
```javascript
db.users.updateOne(
  { email: "tu-email@gmail.com" },
  { $set: { role: "admin", updatedAt: new Date() } }
)
```

---

## 🎯 Siguientes Pasos

Una vez configurado el administrador:

1. **Accede a**: `/admin/notifications`
2. **Crea tu primera notificación** para probar el sistema
3. **Invita a otros administradores** si es necesario
4. **Elimina los archivos temporales** (opcional):
   - `pages/setup-admin.tsx`
   - `pages/api/admin/setup-first-admin.ts`
   - `scripts/setup-admin.js`

---

## 🔄 Promover Usuarios Adicionales

Para promover más usuarios a administrador después del primero:

### Método 1: Script
```bash
node scripts/promote-user.js email@ejemplo.com admin
```

### Método 2: Panel de Admin
1. Ve a `/admin/users` (si existe)
2. Edita el rol del usuario

### Método 3: Base de Datos
```javascript
db.users.updateOne(
  { email: "nuevo-admin@gmail.com" },
  { $set: { role: "admin" } }
)
```

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs** de la consola del servidor
2. **Verifica la conexión** a MongoDB
3. **Confirma que el usuario** está registrado
4. **Chequea las variables** de entorno

¡El sistema está listo para ser usado! 🚀 