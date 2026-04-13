import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/mockStore';

export async function GET() {
  return NextResponse.json(store.getGuests());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, phone, email = '', notes = '' } = body;

    if (!first_name || !last_name || !phone) {
      return NextResponse.json(
        { error: 'first_name, last_name and phone are required' },
        { status: 400 }
      );
    }

    const guest = store.createGuest({ first_name, last_name, phone, email, notes });
    return NextResponse.json(guest, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
