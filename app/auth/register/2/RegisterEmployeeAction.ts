'use server';

import { cookies } from 'next/headers';

export async function registerEmployeeAction(formData: {
  contact_person_name: string;
  position: string;
  contact_number: string;
  email: string;
  password: string;
  user_type: number;
  hotel: number;
}) {
  try {
    const response = await fetch('https://dev.kacc.mn/api/EmployeeRegister/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.contact_person_name,
        position: formData.position,
        contact_number: formData.contact_number,
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type,
        hotel: formData.hotel,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.detail || 'Registration failed' };
    }

    // Set server-side cookie
    const cookieStore = await cookies();
    cookieStore.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 30, // 30 mins
    });

    return { success: true, userInfo: data };
  } catch (err) {
    console.error(err);
    return { error: 'Unexpected server error' };
  }
}
