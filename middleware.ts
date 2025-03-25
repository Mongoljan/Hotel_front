import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  

  // Redirect to login if there is no token
  // if (!token) {
  //   return NextResponse.redirect(new URL(`/auth/login`, req.url));
  // }

  // If a token exists, redirect to the admin dashboard
 
}

// Apply middleware to protected routes
export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/user/:path*"],
};
