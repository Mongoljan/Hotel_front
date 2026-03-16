import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

// Map ISO 4217 currency code -> ISO 3166-1 alpha-2 country/region code for flags.
// This keeps flag rendering stable when backend `code` contains values like USD/CNY/JPY.
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: 'US',
  EUR: 'EU',
  GBP: 'GB',
  CNY: 'CN',
  JPY: 'JP',
  RUB: 'RU',
  KRW: 'KR',
  MNT: 'MN',
  HKD: 'HK',
  SGD: 'SG',
  AUD: 'AU',
  CAD: 'CA',
  CHF: 'CH',
  TRY: 'TR',
  INR: 'IN',
  KZT: 'KZ',
};

const resolveCountryCode = (code: string): string => {
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) return 'UN';

  // If backend already returns country code (e.g. MN), use as-is.
  if (/^[A-Z]{2}$/.test(normalized)) {
    return normalized;
  }

  // Otherwise map from currency code; fallback to first 2 chars for best effort.
  return CURRENCY_TO_COUNTRY[normalized] || normalized.slice(0, 2) || 'UN';
};

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
    
    // Add flag URL to each currency using flagcdn.com (free CDN).
    // Backend may return either country code (MN) or currency code (USD), so resolve first.
    const currenciesWithFlags = (Array.isArray(data) ? data : []).map((currency: { id: number; name: string; code: string; symbol: string }) => ({
      ...currency,
      flagUrl: `https://flagcdn.com/w40/${resolveCountryCode(currency.code).toLowerCase()}.png`,
      flagUrlSvg: `https://flagcdn.com/${resolveCountryCode(currency.code).toLowerCase()}.svg`,
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
