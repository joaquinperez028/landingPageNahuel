const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Esquema de Usuario (simplificado para el script)
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: {
    type: String,
    enum: ['normal', 'suscriptor', 'admin'],
    default: 'normal'
  }
});

const User = mongoose.model('User', userSchema);

async function makeAdmin(email) {
  try {
    console.log(`🔍 Buscando usuario: ${email}`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return false;
    }
    
    console.log(`👤 Usuario encontrado: ${user.name} (${user.email})`);
    console.log(`📊 Rol actual: ${user.role}`);
    
    if (user.role === 'admin') {
      console.log('ℹ️ El usuario ya es administrador');
      return true;
    }
    
    // Actualizar rol a admin
    user.role = 'admin';
    await user.save();
    
    console.log('✅ Usuario actualizado a administrador exitosamente');
    console.log(`📊 Nuevo rol: ${user.role}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    return false;
  }
}

async function listAdmins() {
  try {
    console.log('🔍 Listando administradores...');
    
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('ℹ️ No hay administradores en el sistema');
      return;
    }
    
    console.log(`📊 Administradores encontrados: ${admins.length}`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - Rol: ${admin.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error listando administradores:', error);
  }
}

async function main() {
  await connectDB();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'make-admin') {
    const email = args[1];
    if (!email) {
      console.log('❌ Uso: node make-admin.js make-admin <email>');
      process.exit(1);
    }
    
    const success = await makeAdmin(email);
    if (success) {
      console.log('🎉 Proceso completado exitosamente');
    } else {
      console.log('💥 Proceso falló');
      process.exit(1);
    }
    
  } else if (command === 'list-admins') {
    await listAdmins();
    
  } else {
    console.log('📋 Comandos disponibles:');
    console.log('  node make-admin.js make-admin <email>  - Convertir usuario en admin');
    console.log('  node make-admin.js list-admins         - Listar administradores');
    console.log('');
    console.log('📝 Ejemplos:');
    console.log('  node make-admin.js make-admin usuario@ejemplo.com');
    console.log('  node make-admin.js list-admins');
  }
  
  await mongoose.disconnect();
  console.log('👋 Desconectado de MongoDB');
}

main().catch(console.error); 