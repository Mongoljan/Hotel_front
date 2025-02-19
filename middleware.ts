import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "mn"]; // Supported locales
const defaultLocale = "en"; // Default language

export function middleware(req: NextRequest) {
  const token = req.cookies.get("jwtToken")?.value;
  const userType = req.cookies.get("userType")?.value;
  const userLocale = req.cookies.get("NEXT_LOCALE")?.value || defaultLocale; // Get locale from cookies

  // Ensure locale is valid; otherwise, default to "en"
  const locale = locales.includes(userLocale) ? userLocale : defaultLocale;

  // Redirect to login if user is not authenticated
  if (!token) {
    return NextResponse.redirect(new URL(`/auth/login`, req.url));
  }

  // Restrict access for admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && userType !== "Owner") {
    return NextResponse.redirect(new URL(`/unauthorized`, req.url));
  }

  // Restrict access for superadmin routes
  if (req.nextUrl.pathname.startsWith("/superadmin") && userType !== "SuperAdmin") {
    return NextResponse.redirect(new URL(`/unauthorized`, req.url));
  }

  // Pass locale as a header to be used in frontend
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

// Apply middleware to protected routes
export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/user/:path*"],
};
