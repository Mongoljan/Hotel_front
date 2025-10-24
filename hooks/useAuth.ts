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
      console.log('🧹 All client cookies cleared');
      
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

  // Initial session fetch
  useEffect(() => {
    fetchSession()
  }, [])

  // 🔥 NEW: Auto-check session expiry every minute
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user) return;

    const checkSessionExpiry = () => {
      // Check if localStorage session is still valid
      const isValid = UserStorage.isSessionValid();
      
      if (!isValid) {
        console.log('⏰ Session expired - auto-logging out');
        logout(); // This will clear cookies AND localStorage
      }
    };

    // Check immediately
    checkSessionExpiry();

    // Then check every 60 seconds (1 minute)
    const intervalId = setInterval(checkSessionExpiry, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [authState.isAuthenticated, authState.user]);

  // 🔥 NEW: Clear expired data on visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && authState.isAuthenticated) {
        const isValid = UserStorage.isSessionValid();
        if (!isValid) {
          console.log('⏰ Session expired while tab was hidden - auto-logging out');
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
          console.log('🧹 Found expired session data on load - cleaning up');
          UserStorage.clearOnLogout();
        }
      } catch (e) {
        // Invalid metadata, clear it
        console.log('🧹 Found invalid session metadata - cleaning up');
        UserStorage.clearOnLogout();
      }
    }
  }, []); // Run once on mount

  return {
    ...authState,
    login,
    logout,
    refreshSession,
  }
}