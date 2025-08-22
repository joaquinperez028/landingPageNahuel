const mongoose = require('mongoose');

// Conectar a MongoDB
async function connectDB() {
  try {
    const mongoUri = 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';
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
  }],
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Función principal
async function listUsers() {
  try {
    await connectDB();

    console.log('🔍 Buscando usuarios en la base de datos...');
    
    const users = await User.find({}).select('name email role createdAt subscriptionExpiry activeSubscriptions').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos');
      return;
    }

    console.log(`✅ Se encontraron ${users.length} usuarios:`);
    console.log('=' .repeat(80));

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Creado: ${user.createdAt.toLocaleDateString('es-AR')}`);
      
      if (user.subscriptionExpiry) {
        const isActive = new Date() < user.subscriptionExpiry;
        console.log(`   Suscripción: ${isActive ? '✅ Activa' : '❌ Inactiva'} - Vence: ${user.subscriptionExpiry.toLocaleDateString('es-AR')}`);
      } else {
        console.log(`   Suscripción: ❌ Sin suscripción`);
      }

      if (user.activeSubscriptions && user.activeSubscriptions.length > 0) {
        console.log(`   Servicios activos:`);
        user.activeSubscriptions.forEach(sub => {
          if (sub.isActive && new Date() < sub.expiryDate) {
            console.log(`     - ${sub.service}: Vence ${sub.expiryDate.toLocaleDateString('es-AR')}`);
          }
        });
      }
      
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
listUsers();
