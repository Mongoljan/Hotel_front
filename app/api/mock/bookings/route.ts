import { NextRequest, NextResponse } from 'next/server';
import { store, type BookingStatus } from '@/lib/mockStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as BookingStatus | null;
  const date   = searchParams.get('date') ?? undefined;

  return NextResponse.json(
    store.getBookings({ status: status ?? undefined, date })
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      room_ids,
      guest_id,
      check_in,
      check_out,
      check_in_time  = '14:00',
      check_out_time = '12:00',
      adults         = 1,
      children       = 0,
      status         = 'confirmed',
      channel        = 'reception',
      corporate_id   = null,
      extra_services = [],
      discount_percent = 0,
      notes          = '',
      total_price    = 0,
    } = body;

    if (!room_ids?.length || !guest_id || !check_in || !check_out) {
      return NextResponse.json(
        { error: 'room_ids, guest_id, check_in and check_out are required' },
        { status: 400 }
      );
    }

    const booking = store.createBooking({
      room_ids,
      guest_id,
      check_in,
      check_out,
      check_in_time,
      check_out_time,
      adults,
      children,
      status,
      channel,
      corporate_id,
      extra_services,
      discount_percent,
      notes,
      total_price,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
