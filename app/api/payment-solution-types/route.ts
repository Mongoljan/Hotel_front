import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/payment-solution-types/
 * Fetches all active payment solution types (QPay, MBank, SocialPay, etc.)
 * No authentication required as per API documentation
 */
export async function GET() {
  try {
    // Mock payment solution types matching the API documentation
    const mockSolutionTypes = [
      { 
        id: 1, 
        name: 'QPay', 
        config_json: {
          merchant_id: '',
          invoice_code: '',
          username: '',
          password: '',
          callback_url: ''
        },
        logo: null, 
        is_active: true 
      },
      { 
        id: 2, 
        name: 'MBank', 
        config_json: {
          merchant_id: '',
          api_key: ''
        },
        logo: null, 
        is_active: true 
      },
      { 
        id: 3, 
        name: 'SocialPay', 
        config_json: {},
        logo: null, 
        is_active: true 
      },
      { 
        id: 4, 
        name: 'POCKET', 
        config_json: {},
        logo: null, 
        is_active: true 
      },
      { 
        id: 5, 
        name: 'MONPAY', 
        config_json: {},
        logo: null, 
        is_active: true 
      }
    ];

    // Try to fetch from real API, fallback to mock
    try {
      const response = await fetch(`${BACKEND_URL}/api/payment-solution-types/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }
      });

      if (response.ok) {
        const solutionTypes = await response.json();
        return NextResponse.json(solutionTypes, {
          headers: {
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
          }
        });
      } else {
        console.warn('Payment solution types API returned error, using mock data');
      }
    } catch (networkError) {
      console.warn('Network error fetching payment solution types, using mock data:', networkError);
    }

    // Return mock data
    return NextResponse.json(mockSolutionTypes, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Payment Solution Types API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment solution types' }, 
      { status: 500 }
    );
  }
}