// auth.config.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

// Environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dev.kacc.mn";
const AUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
}

// Extend the default session type
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
      position: string | undefined;
      contact_number: string | undefined;
      hotel: string;
      approved: boolean;
      isApproved: boolean;
    };
  }
  
  interface User {
    id: string;
    email: string;
    name: string;
    position: string | undefined;
    contact_number: string | undefined;
    hotel: string;
    approved: boolean;
    isApproved: boolean;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    position: string | undefined;
    contact_number: string | undefined;
    hotel: string;
    approved: boolean;
    isApproved: boolean;
    accessToken: string;
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(credentials.email)) {
            return null;
          }

          const loginUrl = `${API_BASE_URL}/api/EmployeeLogin/`;

          // Login request
          const loginResponse = await fetch(loginUrl, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!loginResponse.ok) {
            return null;
          }

          const userData = await loginResponse.json();

          if (!userData.token) {
            return null;
          }

          // Handle different possible approval field names from API
          const isApproved = Boolean(
            userData.approved || 
            userData.isApproved || 
            userData.is_approved || 
            userData.user_approved
          );

          const user = {
            id: String(userData.id || userData.email),
            email: userData.email,
            name: userData.name || userData.user_name || "User",
            position: userData.position || undefined,
            contact_number: userData.contact_number || undefined,
            hotel: String(userData.hotel || ""),
            approved: isApproved,
            isApproved: isApproved,
            token: userData.token,
          };

          return user;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.position = user.position;
        token.contact_number = user.contact_number;
        token.hotel = user.hotel;
        token.approved = user.approved;
        token.isApproved = user.isApproved;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.position = token.position;
        session.user.contact_number = token.contact_number;
        session.user.hotel = token.hotel;
        session.user.approved = token.approved;
        session.user.isApproved = token.isApproved;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: AUTH_SECRET,
  debug: false,
};
