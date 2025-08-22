import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    token: string
    hotel: string
    position: string
    contact_number: string
    approved: boolean
    hotelApproved: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      token: string
      hotel: string
      position: string
      contact_number: string
      approved: boolean
      hotelApproved: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    token: string
    hotel: string
    position: string
    contact_number: string
    approved: boolean
    hotelApproved: boolean
  }
}