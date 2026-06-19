import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

function resolveToken(request: NextRequest, fallback?: string): string | null {
  const { searchParams } = new URL(request.url);
  return (
    searchParams.get('token') ||
    fallback ||
    request.cookies.get('access_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    null
  );
}

/**
 * GET /api/property-faqs?property=<id>&token=<token>
 * Proxies to: GET {BACKEND_URL}/api/property-faqs/?property=...&token=...
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthToken();
    const token = resolveToken(request, payload?.backendToken);

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const property = searchParams.get('property') || payload?.hotel;

    if (!property) {
      return NextResponse.json({ error: 'property param required' }, { status: 400 });
    }

    const response = await fetch(
      `${BACKEND_URL}/api/property-faqs/?property=${encodeURIComponent(property)}&token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in GET /api/property-faqs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/property-faqs?property=<id>&token=<token>
 * Creates or updates a property FAQ answer.
 * Proxies to: POST {BACKEND_URL}/api/property-faqs/?property=...&token=...
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthToken();
    const token = resolveToken(request, payload?.backendToken);

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const property = searchParams.get('property') || body.property || payload?.hotel;

    if (!property) {
      return NextResponse.json({ error: 'property param required' }, { status: 400 });
    }

    const requestBody = {
      ...body,
      property: Number(property),
    };

    const response = await fetch(
      `${BACKEND_URL}/api/property-faqs/?property=${encodeURIComponent(String(property))}&token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in POST /api/property-faqs:', error);
    return NextResponse.json(
      { error: 'Failed to save FAQ', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
