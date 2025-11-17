'use server';

import { getAuthToken } from '@/utils/jwt';

export async function createEmployeeAction(formData: {
  name: string;
  position: string;
  contact_number: string;
  email: string;
  password: string;
  user_type: number; // 3 = Manager, 4 = Reception
}) {
  try {
    // Get authenticated user info from JWT
    const payload = await getAuthToken();

    if (!payload || !payload.hotel || !payload.backendToken) {
      return { error: 'Unauthorized: Please sign in again' };
    }

    const hotelId = payload.hotel;
    const token = payload.backendToken;

    const response = await fetch('https://dev.kacc.mn/api/EmployeeRegister/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: formData.name,
        position: formData.position,
        contact_number: formData.contact_number,
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type,
        hotel: parseInt(hotelId),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.detail || data.email?.[0] || 'Employee creation failed' };
    }

    return { success: true, employee: data };
  } catch (err) {
    console.error(err);
    return { error: 'Unexpected server error' };
  }
}
