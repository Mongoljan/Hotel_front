import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import jwt from 'jsonwebtoken'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await fetch('https://dev.kacc.mn/api/EmployeeLogin/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          const hotelId = data.hotel

          // Fetch hotel approval status
          const hotelRes = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`)
          const hotelData = await hotelRes.json()
          const isApproved = hotelData?.is_approved === true

          return {
            id: data.id.toString(),
            email: data.email,
            name: data.name,
            token: data.token,
            hotel: hotelId.toString(),
            position: data.position,
            contact_number: data.contact_number,
            approved: data.approved,
            hotelApproved: isApproved
          }
        } catch (error) {
          console.error('Login error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.token = user.token
        token.hotel = user.hotel
        token.position = user.position
        token.contact_number = user.contact_number
        token.approved = user.approved
        token.hotelApproved = user.hotelApproved
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.token = token.token as string
        session.user.hotel = token.hotel as string
        session.user.position = token.position as string
        session.user.contact_number = token.contact_number as string
        session.user.approved = token.approved as boolean
        session.user.hotelApproved = token.hotelApproved as boolean
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
})

export { handler as GET, handler as POST }