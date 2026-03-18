import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthToken();

    if (!payload || !payload.backendToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/EmployeeApprove/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error (POST /EmployeeApprove):', errorText);
      return NextResponse.json(
        { error: 'Failed to update approval', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/EmployeeApprove:', error);
    return NextResponse.json(
      { error: 'Failed to update approval', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
