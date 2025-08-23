const fs = require('fs');
const path = require('path');

console.log('🔧 Script de configuración de variables de entorno');
console.log('===============================================\n');

// Verificar si existe .env.local
const envLocalPath = path.join(__dirname, '../.env.local');
const envExamplePath = path.join(__dirname, '../env.example');

console.log('📁 Verificando archivos de configuración...');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ No se encontró .env.local');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('✅ Se encontró env.example');
    console.log('\n💡 Para configurar las variables de entorno:');
    console.log('1. Copia el archivo env.example a .env.local:');
    console.log('   cp env.example .env.local');
    console.log('');
    console.log('2. O crea manualmente el archivo .env.local con:');
    console.log('   MONGODB_URI=tu_uri_de_mongodb_aqui');
    console.log('   NEXTAUTH_SECRET=tu_secret_aqui');
    console.log('   (y otras variables necesarias)');
  } else {
    console.log('❌ Tampoco se encontró env.example');
    console.log('\n💡 Necesitas crear un archivo .env.local con al menos:');
    console.log('   MONGODB_URI=tu_uri_de_mongodb_aqui');
  }
  
  console.log('\n⚠️  Sin .env.local, los scripts no podrán conectarse a MongoDB');
  process.exit(1);
} else {
  console.log('✅ Se encontró .env.local');
  
  // Verificar variables clave
  require('dotenv').config({ path: envLocalPath });
  
  const requiredVars = ['MONGODB_URI'];
  const missingVars = [];
  
  console.log('\n🔍 Verificando variables requeridas...');
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Configurada`);
    } else {
      console.log(`❌ ${varName}: Faltante`);
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n⚠️  Faltan ${missingVars.length} variable(s) requerida(s):`);
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Agrega estas variables a tu archivo .env.local');
    process.exit(1);
  } else {
    console.log('\n🎉 ¡Todas las variables requeridas están configuradas!');
    console.log('\n🚀 Ahora puedes ejecutar los scripts de generación de turnos:');
    console.log('   - Prueba: node scripts/generate-test-saturday-slots.js');
    console.log('   - Completo: node scripts/generate-saturday-slots.js');
  }
}

console.log('\n📚 Para más información, consulta:');
console.log('   - README: scripts/README_SATURDAY_SLOTS.md');
console.log('   - Ejemplo: env.example');

process.exit(0); 