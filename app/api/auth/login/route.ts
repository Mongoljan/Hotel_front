import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies, UserPayload } from '@/utils/jwt'
import { storeCredentials } from '@/utils/credentialVault'

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
      // Parse backend error to surface useful message (e.g., non_field_errors)
      let code = 'auth.invalid'
      let message: string | undefined

      try {
        const errorData = await response.json()
        code = errorData?.code || code
        if (Array.isArray(errorData?.non_field_errors) && errorData.non_field_errors.length > 0) {
          message = errorData.non_field_errors[0]
        } else {
          message = errorData?.message || errorData?.detail
        }
      } catch (err) {
        // fallback to raw text if JSON parse fails
        try {
          message = await response.text()
        } catch (_) {
          message = undefined
        }
      }

      return NextResponse.json(
        { code, error: message || 'Invalid email or password.' },
        { status: response.status || 401 }
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

    // Stash credentials (encrypted, httpOnly) so /api/auth/refresh can
    // re-authenticate against the backend until the backend exposes a
    // proper refresh endpoint.
    await storeCredentials({ email, password })

    // Calculate session expiry (1 hour from now)
    const sessionExpiresAt = Date.now() + 60 * 60 * 1000

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
        expiresIn: 60 * 60, // 1 hour in seconds
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