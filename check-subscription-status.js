// Script para verificar el estado de la suscripción de prueba
// Ejecutar con: node check-subscription-status.js

const { MongoClient } = require('mongodb');

// Configuración
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';
const TEST_USER_EMAIL = 'franco.l.varela99@gmail.com';

async function checkSubscriptionStatus() {
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
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log(`✅ Usuario: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    
    // Verificar suscripciones activas
    const now = new Date();
    console.log(`\n⏰ Fecha actual: ${now.toLocaleString('es-AR')}`);
    
    if (user.activeSubscriptions && user.activeSubscriptions.length > 0) {
      console.log('\n📋 Suscripciones activas:');
      user.activeSubscriptions.forEach((sub, index) => {
        const isExpired = new Date(sub.expiryDate) < now;
        const timeRemaining = Math.round((new Date(sub.expiryDate) - now) / 1000);
        
        console.log(`  ${index + 1}. ${sub.serviceName} (${sub.service})`);
        console.log(`     📅 Expira: ${new Date(sub.expiryDate).toLocaleString('es-AR')}`);
        console.log(`     ⏱️ Tiempo restante: ${timeRemaining} segundos`);
        console.log(`     📊 Estado: ${isExpired ? '❌ EXPIRADA' : '✅ ACTIVA'}`);
        console.log(`     💳 Payment ID: ${sub.paymentId}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay suscripciones activas');
    }
    
    // Verificar pagos recientes
    console.log('💳 Pagos recientes:');
    const recentPayments = await paymentsCollection.find({
      userEmail: TEST_USER_EMAIL,
      externalReference: { $regex: /^test_sub_/ }
    }).sort({ createdAt: -1 }).limit(5).toArray();
    
    if (recentPayments.length > 0) {
      recentPayments.forEach((payment, index) => {
        const isExpired = new Date(payment.expiryDate) < now;
        const timeRemaining = Math.round((new Date(payment.expiryDate) - now) / 1000);
        
        console.log(`  ${index + 1}. ${payment.serviceName} - $${payment.amount} ${payment.currency}`);
        console.log(`     📅 Expira: ${new Date(payment.expiryDate).toLocaleString('es-AR')}`);
        console.log(`     ⏱️ Tiempo restante: ${timeRemaining} segundos`);
        console.log(`     📊 Estado: ${isExpired ? '❌ EXPIRADA' : '✅ ACTIVA'}`);
        console.log(`     🔗 Reference: ${payment.externalReference}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay pagos de prueba recientes');
    }
    
    // Verificar si hay suscripciones que necesiten notificación
    const subscriptionsForNotification = user.activeSubscriptions?.filter(sub => {
      const expiryDate = new Date(sub.expiryDate);
      const timeDiff = expiryDate - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Suscripciones que expiran en las próximas 24 horas o ya expiraron
      return hoursDiff <= 24 && hoursDiff >= -24;
    });
    
    if (subscriptionsForNotification && subscriptionsForNotification.length > 0) {
      console.log('🔔 Suscripciones que necesitan notificación:');
      subscriptionsForNotification.forEach((sub, index) => {
        const timeDiff = new Date(sub.expiryDate) - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        let notificationType = '';
        if (timeDiff < 0) {
          notificationType = '❌ EXPIRADA - Enviar notificación de expiración';
        } else if (hoursDiff <= 24) {
          notificationType = '⚠️ ADVERTENCIA - Enviar notificación de advertencia';
        }
        
        console.log(`  ${index + 1}. ${sub.serviceName}`);
        console.log(`     📅 Expira: ${new Date(sub.expiryDate).toLocaleString('es-AR')}`);
        console.log(`     ⏱️ Tiempo restante: ${Math.round(hoursDiff)} horas (${Math.round(daysDiff)} días)`);
        console.log(`     📧 ${notificationType}`);
        console.log('');
      });
    } else {
      console.log('ℹ️ No hay suscripciones que necesiten notificación');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

checkSubscriptionStatus();
