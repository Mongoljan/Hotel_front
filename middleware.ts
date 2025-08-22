// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySimpleJWT, getTokenFromRequest } from '@/utils/jwt-edge'

export function middleware(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const userApproved = req.cookies.get('user_approved')?.value === 'true'
  const hotelApproved = req.cookies.get('isApproved')?.value === 'true'
  const { pathname } = req.nextUrl

  // Verify JWT token
  let isValidToken = false
  if (token) {
    const payload = verifySimpleJWT(token)
    isValidToken = !!payload
  }

  // 1. If at root "/" and logged in, send to /admin/hotel
  if (pathname === '/' && isValidToken) {
    return NextResponse.redirect(new URL('/admin/hotel', req.url))
  }

  // 2. If logged in and trying to access auth pages, redirect to appropriate admin page
  if (pathname.startsWith('/auth') && isValidToken) {
    // If both user and hotel are approved, go to dashboard
    if (userApproved && hotelApproved) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    // Otherwise go to hotel page (registration/approval process)
    return NextResponse.redirect(new URL('/admin/hotel', req.url))
  }

  // 3. Protect /admin/*: not logged in → login
  if (pathname.startsWith('/admin') && !isValidToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // 4. If logged in but EITHER user or hotel isn't approved → lock to /admin/hotel
  if (
    pathname.startsWith('/admin') &&
    isValidToken &&
    (!userApproved || !hotelApproved) &&
    pathname !== '/admin/hotel'
  ) {
    return NextResponse.redirect(new URL('/admin/hotel', req.url))
  }

  // 4. Otherwise allow
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/auth/:path*'],
}
