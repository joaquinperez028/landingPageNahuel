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
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/landingPageNahuel';
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

// Función para promover usuario
async function promoteUser() {
  try {
    await connectDB();

    // Obtener argumentos
    const userEmail = process.argv[2];
    const newRole = process.argv[3] || 'admin';
    
    if (!userEmail) {
      console.log('❌ Por favor proporciona un email y opcionalmente un rol:');
      console.log('node scripts/promote-user.js tu-email@gmail.com [admin|suscriptor|normal]');
      console.log('');
      console.log('Ejemplos:');
      console.log('  node scripts/promote-user.js juan@email.com admin');
      console.log('  node scripts/promote-user.js maria@email.com suscriptor');
      console.log('  node scripts/promote-user.js pedro@email.com normal');
      process.exit(1);
    }

    // Validar rol
    const validRoles = ['normal', 'suscriptor', 'admin'];
    if (!validRoles.includes(newRole)) {
      console.log('❌ Rol inválido. Roles válidos:', validRoles.join(', '));
      process.exit(1);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.log('❌ El email proporcionado no tiene un formato válido');
      process.exit(1);
    }

    // Buscar usuario existente
    const existingUser = await User.findOne({ email: userEmail });
    
    if (!existingUser) {
      console.log('❌ No se encontró un usuario con el email:', userEmail);
      console.log('💡 El usuario debe registrarse primero en la aplicación.');
      console.log('💡 Dile al usuario que visite tu sitio y haga login con Google al menos una vez.');
      process.exit(1);
    }

    // Verificar si ya tiene ese rol
    if (existingUser.role === newRole) {
      console.log(`✅ El usuario ya tiene el rol "${newRole}":`, userEmail);
      console.log('👤 Nombre:', existingUser.name);
      console.log('📅 Última actualización:', new Date(existingUser.updatedAt).toLocaleString());
      process.exit(0);
    }

    // Actualizar rol
    const oldRole = existingUser.role;
    await User.findByIdAndUpdate(existingUser._id, { 
      role: newRole,
      updatedAt: new Date()
    });

    console.log('🎉 ¡Usuario actualizado exitosamente!');
    console.log('📧 Email:', userEmail);
    console.log('👤 Nombre:', existingUser.name);
    console.log('🔧 Rol anterior:', oldRole);
    console.log('🔧 Rol nuevo:', newRole);
    console.log('📅 Fecha de cambio:', new Date().toLocaleString());
    
    // Mostrar información adicional según el rol
    if (newRole === 'admin') {
      console.log('');
      console.log('🔐 El usuario ahora puede:');
      console.log('   - Acceder al panel de administración');
      console.log('   - Gestionar notificaciones en /admin/notifications');
      console.log('   - Ver todas las notificaciones sin restricción de tiempo');
      console.log('   - Promover otros usuarios (usando este script)');
    } else if (newRole === 'suscriptor') {
      console.log('');
      console.log('📋 El usuario ahora puede:');
      console.log('   - Acceder a contenido para suscriptores');
      console.log('   - Recibir notificaciones dirigidas a suscriptores');
      console.log('   - Acceder a funcionalidades premium');
    } else {
      console.log('');
      console.log('👤 El usuario ahora tiene acceso básico:');
      console.log('   - Solo contenido público');
      console.log('   - Solo notificaciones para todos los usuarios');
      console.log('   - Funcionalidades limitadas');
    }

    // Listar usuarios por rol
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Resumen de usuarios por rol:');
    usersByRole.forEach(group => {
      console.log(`   - ${group._id}: ${group.count} usuario${group.count !== 1 ? 's' : ''}`);
    });

    if (newRole === 'admin') {
      console.log('\n🎯 Siguientes pasos para el nuevo administrador:');
      console.log('1. Hacer logout y login nuevamente en la aplicación');
      console.log('2. Buscar el menú de administrador en el navbar');
      console.log('3. Visitar /admin/notifications para gestionar notificaciones');
    }

  } catch (error) {
    console.error('❌ Error promoviendo usuario:', error);
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
promoteUser(); 