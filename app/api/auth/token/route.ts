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

    // Return the backend token that APIs need
    return NextResponse.json({
      token: payload.backendToken
    })

  } catch (error) {
    console.error('Get token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}