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
            suscripciones: []
          });
        } else {
          // Actualizar información del usuario
          console.log('👤 Actualizando usuario existente:', user.email);
          await User.findByIdAndUpdate(existingUser._id, {
            name: user.name,
            picture: user.image,
            googleId: account?.providerAccountId
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
      if (session.user?.email) {
        try {
          const connection = await dbConnect();
          
          if (!connection) {
            console.error('❌ No se pudo conectar a MongoDB durante session');
            return session;
          }
          
          const user = await User.findOne({ email: session.user.email });
          
          if (user) {
            session.user.id = user._id.toString();
            session.user.role = user.role;
            session.user.suscripciones = user.suscripciones;
          }
        } catch (error) {
          console.error('❌ Error en session callback:', error);
          // Continuar con la sesión básica aunque haya error
        }
      }
      
      return session;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
      }
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