console.log('🔧 CONFIGURAR NUEVA APLICACIÓN OAUTH PARA JOAQUINPEREZ028@GMAIL.COM');
console.log('=' .repeat(70));

console.log('\n📋 PASOS PARA CREAR OAUTH CON TU CUENTA CORRECTA:');
console.log('\n1. 🌐 Ve a Google Cloud Console:');
console.log('   https://console.cloud.google.com/');

console.log('\n2. 📧 IMPORTANTE: Inicia sesión con joaquinperez028@gmail.com');
console.log('   (NO con franco.l.varela99@gmail.com)');

console.log('\n3. 📁 Crear/Seleccionar proyecto:');
console.log('   - Si no tienes proyecto: "Nuevo Proyecto" → Nombre: "Landing Page Nahuel"');
console.log('   - Si ya tienes proyecto: Selecciónalo');

console.log('\n4. 🔌 Habilitar Google Calendar API:');
console.log('   - Ir a "APIs y servicios" → "Biblioteca"');
console.log('   - Buscar "Google Calendar API"');
console.log('   - Click "Habilitar"');

console.log('\n5. 🔑 Crear credenciales OAuth:');
console.log('   - Ir a "APIs y servicios" → "Credenciales"');
console.log('   - Click "Crear credenciales" → "ID de cliente de OAuth 2.0"');

console.log('\n6. ⚙️ Configurar pantalla de consentimiento:');
console.log('   - Tipo: "Externo"');
console.log('   - Nombre de la aplicación: "Landing Page Nahuel"');
console.log('   - Email de soporte: joaquinperez028@gmail.com');
console.log('   - Dominios autorizados: lozanonahuel.vercel.app');

console.log('\n7. 🔗 Configurar cliente OAuth:');
console.log('   - Tipo de aplicación: "Aplicación web"');
console.log('   - Nombre: "Landing Page Nahuel Calendar"');
console.log('   - Orígenes autorizados: https://lozanonahuel.vercel.app');
console.log('   - URIs de redirección: https://lozanonahuel.vercel.app/api/auth/callback/google');

console.log('\n8. 📥 Descargar credenciales:');
console.log('   - Click "Crear"');
console.log('   - Copiar CLIENT_ID y CLIENT_SECRET');

console.log('\n9. 👥 Agregar usuarios de prueba:');
console.log('   - En "Pantalla de consentimiento OAuth"');
console.log('   - Agregar joaquinperez028@gmail.com como usuario de prueba');

console.log('\n10. 🔄 Actualizar script:');
console.log('    - Usar las nuevas credenciales en el script');

console.log('\n' + '=' .repeat(70));
console.log('💡 ALTERNATIVA RÁPIDA: Si quieres continuar con las credenciales actuales:');
console.log('1. En la pantalla de error, click "Configuración avanzada"');
console.log('2. Click "Ir a [app] (no seguro)"');
console.log('3. Autorizar todos los permisos');
console.log('4. Continuar con el proceso');

console.log('\n¿Qué opción prefieres?');
console.log('A) Crear nueva aplicación OAuth limpia (recomendado)');
console.log('B) Saltarse la verificación con la app actual (más rápido)');

console.log('\n' + '=' .repeat(70)); 