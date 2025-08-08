// Script para crear una suscripción de prueba que expire en 1 minuto
// Ejecutar con: node create-test-subscription.js

const { MongoClient } = require('mongodb');

// Configuración
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';
const TEST_USER_EMAIL = 'franco.l.varela99@gmail.com'; // Cambiar por el email del usuario de prueba

async function createTestSubscription() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const paymentsCollection = db.collection('payments');
    
    // Buscar el usuario
    console.log(`🔍 Buscando usuario: ${TEST_USER_EMAIL}`);
    const user = await usersCollection.findOne({ email: TEST_USER_EMAIL });
    
    if (!user) {
      console.log('❌ Usuario no encontrado. Asegúrate de que el email sea correcto.');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${user.name}`);
    
    // Crear fecha de expiración (5 minutos desde ahora)
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutos
    
    console.log(`⏰ Fecha actual: ${now.toLocaleString('es-AR')}`);
    console.log(`⏰ Fecha de expiración: ${expiryDate.toLocaleString('es-AR')}`);
    
    // Crear el pago de prueba
    const testPayment = {
      userId: user._id,
      userEmail: TEST_USER_EMAIL,
      amount: 1.00,
      currency: 'ARS',
      service: 'cash-flow',
      serviceName: 'CashFlow',
      status: 'approved',
      paymentMethod: 'mercadopago',
      mercadopagoPaymentId: `test_${Date.now()}`,
      externalReference: `test_sub_${Date.now()}`,
      transactionDate: now,
      expiryDate: expiryDate,
      createdAt: now,
      updatedAt: now
    };
    
    console.log('💳 Creando pago de prueba...');
    const paymentResult = await paymentsCollection.insertOne(testPayment);
    console.log(`✅ Pago creado con ID: ${paymentResult.insertedId}`);
    
    // Actualizar el usuario con la suscripción activa
    const subscriptionData = {
      service: 'cash-flow',
      serviceName: 'CashFlow',
      startDate: now,
      expiryDate: expiryDate,
      paymentId: paymentResult.insertedId,
      status: 'active'
    };
    
    console.log('👤 Actualizando suscripciones del usuario...');
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      { 
        $push: { activeSubscriptions: subscriptionData },
        $set: { 
          subscriptionExpiry: expiryDate,
          lastPaymentDate: now,
          updatedAt: now
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Usuario actualizado con la nueva suscripción');
    } else {
      console.log('❌ Error al actualizar el usuario');
    }
    
    // Verificar que se creó correctamente
    const updatedUser = await usersCollection.findOne({ _id: user._id });
    const hasSubscription = updatedUser.activeSubscriptions?.some(sub => 
      sub.service === 'cash-flow' && sub.status === 'active'
    );
    
    if (hasSubscription) {
      console.log('✅ Verificación exitosa: El usuario tiene la suscripción activa');
      console.log(`📅 La suscripción expira en: ${expiryDate.toLocaleString('es-AR')}`);
      console.log(`⏱️ Tiempo restante: ${Math.round((expiryDate - now) / 1000)} segundos`);
    } else {
      console.log('❌ Error: La suscripción no se creó correctamente');
    }
    
    console.log('\n🎯 Próximos pasos:');
    console.log('1. Espera 1 minuto para que expire la suscripción');
    console.log('2. Ejecuta: node test-cron-endpoint.js');
    console.log('3. O ve a /admin/subscriptions y haz clic en "Procesar Notificaciones"');
    console.log('4. Verifica que se envíe el email de notificación');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Función para limpiar la suscripción de prueba
async function cleanupTestSubscription() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🧹 Limpiando suscripción de prueba...');
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const paymentsCollection = db.collection('payments');
    
    // Eliminar pagos de prueba
    const deletePaymentsResult = await paymentsCollection.deleteMany({
      externalReference: { $regex: /^test_sub_/ }
    });
    console.log(`🗑️ Eliminados ${deletePaymentsResult.deletedCount} pagos de prueba`);
    
    // Limpiar suscripciones de prueba del usuario
    const updateResult = await usersCollection.updateOne(
      { email: TEST_USER_EMAIL },
      { 
        $pull: { 
          activeSubscriptions: { 
            service: 'cash-flow',
            paymentId: { $exists: true }
          } 
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Suscripciones de prueba eliminadas del usuario');
    } else {
      console.log('ℹ️ No se encontraron suscripciones de prueba para eliminar');
    }
    
  } catch (error) {
    console.error('❌ Error al limpiar:', error);
  } finally {
    await client.close();
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
const command = args[0];

if (command === 'cleanup') {
  cleanupTestSubscription();
} else {
  createTestSubscription();
}

console.log('\n💡 Uso:');
console.log('  node create-test-subscription.js          # Crear suscripción de prueba');
console.log('  node create-test-subscription.js cleanup  # Limpiar suscripciones de prueba');
