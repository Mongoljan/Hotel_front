import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/banks/
 * Fetches all active banks
 * No authentication required as per API documentation
 */
export async function GET() {
  try {
    // Mock banks data matching the API documentation response format
    const mockBanks = [
      { 
        id: 1, 
        name: 'Khan Bank', 
        short_code: 'khan', 
        logo: null, 
        is_active: true 
      },
      { 
        id: 2, 
        name: 'Golomt Bank', 
        short_code: 'golomt', 
        logo: null, 
        is_active: true 
      },
      { 
        id: 3, 
        name: 'TDB Bank', 
        short_code: 'tdb', 
        logo: null, 
        is_active: true 
      },
      { 
        id: 4, 
        name: 'ХХБ Банк', 
        short_code: 'xxb', 
        logo: null, 
        is_active: true 
      }
    ];

    // Try to fetch from real API, fallback to mock
    try {
      const response = await fetch(`${BACKEND_URL}/api/banks/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Cache for 1 hour since bank info doesn't change frequently
        next: { revalidate: 3600 }
      });

      if (response.ok) {
        const banks = await response.json();
        return NextResponse.json(banks, {
          headers: {
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
          }
        });
      } else {
        console.warn('Banks API returned error, using mock data');
      }
    } catch (networkError) {
      console.warn('Network error fetching banks, using mock data:', networkError);
    }

    // Return mock data
    return NextResponse.json(mockBanks, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Banks API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banks' }, 
      { status: 500 }
    );
  }
}