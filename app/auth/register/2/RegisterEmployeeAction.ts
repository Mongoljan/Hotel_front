'use server';

import { cookies } from 'next/headers';

export async function registerEmployeeAction(formData: {
  contact_person_name: string;
  position: number;
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
      return {
        success: false as const,
        error: (data.detail || data.email?.[0] || 'Employee registration failed') as string,
      };
    }

    const cookieStore = await cookies();
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 60 * 30,
    };

    cookieStore.set('token', data.token, options);
    cookieStore.set('hotel', String(formData.hotel), options);
    cookieStore.set('user_type', String(formData.user_type), options);
    cookieStore.set('userName', formData.contact_person_name, options);
    cookieStore.set('userEmail', formData.email, options);
    cookieStore.set('user_approved', 'false', options);
    cookieStore.set('isApproved', 'false', options);

    return { success: true as const, userInfo: data };
  } catch (err) {
    console.error(err);
    return {
      success: false as const,
      error: 'Unexpected server error',
    };
  }
}
