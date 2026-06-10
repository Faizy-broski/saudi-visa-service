import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/admin/login';
  const isSetupPage = pathname === '/admin/setup';
  const isPublicApiRoute = pathname === '/api/admin/login' || pathname === '/api/admin/setup';
  const isAdminApiRoute = pathname.startsWith('/api/admin/') && !isPublicApiRoute;
  const isAdminPage = pathname.startsWith('/admin') && !isLoginPage && !isSetupPage;

  if (isAdminPage || isAdminApiRoute) {
    const token = request.cookies.get('admin_token')?.value;
    const secret = process.env.ADMIN_SECRET;

    if (!token || !secret || token !== secret) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
