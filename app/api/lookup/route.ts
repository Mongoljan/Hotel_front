import { NextRequest, NextResponse } from 'next/server';

// ISR Configuration - Revalidate every 24 hours (reference data rarely changes)
export const revalidate = 86400; // 24 hours in seconds

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/lookup
 * Fetches all lookup/reference data in a single request
 * Includes: room types, bed types, features, amenities, view types, etc.
 * 
 * This endpoint uses ISR with 24-hour revalidation because:
 * - Reference data changes very rarely
 * - Same data is used across many pages
 * - High cache hit ratio reduces backend load significantly
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token from query params, cookies, or Authorization header
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') ||
                  request.cookies.get('access_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch all lookup data from backend's all-data endpoint
    const response = await fetch(
      `${BACKEND_URL}/api/all-data/?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const lookupData = await response.json();

    return NextResponse.json(lookupData, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
      },
    });

  } catch (error) {
    console.error('Error in /api/lookup:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lookup data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
