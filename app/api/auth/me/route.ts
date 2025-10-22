import { NextResponse } from 'next/server'
import { getAuthToken } from '@/utils/jwt'

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

    // Return non-sensitive user info
    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        hotel: payload.hotel,
        position: payload.position,
        contact_number: payload.contact_number,
        approved: payload.approved,
        hotelApproved: payload.hotelApproved,
        user_type: payload.user_type
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