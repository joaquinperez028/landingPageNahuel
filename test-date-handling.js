// Script de prueba para verificar el manejo de fechas
console.log('=== PRUEBA DE MANEJO DE FECHAS ===\n');

// Simular fecha que viene del frontend (formato YYYY-MM-DD)
const frontendDate = '2024-01-15';
console.log('1. Fecha del frontend:', frontendDate);

// Método anterior (problemático)
const oldMethod = new Date(frontendDate);
console.log('2. Método anterior (new Date):', oldMethod.toISOString());
console.log('   Problema: Se interpreta como UTC y puede cambiar el día');

// Método nuevo (correcto)
const [year, month, day] = frontendDate.split('-').map(Number);
const newMethod = new Date(Date.UTC(year, month - 1, day));
console.log('3. Método nuevo (Date.UTC):', newMethod.toISOString());
console.log('   Ventaja: Se crea explícitamente en UTC para la fecha seleccionada');

// Comparación
console.log('\n=== COMPARACIÓN ===');
console.log('Fecha original:', frontendDate);
console.log('Método anterior:', oldMethod.toISOString());
console.log('Método nuevo:', newMethod.toISOString());

// Verificar que el día sea el mismo
const oldDay = oldMethod.getUTCDate();
const newDay = newMethod.getUTCDate();
console.log('\nDía en UTC:');
console.log('Método anterior:', oldDay);
console.log('Método nuevo:', newDay);
console.log('¿Son iguales?', oldDay === newDay ? 'SÍ' : 'NO');

// Simular recuperación desde la base de datos
console.log('\n=== SIMULACIÓN DE RECUPERACIÓN ===');
const dbDate = newMethod; // Esta es la fecha que se guardaría en la BD
console.log('Fecha en BD:', dbDate.toISOString());

// Formateo anterior (problemático)
const displayDateOld = dbDate.toLocaleDateString('es-ES', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
console.log('Fecha formateada (método anterior):', displayDateOld);

// Formateo nuevo (corregido)
const displayDateNew = dbDate.toLocaleDateString('es-ES', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC'
});
console.log('Fecha formateada (método nuevo):', displayDateNew);

console.log('\n=== FIN DE PRUEBA ===');
