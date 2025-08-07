const mongoose = require('mongoose');

// URI de MongoDB directa
const MONGODB_URI = 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';

// Esquema de Pago
const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userEmail: String,
  service: String,
  amount: Number,
  currency: String,
  status: String,
  mercadopagoPaymentId: String,
  externalReference: String,
  paymentMethodId: String,
  paymentTypeId: String,
  installments: Number,
  transactionDate: Date,
  expiryDate: Date,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', PaymentSchema);

async function cleanTestPayments() {
  try {
    console.log('🧹 LIMPIANDO PAGOS DE PRUEBA');
    console.log('=' .repeat(40));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Buscar pagos de prueba
    const testPayments = await Payment.find({
      'metadata.isTestPayment': true
    });
    
    console.log(`🔍 Encontrados ${testPayments.length} pagos de prueba`);
    
    if (testPayments.length === 0) {
      console.log('✅ No hay pagos de prueba para limpiar');
      return;
    }
    
    console.log('');
    console.log('📋 PAGOS DE PRUEBA ENCONTRADOS:');
    testPayments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.service} - $${payment.amount} ${payment.currency}`);
      console.log(`   📧 Usuario: ${payment.userEmail}`);
      console.log(`   📅 Creado: ${payment.createdAt.toLocaleString('es-AR')}`);
      console.log(`   ⏰ Expira: ${payment.expiryDate.toLocaleString('es-AR')}`);
      console.log(`   🔗 Referencia: ${payment.externalReference}`);
      console.log('');
    });
    
    // Eliminar pagos de prueba
    const result = await Payment.deleteMany({
      'metadata.isTestPayment': true
    });
    
    console.log(`✅ Eliminados ${result.deletedCount} pagos de prueba`);
    
    console.log('');
    console.log('🎯 AHORA PUEDES VERIFICAR:');
    console.log('- El panel de admin ya no debería mostrar estos pagos');
    console.log('- El perfil de usuario no debería mostrar estas suscripciones');
    console.log('- El acceso a los servicios debería estar bloqueado');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Conexión cerrada');
  }
}

console.log('🚀 Iniciando limpieza de pagos de prueba...');
cleanTestPayments().catch(console.error);
