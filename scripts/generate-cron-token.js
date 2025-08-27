#!/usr/bin/env node

/**
 * ✅ NUEVO: Script para generar un token seguro para CRON_SECRET_TOKEN
 * 
 * Uso:
 * node scripts/generate-cron-token.js
 * 
 * Este script genera un token aleatorio de 64 caracteres hexadecimales
 * que se debe usar como CRON_SECRET_TOKEN en Vercel y .env.local
 */

const crypto = require('crypto');

function generateCronToken() {
  // ✅ NUEVO: Generar token de 32 bytes (64 caracteres hex)
  const token = crypto.randomBytes(32).toString('hex');
  
  console.log('🔐 TOKEN GENERADO PARA CRON_SECRET_TOKEN:');
  console.log('='.repeat(60));
  console.log(token);
  console.log('='.repeat(60));
  console.log('');
  console.log('📋 INSTRUCCIONES:');
  console.log('');
  console.log('1. Copia el token de arriba');
  console.log('');
  console.log('2. En Vercel Dashboard:');
  console.log('   - Ve a Settings > Environment Variables');
  console.log('   - Agrega: CRON_SECRET_TOKEN');
  console.log('   - Valor: pega el token copiado');
  console.log('   - Selecciona Production, Preview y Development');
  console.log('');
  console.log('3. En tu .env.local:');
  console.log('   CRON_SECRET_TOKEN=' + token);
  console.log('');
  console.log('4. En Vercel, ve a Functions > Cron Jobs');
  console.log('   - Verifica que las tareas estén configuradas');
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('- Nunca compartas este token');
  console.log('- Usa el mismo token en Vercel y .env.local');
  console.log('- Si se compromete, genera uno nuevo');
  console.log('');
  console.log('✅ ¡Listo! Tus cron jobs ahora están protegidos');
}

// ✅ NUEVO: Ejecutar si se llama directamente
if (require.main === module) {
  generateCronToken();
}

module.exports = { generateCronToken }; 