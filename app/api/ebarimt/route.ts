import { NextRequest, NextResponse } from 'next/server';
import { resolveEbarimtCompanyName } from '@/lib/ebarimtServer';

export const runtime = 'edge';
// Closest Vercel regions to Mongolia — reduces round-trip vs US default
export const preferredRegion = ['icn1', 'hkg1', 'sin1', 'bom1'];

export async function GET(request: NextRequest) {
  const rawRegno = request.nextUrl.searchParams.get('regno');
  if (!rawRegno?.trim()) {
    return NextResponse.json({ found: false, error: 'regno required' }, { status: 400 });
  }

  try {
    const name = await resolveEbarimtCompanyName(rawRegno);
    if (name) {
      return NextResponse.json({ found: true, name });
    }
    return NextResponse.json({ found: false, error: 'Company not found' }, { status: 200 });
  } catch (err) {
    console.error('[ebarimt] fetch failed:', err);
    return NextResponse.json({ found: false, error: String(err) }, { status: 500 });
  }
}
