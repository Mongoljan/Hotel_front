import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken } from '@/utils/jwt'
import { USER_TYPES } from '@/lib/userTypes'
import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.kacc.mn'

export const dynamic = 'force-dynamic'

// Helper function to get superadmin token
async function getSuperadminToken() {
  const cookieStore = await cookies()
  return cookieStore.get('superadmin_token')?.value
}

// GET /api/superadmin/price-policies - Get price policies for a property
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthToken()
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (payload.user_type !== USER_TYPES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. SuperAdmin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotel')

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      )
    }

    // Fetch price policies from backend
    const response = await fetch(`${API_BASE_URL}/api/price-policies/?hotel=${hotelId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch price policies' },
        { status: response.status }
      )
    }

    const policies = await response.json()
    return NextResponse.json(policies)

  } catch (error) {
    console.error('Get price policies error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/superadmin/price-policies - Create a new price policy
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthToken()
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (payload.user_type !== USER_TYPES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. SuperAdmin access required.' },
        { status: 403 }
      )
    }

    const superadminToken = await getSuperadminToken()
    
    if (!superadminToken) {
      return NextResponse.json(
        { error: 'Superadmin token not found. Please login again.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.property_obj || body.hotel_discount_percent === undefined || body.platform_markup_percent === undefined) {
      return NextResponse.json(
        { error: 'property_obj, hotel_discount_percent, and platform_markup_percent are required' },
        { status: 400 }
      )
    }

    // Create price policy on backend with superadmin token
    const response = await fetch(`${API_BASE_URL}/api/price-policies/create/?token=${superadminToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        property_obj: body.property_obj,
        hotel_discount_percent: body.hotel_discount_percent,
        platform_markup_percent: body.platform_markup_percent,
        is_active: body.is_active ?? true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create price policy' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error('Create price policy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
