import { getAuthToken, UserPayload } from './jwt'

export interface SessionUser {
  id: string
  email: string
  name: string
  hotel: string
  position: string
  contact_number: string
  approved: boolean
  hotelApproved: boolean
}

export interface AuthSession {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  backendToken: string | null
}

export async function getServerSession(): Promise<AuthSession> {
  try {
    const payload = await getAuthToken()
    
    if (!payload) {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        backendToken: null
      }
    }

    return {
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        hotel: payload.hotel,
        position: payload.position,
        contact_number: payload.contact_number,
        approved: payload.approved,
        hotelApproved: payload.hotelApproved
      },
      isAuthenticated: true,
      isLoading: false,
      backendToken: payload.backendToken
    }
  } catch (error) {
    console.error('Session error:', error)
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      backendToken: null
    }
  }
}

export async function requireAuth(): Promise<UserPayload> {
  const payload = await getAuthToken()
  
  if (!payload) {
    throw new Error('Authentication required')
  }
  
  return payload
}

export async function requireApprovedUser(): Promise<UserPayload> {
  const payload = await requireAuth()
  
  if (!payload.approved || !payload.hotelApproved) {
    throw new Error('User or hotel not approved')
  }
  
  return payload
}