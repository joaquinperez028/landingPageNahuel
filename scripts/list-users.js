const mongoose = require('mongoose');

// URI de MongoDB directa (del archivo env.example)
const MONGODB_URI = 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';

// Esquema de Usuario
const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String
  },
  role: {
    type: String,
    enum: ['normal', 'suscriptor', 'admin'],
    default: 'normal'
  },
  phone: String,
  address: String,
  tarjetas: [{
    numeroEnmascarado: String,
    tipo: String,
    expiracion: Date
  }],
  compras: [{
    itemId: String,
    tipo: String,
    fecha: Date,
    estado: String,
    monto: Number
  }],
  suscripciones: [{
    servicio: {
      type: String,
      enum: ['TraderCall', 'SmartMoney', 'CashFlow']
    },
    fechaInicio: Date,
    fechaVencimiento: Date,
    activa: {
      type: Boolean,
      default: true
    }
  }],
  fullName: {
    type: String,
    default: null,
  },
  cuitCuil: {
    type: String,
    default: null,
  },
  educacionFinanciera: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzado', 'experto'],
    default: null,
  },
  brokerPreferencia: {
    type: String,
    enum: ['bull-market', 'iol', 'portfolio-personal', 'cocos-capital', 'eco-valores', 'otros'],
    default: null,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

async function listUsers() {
  try {
    console.log('Conectando a MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Conectado exitosamente a MongoDB');
    
    // Buscar todos los usuarios
    const users = await User.find({}, 'name email role createdAt');
    
    console.log(`\nEncontrados ${users.length} usuarios:`);
    console.log('===============================================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Nombre: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Creado: ${user.createdAt}`);
      console.log('-------------------------------------------');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

listUsers(); 