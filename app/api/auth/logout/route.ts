import { NextResponse } from 'next/server'
import { clearAuthCookies } from '@/utils/jwt'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await clearAuthCookies()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}