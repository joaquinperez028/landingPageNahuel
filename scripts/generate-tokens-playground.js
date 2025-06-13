console.log('🎯 GENERAR TOKENS USANDO GOOGLE OAUTH PLAYGROUND');
console.log('=' .repeat(60));
console.log('📧 Cuenta objetivo: joaquinperez028@gmail.com');
console.log('🔧 Método: OAuth Playground (sin conflictos con NextAuth)');

console.log('\n📋 PASOS:');

console.log('\n1. 🌐 Ve a Google OAuth Playground:');
console.log('   https://developers.google.com/oauthplayground/');

console.log('\n2. 📧 IMPORTANTE: En la esquina superior derecha');
console.log('   - Click en el ícono de cuenta');
console.log('   - Asegúrate de estar logueado con: joaquinperez028@gmail.com');
console.log('   - Si no, cambia de cuenta');

console.log('\n3. ⚙️ Configurar OAuth Playground:');
console.log('   - En la esquina superior derecha, click en ⚙️ (configuración)');
console.log('   - Marcar "Use your own OAuth credentials"');
console.log('   - OAuth Client ID: 543877130645-56odc6i9t4oh1p14lfb0khbju43qnb8c.apps.googleusercontent.com');
console.log('   - OAuth Client secret: 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');
console.log('   - Click "Close"');

console.log('\n4. 🔍 Seleccionar APIs:');
console.log('   - En "Step 1", busca "Calendar API v3"');
console.log('   - Marca estas opciones:');
console.log('     ✅ https://www.googleapis.com/auth/calendar');
console.log('     ✅ https://www.googleapis.com/auth/calendar.events');

console.log('\n5. 🔐 Autorizar APIs:');
console.log('   - Click "Authorize APIs"');
console.log('   - Se abrirá una ventana de autorización');
console.log('   - ⚠️ CRÍTICO: Asegúrate de autorizar con joaquinperez028@gmail.com');
console.log('   - Autoriza TODOS los permisos');

console.log('\n6. 🔄 Intercambiar por tokens:');
console.log('   - En "Step 2", click "Exchange authorization code for tokens"');
console.log('   - ¡Se generarán tus tokens!');

console.log('\n7. 📋 Copiar tokens:');
console.log('   - access_token: Copiarlo para ADMIN_GOOGLE_ACCESS_TOKEN');
console.log('   - refresh_token: Copiarlo para ADMIN_GOOGLE_REFRESH_TOKEN');

console.log('\n8. 🧪 (Opcional) Probar los tokens:');
console.log('   - En "Step 3", puedes hacer requests de prueba');
console.log('   - Request URI: https://www.googleapis.com/calendar/v3/calendars/primary');
console.log('   - Click "Send the request" para verificar que funciona');

console.log('\n' + '=' .repeat(60));
console.log('📋 VARIABLES PARA VERCEL:');
console.log('ADMIN_GOOGLE_ACCESS_TOKEN=el_access_token_que_obtuviste');
console.log('ADMIN_GOOGLE_REFRESH_TOKEN=el_refresh_token_que_obtuviste');

console.log('\n✅ VENTAJAS DE ESTE MÉTODO:');
console.log('- No interfiere con NextAuth');
console.log('- No requiere configuración adicional');
console.log('- Más simple y confiable');
console.log('- Puedes probar los tokens inmediatamente');

console.log('\n🔧 PASOS SIGUIENTES:');
console.log('1. Obtener los tokens siguiendo los pasos de arriba');
console.log('2. Actualizar las variables en Vercel');
console.log('3. Redeploy la aplicación');
console.log('4. Probar una nueva reserva');

console.log('\n' + '=' .repeat(60)); 