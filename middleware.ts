// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySimpleJWT, getTokenFromRequest } from '@/utils/jwt-edge'

export function middleware(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const userApproved = req.cookies.get('user_approved')?.value === 'true'
  const hotelApproved = req.cookies.get('isApproved')?.value === 'true'
  const userType = parseInt(req.cookies.get('user_type')?.value || '0')
  const { pathname } = req.nextUrl

  // Verify JWT token
  let isValidToken = false
  if (token) {
    const payload = verifySimpleJWT(token)
    isValidToken = !!payload
  }

  // Allow access to superadmin login page without redirect
  if (pathname === '/auth/superadmin-login') {
    // If already logged in as superadmin, redirect to dashboard
    if (isValidToken && userType === 1) {
      return NextResponse.redirect(new URL('/superadmin/dashboard', req.url))
    }
    // Otherwise allow access to login page
    return NextResponse.next()
  }

  // Allow access to no-access page without redirect loops
  if (pathname === '/admin/no-access') {
    if (!isValidToken) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    return NextResponse.next()
  }

  // ===== SUPERADMIN ROUTES =====
  // Protect /superadmin/*: only SuperAdmin (user_type=1) can access
  if (pathname.startsWith('/superadmin')) {
    if (!isValidToken) {
      return NextResponse.redirect(new URL('/auth/superadmin-login', req.url))
    }
    if (userType !== 1) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    // SuperAdmin doesn't need user/hotel approval checks
    return NextResponse.next()
  }

  // ===== SUPERADMIN SHOULD NOT ACCESS /admin/* =====
  // Redirect SuperAdmin from /admin/* to /superadmin/dashboard
  if (pathname.startsWith('/admin') && isValidToken && userType === 1) {
    return NextResponse.redirect(new URL('/superadmin/dashboard', req.url))
  }

  // ===== ADMIN ROUTES =====
  // Role-based route protection (only if user IS approved - otherwise they need to go through approval flow)
  
  // Only Owner (2) can access /admin/users (user management)
  if (pathname.startsWith('/admin/users') && isValidToken && userApproved && hotelApproved) {
    if (userType !== 2) {
      return NextResponse.redirect(new URL('/admin/no-access', req.url))
    }
  }

  // Reception (4) cannot access settings pages (only if approved)
  if (userType === 4 && isValidToken && userApproved && hotelApproved) {
    const settingsPages = [
      '/admin/hotel',
      '/admin/room',
      '/admin/internal-rules',
      '/admin/corporate',
      '/admin/additional-services',
      '/admin/currency',
      '/admin/users',
    ];
    
    if (settingsPages.some(page => pathname.startsWith(page))) {
      return NextResponse.redirect(new URL('/admin/no-access', req.url))
    }
  }

  // 1. If at root "/" and logged in, redirect based on user type
  if (pathname === '/' && isValidToken) {
    if (userType === 1) {
      return NextResponse.redirect(new URL('/superadmin/dashboard', req.url))
    }
    // If approved, go to dashboard
    if (userApproved && hotelApproved) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    // Staff users (Reception/Manager) who are not approved go to hotel page to see waiting status
    // Owner who is not approved also goes to hotel page for registration flow
    return NextResponse.redirect(new URL('/admin/hotel', req.url))
  }

  // 2. If logged in and trying to access auth pages, redirect to appropriate page
  if (pathname.startsWith('/auth') && isValidToken) {
    // SuperAdmin goes to superadmin dashboard
    if (userType === 1) {
      return NextResponse.redirect(new URL('/superadmin/dashboard', req.url))
    }
    // If both user and hotel are approved, go to dashboard
    if (userApproved && hotelApproved) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    // Staff users waiting for approval go to hotel page to see their status
    // Owner goes to hotel page for registration/approval process
    return NextResponse.redirect(new URL('/admin/hotel', req.url))
  }

  // 3. Protect /admin/*: not logged in → login
  if (pathname.startsWith('/admin') && !isValidToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // 4. If logged in but EITHER user or hotel isn't approved → lock to /admin/hotel
  // (Skip this check for SuperAdmin - they should already be redirected above)
  // But for staff users who ARE approved, don't redirect them to /admin/hotel
  const isStaffUser = userType === 3 || userType === 4
  if (
    pathname.startsWith('/admin') &&
    isValidToken &&
    userType !== 1 &&
    (!userApproved || !hotelApproved) &&
    pathname !== '/admin/hotel'
  ) {
    return NextResponse.redirect(new URL('/admin/hotel', req.url))
  }

  // 5. Otherwise allow
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/auth/:path*', '/superadmin/:path*'],
}
