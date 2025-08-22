'use server';

import { cookies } from 'next/headers';

export async function registerHotelAndEmployeeAction(hotelData: any, employeeData: any) {
  try {
    const hotelResponse = await fetch('https://dev.kacc.mn/api/properties/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData),
    });

    const hotelJson = await hotelResponse.json();

    if (!hotelResponse.ok) {
      return {
        success: false,
        error: hotelJson?.register?.[0] || hotelJson?.message || 'Hotel registration failed',
      };
    }

    const hotelId = hotelJson.pk;

    // Merge hotel ID into employee registration
    const employeeResponse = await fetch('https://dev.kacc.mn/api/EmployeeRegister/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: employeeData.contact_person_name,
        position: employeeData.position,
        contact_number: employeeData.contact_number,
        email: employeeData.email,
        password: employeeData.password,
        user_type: employeeData.user_type,
        hotel: hotelId,
      }),
    });

    const employeeJson = await employeeResponse.json();

    if (!employeeResponse.ok) {
      return {
        success: false,
        error: employeeJson?.detail || 'Employee registration failed',
      };
    }

    // Optional: Set token cookie if needed
    const cookieStore = await cookies();
    cookieStore.set('token', employeeJson.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 30,
    });

    return {
      success: true,
      hotelId,
    };
  } catch (error) {
    console.error('Error in registerHotelAndEmployeeAction:', error);
    return {
      success: false,
      error: 'Unexpected server error',
    };
  }
}
