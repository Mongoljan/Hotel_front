import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * GET /api/partner-organizations
 * Fetches all partner organizations (corporate clients)
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
      `${BACKEND_URL}/api/partner-organizations/?token=${encodeURIComponent(token)}`,
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
    console.error('Error in GET /api/partner-organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner organizations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partner-organizations
 * Creates a new partner organization
 * Body: {
 *   name: string,
 *   register_no: string,
 *   org_type: string,
 *   discount_percent: number,
 *   promo: string,
 *   contact_name: string,
 *   contact_phone: string,
 *   contact_email: string,
 *   finance1_name: string,
 *   finance1_phone: string,
 *   finance1_email: string,
 *   finance2_name: string,
 *   finance2_phone: string,
 *   finance2_email: string,
 *   address: string,
 *   description: string,
 *   start_date: string,
 *   end_date: string,
 *   is_active: boolean
 * }
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

    const response = await fetch(
      `${BACKEND_URL}/api/partner-organizations/?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
    console.error('Error in POST /api/partner-organizations:', error);
    return NextResponse.json(
      { error: 'Failed to create partner organization', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/partner-organizations
 * Updates an existing partner organization
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
        { error: 'Partner organization ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/partner-organizations/${id}/?token=${encodeURIComponent(token)}`,
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
    console.error('Error in PUT /api/partner-organizations:', error);
    return NextResponse.json(
      { error: 'Failed to update partner organization', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/partner-organizations
 * Deletes a partner organization
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
        { error: 'Partner organization ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/partner-organizations/${id}/?token=${encodeURIComponent(token)}`,
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
    console.error('Error in DELETE /api/partner-organizations:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner organization', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
