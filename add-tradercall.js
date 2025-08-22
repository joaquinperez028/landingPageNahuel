const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Esquema de Usuario
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
  activeSubscriptions: [{
    service: {
      type: String,
      enum: ['TraderCall', 'SmartMoney', 'CashFlow']
    },
    startDate: Date,
    expiryDate: Date,
    isActive: Boolean,
    amount: Number,
    currency: String
  }]
});

const User = mongoose.model('User', userSchema);

// Función principal
async function addTraderCallMembership() {
  try {
    await connectDB();

    // Email del usuario (cambia esto por el email del usuario que quieres agregar)
    const userEmail = 'lozanonahuel@gmail.com'; // CAMBIA ESTE EMAIL
    const durationDays = 2;

    console.log(`🔍 Buscando usuario: ${userEmail}`);
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.name}`);

    // Calcular fechas
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Verificar si ya tiene suscripción activa
    const existingSub = user.activeSubscriptions.find(
      sub => sub.service === 'TraderCall' && sub.isActive && new Date() < sub.expiryDate
    );

    if (existingSub) {
      console.log('⚠️ Usuario ya tiene suscripción activa de TraderCall');
      console.log(`📅 Vencimiento actual: ${existingSub.expiryDate.toLocaleDateString('es-AR')}`);
      
      // Extender suscripción
      existingSub.expiryDate = new Date(existingSub.expiryDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      console.log(`📅 Nuevo vencimiento: ${existingSub.expiryDate.toLocaleDateString('es-AR')}`);
    } else {
      console.log('➕ Agregando nueva suscripción de TraderCall');
      
      // Agregar nueva suscripción
      user.activeSubscriptions.push({
        service: 'TraderCall',
        startDate,
        expiryDate,
        isActive: true,
        amount: 0,
        currency: 'ARS'
      });
    }

    // Actualizar fecha de expiración general
    if (!user.subscriptionExpiry || user.subscriptionExpiry < expiryDate) {
      user.subscriptionExpiry = expiryDate;
    }

    // Actualizar rol
    if (user.role === 'normal') {
      user.role = 'suscriptor';
    }

    // Guardar cambios
    await user.save();

    console.log('✅ Membresía TraderCall agregada exitosamente');
    console.log(`📅 Vence: ${expiryDate.toLocaleDateString('es-AR')} ${expiryDate.toLocaleTimeString('es-AR')}`);
    console.log(`👤 Rol: ${user.role}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
addTraderCallMembership();
