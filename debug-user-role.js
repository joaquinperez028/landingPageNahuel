const mongoose = require('mongoose');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

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
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Función para verificar rol de usuario
async function checkUserRole(email) {
  try {
    await connectDB();
    
    const user = await User.findOne({ email }).select('name email role');
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return;
    }
    
    console.log('👤 Usuario encontrado:');
    console.log('  - Nombre:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Rol:', user.role);
    console.log('  - Es admin:', user.role === 'admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Obtener email desde argumentos
const email = process.argv[2];

if (!email) {
  console.log('❌ Por favor proporciona un email:');
  console.log('node debug-user-role.js tu-email@gmail.com');
  process.exit(1);
}

checkUserRole(email); 