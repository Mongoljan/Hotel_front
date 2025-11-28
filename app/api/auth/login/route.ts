import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies, UserPayload } from '@/utils/jwt'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { code: 'auth.required' },
        { status: 400 }
      )
    }

    // Call your backend API
    const response = await fetch('https://dev.kacc.mn/api/EmployeeLogin/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { code: 'auth.invalid' },
        { status: 401 }
      )
    }

    const data = await response.json()
    const hotelId = data.hotel

    // Fetch hotel approval status with timeout and error handling
    let isApproved = false
    try {
      const hotelRes = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (hotelRes.ok) {
        const hotelData = await hotelRes.json()
        isApproved = hotelData?.is_approved === true
      } else {
      }
    } catch (error) {
    }

    // Create our secure JWT payload
    const userPayload: UserPayload = {
      id: data.id.toString(),
      email: data.email,
      name: data.name,
      backendToken: data.token, // Store backend token securely
      hotel: hotelId.toString(),
      position: data.position,
      contact_number: data.contact_number,
      approved: data.approved,
      hotelApproved: isApproved,
      user_type: data.user_type || 5 // Default to User (5) if not provided
    }

    // Set secure httpOnly cookies
    await setAuthCookies(userPayload)

    // Calculate session expiry (30 minutes from now)
    const sessionExpiresAt = Date.now() + 30 * 60 * 1000

    // Return non-sensitive user info with session info
    return NextResponse.json({
      success: true,
      user: {
        id: userPayload.id,
        email: userPayload.email,
        name: userPayload.name,
        hotel: userPayload.hotel,
        position: userPayload.position,
        contact_number: userPayload.contact_number,
        approved: userPayload.approved,
        hotelApproved: userPayload.hotelApproved,
        user_type: userPayload.user_type
      },
      session: {
        expiresAt: sessionExpiresAt,
        expiresIn: 30 * 60, // 30 minutes in seconds
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { code: 'error.internal' },
      { status: 500 }
    )
  }
}