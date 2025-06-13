console.log('🔧 VERIFICAR CONFIGURACIÓN EN VERCEL');
console.log('=' .repeat(50));

console.log('✅ CONFIRMADO LOCALMENTE:');
console.log('- Los tokens funcionan perfectamente');
console.log('- Acceso directo a joaquinperez028@gmail.com: ✅');
console.log('- Primary calendar: joaquinperez028@gmail.com');
console.log('- Evento de prueba creado exitosamente');

console.log('\n❌ PROBLEMA EN PRODUCCIÓN:');
console.log('- Los logs muestran: "No se puede acceder a joaquinperez028@gmail.com"');
console.log('- Fallback a primary (que debería ser franco.l.varela99@gmail.com)');
console.log('- Esto indica que las variables en Vercel NO están actualizadas');

console.log('\n🔧 PASOS PARA SOLUCIONAR:');

console.log('\n1. 🌐 Ve a Vercel Dashboard:');
console.log('   https://vercel.com/dashboard');

console.log('\n2. 📁 Selecciona tu proyecto');

console.log('\n3. ⚙️ Ve a Settings → Environment Variables');

console.log('\n4. 🔍 VERIFICAR que estas variables existan:');
console.log('   ✅ ADMIN_GOOGLE_ACCESS_TOKEN');
console.log('   ✅ ADMIN_GOOGLE_REFRESH_TOKEN');

console.log('\n5. 🔄 Si NO existen, AGREGAR:');
console.log('   Variable 1:');
console.log('   - Name: ADMIN_GOOGLE_ACCESS_TOKEN');
console.log('   - Value: ya29.a0AW4XtxjzHPG7a4uqPlKzcFrchrgIiNmOydj5zh-5qOny6ST6v9BWmiGgOtlhnvLyJN5O8G5DxW06aMAb341ubnCJ1jp_tmPyJkoVWH3Zcmb6RYDtPkHonfpt8Pzt610qavaVI3hpGREwmtiMWo9GdvHHht5bRi8Q6geR2ceEaCgYKAdQSARYSFQHGX2MiiAl9aEY7K9DvHVWi732Zwg0175');
console.log('   - Environment: Production');

console.log('\n   Variable 2:');
console.log('   - Name: ADMIN_GOOGLE_REFRESH_TOKEN');
console.log('   - Value: 1//04KfS0a4p3xHaCgYIARAAGAQSNwF-L9IrDbeYTXN4S4V74C5afuUT8dIji7VQV-8gcIgJta0vP01Na8dh3NwxJhGrbfcgGdSLLZ8');
console.log('   - Environment: Production');

console.log('\n6. 🔄 Si SÍ existen, ACTUALIZAR los valores:');
console.log('   - Click en cada variable');
console.log('   - Click "Edit"');
console.log('   - Reemplazar con los nuevos valores de arriba');
console.log('   - Click "Save"');

console.log('\n7. 🚀 REDEPLOY OBLIGATORIO:');
console.log('   - Ve a la pestaña "Deployments"');
console.log('   - En el último deployment, click en "..."');
console.log('   - Click "Redeploy"');
console.log('   - ⚠️ IMPORTANTE: Esperar a que termine completamente');

console.log('\n8. 🧪 PROBAR INMEDIATAMENTE:');
console.log('   - Hacer una nueva reserva');
console.log('   - Verificar que aparezca en joaquinperez028@gmail.com');

console.log('\n' + '=' .repeat(50));
console.log('🎯 RESULTADO ESPERADO DESPUÉS DEL REDEPLOY:');
console.log('- ✅ Acceso directo a joaquinperez028@gmail.com');
console.log('- ❌ NO más fallback a primary');
console.log('- ✅ Eventos en el calendario correcto');

console.log('\n📋 SI SIGUE FALLANDO:');
console.log('1. Verificar que las variables se guardaron correctamente');
console.log('2. Hacer otro redeploy');
console.log('3. Verificar los logs de Vercel Functions');

console.log('\n' + '=' .repeat(50)); 