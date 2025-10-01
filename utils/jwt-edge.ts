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

// Helper function to handle Unicode characters in btoa
function unicodeToBtoa(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  }))
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

  try {
    const encodedHeader = unicodeToBtoa(JSON.stringify(header)).replace(/[=+/]/g, c => ({ '=': '', '+': '-', '/': '_' }[c] || c))
    const encodedPayload = unicodeToBtoa(JSON.stringify(jwtPayload)).replace(/[=+/]/g, c => ({ '=': '', '+': '-', '/': '_' }[c] || c))
    
    return `${encodedHeader}.${encodedPayload}.signature`
  } catch (error) {
    console.error('JWT creation error:', error)
    console.error('Payload causing issue:', JSON.stringify(jwtPayload, null, 2))
    throw new Error('Failed to create JWT token')
  }
}

// Helper function to handle Unicode characters in atob
function btoaToUnicode(str: string): string {
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

export function verifySimpleJWT(token: string): JWTPayload | null {
  try {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null
    
    const normalizedPayload = payload.replace(/[-_]/g, c => ({ '-': '+', '_': '/' }[c] || c))
    const decodedPayload = JSON.parse(btoaToUnicode(normalizedPayload))
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp < now) return null
    
    return decodedPayload as JWTPayload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(TOKEN_NAME)?.value || null
}