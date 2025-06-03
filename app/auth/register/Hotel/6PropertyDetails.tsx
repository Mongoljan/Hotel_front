'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { schemaHotelSteps6 } from '../../../schema';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_PROPERTY_DETAILS = 'https://dev.kacc.mn/api/property-details/';

type FormFields = z.infer<typeof schemaHotelSteps6>;

type Props = {
  onNext: () => void;
  onBack: () => void;
  proceed: number;
  setProceed: (value: number) => void;
};

export default function RegisterHotel6({ onNext, onBack, proceed, setProceed }: Props) {
  const t = useTranslations('6FinalPropertyDetails');
  const locale = useLocale();
  const [facilities, setFacilities] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps6),
    defaultValues: {
      google_map: '',
      general_facilities: [],
    },
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await fetch(API_COMBINED_DATA);
        const data = await res.json();
        setFacilities(data.facilities);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      }
    };
    fetchFacilities();
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
    if (stored.step6) {
      reset({
        google_map: stored.step6.google_map || '',
        general_facilities: (stored.step6.general_facilities || []).map(String),
      });
    }
  }, [reset]);

  const getStepId = (step: any) => {
    if (Array.isArray(step)) return step[0]?.id;
    if (typeof step === 'object' && step !== null) return step.id;
    return null;
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const propertyId = stored.propertyId;

      if (!propertyId) {
        toast.error('Property ID not found. Please complete Step 1.');
        return;
      }

      const payload = {
        propertyBasicInfo: getStepId(stored.step1),
        confirmAddress: getStepId(stored.step2),
        propertyPolicies: getStepId(stored.step4),
        property_photos: Array.isArray(stored.property_photos)
          ? stored.property_photos
          : [stored.property_photos],
        google_map: data.google_map,
        general_facilities: [...data.general_facilities].map(Number),
        property
        : propertyId,
      };

      console.log(JSON.stringify(payload))

      const response = await fetch(API_PROPERTY_DETAILS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Property detail submission failed.');

      const result = await response.json();
      stored.step6 = data;
      localStorage.setItem('propertyData', JSON.stringify(stored));

      toast.success('✔️ Мэдээлэл хадгалагдлаа!');
      onNext();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Алдаа гарлаа. Дахин оролдоно уу.');
    }
  };

  return (
    <div className="flex justify-center items-center">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-6">{t('title')}</h2>

        <section className="mb-4">
          <label className="text-black">{t('1')}</label>
          <input
            type="url"
            {...register('google_map')}
            className="border p-2 w-full rounded-[15px]"
          />
          {errors.google_map && <div className="text-red text-sm">{errors.google_map.message}</div>}
        </section>

        <section className="mb-4">
          <label className="text-black">
            Зочин та бүхнээс төлбөртэй болон төлбөргүй ямар нэмэлт үйлчилгээг авах боломжтой вэ? Дараахаас сонгоно уу.
          </label>
          {facilities.map((facility) => (
            <div key={facility.id} className="flex items-center">
              <input
                type="checkbox"
value={String(facility.id)}


                {...register('general_facilities')}
                className="mr-2"
              />
              <label>{locale === 'mn' ? facility.name_mn : facility.name_en}</label>
            </div>
          ))}
          {errors.general_facilities && (
            <div className="text-red text-sm">{errors.general_facilities.message}</div>
          )}
        </section>

        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <FaArrowLeft className="self-center mx-1" /> {t('5')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            {t('6')} <FaArrowRight className="self-center mx-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
