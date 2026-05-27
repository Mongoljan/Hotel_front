import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const regno = request.nextUrl.searchParams.get('regno');
  if (!regno) {
    return NextResponse.json({ found: false, error: 'regno required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://info.ebarimt.mn/rest/merchant/info?regno=${encodeURIComponent(regno)}`,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        cache: 'no-store',
      }
    );
    const text = await res.text();
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[ebarimt] fetch failed:', err);
    return NextResponse.json({ found: false, error: 'lookup failed' }, { status: 500 });
  }
}
