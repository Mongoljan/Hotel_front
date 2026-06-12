import { NextResponse } from 'next/server'
import { getAuthToken } from '@/utils/jwt'
import { normalizePosition } from '@/utils/formatPosition'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getAuthToken()
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Calculate remaining session time
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = payload.exp ? payload.exp - now : 0
    const expiresAt = payload.exp ? payload.exp * 1000 : Date.now() + 60 * 60 * 1000

    // Return non-sensitive user info with session info
    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        hotel: payload.hotel,
        position: normalizePosition(payload.position as Parameters<typeof normalizePosition>[0]),
        contact_number: payload.contact_number,
        approved: payload.approved,
        hotelApproved: payload.hotelApproved,
        user_type: payload.user_type,
        hotel_name: payload.hotel_name || '',
        hotel_name_en: payload.hotel_name_en || ''
      },
      session: {
        expiresAt,
        expiresIn, // seconds remaining
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}