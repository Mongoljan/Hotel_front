import { NextRequest, NextResponse } from 'next/server';
import { PaymentConfigRequest } from '@/types/payment';
import { getAuthToken } from '@/utils/jwt';

// Always render dynamically and never cache — payment config must reflect
// the latest backend state immediately after a PATCH.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/payment-config
 * Retrieves all payment configurations for the authenticated hotel
 * Uses JWT cookie authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from JWT cookie
    const payload = await getAuthToken();
    
    if (!payload || !payload.backendToken) {
      console.warn('No valid authentication found - returning mock data for development');
      return NextResponse.json([
        {
          id: 1,
          payment_type: 'bank_card',
          bank_id: 1,
          bank: { id: 1, name: 'Khan Bank', short_code: 'khan', is_active: true },
          terminal_id: 'HAs-37373г',
          currency_id: 1,
          short_name: 'Khan Bank ПОС',
          description: 'ПОС терминал - HAs-37373г',
          is_active: true,
          show_on_booking: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          payment_type: 'bank_account',
          bank_id: 2,
          bank: { id: 2, name: 'Golomt Bank', short_code: 'golomt', is_active: true },
          account_number: '5000-0000-00',
          iban: '000000',
          account_holder: 'MyRoom ХХК',
          currency_id: 1,
          short_name: 'Golomt Bank Данс',
          is_active: true,
          show_on_booking: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          payment_type: 'payment_solution',
          solution_types: [
            { id: 1, name: 'QPay', is_active: true },
            { id: 3, name: 'SocialPay', is_active: true }
          ],
          currency_id: 1,
          short_name: 'Цахим төлбөр',
          description: 'QPay, SocialPay',
          is_active: true,
          show_on_booking: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          payment_type: 'cash',
          currency_id: 1,
          short_name: 'Бэлэн мөнгө',
          description: 'Ресепшнээр бэлэн мөнгөөр төлбөр',
          is_active: false,
          show_on_booking: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          payment_type: 'credit',
          currency_id: 1,
          short_name: 'Зээлийн төлбөр',
          description: 'Гэрээт байгууллагуудын зээлийн лимит',
          is_active: false,
          show_on_booking: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 6,
          payment_type: 'bonus_card',
          currency_id: 1,
          short_name: 'Бонус карт',
          description: 'Урамшууллын карт систем',
          is_active: false,
          show_on_booking: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/payment-config/?token=${encodeURIComponent(payload.backendToken)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          );
        }
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const paymentConfigs = await response.json();
      return NextResponse.json(paymentConfigs, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      });

    } catch (networkError) {
      console.error('Network error fetching payment configs:', networkError);
      return NextResponse.json(
        { error: 'Backend unavailable', detail: String(networkError) },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Payment Config GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment-config
 * Creates or updates payment configuration
 * Uses JWT cookie authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from JWT cookie
    const payload = await getAuthToken();
    
    if (!payload || !payload.backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: PaymentConfigRequest = await request.json();

    // Validate required fields
    if (!body.payment_type) {
      return NextResponse.json(
        { error: 'payment_type is required' },
        { status: 400 }
      );
    }

    // Additional validation based on payment type
    if (body.payment_type === 'bank_account' && !body.bank_id) {
      return NextResponse.json(
        { error: 'bank_id is required for bank_account type' },
        { status: 400 }
      );
    }

    if (body.payment_type === 'bank_card' && (!body.bank_id || !body.terminal_id)) {
      return NextResponse.json(
        { error: 'bank_id and terminal_id are required for bank_card type' },
        { status: 400 }
      );
    }

    try {
      console.log('Sending to backend with token:', payload.backendToken.substring(0, 15) + '...');
      console.log('Request body:', body);
      
      const response = await fetch(
        `${BACKEND_URL}/api/payment-config/?token=${encodeURIComponent(payload.backendToken)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          return NextResponse.json(errorData, { status: 400 });
        }
        if (response.status === 401) {
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          );
        }
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return NextResponse.json(result, { status: 200 });

    } catch (networkError) {
      console.error('Network error saving payment config:', networkError);
      return NextResponse.json(
        { error: 'Backend unavailable', detail: String(networkError) },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Payment Config POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/payment-config?id={id}
 * Updates specific payment configuration by ID
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user from JWT cookie
    const payload = await getAuthToken();
    
    if (!payload || !payload.backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const backendUrl = `${BACKEND_URL}/api/payment-config/${id}/?token=${encodeURIComponent(payload.backendToken)}`;
    console.log('[PATCH payment-config] forwarding to', backendUrl, 'body=', body);

    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (networkError) {
      console.error('[PATCH payment-config] network error:', networkError);
      return NextResponse.json(
        { error: 'Backend unavailable', detail: String(networkError) },
        { status: 502 }
      );
    }

    const rawText = await response.text();
    let parsed: any = null;
    try { parsed = rawText ? JSON.parse(rawText) : null; } catch { parsed = { raw: rawText }; }

    if (!response.ok) {
      console.error('[PATCH payment-config] backend error', response.status, parsed);
      return NextResponse.json(
        parsed ?? { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(parsed ?? { ok: true }, { status: 200 });

  } catch (error) {
    console.error('Payment Config PATCH Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payment-config?id={id}
 * Removes a payment configuration row.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    const payload = await getAuthToken();
    if (!payload || !payload.backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_URL}/api/payment-config/${id}/?token=${encodeURIComponent(payload.backendToken)}`;
    console.log('[DELETE payment-config] forwarding to', backendUrl);

    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (networkError) {
      console.error('[DELETE payment-config] network error:', networkError);
      return NextResponse.json(
        { error: 'Backend unavailable', detail: String(networkError) },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const rawText = await response.text();
      console.error('[DELETE payment-config] backend error', response.status, rawText);
      let parsed: any = null;
      try { parsed = rawText ? JSON.parse(rawText) : null; } catch { parsed = { raw: rawText }; }
      return NextResponse.json(
        parsed ?? { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Payment Config DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}