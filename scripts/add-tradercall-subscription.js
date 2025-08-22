const mongoose = require('mongoose');
require('dotenv').config();

// Esquema de Usuario (simplificado para el script)
const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  role: {
    type: String,
    enum: ['normal', 'suscriptor', 'admin'],
    default: 'normal'
  },
  subscriptionExpiry: Date,
  lastPaymentDate: Date,
  activeSubscriptions: [{
    service: {
      type: String,
      enum: ['TraderCall', 'SmartMoney', 'CashFlow'],
      required: true
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    mercadopagoPaymentId: String,
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'ARS'
    }
  }],
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

/**
 * Función para agregar membresía TraderCall por 2 días a un usuario
 */
async function addTraderCallSubscription(userEmail, durationDays = 2) {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log(`🔍 Buscando usuario: ${userEmail}`);
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.name} (${user.email})`);

    // Calcular fechas
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Verificar si ya tiene una suscripción activa de TraderCall
    const existingSubscription = user.activeSubscriptions.find(
      sub => sub.service === 'TraderCall' && sub.isActive && new Date() < sub.expiryDate
    );

    if (existingSubscription) {
      console.log('⚠️ Usuario ya tiene suscripción activa de TraderCall');
      console.log(`📅 Fecha de vencimiento actual: ${existingSubscription.expiryDate.toLocaleDateString('es-AR')}`);
      
      // Extender la suscripción existente
      existingSubscription.expiryDate = new Date(existingSubscription.expiryDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      existingSubscription.isActive = true;
      
      console.log(`📅 Nueva fecha de vencimiento: ${existingSubscription.expiryDate.toLocaleDateString('es-AR')}`);
    } else {
      console.log('➕ Agregando nueva suscripción de TraderCall');
      
      // Agregar nueva suscripción
      user.activeSubscriptions.push({
        service: 'TraderCall',
        startDate,
        expiryDate,
        isActive: true,
        amount: 0, // Gratis por 2 días
        currency: 'ARS'
      });
    }

    // Actualizar fecha de expiración general si es necesario
    if (!user.subscriptionExpiry || user.subscriptionExpiry < expiryDate) {
      user.subscriptionExpiry = expiryDate;
    }

    // Actualizar rol si es necesario
    if (user.role === 'normal') {
      user.role = 'suscriptor';
      console.log('👤 Rol actualizado a suscriptor');
    }

    // Guardar cambios
    await user.save();

    console.log('✅ Membresía TraderCall agregada exitosamente');
    console.log(`📅 Fecha de vencimiento: ${expiryDate.toLocaleDateString('es-AR')} ${expiryDate.toLocaleTimeString('es-AR')}`);
    console.log(`👤 Rol del usuario: ${user.role}`);

    // Mostrar suscripciones activas
    const activeSubs = user.activeSubscriptions.filter(sub => 
      sub.isActive && new Date() < sub.expiryDate
    );
    
    if (activeSubs.length > 0) {
      console.log('\n📋 Suscripciones activas:');
      activeSubs.forEach(sub => {
        console.log(`  - ${sub.service}: Vence ${sub.expiryDate.toLocaleDateString('es-AR')}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📝 Uso: node add-tradercall-subscription.js <email_usuario> [dias]');
    console.log('📝 Ejemplo: node add-tradercall-subscription.js usuario@ejemplo.com 2');
    process.exit(1);
  }

  const userEmail = args[0];
  const durationDays = parseInt(args[1]) || 2;

  console.log(`🎯 Agregando membresía TraderCall por ${durationDays} días a: ${userEmail}`);
  console.log('=' .repeat(60));

  await addTraderCallSubscription(userEmail, durationDays);
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { addTraderCallSubscription };
