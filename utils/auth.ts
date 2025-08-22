import { getServerSession } from './session'

// Server-side functions moved to a separate file to avoid import issues

/**
 * Get backend token for API calls (client-side)
 */
export async function getClientBackendToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    return null;
  } catch (error) {
    console.error('Error getting backend token:', error);
    return null;
  }
}

/**
 * Client-side utilities for making authenticated requests
 */
export class AuthClient {
  static async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/auth/login'
      throw new Error('Authentication required')
    }

    return response
  }

  static async get(url: string) {
    return this.makeAuthenticatedRequest(url, { method: 'GET' })
  }

  static async post(url: string, data?: any) {
    return this.makeAuthenticatedRequest(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async put(url: string, data?: any) {
    return this.makeAuthenticatedRequest(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async delete(url: string) {
    return this.makeAuthenticatedRequest(url, { method: 'DELETE' })
  }
}