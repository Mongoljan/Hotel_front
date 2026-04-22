import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * POST /api/roomsNew/transfer
 * Moves one or more room numbers from their current group to a target group.
 * Body: { room_numbers: number[], target_room_group_id: number }
 */
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();

    if (!body.room_numbers?.length || !body.target_room_group_id) {
      return NextResponse.json(
        { error: 'room_numbers and target_room_group_id are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/roomsNew/transfer/?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Transfer failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in POST /api/roomsNew/transfer:', error);
    return NextResponse.json(
      { error: 'Transfer failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
