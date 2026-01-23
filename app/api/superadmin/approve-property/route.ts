import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken } from '@/utils/jwt'
import { USER_TYPES } from '@/lib/userTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.kacc.mn'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { property_pk, is_approved } = body

    if (!property_pk || typeof is_approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. property_pk and is_approved are required.' },
        { status: 400 }
      )
    }

    // Send approval request to backend (endpoint to be provided)
    const response = await fetch(`${API_BASE_URL}/api/approve_property/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        property_pk,
        is_approved,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to update property approval status' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({
      success: true,
      message: is_approved ? 'Property approved successfully' : 'Property approval revoked',
      data: result,
    })

  } catch (error) {
    console.error('Approve property error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
