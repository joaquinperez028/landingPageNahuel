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

async function makeAdmin() {
  try {
    console.log('Conectando a MongoDB...');
    console.log('URI:', MONGODB_URI.substring(0, 50) + '...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
    });
    
    console.log('Conectado exitosamente a MongoDB');
    
    // Buscar el usuario por email
    const email = 'joaquinperez8280@gmail.com'; // Email del usuario a hacer admin
    console.log(`Buscando usuario con email: ${email}`);
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }
    
    console.log('Usuario encontrado:', {
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Actualizar el rol a admin
    user.role = 'admin';
    await user.save();
    
    console.log('Usuario actualizado exitosamente a admin');
    
    // Verificar el cambio
    const updatedUser = await User.findOne({ email: email });
    console.log('Verificación - Usuario actualizado:', {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

makeAdmin(); 