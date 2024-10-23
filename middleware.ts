import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('jwtToken')?.value;
  const userType = req.cookies.get('userType')?.value;

  // If the user is not authenticated, redirect to the login page
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Restrict access based on user type for admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (userType !== 'Owner') {
      return NextResponse.redirect(new URL('/unauthorized', req.url)); // Redirect to unauthorized page or another appropriate action
    }
  }

  // Restrict access based on user type for superadmin routes
  if (req.nextUrl.pathname.startsWith('/superadmin')) {
    if (userType !== 'SuperAdmin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url)); // Redirect to unauthorized page or another appropriate action
    }
  }

  return NextResponse.next();
}

// Protect admin and user routes
export const config = {
  matcher: ['/admin/:path*', '/superadmin/:path*', '/user/:path*'],
};
