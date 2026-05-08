import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('motopillos_session')?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MASTER_ADMIN')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Solo MASTER_ADMIN puede entrar a /admin/users
    if (pathname.startsWith('/admin/users') && session.role !== 'MASTER_ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  // Protect /cuenta routes
  if (pathname.startsWith('/cuenta')) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cuenta/:path*'],
};
