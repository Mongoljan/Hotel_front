"use client";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import UserStorage from '@/utils/storage'

interface User {
  id: string
  email: string
  name: string
  hotel: string
  position: string
  contact_number: string
  approved: boolean
  hotelApproved: boolean
  user_type?: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  token: string | null
  hotel: string | null
  isUserApproved: boolean
  isHotelApproved: boolean
}

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
} {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    token: null,
    hotel: null,
    isUserApproved: false,
    isHotelApproved: false,
  })

  const router = useRouter()

  const fetchSession = async () => {
    try {
      console.log('useAuth: Fetching session from /api/auth/me')
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        console.log('useAuth: Session data received:', data)
        
        // Initialize user-scoped storage (clears old data if user changed)
        UserStorage.initializeForUser(data.user.id, data.user.hotel)
        
        // Store userInfo using UserStorage
        UserStorage.setItem('userInfo', JSON.stringify(data.user), data.user.id)
        
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          token: 'secure-jwt', // We don't expose the actual token
          hotel: data.user.hotel,
          isUserApproved: data.user.approved,
          isHotelApproved: data.user.hotelApproved,
        })
        console.log('useAuth: Auth state updated with user data')
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          token: null,
          hotel: null,
          isUserApproved: false,
          isHotelApproved: false,
        })
      }
    } catch (error) {
      console.error('Session fetch error:', error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        token: null,
        hotel: null,
        isUserApproved: false,
        isHotelApproved: false,
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        
        // Initialize user-scoped storage (clears old data if user changed)
        UserStorage.initializeForUser(data.user.id, data.user.hotel)
        
        // Store userInfo using UserStorage
        UserStorage.setItem('userInfo', JSON.stringify(data.user), data.user.id)
        
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          token: 'secure-jwt',
          hotel: data.user.hotel,
          isUserApproved: data.user.approved,
          isHotelApproved: data.user.hotelApproved,
        })
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error, code: errorData.code }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error', code: 'error.internal' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all user-scoped localStorage data
      UserStorage.clearOnLogout()
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        token: null,
        hotel: null,
        isUserApproved: false,
        isHotelApproved: false,
      })
      router.push('/auth/login')
    }
  }

  const refreshSession = async () => {
    await fetchSession()
  }

  useEffect(() => {
    fetchSession()
  }, [])

  return {
    ...authState,
    login,
    logout,
    refreshSession,
  }
}