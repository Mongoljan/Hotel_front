'use server';

export async function registerHotelAction(hotelData: Record<string, unknown>) {
  try {
    const hotelResponse = await fetch('https://dev.kacc.mn/api/properties/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData),
    });

    const hotelJson = await hotelResponse.json();

    if (!hotelResponse.ok) {
      let errorMessage = 'Зочид буудал бүртгэхэд алдаа гарлаа';

      const rawError = hotelJson?.register?.[0] || hotelJson?.message || '';

      if (rawError.toLowerCase().includes('already exists') || rawError.toLowerCase().includes('register')) {
        errorMessage = 'Энэ регистрийн дугаартай зочид буудал аль хэдийн бүртгэгдсэн байна.';
      } else if (rawError) {
        errorMessage = rawError;
      }

      return {
        success: false as const,
        error: errorMessage,
        code: 'HOTEL_EXISTS' as const,
      };
    }

    return {
      success: true as const,
      hotelId: hotelJson.pk as number,
    };
  } catch (error) {
    console.error('Error in registerHotelAction:', error);
    return {
      success: false as const,
      error: 'Unexpected server error',
    };
  }
}
