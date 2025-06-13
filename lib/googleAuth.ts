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
          // Solo permisos básicos - SIN calendario
          scope: 'openid email profile',
          prompt: 'select_account', // Cambiar de 'consent' a 'select_account' para ser menos invasivo
          response_type: 'code'
          // Eliminamos access_type: 'offline' ya que no necesitamos refresh tokens para usuarios normales
        },
      },
    }),
  ],
  pages: {
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 Iniciando sesión:', user.email);
      console.log('🖼️ Datos de imagen:', {
        userImage: user.image,
        profilePicture: (profile as any)?.picture,
        hasUserImage: !!user.image,
        hasProfilePicture: !!(profile as any)?.picture
      });
      
      try {
        const connection = await dbConnect();
        
        if (!connection) {
          console.error('❌ No se pudo conectar a MongoDB durante signIn');
          // Permitir login aunque no se pueda guardar en BD
          return true;
        }
        
        // Buscar usuario existente
        let existingUser = await User.findOne({ email: user.email });
        
        // Usar la imagen del profile si está disponible, sino la del user
        const userImageUrl = user.image || (profile as any)?.picture;
        console.log('🖼️ URL de imagen final:', userImageUrl);
        
        if (!existingUser) {
          // Crear nuevo usuario - SIN tokens de Google para usuarios normales
          console.log('👤 Creando nuevo usuario:', user.email);
          existingUser = await User.create({
            googleId: account?.providerAccountId,
            name: user.name,
            email: user.email,
            picture: userImageUrl,
            role: 'normal',
            tarjetas: [],
            compras: [],
            suscripciones: [],
            lastLogin: new Date(), // Registrar primer login
            // NO guardamos tokens de Google para usuarios normales
          });
        } else {
          // Actualizar información del usuario Y el último login - SIN tokens
          console.log('👤 Actualizando usuario existente y último login:', user.email);
          await User.findByIdAndUpdate(existingUser._id, {
            name: user.name,
            picture: userImageUrl,
            googleId: account?.providerAccountId,
            lastLogin: new Date(), // Actualizar último login
            // NO actualizamos tokens de Google para usuarios normales
          });
        }
        
        return true;
      } catch (error) {
        console.error('❌ Error en signIn callback:', error);
        // Permitir login aunque haya error para evitar crashes
        return true;
      }
    },
    async jwt({ token, account, user }) {
      // NO persistimos tokens de Google para usuarios normales
      // Solo información básica del usuario
      return token;
    },
    async session({ session, token }) {
      // Solo devolvemos información básica del usuario
      // NO incluimos access tokens
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
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
    // Eliminamos accessToken ya que no lo necesitamos para usuarios normales
  }
  
  interface User {
    role: 'normal' | 'suscriptor' | 'admin';
    // Eliminamos campos de Google tokens para usuarios normales
  }
} 