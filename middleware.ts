import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Solo aplicar a rutas administrativas
  if (pathname.startsWith('/admin')) {
    console.log('🔒 [MIDDLEWARE] Protegiendo ruta administrativa:', pathname);
    
    try {
      // Verificar token de autenticación
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      console.log('🔍 [MIDDLEWARE] Token encontrado:', !!token);
      console.log('👤 [MIDDLEWARE] Usuario:', token?.email);
      console.log('🔧 [MIDDLEWARE] Rol:', token?.role);
      
      // Si no hay token, redirigir a login
      if (!token) {
        console.log('❌ [MIDDLEWARE] No hay token - redirigiendo a login');
        return NextResponse.redirect(new URL('/api/auth/signin', request.url));
      }
      
      // Si no es admin, redirigir a home
      if (token.role !== 'admin') {
        console.log('❌ [MIDDLEWARE] Usuario no es admin - redirigiendo a home');
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      console.log('✅ [MIDDLEWARE] Acceso de admin confirmado para:', token.email);
      
    } catch (error) {
      console.error('💥 [MIDDLEWARE] Error verificando token:', error);
      // En caso de error, redirigir a login por seguridad
      return NextResponse.redirect(new URL('/api/auth/signin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 