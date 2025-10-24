import jwt, { SignOptions } from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET: string = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
const TOKEN_NAME = 'auth-token'
const REFRESH_TOKEN_NAME = 'refresh-token'

export interface UserPayload {
  id: string
  email: string
  name: string
  backendToken: string
  hotel: string
  position: string
  contact_number: string
  approved: boolean
  hotelApproved: boolean
  user_type?: number
}

export interface JWTPayload extends UserPayload {
  iat: number
  exp: number
}

export function createJWT(payload: UserPayload, expiresIn: string = '30m'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions)
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function createRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' } as SignOptions)
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    if (payload.type === 'refresh') {
      return { userId: payload.userId }
    }
    return null
  } catch (error) {
    return null
  }
}

export async function setAuthCookies(payload: UserPayload) {
  // Use the edge-compatible JWT for cookies
  const { createSimpleJWT } = await import('./jwt-edge')
  const token = createSimpleJWT(payload)
  const refreshToken = createRefreshToken(payload.id)
  
  const cookieStore = await cookies()
  
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60, // 30 minutes
    path: '/',
  })
  
  cookieStore.set(REFRESH_TOKEN_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  // Set approval status cookies for middleware (non-sensitive)
  cookieStore.set('user_approved', payload.approved.toString(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60,
    path: '/',
  })
  
  cookieStore.set('isApproved', payload.hotelApproved.toString(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60,
    path: '/',
  })

  if (payload.user_type !== undefined) {
    cookieStore.set('user_type', payload.user_type.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60,
      path: '/',
    })
  }
}

export async function getAuthToken(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  
  if (!token) {
    return null
  }
  
  // Use edge-compatible verification
  const { verifySimpleJWT } = await import('./jwt-edge')
  return verifySimpleJWT(token)
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  
  // Clear all auth-related cookies
  const cookiesToClear = [
    TOKEN_NAME,
    REFRESH_TOKEN_NAME,
    'user_approved',
    'isApproved',
    'user_type'
  ];
  
  cookiesToClear.forEach(cookieName => {
    cookieStore.delete(cookieName);
  });
  
  console.log('🧹 All auth cookies cleared');
}

export async function refreshAuthToken(): Promise<boolean> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN_NAME)?.value
  
  if (!refreshToken) {
    return false
  }
  
  const refreshPayload = verifyRefreshToken(refreshToken)
  if (!refreshPayload) {
    await clearAuthCookies()
    return false
  }
  
  // Here you would typically fetch fresh user data from your backend
  // For now, we'll return false to indicate refresh failed
  // You'll need to implement this based on your backend API
  return false
}