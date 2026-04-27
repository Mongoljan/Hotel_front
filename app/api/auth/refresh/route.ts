import { NextResponse } from 'next/server'
import { getAuthToken, setAuthCookies, UserPayload } from '@/utils/jwt'
import { readCredentials } from '@/utils/credentialVault'

export const dynamic = 'force-dynamic'

const SESSION_DURATION_MS = 60 * 60 * 1000
const SESSION_DURATION_S = 60 * 60

export async function POST() {
  try {
    const currentPayload = await getAuthToken()
    const creds = await readCredentials()

    // Path A: We have stashed credentials → re-authenticate against backend
    // to obtain a *fresh backendToken*. This is the real refresh.
    if (creds) {
      const loginRes = await fetch('https://dev.kacc.mn/api/EmployeeLogin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: creds.email, password: creds.password }),
        signal: AbortSignal.timeout(8000),
      })

      if (!loginRes.ok) {
        return NextResponse.json(
          { error: 'Re-authentication failed', code: 'auth.expired' },
          { status: 401 }
        )
      }

      const data = await loginRes.json()
      const hotelId = data.hotel

      // Best-effort hotel approval refresh
      let isApproved = currentPayload?.hotelApproved ?? false
      try {
        const hotelRes = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`, {
          signal: AbortSignal.timeout(5000),
        })
        if (hotelRes.ok) {
          const hotelData = await hotelRes.json()
          isApproved = hotelData?.is_approved === true
        }
      } catch {}

      const userPayload: UserPayload = {
        id: data.id.toString(),
        email: data.email,
        name: data.name,
        backendToken: data.token,
        hotel: hotelId.toString(),
        position: data.position,
        contact_number: data.contact_number,
        approved: data.approved,
        hotelApproved: isApproved,
        user_type: data.user_type ?? currentPayload?.user_type ?? 5,
      }

      await setAuthCookies(userPayload)

      return NextResponse.json({
        success: true,
        message: 'Session refreshed (backend re-auth)',
        user: {
          id: userPayload.id,
          email: userPayload.email,
          name: userPayload.name,
          hotel: userPayload.hotel,
          position: userPayload.position,
          contact_number: userPayload.contact_number,
          approved: userPayload.approved,
          hotelApproved: userPayload.hotelApproved,
          user_type: userPayload.user_type,
        },
        session: {
          expiresAt: Date.now() + SESSION_DURATION_MS,
          expiresIn: SESSION_DURATION_S,
        },
      })
    }

    // Path B: No stashed creds (older session). Fall back to cookie-only
    // refresh — extends the JWT but keeps the same backend token.
    if (!currentPayload) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'auth.expired' },
        { status: 401 }
      )
    }

    if (!currentPayload.backendToken) {
      return NextResponse.json(
        { error: 'No backend token', code: 'auth.invalid' },
        { status: 401 }
      )
    }

    let isApproved = currentPayload.hotelApproved
    try {
      const hotelRes = await fetch(`https://dev.kacc.mn/api/properties/${currentPayload.hotel}`, {
        signal: AbortSignal.timeout(5000),
      })
      if (hotelRes.ok) {
        const hotelData = await hotelRes.json()
        isApproved = hotelData?.is_approved === true
      }
    } catch {}

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
      user_type: currentPayload.user_type,
    }

    await setAuthCookies(userPayload)

    return NextResponse.json({
      success: true,
      message: 'Session refreshed (cookie only)',
      user: {
        id: userPayload.id,
        email: userPayload.email,
        name: userPayload.name,
        hotel: userPayload.hotel,
        position: userPayload.position,
        contact_number: userPayload.contact_number,
        approved: userPayload.approved,
        hotelApproved: isApproved,
        user_type: userPayload.user_type,
      },
      session: {
        expiresAt: Date.now() + SESSION_DURATION_MS,
        expiresIn: SESSION_DURATION_S,
      },
    })
  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh session', code: 'error.internal' },
      { status: 500 }
    )
  }
}
