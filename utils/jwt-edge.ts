// Edge Runtime compatible JWT utils
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
const TOKEN_NAME = 'auth-token'

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
}

export interface JWTPayload extends UserPayload {
  iat: number
  exp: number
}

// Simple JWT implementation for Edge Runtime
export function createSimpleJWT(payload: UserPayload, expiresInMinutes: number = 30): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (expiresInMinutes * 60)
  }

  const encodedHeader = btoa(JSON.stringify(header)).replace(/[=+/]/g, c => ({ '=': '', '+': '-', '/': '_' }[c] || c))
  const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/[=+/]/g, c => ({ '=': '', '+': '-', '/': '_' }[c] || c))
  
  return `${encodedHeader}.${encodedPayload}.signature`
}

export function verifySimpleJWT(token: string): JWTPayload | null {
  try {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null
    
    const decodedPayload = JSON.parse(atob(payload.replace(/[-_]/g, c => ({ '-': '+', '_': '/' }[c] || c))))
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp < now) return null
    
    return decodedPayload as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(TOKEN_NAME)?.value || null
}