import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/property-payment-methods
 * Fetches enabled payment methods for the property
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
      `${BACKEND_URL}/api/property-payment-methods/?token=${encodeURIComponent(token)}`,
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
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in GET /api/property-payment-methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property payment methods', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/property-payment-methods
 * Adds/updates a payment method for the property
 * Body: { payment_method: number, is_enabled: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthToken();

    if (!payload || !payload.backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = payload.backendToken;
    const body = await request.json();

    // Backend expects an array of payment methods
    const dataToSend = Array.isArray(body) ? body : [body];

    const response = await fetch(
      `${BACKEND_URL}/api/property-payment-methods/?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/property-payment-methods:', error);
    return NextResponse.json(
      { error: 'Failed to update property payment method', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/property-payment-methods
 * Updates a property payment method
 */
export async function PUT(request: NextRequest) {
  try {
    const payload = await getAuthToken();

    if (!payload || !payload.backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = payload.backendToken;
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Property payment method ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/property-payment-methods/${id}/?token=${encodeURIComponent(token)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in PUT /api/property-payment-methods:', error);
    return NextResponse.json(
      { error: 'Failed to update property payment method', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/property-payment-methods
 * Removes a payment method from the property
 */
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getAuthToken();

    if (!payload || !payload.backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = payload.backendToken;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property payment method ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/property-payment-methods/${id}/?token=${encodeURIComponent(token)}`,
      {
        method: 'DELETE',
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

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/property-payment-methods:', error);
    return NextResponse.json(
      { error: 'Failed to delete property payment method', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
