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
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
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
          // Crear nuevo usuario
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
            googleAccessToken: account?.access_token,
            googleRefreshToken: account?.refresh_token,
            googleTokenExpiry: account?.expires_at
          });
        } else {
          // Actualizar información del usuario Y el último login
          console.log('👤 Actualizando usuario existente y último login:', user.email);
          await User.findByIdAndUpdate(existingUser._id, {
            name: user.name,
            picture: userImageUrl,
            googleId: account?.providerAccountId,
            lastLogin: new Date(), // Actualizar último login
            googleAccessToken: account?.access_token,
            googleRefreshToken: account?.refresh_token,
            googleTokenExpiry: account?.expires_at
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
      // Persistir el access_token y refresh_token en el token JWT
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Enviar el access_token al cliente
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
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
    accessToken?: string;
  }
  
  interface User {
    role: 'normal' | 'suscriptor' | 'admin';
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleTokenExpiry?: number;
  }
} 