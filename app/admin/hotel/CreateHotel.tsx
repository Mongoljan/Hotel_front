'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaHotelRegistration } from '../../schema';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

type FormFields = z.infer<typeof schemaHotelRegistration>;

export default function CreateHotel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelRegistration),
  });

  const showValidationErrors = () => {
    if (errors.hotel_name) toast.error(errors.hotel_name.message);
    if (errors.email) toast.error(errors.email.message);
    if (errors.contact_number) toast.error(errors.contact_number.message);
    if (errors.address) toast.error(errors.address.message);
    if (errors.map_url) toast.error(errors.map_url.message);
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!session?.accessToken || !session.user.id) {
      toast.error('Та эхлээд нэвтэрнэ үү.');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody = {
        token: session.accessToken, // ✅ from session
        hotel_name: data.hotel_name,
        email: data.email,
        contact: data.contact_number,
        address: data.address,
        map_url: data.map_url,
        gst_number: data.gst_number || 'N/A',
        food_gst_percentage: data.food_gst_percentage || 5.0,
        room_gst_percentage: data.room_gst_percentage || 18.0,
        joined_date: new Date().toISOString(),
        hotel_owner: session.user.id, // ✅ assuming this is in your JWT/session
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create-hotel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success('Зочид буудал амжилттай бүртгэгдлээ!');
      } else {
        const errorData = await response.json();
        toast.error('Бүртгэл амжилтгүй: ' + errorData.message);
      }
    } catch (error) {
      toast.error('Сервертэй холбогдоход алдаа гарлаа');
      console.error('Error during registration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-[100px] bg-[#E5FDoD] rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit, showValidationErrors)}
        className="bg-white border-[#4A90E2] border-solid border-[1px] p-10 px-10 max-w-[500px] rounded-[10px] text-gray-600"
      >
        <h2 className="text-2xl font-bold mx-auto text-center text-blue-500 mb-10">
          Зочид буудлын бүртгэл
        </h2>

        <input
          type="text"
          placeholder="Зочид буудлын нэр"
          {...register('hotel_name')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
        />
        <input
          type="email"
          placeholder="И-мэйл хаяг"
          {...register('email')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
        />
        <input
          type="text"
          placeholder="Холбоо барих дугаар"
          {...register('contact_number')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
        />
        <input
          type="text"
          placeholder="Хаяг"
          {...register('address')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
        />
        <input
          type="text"
          placeholder="Газрын зургийн холбоос"
          {...register('map_url')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
        />
        <input
          type="text"
          placeholder="GST Number (optional)"
          {...register('gst_number')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
        />
        <input
          type="number"
          placeholder="Хоолны НӨАТ хувь"
          {...register('food_gst_percentage')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
        />
        <input
          type="number"
          placeholder="Өрөөний НӨАТ хувь"
          {...register('room_gst_percentage')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
        />

        <button
          type="submit"
          className="w-full h-12 bg-primary text-white font-semibold rounded-[10px] shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>
    </div>
  );
}
