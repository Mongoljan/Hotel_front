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
      let errorMessage = 'Нэвтрэлт амжилтгүй. Та нууц үг нэвтрэх нэрээ шалгаад дахин оролдоно уу?';
      try {
        const error = await response.json();
        errorMessage = (Array.isArray(error?.non_field_errors) && error.non_field_errors[0])
          || error?.message
          || error?.detail
          || errorMessage;
      } catch (err) {
        // ignore parse errors and fall back to default message
      }
      return { error: errorMessage };
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
      user_type: data.user_type, // Add user_type from response
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

    const cookieStore = await cookies();
    cookieStore.set('token', data.token, options);
    cookieStore.set('hotel', String(hotelId), options);
    cookieStore.set('userName', data.name, { ...options, httpOnly: true });
    cookieStore.set('userEmail', data.email, { ...options, httpOnly: true });
    cookieStore.set('user_approved',data.approved, { ...options, httpOnly: true } )
    cookieStore.set('user_type', String(data.user_type), { ...options, httpOnly: true })

    // ✅ Store approval status securely
    cookieStore.set('isApproved', String(isApproved), {
      ...options,
      httpOnly: true,
    });

    return { success: true, userInfo };
  } catch (err) {
    console.error('Login Error:', err);
    return { error: 'Unexpected server error' };
  }
}
