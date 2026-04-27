import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 60;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/rooms
 * Backwards-compatible proxy that returns a flat list of individual rooms.
 *
 * Internally calls the new grouped endpoint (`/api/roomsNew/`) and flattens
 * each group into one row per `room_number`, exposing the legacy field names
 * (`room_number`, `room_type`, `room_category`) that older pages such as
 * RoomPriceList and price-settings rely on.
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

    const response = await fetch(`${BACKEND_URL}/api/roomsNew/?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: `Backend returned ${response.status}` }));
      return NextResponse.json(body, { status: response.status });
    }

    const groups = await response.json();
    const flattened: any[] = [];

    if (Array.isArray(groups)) {
      for (const group of groups) {
        const numbers: any[] = Array.isArray(group?.room_numbers)
          ? group.room_numbers
          : typeof group?.room_numbers === 'string'
            ? group.room_numbers.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

        if (numbers.length === 0) {
          // Surface the group itself when no individual rooms are listed.
          // Emit empty string so legacy `.split(',').length` returns 1 row.
          flattened.push({ ...group, room_number: null, room_numbers: '' });
          continue;
        }

        for (const n of numbers) {
          const num = typeof n === 'string' ? parseInt(n, 10) || n : n;
          flattened.push({
            ...group,
            room_number: num,
            // Legacy code expects `room_numbers` to be a comma-separated string
            // and calls `.split(',')` on it. After flattening, each row maps to
            // exactly one room number, so emit the string form here.
            room_numbers: String(num),
          });
        }
      }
    }

    return NextResponse.json(flattened, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('Error in GET /api/rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
