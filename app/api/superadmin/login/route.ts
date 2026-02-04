import { NextRequest, NextResponse } from 'next/server'
import { createSimpleJWT } from '@/utils/jwt-edge'
import { USER_TYPES } from '@/lib/userTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.kacc.mn'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Call backend superadmin login API
    const response = await fetch(`${API_BASE_URL}/api/superadmin/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Invalid credentials' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const admin = data.admin

    // Create JWT token for session - createSimpleJWT takes expiresInMinutes as second param
    const jwtPayload = {
      id: admin.id.toString(),
      email: `${admin.username}@superadmin.local`,
      name: admin.username,
      backendToken: admin.token,
      hotel: '',
      position: 'SuperAdmin',
      contact_number: '',
      approved: true,
      hotelApproved: true,
      user_type: USER_TYPES.SUPER_ADMIN,
    }

    const token = createSimpleJWT(jwtPayload, 60 * 24) // 24 hours in minutes

    // Create response with cookies
    const res = NextResponse.json({
      success: true,
      message: data.message || 'Login successful',
      admin: {
        id: admin.id,
        username: admin.username,
        token: admin.token,
      },
    })

    // Set authentication cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    }

    res.cookies.set('auth-token', token, cookieOptions)
    res.cookies.set('superadmin_token', admin.token, {
      ...cookieOptions,
      httpOnly: false, // Allow client access for API calls
    })
    res.cookies.set('user_type', String(USER_TYPES.SUPER_ADMIN), {
      ...cookieOptions,
      httpOnly: false,
    })
    res.cookies.set('user_approved', 'true', {
      ...cookieOptions,
      httpOnly: false,
    })
    res.cookies.set('isApproved', 'true', {
      ...cookieOptions,
      httpOnly: false,
    })

    return res
  } catch (error) {
    console.error('Superadmin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
