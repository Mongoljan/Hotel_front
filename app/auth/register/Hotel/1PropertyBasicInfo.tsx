'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelSteps1 } from '../../../schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { useTranslations } from 'next-intl';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';

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
  const t = useTranslations('1BasicInfo');
  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [ratings, setRatings] = useState<RatingType[]>([]);

  // Load stored values if available
  const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
  const defaultValues = stored.step1 || {};

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps1),
    defaultValues,
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
    const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
    localStorage.setItem(
      'propertyData',
      JSON.stringify({ ...stored, step1: data })
    );

    toast.success(t('saveSuccess') || 'Мэдээлэл хадгалагдлаа!');
    onNext();
  };

  return (
    <div className="flex justify-center items-center min-h-screen h-full rounded-[12px] mt-[30px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[440px] md:max-w-[500px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black mb-10">{t('title')}</h2>

        <div className="text-black">{t('1')}</div>
        <input
          type="text"
          {...register('property_name_mn')}
          className="border p-2 w-full mb-5 h-[45px] rounded-[15px]"
        />
        {errors.property_name_mn && <div className="text-red text-sm">{errors.property_name_mn.message}</div>}

        <div className="text-black">{t('2')}</div>
        <input
          type="text"
          {...register('property_name_en')}
          className="border p-2 w-full mb-5 h-[45px] rounded-[15px]"
        />
        {errors.property_name_en && <div className="text-red text-sm">{errors.property_name_en.message}</div>}

        <div className="text-black">{t('3')}</div>
        <input
          type="date"
          {...register('start_date')}
          className="border p-2 w-full mb-5 h-[45px] rounded-[15px]"
        />
        {errors.start_date && <div className="text-red text-sm">{errors.start_date.message}</div>}

        <div className="text-black">{t('4')}</div>
        <select
          {...register('star_rating')}
          className="border p-2 w-full mb-5 h-[45px] rounded-[15px]"
        >
          <option value="">Сонгох</option>
          {ratings.map((rating) => (
            <option key={rating.id} value={rating.id}>
              {rating.rating}
            </option>
          ))}
        </select>
        {errors.star_rating && <div className="text-red text-sm">{errors.star_rating.message}</div>}

        <div className="text-black mb-2">{t('5')}?</div>
        <label className="flex items-center gap-2 mb-5">
          <input type="checkbox" aria-label="yes" {...register('part_of_group')} />
          <span>Тийм</span>
        </label>
        {watch('part_of_group') && (
  <>
    <div className="text-black">{t('groupName')}</div>
    <input
      type="text"
      {...register('group_name')}
      className="border p-2 w-full mb-5 h-[45px] rounded-[15px]"
    />
    {errors.group_name && <div className="text-red text-sm">{errors.group_name.message}</div>}
  </>
)}


        <section className="flex mb-5">
          <div className='w-1/2 my-auto'>
            <div className="text-black">{t('6')}</div>
            <input
              type="number"
              {...register('total_hotel_rooms')}
              className="border p-2 w-1/2 mb-4 h-[45px] rounded-[15px]"
              min={1}
            />
            {errors.total_hotel_rooms && <div className="text-red text-sm">{errors.total_hotel_rooms.message}</div>}
          </div>
          <div className="w-1/2 my-auto">
            <div className="text-black">{t('7')}</div>
            <input
              type="number"
              {...register('available_rooms')}
              className="border p-2 w-1/2 mb-4 h-[45px] rounded-[15px]"
              min={0}
            />
            {errors.available_rooms && <div className="text-red text-sm">{errors.available_rooms.message}</div>}
          </div>
        </section>

        <div className="mb-5">
          <div className="text-black mb-2">{t('8')}</div>
          <label className="mb-5">
            <input type="checkbox" {...register('sales_room_limitation')} />
            <span className="ml-3 translate-y-2">Тийм</span>
          </label>
        </div>

        <div className="text-black">{t('9')}</div>
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
        {errors.languages && <div className="text-red text-sm">{errors.languages.message}</div>}

        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <div className="flex items-center">
              <FaArrowLeft className="mr-1" /> {t('10')}
            </div>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <div className="flex items-center">
              {t('11')} <FaArrowRight className="self-center mx-1" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
