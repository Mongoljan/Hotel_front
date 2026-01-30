import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/currencies
 * Fetches all available currencies
 * Response: [{ id, name, code, symbol }]
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthToken();

    if (!payload || !payload.backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = payload.backendToken;

    const response = await fetch(
      `${BACKEND_URL}/api/currencies/?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    
    // Add flag URL to each currency using flagcdn.com (free CDN)
    // The code field contains ISO 3166-1 alpha-2 country code (e.g., "MN" for Mongolia)
    const currenciesWithFlags = (Array.isArray(data) ? data : []).map((currency: { id: number; name: string; code: string; symbol: string }) => ({
      ...currency,
      // flagcdn.com uses lowercase country codes
      flagUrl: `https://flagcdn.com/w40/${currency.code.toLowerCase()}.png`,
      flagUrlSvg: `https://flagcdn.com/${currency.code.toLowerCase()}.svg`,
    }));

    return NextResponse.json(currenciesWithFlags);

  } catch (error) {
    console.error('Error in GET /api/currencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
