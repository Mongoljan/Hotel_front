// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const userApproved = req.cookies.get('user_approved')?.value === 'true'
  const hotelApproved = req.cookies.get('isApproved')?.value === 'true'
  const { pathname } = req.nextUrl

  // 1. If at root "/" and logged in, send to /admin/hotel
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/admin/hotel', req.url))
  }

  // 2. Protect /admin/*: not logged in → login
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // 3. If logged in but EITHER user or hotel isn't approved → lock to /admin/hotel
  if (
    pathname.startsWith('/admin') &&
    token &&
    (!userApproved || !hotelApproved) &&
    pathname !== '/admin/hotel'
  ) {
    return NextResponse.redirect(new URL('/admin/hotel', req.url))
  }

  // 4. Otherwise allow
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*'],
}
