const mongoose = require('mongoose');

// Intentar cargar dotenv si está disponible
try {
  require('dotenv').config();
} catch (error) {
  console.log('💡 dotenv no disponible, usando variables de entorno del sistema');
}

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Tortu:Las40org@landingpagenahuel.pdccomn.mongodb.net/?retryWrites=true&w=majority&appName=landingPageNahuel';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    console.error('💡 Asegúrate de que MongoDB esté ejecutándose y la URL sea correcta');
    process.exit(1);
  }
};

// Esquema de Usuario (simplificado)
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
  // ... otros campos
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Función para crear administrador
async function setupAdmin() {
  try {
    await connectDB();

    // Obtener email desde argumentos de línea de comandos
    const adminEmail = process.argv[2];
    
    if (!adminEmail) {
      console.log('❌ Por favor proporciona un email:');
      console.log('node scripts/setup-admin.js tu-email@gmail.com');
      console.log('');
      console.log('Ejemplo:');
      console.log('  node scripts/setup-admin.js nahuel@ejemplo.com');
      process.exit(1);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      console.log('❌ El email proporcionado no tiene un formato válido');
      process.exit(1);
    }

    // Buscar usuario existente
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (!existingUser) {
      console.log('❌ No se encontró un usuario con el email:', adminEmail);
      console.log('💡 El usuario debe registrarse primero en la aplicación.');
      console.log('💡 Dile al usuario que visite tu sitio y haga login con Google al menos una vez.');
      process.exit(1);
    }

    // Verificar si ya es administrador
    if (existingUser.role === 'admin') {
      console.log('✅ El usuario ya es administrador:', adminEmail);
      
      // Mostrar todos los administradores existentes
      const allAdmins = await User.find({ role: 'admin' }, 'name email role createdAt');
      console.log('\n👥 Administradores actuales:');
      allAdmins.forEach(admin => {
        const joinDate = new Date(admin.createdAt).toLocaleDateString();
        console.log(`   - ${admin.name} (${admin.email}) - Registrado: ${joinDate}`);
      });
      
      process.exit(0);
    }

    // Promover a administrador
    await User.findByIdAndUpdate(existingUser._id, { 
      role: 'admin',
      updatedAt: new Date()
    });

    console.log('🎉 ¡Usuario promovido a administrador exitosamente!');
    console.log('📧 Email:', adminEmail);
    console.log('👤 Nombre:', existingUser.name);
    console.log('🔧 Rol anterior:', existingUser.role);
    console.log('🔧 Rol nuevo: admin');
    console.log('📅 Fecha de promoción:', new Date().toLocaleString());
    
    // Listar todos los administradores
    const allAdmins = await User.find({ role: 'admin' }, 'name email role createdAt');
    console.log('\n👥 Administradores actuales:');
    allAdmins.forEach(admin => {
      const joinDate = new Date(admin.createdAt).toLocaleDateString();
      console.log(`   - ${admin.name} (${admin.email}) - Registrado: ${joinDate}`);
    });

    console.log('\n🎯 Siguientes pasos:');
    console.log('1. El usuario debe hacer logout y login nuevamente');
    console.log('2. Buscar el menú de administrador en el navbar');
    console.log('3. Visitar /admin/notifications para gestionar notificaciones');

  } catch (error) {
    console.error('❌ Error configurando administrador:', error);
    if (error.name === 'MongoNetworkError') {
      console.error('💡 No se pudo conectar a MongoDB. Verifica:');
      console.error('   - Que MongoDB esté ejecutándose');
      console.error('   - Que la URL en MONGODB_URI sea correcta');
      console.error('   - Que tengas conexión a internet (si usas MongoDB Atlas)');
    }
  } finally {
    mongoose.connection.close();
  }
}

// Ejecutar script
setupAdmin(); 