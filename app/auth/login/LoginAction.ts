'use server';

import { cookies } from 'next/headers';

export async function loginAction(formData: {
  email: string;
  password: string;
}) {
  try {
    const response = await fetch('https://dev.kacc.mn/api/EmployeeLogin/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Login failed' };
    }

    const data = await response.json();

    const userInfo = {
      hotel: data.hotel,
      name: data.name,
      position: data.position,
      contact_number: data.contact_number,
      email: data.email,
      id: data.id,
      approved: data.approved,
    };

    const hotelId = data.hotel;

    // 🔐 Fetch approval status of the hotel
    const hotelRes = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`);
    const hotelData = await hotelRes.json();
    const isApproved = hotelData?.is_approved === true;

    // ✅ Set cookies (secure + some httpOnly)
    const options = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 60 * 30,
      path: '/',
    };

    cookies().set('token', data.token, options);
    cookies().set('hotel', String(hotelId), options);
    cookies().set('userName', data.name, { ...options, httpOnly: true });
    cookies().set('userEmail', data.email, { ...options, httpOnly: true });
    cookies().set('user_approved',data.approved, { ...options, httpOnly: true } )

    // ✅ Store approval status securely
    cookies().set('isApproved', String(isApproved), {
      ...options,
      httpOnly: true,
    });

    return { success: true, userInfo };
  } catch (err) {
    console.error('Login Error:', err);
    return { error: 'Unexpected server error' };
  }
}
