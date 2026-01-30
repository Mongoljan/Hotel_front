import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/utils/jwt';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn';

// User types that should be shown (exclude SUPER_ADMIN = 1)
const ALLOWED_USER_TYPES = [2, 3, 4, 5]; // Owner, Manager, Reception, User

/**
 * GET /api/employees
 * Fetches all employees for the hotel
 * Uses the hotel ID from the authenticated user's token
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
    const hotelId = payload.hotel;

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel ID not found' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/employees/${hotelId}/?token=${encodeURIComponent(token)}`,
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
    
    // Filter out superadmin users (user_type = 1)
    const filteredEmployees = Array.isArray(data) 
      ? data.filter((emp: { user_type: number }) => ALLOWED_USER_TYPES.includes(emp.user_type))
      : [];

    return NextResponse.json(filteredEmployees);

  } catch (error) {
    console.error('Error in GET /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employees
 * Creates a new employee
 * Body: { name, position, contact_number, email, password, user_type }
 * Uses /api/EmployeeRegister/ endpoint for registration
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
    const hotelId = payload.hotel;

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel ID not found' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Transform body to match EmployeeRegister API structure
    const registerBody = {
      name: body.name,
      position: body.position,
      contact_number: body.contact_number,
      email: body.email,
      password: body.password,
      user_type: body.user_type, // API expects user_type
      hotel: hotelId, // API expects hotel field
    };

    const response = await fetch(
      `${BACKEND_URL}/api/EmployeeRegister/?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create employee', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to create employee', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/employees
 * Updates an employee
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
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/employees/${id}/?token=${encodeURIComponent(token)}`,
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
    console.error('Error in PUT /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to update employee', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/employees
 * Deletes an employee
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
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/employees/${id}/?token=${encodeURIComponent(token)}`,
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
    console.error('Error in DELETE /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
