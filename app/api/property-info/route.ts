import { NextRequest, NextResponse } from 'next/server';

// Route reads request.url query params, so it must be rendered dynamically.
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/property-info?property=<hotelId>&token=<token>
 * Proxies GET /api/property-basic-info/ from the backend.
 * Used to retrieve total_hotel_rooms and available_rooms.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') ||
                  request.cookies.get('access_token')?.value ||
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const property = searchParams.get('property');
    if (!property) {
      return NextResponse.json({ error: 'property param required' }, { status: 400 });
    }

    const response = await fetch(
      `${BACKEND_URL}/api/property-basic-info/?property=${encodeURIComponent(property)}&token=${encodeURIComponent(token)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/property-info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
