import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // If user is authenticated and visits "/", redirect to /admin/hotel
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/hotel", req.url));
  }

  // If unauthenticated and tries to access protected routes, redirect to login
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/") ||
    pathname.startsWith("/user");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Allow other requests to proceed
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
     * - auth/login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/login).*)',
  ],
};
