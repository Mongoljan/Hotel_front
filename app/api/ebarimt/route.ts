import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const regno = request.nextUrl.searchParams.get('regno');
  if (!regno) {
    return NextResponse.json({ found: false, error: 'regno required' }, { status: 400 });
  }

  try {
    // Step 1: get TIN from regNo
    const tinRes = await fetch(
      `https://api.ebarimt.mn/api/info/check/getTinInfo?regNo=${encodeURIComponent(regno)}`,
      { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
    );
    const tinJson = await tinRes.json();
    const tin = tinJson?.data;
    if (!tin) {
      return NextResponse.json({ found: false, error: 'TIN not found' }, { status: 200 });
    }

    // Step 2: get company info from TIN
    const infoRes = await fetch(
      `https://api.ebarimt.mn/api/info/check/getInfo?tin=${encodeURIComponent(tin)}`,
      { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
    );
    const infoJson = await infoRes.json();
    const data = infoJson?.data;
    if (!data?.found) {
      return NextResponse.json({ found: false, error: 'Company not found' }, { status: 200 });
    }

    return NextResponse.json({ found: true, name: data.name });
  } catch (err) {
    console.error('[ebarimt] fetch failed:', err);
    return NextResponse.json({ found: false, error: String(err) }, { status: 500 });
  }
}
