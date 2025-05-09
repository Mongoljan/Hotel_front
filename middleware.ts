import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // If user is authenticated and visits "/", redirect to /admin/page
  if (token && (pathname === "/" || pathname === "/auth/login")) {
    return NextResponse.redirect(new URL("/admin/hotel", req.url));
  }

  // If unauthenticated and tries to access protected routes, redirect to login
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/user");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Allow other requests to proceed
  return NextResponse.next();
}

// Apply middleware to relevant routes
export const config = {
  matcher: ["/", "/auth/login", "/admin/:path*", "/superadmin/:path*", "/user/:path*"],
};
