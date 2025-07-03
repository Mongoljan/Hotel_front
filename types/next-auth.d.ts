// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      token: string;
      name: string;
      email: string;
      hotel: number;
      position: string;
      contact_number: string;
      approved: boolean;
      isApproved: boolean;
    };
  }

  interface User {
    id: number;
    token: string;
    name: string;
    email: string;
    hotel: number;
    position: string;
    contact_number: string;
    approved: boolean;
    isApproved: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    token: string;
    name: string;
    email: string;
    hotel: number;
    position: string;
    contact_number: string;
    approved: boolean;
    isApproved: boolean;
  }
}
