// lib/auth.ts
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth.config";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  position?: string;
  contact_number?: string;
  hotel: string;
  approved: boolean;
  isApproved: boolean;
  token: string;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

/**
 * Get the current server session
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const session = await getServerSession(authConfig);
    return session as AuthSession | null;
  } catch (error) {
    console.error("Error getting auth session:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session?.user;
}

/**
 * Check if user is approved
 */
export async function isUserApproved(): Promise<boolean> {
  const session = await getAuthSession();
  return !!(session?.user?.approved && session?.user?.isApproved);
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getAuthSession();
  return session?.user || null;
}
