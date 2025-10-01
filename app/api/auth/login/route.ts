import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies, UserPayload } from '@/utils/jwt'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN API DEBUG ===')
    const { email, password } = await request.json()
    console.log('Login attempt for email:', email)

    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { code: 'auth.required' },
        { status: 400 }
      )
    }

    // Call your backend API
    console.log('Calling backend API: https://dev.kacc.mn/api/EmployeeLogin/')
    const response = await fetch('https://dev.kacc.mn/api/EmployeeLogin/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    console.log('Backend API response status:', response.status)

    if (!response.ok) {
      console.log('Backend login failed with status:', response.status)
      const errorData = await response.text()
      console.log('Backend error response:', errorData)
      return NextResponse.json(
        { code: 'auth.invalid' },
        { status: 401 }
      )
    }

    const data = await response.json()
    console.log('Backend login success, user data:', { ...data, token: '[REDACTED]' })
    const hotelId = data.hotel

    // Fetch hotel approval status with timeout and error handling
    let isApproved = false
    try {
      console.log('Fetching hotel data for hotel ID:', hotelId)
      const hotelRes = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      console.log('Hotel API response status:', hotelRes.status)
      
      if (hotelRes.ok) {
        const hotelData = await hotelRes.json()
        console.log('Hotel data:', hotelData)
        isApproved = hotelData?.is_approved === true
      } else {
        console.log('Hotel API returned non-OK status, defaulting isApproved to false')
      }
    } catch (error) {
      console.log('Hotel API fetch failed, defaulting isApproved to false:', error instanceof Error ? error.message : String(error))
    }

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
      { code: 'error.internal' },
      { status: 500 }
    )
  }
}