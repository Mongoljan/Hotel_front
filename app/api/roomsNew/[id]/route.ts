import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * PATCH /api/roomsNew/[id]?token=...
 * Partially updates a room group — id is a path param, token is a query param.
 * Proxies to: PATCH {BACKEND_URL}/api/roomsNew/{id}/?token=...
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token =
      searchParams.get('token') ||
      request.cookies.get('access_token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Room group ID is required' }, { status: 400 });
    }

    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/roomsNew/${id}/?token=${encodeURIComponent(token)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to update room group', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in PATCH /api/roomsNew/[id]:`, error);
    return NextResponse.json(
      { error: 'Failed to update room group', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
