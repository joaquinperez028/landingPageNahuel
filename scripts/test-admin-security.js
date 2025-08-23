const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAdminSecurity() {
  console.log('🔒 [TEST] Probando restricciones de seguridad administrativa...\n');

  // Test 1: Intentar acceder a página admin sin sesión
  console.log('🧪 Test 1: Acceso sin sesión a /admin/dashboard');
  try {
    const response = await fetch(`${BASE_URL}/admin/dashboard`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Redirect: ${response.headers.get('location') || 'No redirect'}`);
    
    if (response.status === 200) {
      console.log('   ❌ ERROR: Página accesible sin sesión');
    } else if (response.status === 302 || response.status === 301) {
      console.log('   ✅ OK: Redirección correcta');
    } else {
      console.log('   ⚠️  Status inesperado');
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }

  console.log('');

  // Test 2: Verificar que el middleware esté funcionando
  console.log('🧪 Test 2: Verificar middleware en /admin');
  try {
    const response = await fetch(`${BASE_URL}/admin`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Redirect: ${response.headers.get('location') || 'No redirect'}`);
    
    if (response.status === 200) {
      console.log('   ❌ ERROR: Página admin accesible sin autenticación');
    } else if (response.status === 302 || response.status === 301) {
      console.log('   ✅ OK: Middleware bloqueando acceso');
    } else {
      console.log('   ⚠️  Status inesperado');
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }

  console.log('');

  // Test 3: Verificar que páginas públicas sigan funcionando
  console.log('🧪 Test 3: Verificar acceso a página pública');
  try {
    const response = await fetch(`${BASE_URL}/`);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ OK: Página pública accesible');
    } else {
      console.log('   ❌ ERROR: Página pública no accesible');
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
  }

  console.log('\n📋 Resumen de Tests:');
  console.log('   - Si ves "❌ ERROR" en Tests 1 y 2, las restricciones NO están funcionando');
  console.log('   - Si ves "✅ OK" en Tests 1 y 2, las restricciones SÍ están funcionando');
  console.log('   - El middleware debería bloquear TODAS las rutas /admin/* sin autenticación');
}

// Ejecutar tests
testAdminSecurity().catch(console.error); 