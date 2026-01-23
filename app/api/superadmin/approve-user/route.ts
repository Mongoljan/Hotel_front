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
    const { owner_pk, approved } = body

    if (!owner_pk || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. owner_pk and approved are required.' },
        { status: 400 }
      )
    }

    // Send approval request to backend
    const response = await fetch(`${API_BASE_URL}/api/approve_user/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner_pk,
        approved,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to update user approval status' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({
      success: true,
      message: approved ? 'User approved successfully' : 'User approval revoked',
      data: result,
    })

  } catch (error) {
    console.error('Approve user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
