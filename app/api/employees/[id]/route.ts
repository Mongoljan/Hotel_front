import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

async function ensureAuthenticated() {
  const payload = await getAuthToken();

  if (!payload || !payload.backendToken) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  return { ok: true };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    const { error } = await ensureAuthenticated();
    if (error) return error as NextResponse;

    if (!params?.id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const response = await fetch(
      `${BACKEND_URL}/api/employees/${params.id}/`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error (GET /employees/:id):', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch employee', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error in GET /api/employees/[id]:', err);
    return NextResponse.json(
      { error: 'Failed to fetch employee', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function forwardUpdate(
  request: NextRequest,
  params: { id?: string },
  method: 'PUT' | 'PATCH'
) {
  const { error } = await ensureAuthenticated();
  if (error) return error as NextResponse;

  if (!params?.id) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  const body = await request.json();

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/employees/${params.id}/`,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${method} /employees/:id):`, errorText);
      return NextResponse.json(
        { error: 'Failed to update employee', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(`Error in ${method} /api/employees/[id]:`, err);
    return NextResponse.json(
      { error: 'Failed to update employee', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: { params: { id?: string } }) {
  return forwardUpdate(request, context.params, 'PUT');
}

export async function PATCH(request: NextRequest, context: { params: { id?: string } }) {
  return forwardUpdate(request, context.params, 'PATCH');
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id?: string } }
) {
  const { error } = await ensureAuthenticated();
  if (error) return error as NextResponse;

  if (!params?.id) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/employees/${params.id}/`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error (DELETE /employees/:id):', errorText);
      return NextResponse.json(
        { error: 'Failed to delete employee', details: errorText },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/employees/[id]:', err);
    return NextResponse.json(
      { error: 'Failed to delete employee', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
