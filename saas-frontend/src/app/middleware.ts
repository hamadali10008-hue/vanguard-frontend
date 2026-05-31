import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Grab the auth cookie or token from the request
  // (Note: Next.js Middleware runs on the server, so it checks cookies rather than localStorage)
  const token = request.cookies.get('token')?.value;
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginRoute = request.nextUrl.pathname === '/login';

  // Security Rule 1: If trying to access dashboard but NOT logged in -> Kick to login
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Security Rule 2: If already logged in but trying to go to login page -> Send straight to dashboard
  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If everything looks good, let them pass through normally
  return NextResponse.next();
}

// This tells Next.js EXACTLY which paths this security guard should watch
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};