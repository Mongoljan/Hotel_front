import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies, UserPayload } from '@/utils/jwt'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const data = await response.json()
    const hotelId = data.hotel

    // Fetch hotel approval status
    const hotelRes = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`)
    const hotelData = await hotelRes.json()
    const isApproved = hotelData?.is_approved === true

    console.log('Login data:', { 
      user_approved: data.approved, 
      hotel_approved: isApproved,
      hotel_id: hotelId 
    })

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
      hotelApproved: isApproved
    }

    // Set secure httpOnly cookies
    await setAuthCookies(userPayload)

    // Return non-sensitive user info
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
        hotelApproved: userPayload.hotelApproved
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}