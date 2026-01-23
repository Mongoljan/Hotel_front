import { NextResponse } from 'next/server'
import { getAuthToken } from '@/utils/jwt'
import { USER_TYPES } from '@/lib/userTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.kacc.mn'

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

    // Only SuperAdmin can access this endpoint
    if (payload.user_type !== USER_TYPES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. SuperAdmin access required.' },
        { status: 403 }
      )
    }

    // Fetch all properties from backend
    const response = await fetch(`${API_BASE_URL}/api/properties/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: response.status }
      )
    }

    const properties = await response.json()
    return NextResponse.json(properties)

  } catch (error) {
    console.error('Get properties error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
