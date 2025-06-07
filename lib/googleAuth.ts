import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import dbConnect from './mongodb';
import User from '@/models/User';

// Mover validaciones a funciones para evitar problemas en build time
function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  const client = new MongoClient(uri);
  return client.connect();
}

export const authOptions: NextAuthOptions = {
  // Comentamos el adapter por ahora para evitar problemas de conexión
  // adapter: MongoDBAdapter(getMongoClient()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 Iniciando sesión:', user.email);
      
      try {
        const connection = await dbConnect();
        
        if (!connection) {
          console.error('❌ No se pudo conectar a MongoDB durante signIn');
          // Permitir login aunque no se pueda guardar en BD
          return true;
        }
        
        // Buscar usuario existente
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Crear nuevo usuario
          console.log('👤 Creando nuevo usuario:', user.email);
          existingUser = await User.create({
            googleId: account?.providerAccountId,
            name: user.name,
            email: user.email,
            picture: user.image,
            role: 'normal',
            tarjetas: [],
            compras: [],
            suscripciones: [],
            lastLogin: new Date() // Registrar primer login
          });
        } else {
          // Actualizar información del usuario Y el último login
          console.log('👤 Actualizando usuario existente y último login:', user.email);
          await User.findByIdAndUpdate(existingUser._id, {
            name: user.name,
            picture: user.image,
            googleId: account?.providerAccountId,
            lastLogin: new Date() // Actualizar último login
          });
        }
        
        return true;
      } catch (error) {
        console.error('❌ Error en signIn callback:', error);
        // Permitir login aunque haya error para evitar crashes
        return true;
      }
    },
    
    async session({ session, token }) {
      console.log(`🔍 SESSION callback - Email: ${session.user?.email}`);
      console.log(`🔍 TOKEN data - Role: ${token.role}, UserId: ${token.userId}`);
      
      // Usar principalmente datos del token para evitar consultas excesivas a BD
      if (session.user?.email && token) {
        session.user.id = token.userId as string || session.user.id;
        session.user.role = token.role as any || 'normal';
        session.user.image = token.picture as string || session.user.image;
        session.user.suscripciones = token.suscripciones as any || [];
        
        console.log(`✅ SESSION actualizada - Rol asignado: ${session.user.role}`);
      }
      
      return session;
    },
    
    async jwt({ token, user, account, trigger }) {
      console.log(`🔍 JWT callback - Email: ${token.email}, Trigger: ${trigger}`);
      
      // SIEMPRE verificar el rol más actualizado desde la BD para asegurar que los cambios de rol se reflejen
      if (token.email) {
        try {
          const connection = await dbConnect();
          if (connection) {
            const dbUser = await User.findOne({ email: token.email })
              .select('_id role picture suscripciones')
              .lean()
              .maxTimeMS(2000) as any;
            
            if (dbUser) {
              token.userId = dbUser._id.toString();
              token.role = dbUser.role; // SIEMPRE actualizar el rol desde BD
              token.picture = dbUser.picture;
              token.suscripciones = dbUser.suscripciones;
              
              console.log(`🔄 JWT actualizado para ${token.email} - Rol BD: ${dbUser.role} → Token: ${token.role}`);
            } else {
              console.log(`❌ No se encontró usuario en BD para: ${token.email}`);
            }
          } else {
            console.log(`❌ No hay conexión a BD en JWT callback`);
          }
        } catch (error) {
          console.error('❌ Error en JWT callback:', error);
          // Usar valores existentes si hay error
          token.role = token.role || 'normal';
        }
      }
      
      console.log(`🏁 JWT final - Role: ${token.role}, UserId: ${token.userId}`);
      return token;
    }
  },

  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extender el tipo de session para incluir nuestros campos personalizados
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: 'normal' | 'suscriptor' | 'admin';
      suscripciones: Array<{
        servicio: 'TraderCall' | 'SmartMoney' | 'CashFlow';
        fechaInicio: Date;
        fechaVencimiento: Date;
        activa: boolean;
      }>;
    };
  }
  
  interface User {
    role: 'normal' | 'suscriptor' | 'admin';
  }
} 