import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

/**
 * DELETE /api/property-faqs/[id]?token=<token>
 * Deletes a property FAQ answer.
 * Proxies to: DELETE {BACKEND_URL}/api/property-faqs/{id}/?token=...
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getAuthToken();
    const { searchParams } = new URL(request.url);
    const token =
      searchParams.get('token') ||
      payload?.backendToken ||
      request.cookies.get('access_token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const response = await fetch(
      `${BACKEND_URL}/api/property-faqs/${id}/?token=${encodeURIComponent(token)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status === 204 ? 200 : response.status });
  } catch (error) {
    console.error('Error in DELETE /api/property-faqs/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
