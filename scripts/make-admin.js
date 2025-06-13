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
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

async function makeAdmin() {
  try {
    console.log('🔧 SCRIPT PARA CREAR ADMINISTRADOR');
    console.log('=' .repeat(50));
    console.log('Conectando a MongoDB...');
    console.log('URI:', MONGODB_URI.substring(0, 50) + '...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
    });
    
    console.log('✅ Conectado exitosamente a MongoDB');
    
    // Email del usuario a hacer admin - CORREGIDO
    const email = 'joaquinperez028@gmail.com'; // Email correcto del administrador
    console.log(`🔍 Buscando usuario con email: ${email}`);
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      console.log('');
      console.log('📋 POSIBLES SOLUCIONES:');
      console.log('1. Verificar que el usuario se haya logueado al menos una vez');
      console.log('2. Verificar que el email sea exactamente:', email);
      console.log('3. Listar todos los usuarios para verificar emails:');
      
      // Listar algunos usuarios para debug
      const allUsers = await User.find({}, 'email name role').limit(10);
      console.log('');
      console.log('👥 USUARIOS EN LA BASE DE DATOS:');
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.email} - ${u.name} - Rol: ${u.role}`);
      });
      
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('  📧 Email:', user.email);
    console.log('  👤 Nombre:', user.name);
    console.log('  🔑 Rol actual:', user.role);
    console.log('  📅 Registrado:', user.createdAt);
    console.log('  🆔 Google ID:', user.googleId);
    
    if (user.role === 'admin') {
      console.log('');
      console.log('✅ El usuario ya es administrador.');
      console.log('🎯 No se requieren cambios.');
      return;
    }
    
    console.log('');
    console.log('🔄 Actualizando rol a administrador...');
    
    // Actualizar el rol a admin
    user.role = 'admin';
    await user.save();
    
    console.log('✅ Usuario actualizado exitosamente a administrador');
    
    // Verificar el cambio
    const updatedUser = await User.findOne({ email: email });
    console.log('');
    console.log('🔍 VERIFICACIÓN FINAL:');
    console.log('  👤 Nombre:', updatedUser.name);
    console.log('  📧 Email:', updatedUser.email);
    console.log('  🔑 Rol:', updatedUser.role);
    console.log('  📅 Actualizado:', updatedUser.updatedAt);
    
    console.log('');
    console.log('🎉 ¡PROCESO COMPLETADO EXITOSAMENTE!');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('1. El usuario debe cerrar sesión y volver a iniciar sesión');
    console.log('2. Verificar que aparezcan las opciones de administrador en el menú');
    console.log('3. Probar acceso a /admin/dashboard');
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    console.log('');
    console.log('🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verificar la conexión a MongoDB');
    console.log('2. Verificar que el email sea correcto');
    console.log('3. Verificar que el usuario exista en la base de datos');
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

console.log('🚀 Iniciando script...');
makeAdmin(); 