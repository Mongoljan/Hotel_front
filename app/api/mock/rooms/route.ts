import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/mockStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkIn  = searchParams.get('check_in');
  const checkOut = searchParams.get('check_out');

  if (checkIn && checkOut) {
    return NextResponse.json(store.getRoomsAvailability(checkIn, checkOut));
  }

  return NextResponse.json(store.getRooms());
}
