'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelSteps1 } from '../../../schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowRight } from "react-icons/fa6";

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_PROPERTY_BASIC_INFO = 'https://dev.kacc.mn/api/property-basic-info/';

interface LanguageType {
  id: number;
  languages_name_mn: string;
}

interface RatingType {
  id: number;
  rating: string;
}

interface Props {
  onNext: () => void;
  onBack: () => void;
}

type FormFields = z.infer<typeof schemaHotelSteps1>;

export default function RegisterHotel1({ onNext, onBack }: Props) {
  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [ratings, setRatings] = useState<RatingType[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps1),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_COMBINED_DATA);
        const data = await response.json();
        setLanguages(data.languages);
        setRatings(data.ratings);
      } catch (error) {
        console.error('Error fetching combined data:', error);
      }
    };

    fetchData();
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const response = await fetch(API_PROPERTY_BASIC_INFO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        const propertyBasicInfoId = responseData.id;

        const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
        propertyData.propertyBasicInfo = propertyBasicInfoId;
        localStorage.setItem('propertyData', JSON.stringify(propertyData));

        toast.success('Basic information saved successfully!');
        onNext(); // Trigger the next step after successful submission
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Saving basic information failed.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while saving basic information');
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen h-full py-[100px] rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black mb-10">Буудлын үндсэн мэдээлэл</h2>

        <div className="text-black">Монгол нэр</div>
        <input
          type="text"
          {...register('property_name_mn')}
          className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
          required
        />
        {errors.property_name_mn && <div className="text-red-500">{errors.property_name_mn.message}</div>}

        <div className="text-black">Англи нэр</div>
        <input
          type="text"
          {...register('property_name_en')}
          className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
          required
        />
        {errors.property_name_en && <div className="text-red-500">{errors.property_name_en.message}</div>}

        <div className="text-black">Эхлэх огноо</div>
        <input
          type="date"
          {...register('start_date')}
          className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
          required
        />
        {errors.start_date && <div className="text-red-500">{errors.start_date.message}</div>}

        <div className="text-black">Одны зэрэглэл</div>
        <select
          {...register('star_rating')}
          className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
          required
        >
          <option value="">Сонгох</option>
          {ratings.map((rating) => (
            <option key={rating.id} value={rating.id}>
              {rating.rating}
            </option>
          ))}
        </select>
        {errors.star_rating && <div className="text-red-500">{errors.star_rating.message}</div>}

        <div className="text-black">Группын нэг хэсэг үү?</div>
        <input type="checkbox" {...register('part_of_group')} />

        <div className="text-black">Нийт өрөөний тоо</div>
        <input
          type="number"
          {...register('total_hotel_rooms')}
          className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
          min={1}
          required
        />
        {errors.total_hotel_rooms && <div className="text-red-500">{errors.total_hotel_rooms.message}</div>}

        <div className="text-black">Боломжит өрөөний тоо</div>
        <input
          type="number"
          {...register('available_rooms')}
          className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
          min={0}
          required
        />
        {errors.available_rooms && <div className="text-red-500">{errors.available_rooms.message}</div>}

        <div className="text-black">Өрөөний хязгаарлалт байгаа эсэх</div>
        <input type="checkbox" {...register('sales_room_limitation')} />

        <div className="text-black">Хэлүүд</div>
        <select
          {...register('languages')}
          multiple
          className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.languages_name_mn}
            </option>
          ))}
        </select>
        {errors.languages && <div className="text-red-500">{errors.languages.message}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
        >
          <div className="flex">
            Дараах <FaArrowRight className="self-center mx-1" />
          </div>
        </button>
      </form>
    </div>
  );
}
