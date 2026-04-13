import { NextResponse } from 'next/server';
import { store } from '@/lib/mockStore';

export async function GET() {
  return NextResponse.json(store.getRoomTypes());
}
