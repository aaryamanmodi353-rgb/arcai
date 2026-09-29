import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  const publicPaths = ['/login', '/signup'];
  const isPublic = publicPaths.includes(path);
  
  // Skip middleware for static files, API routes, and images
  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/image.png') ||
    path.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  let verifiedToken = null;
  if (token) {
    verifiedToken = await verifyAuth(token);
  }

  if (!verifiedToken && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (verifiedToken) {
    const role = (verifiedToken as any).role;
    
    // Redirect logged in users away from auth pages
    if (isPublic) {
      if (role === 'admin') return NextResponse.redirect(new URL('/', request.url));
      if (role === 'customer') return NextResponse.redirect(new URL('/customer', request.url));
    }

    // Role-based routing restrictions
    if (path.startsWith('/customer') && role !== 'customer') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if ((path === '/' || path.startsWith('/leads')) && role !== 'admin') {
      return NextResponse.redirect(new URL('/customer', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
