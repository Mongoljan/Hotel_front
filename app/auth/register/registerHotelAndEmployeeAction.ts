'use server';

import { cookies } from 'next/headers';

export async function registerHotelAndEmployeeAction(hotelData: any, employeeData: any) {
  console.log('=== SERVER ACTION DEBUG ===');
  console.log('Hotel Data:', JSON.stringify(hotelData, null, 2));
  console.log('Employee Data:', JSON.stringify(employeeData, null, 2));
  
  try {
    console.log('Calling hotel registration API: https://dev.kacc.mn/api/properties/create/');
    const hotelResponse = await fetch('https://dev.kacc.mn/api/properties/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData),
    });

    const hotelJson = await hotelResponse.json();
    console.log('Hotel API Response:', hotelResponse.status, hotelJson);

    if (!hotelResponse.ok) {
      // Handle specific error messages
      let errorMessage = 'Зочид буудал бүртгэхэд алдаа гарлаа';
      
      const rawError = hotelJson?.register?.[0] || hotelJson?.message || '';
      
      // Check for duplicate registration error
      if (rawError.toLowerCase().includes('already exists') || rawError.toLowerCase().includes('register')) {
        errorMessage = 'Энэ регистрийн дугаартай зочид буудал аль хэдийн бүртгэгдсэн байна. Өмнөх хуудас руу буцан шалгана уу.';
      } else if (rawError) {
        errorMessage = rawError;
      }
      
      return {
        success: false,
        error: errorMessage,
        code: 'HOTEL_EXISTS'
      };
    }

    const hotelId = hotelJson.pk;

    // Merge hotel ID into employee registration
    // Default to Owner (user_type: 2) for first signup
    const employeePayload = {
      name: employeeData.contact_person_name,
      position: employeeData.position,
      contact_number: employeeData.contact_number,
      email: employeeData.email,
      password: employeeData.password,
      user_type: 2, // Owner
      hotel: hotelId,
    };
    
    console.log('Calling employee registration API: https://dev.kacc.mn/api/EmployeeRegister/');
    console.log('Employee payload:', JSON.stringify(employeePayload, null, 2));
    
    const employeeResponse = await fetch('https://dev.kacc.mn/api/EmployeeRegister/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeePayload),
    });

    const employeeJson = await employeeResponse.json();
    console.log('Employee API Response:', employeeResponse.status, employeeJson);

    if (!employeeResponse.ok) {
      return {
        success: false,
        error: employeeJson?.detail || 'Employee registration failed',
      };
    }

    // Set cookies after successful registration
    const cookieStore = await cookies();
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 60 * 30,
    };

    cookieStore.set('token', employeeJson.token, options);
    cookieStore.set('hotel', String(hotelId), options);
    cookieStore.set('user_type', '2', options); // Owner
    cookieStore.set('userName', employeeData.contact_person_name, options);
    cookieStore.set('userEmail', employeeData.email, options);
    cookieStore.set('user_approved', 'false', options); // New user needs approval
    cookieStore.set('isApproved', 'false', options); // Hotel not approved yet

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
