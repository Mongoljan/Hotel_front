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
    };

    cookies().set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 30,
      path: '/',
    });

    cookies().set('userName', data.name, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 30,
      path: '/',
    });

    cookies().set('userEmail', data.email, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 30,
      path: '/',
    });

    return { success: true, userInfo };
  } catch (err) {
    console.error('Login Error:', err);
    return { error: 'Unexpected server error' };
  }
}
