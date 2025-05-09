import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const isApproved = req.cookies.get("isApproved")?.value === "true";
  const { pathname } = req.nextUrl;

  // Redirect authenticated users visiting root "/" to /admin/hotel
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/hotel", req.url));
  }

  const isAdminRoute = pathname.startsWith("/admin");

  // If unauthenticated and tries to access /admin, redirect to login
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If authenticated but not approved, block all except /admin/hotel
  if (isAdminRoute && token && !isApproved && pathname !== "/admin/hotel") {
    return NextResponse.redirect(new URL("/admin/hotel", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/login).*)',
  ],
};
