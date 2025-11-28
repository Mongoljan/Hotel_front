"use client";
import { useEffect, useState, useCallback } from 'react'
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
  sessionExpiresAt: number | null  // timestamp in ms
}

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<{ success: boolean; error?: string }>
  sessionTimeRemaining: number | null  // seconds remaining
  isRefreshing: boolean
} {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    token: null,
    hotel: null,
    isUserApproved: false,
    isHotelApproved: false,
    sessionExpiresAt: null,
  })
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const router = useRouter()

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
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
          token: 'secure-jwt', // We don't expose the actual token
          hotel: data.user.hotel,
          isUserApproved: data.user.approved,
          isHotelApproved: data.user.hotelApproved,
          sessionExpiresAt: data.session?.expiresAt || null,
        })
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          token: null,
          hotel: null,
          isUserApproved: false,
          isHotelApproved: false,
          sessionExpiresAt: null,
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
        sessionExpiresAt: null,
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
          sessionExpiresAt: data.session?.expiresAt || Date.now() + 30 * 60 * 1000,
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
      // Call server to clear httpOnly cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 🔥 Clear all user-scoped localStorage data
      UserStorage.clearOnLogout()
      
      // 🔥 Clear all client-accessible cookies
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        // Set cookie to expire in the past
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        token: null,
        hotel: null,
        isUserApproved: false,
        isHotelApproved: false,
        sessionExpiresAt: null,
      })
      router.push('/auth/login')
    }
  }

  const refreshSession = async (): Promise<{ success: boolean; error?: string }> => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update auth state with refreshed data
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          isUserApproved: data.user.approved,
          isHotelApproved: data.user.hotelApproved,
          sessionExpiresAt: data.session?.expiresAt || Date.now() + 30 * 60 * 1000,
        }))
        return { success: true }
      } else {
        const errorData = await response.json()
        console.error('❌ Refresh failed:', errorData)
        
        // Only logout if explicitly expired (401 with auth.expired code)
        if (response.status === 401 && errorData.code === 'auth.expired') {
          await logout()
        }
        // For other errors, just return the error without logging out
        return { success: false, error: errorData.error || 'Refresh failed' }
      }
    } catch (error) {
      console.error('Refresh session error:', error)
      return { success: false, error: 'Network error' }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Initial session fetch
  useEffect(() => {
    fetchSession()
  }, [])

  // Update session time remaining every second
  useEffect(() => {
    if (!authState.sessionExpiresAt) {
      setSessionTimeRemaining(null)
      return
    }

    const updateTimeRemaining = () => {
      const remaining = Math.max(0, Math.floor((authState.sessionExpiresAt! - Date.now()) / 1000))
      setSessionTimeRemaining(remaining)
      
      // Auto logout when session expires
      if (remaining <= 0) {
        logout()
      }
    }

    updateTimeRemaining()
    const intervalId = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(intervalId)
  }, [authState.sessionExpiresAt])

  // 🔥 NEW: Clear expired data on visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && authState.isAuthenticated) {
        const isValid = UserStorage.isSessionValid();
        if (!isValid) {
          logout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [authState.isAuthenticated]);

  // 🔥 NEW: Additional safety check on page load/reload
  useEffect(() => {
    // Check if we have localStorage data but no valid session
    const metadata = (window as any).localStorage.getItem('__user_session_metadata__');
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata);
        const now = Date.now();
        
        // If metadata exists but is expired, clean up everything
        if (parsed.expiresAt && parsed.expiresAt < now) {
          UserStorage.clearOnLogout();
        }
      } catch (e) {
        UserStorage.clearOnLogout();
      }
    }
  }, []); // Run once on mount

  return {
    ...authState,
    login,
    logout,
    refreshSession,
    sessionTimeRemaining,
    isRefreshing,
  }
}