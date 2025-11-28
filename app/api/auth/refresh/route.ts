import { NextResponse } from 'next/server'
import { getAuthToken, setAuthCookies, UserPayload } from '@/utils/jwt'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Get current auth payload
    const currentPayload = await getAuthToken()
    
    if (!currentPayload) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'auth.expired' },
        { status: 401 }
      )
    }

    // Check if we have a backend token stored
    const backendToken = currentPayload.backendToken
    
    if (!backendToken) {
      return NextResponse.json(
        { error: 'No backend token', code: 'auth.invalid' },
        { status: 401 }
      )
    }

    // Fetch latest hotel approval status (optional - don't fail if this fails)
    let isApproved = currentPayload.hotelApproved
    try {
      const hotelRes = await fetch(`https://dev.kacc.mn/api/properties/${currentPayload.hotel}`, {
        signal: AbortSignal.timeout(5000)
      })
      
      if (hotelRes.ok) {
        const hotelData = await hotelRes.json()
        isApproved = hotelData?.is_approved === true
      }
    } catch (error) {
      console.log('Hotel API fetch failed during refresh, keeping current status')
    }

    // Create fresh JWT payload with updated data
    const userPayload: UserPayload = {
      id: currentPayload.id,
      email: currentPayload.email,
      name: currentPayload.name,
      backendToken: currentPayload.backendToken,
      hotel: currentPayload.hotel,
      position: currentPayload.position,
      contact_number: currentPayload.contact_number,
      approved: currentPayload.approved,
      hotelApproved: isApproved,
      user_type: currentPayload.user_type
    }

    // Set fresh cookies with new expiry
    await setAuthCookies(userPayload)

    // Calculate new session expiry
    const sessionExpiresAt = Date.now() + 30 * 60 * 1000

    return NextResponse.json({
      success: true,
      message: 'Session refreshed',
      user: {
        id: userPayload.id,
        email: userPayload.email,
        name: userPayload.name,
        hotel: userPayload.hotel,
        position: userPayload.position,
        contact_number: userPayload.contact_number,
        approved: userPayload.approved,
        hotelApproved: isApproved,
        user_type: userPayload.user_type
      },
      session: {
        expiresAt: sessionExpiresAt,
        expiresIn: 30 * 60,
      }
    })

  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh session', code: 'error.internal' },
      { status: 500 }
    )
  }
}
