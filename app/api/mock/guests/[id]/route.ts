import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/mockStore';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const guest = store.getGuestById(id);
  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
  return NextResponse.json(guest);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id   = parseInt(params.id, 10);
    const body = await request.json();
    const updated = store.updateGuest(id, body);
    if (!updated) return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const ok = store.deleteGuest(id);
  if (!ok) return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
}
