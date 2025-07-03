// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Environment variables
const AUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is required");
}

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: AUTH_SECRET 
    });
    
    const { pathname } = req.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/error'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // If accessing root path and logged in, redirect to appropriate dashboard
    if (pathname === '/' && token) {
      const userApproved = Boolean(token.approved || token.isApproved);
      if (userApproved) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/admin/hotel', req.url));
      }
    }

    // If accessing public route and logged in, redirect to appropriate page
    if (isPublicRoute && token) {
      const userApproved = Boolean(token.approved || token.isApproved);
      if (userApproved) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/admin/hotel', req.url));
      }
    }

    // If accessing protected route and not logged in, redirect to login
    if (pathname.startsWith('/admin') && !token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // If accessing superadmin route and not logged in, redirect to login
    if (pathname.startsWith('/superadmin') && !token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Check user approval status for admin routes
    if (token && pathname.startsWith('/admin')) {
      const userApproved = Boolean(token.approved || token.isApproved);
      
      // If user is not approved, only allow access to hotel registration page
      if (!userApproved && pathname !== '/admin/hotel') {
        return NextResponse.redirect(new URL('/admin/hotel', req.url));
      }
      
      // If user is approved, allow access to all admin pages
      // Note: We removed the hotel approval check since user approval should be sufficient
    }

    // Allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to login for protected routes
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/superadmin')) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
