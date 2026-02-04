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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    
    const response = await fetch(`${API_BASE_URL}/api/property-commissions/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch property commission' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Fetch property commission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    
    // Get the form data (supports file upload)
    const formData = await request.formData()
    
    // Update commission on backend
    const response = await fetch(`${API_BASE_URL}/api/property-commissions/${id}/`, {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to update property commission' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Update property commission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    
    // Get the form data (supports file upload)
    const formData = await request.formData()
    
    // Update commission on backend using PATCH
    const response = await fetch(`${API_BASE_URL}/api/property-commissions/${id}/`, {
      method: 'PATCH',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: 'Failed to update property commission' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Update property commission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
