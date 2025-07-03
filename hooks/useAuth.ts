'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  position?: string;
  contact_number?: string;
  hotel: string;
  approved: boolean;
  isApproved: boolean;
}

export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
  expires: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as AuthUser | undefined;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!user;

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return { success: true };
    } catch (error) {
      console.error("Login Error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, []);

  const logout = useCallback(async (redirectTo?: string) => {
    try {
      await signOut({ 
        callbackUrl: redirectTo || '/auth/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const isUserApproved = useCallback(() => {
    // Return true if either approved OR isApproved is true
    return Boolean(user?.approved || user?.isApproved);
  }, [user]);

  const requireAuth = useCallback((redirectTo?: string) => {
    if (!isAuthenticated) {
      router.push(redirectTo || '/auth/login');
      return false;
    }
    return true;
  }, [isAuthenticated, router]);

  const requireApproval = useCallback((redirectTo?: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return false;
    }
    
    if (!isUserApproved()) {
      router.push(redirectTo || '/admin/hotel');
      return false;
    }
    
    return true;
  }, [isAuthenticated, isUserApproved, router]);

  return {
    user,
    session: session as AuthSession | null,
    isLoading,
    isAuthenticated,
    isUserApproved: isUserApproved(),
    login,
    logout,
    requireAuth,
    requireApproval,
  };
} 