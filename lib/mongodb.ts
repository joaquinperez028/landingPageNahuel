import mongoose from 'mongoose';

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  console.log('🔄 Intentando conectar a MongoDB...');
  
  // Validar MONGODB_URI solo en runtime
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('❌ Variable de entorno MONGODB_URI no encontrada');
    throw new Error('Por favor define la variable de entorno MONGODB_URI');
  }
  
  if (cached.conn) {
    console.log('✅ Usando conexión existente a MongoDB');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      // Aumentar timeouts para evitar errores de conexión
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
      connectTimeoutMS: 30000, // 30 segundos
      // Configuraciones adicionales para estabilidad
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 30000,
      // Configuración para retry de conexión
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Conectado exitosamente a MongoDB');
      return mongoose;
    }).catch((error) => {
      console.error('❌ Error en la promesa de conexión a MongoDB:', error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error conectando a MongoDB:', e);
    // En lugar de hacer throw, devolvemos null para evitar crashes
    return null;
  }

  return cached.conn;
}

export default dbConnect; 