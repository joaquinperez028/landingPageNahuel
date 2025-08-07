const mongoose = require('mongoose');

// URI de MongoDB directa
const MONGODB_URI = 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';

// Esquema de Usuario
const UserSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: { type: String, unique: true },
  picture: String,
  role: {
    type: String,
    enum: ['normal', 'suscriptor', 'admin'],
    default: 'normal'
  },
}, { timestamps: true });

// Esquema de Pago
const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  service: {
    type: String,
    enum: ['TraderCall', 'SmartMoney', 'CashFlow', 'TradingFundamentals', 'DowJones'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'ARS'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'in_process'],
    required: true,
    default: 'pending'
  },
  mercadopagoPaymentId: {
    type: String,
    required: false,
    unique: false
  },
  externalReference: {
    type: String,
    required: true,
    unique: true
  },
  paymentMethodId: {
    type: String,
    required: false
  },
  paymentTypeId: {
    type: String,
    required: false
  },
  installments: {
    type: Number,
    default: 1,
    min: 1
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);
const Payment = mongoose.model('Payment', PaymentSchema);

async function createTestPayment() {
  try {
    console.log('🧪 CREANDO PAGO DE PRUEBA PARA CASHFLOW');
    console.log('=' .repeat(50));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Tu email
    const email = 'franco.l.varela99@gmail.com';
    
    // Buscar tu usuario
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return;
    }
    
    console.log('👤 Usuario encontrado:', user.name, '(' + user.email + ')');
    
    // Crear pago de prueba
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 día
    const externalReference = `test_cashflow_${user._id}_${Date.now()}`;
    
    const testPayment = new Payment({
      userId: user._id,
      userEmail: user.email,
      service: 'CashFlow',
      amount: 1, // 1 peso
      currency: 'ARS',
      status: 'approved', // Simular pago aprobado
      mercadopagoPaymentId: `test_payment_${Date.now()}`,
      externalReference: externalReference,
      paymentMethodId: 'visa',
      paymentTypeId: 'credit_card',
      installments: 1,
      transactionDate: now,
      expiryDate: tomorrow, // Vence mañana
      metadata: {
        type: 'subscription',
        isTestPayment: true,
        createdBy: 'manual_script'
      }
    });
    
    await testPayment.save();
    
    console.log('');
    console.log('✅ PAGO DE PRUEBA CREADO EXITOSAMENTE');
    console.log('');
    console.log('📋 DETALLES DEL PAGO:');
    console.log('  👤 Usuario:', user.name);
    console.log('  📧 Email:', user.email);
    console.log('  🎯 Servicio: CashFlow');
    console.log('  💰 Monto: $1 ARS');
    console.log('  ✅ Estado: approved (aprobado)');
    console.log('  📅 Fecha de pago:', now.toLocaleString('es-AR'));
    console.log('  ⏰ Fecha de expiración:', tomorrow.toLocaleString('es-AR'));
    console.log('  🔗 Referencia externa:', externalReference);
    console.log('  🆔 Payment ID:', testPayment.mercadopagoPaymentId);
    
    const hoursUntilExpiry = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
    console.log('  ⏳ Expira en:', hoursUntilExpiry, 'horas');
    
    console.log('');
    console.log('🎯 AHORA PUEDES PROBAR:');
    console.log('');
    console.log('1. 🔍 Panel de Admin:');
    console.log('   - Ve a /admin/subscriptions');
    console.log('   - Deberías ver la suscripción activa de CashFlow');
    console.log('   - Haz clic en "Ver detalles" para ver el modal');
    console.log('   - Prueba enviar un email de recordatorio');
    console.log('');
    console.log('2. 👤 Panel de Usuario:');
    console.log('   - Ve a /perfil → Mis Compras');
    console.log('   - Deberías ver la suscripción activa');
    console.log('   - Verifica las estadísticas');
    console.log('');
    console.log('3. 🔔 Acceso a CashFlow:');
    console.log('   - Ve a /alertas/cash-flow');
    console.log('   - Deberías tener acceso como suscriptor');
    console.log('');
    console.log('4. ⏰ Prueba de Expiración:');
    console.log('   - Mañana la suscripción debería aparecer como expirada');
    console.log('   - El acceso a CashFlow debería bloquearse');
    console.log('');
    console.log('🗑️ Para limpiar este pago de prueba más tarde:');
    console.log(`   - Busca en admin el pago con referencia: ${externalReference}`);
    console.log('   - O ejecuta: node clean-test-payment.js');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Conexión cerrada');
  }
}

console.log('🚀 Iniciando creación de pago de prueba...');
createTestPayment().catch(console.error);
