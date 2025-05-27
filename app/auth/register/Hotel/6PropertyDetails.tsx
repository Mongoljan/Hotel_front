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
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_PROPERTY_BASIC_INFO = 'https://dev.kacc.mn/api/property-basic-info/';
const API_CONFIRM_ADDRESS = 'https://dev.kacc.mn/api/confirm-address/';
const API_PROPERTY_POLICIES = 'https://dev.kacc.mn/api/property-policies/';
const API_PROPERTY_IMAGES = 'https://dev.kacc.mn/api/property-images/';
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
  const router = useRouter();
  const [facilities, setFacilities] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
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

  const submitAllSteps = async (step6Data: FormFields) => {
    try {
      const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const status = JSON.parse(localStorage.getItem('submissionStatus') || '{}');
      const hotel = Cookies.get('hotel');

      let propertyBasicInfo = stored.propertyBasicInfo || null;
      let property = parseInt(hotel || '');
      let confirmAddressId = stored.confirmAddress || null;
      let propertyPoliciesId = stored.propertyPolicies || null;
      let imageIDs: number[] = stored.property_photos || [];

      if (!status.step1) {
        const step1Payload = {
          ...stored.step1,
          group_name: stored.step1.part_of_group ? stored.step1.group_name : null,
        };

        const res = await fetch(API_PROPERTY_BASIC_INFO, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step1Payload),
        });
        if (!res.ok) throw new Error('Алдаа: Үндсэн мэдээлэл');
        const basic = await res.json();
        propertyBasicInfo = basic.id;
        status.step1 = true;
      }

      if (!status.step2) {
        const res = await fetch(API_CONFIRM_ADDRESS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...stored.step2, property }),
        });
        if (!res.ok) throw new Error('Алдаа: Хаяг');
        const addr = await res.json();
        confirmAddressId = addr.id;
        status.step2 = true;
      }

      if (!status.step4) {
        const res = await fetch(API_PROPERTY_POLICIES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...stored.step4, property }),
        });
        if (!res.ok) throw new Error('Алдаа: Дотоод журам');
        const pol = await res.json();
        propertyPoliciesId = pol.id;
        status.step4 = true;
      }

      if (!status.step5) {
        const payload = stored.step5.entries.map((entry: any) => ({
          image: entry.images,
          description: entry.descriptions,
        }));

        const res = await fetch(API_PROPERTY_IMAGES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Алдаа: Зураг илгээх');
        const images = await res.json();
        imageIDs = images.map((img: any) => img.id);
        status.step5 = true;
      }

      const finalPayload = {
        propertyBasicInfo,
        confirmAddress: confirmAddressId,
        propertyPolicies: propertyPoliciesId,
        google_map: step6Data.google_map,
        property,
        general_facilities: step6Data.general_facilities.map(Number),
        property_photos: imageIDs,
      };

      const resFinal = await fetch(API_PROPERTY_DETAILS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      const result = await resFinal.json();
      if (!resFinal.ok) throw new Error(result.message || 'Property Details submission failed');

      status.step6 = true;
      localStorage.setItem('submissionStatus', JSON.stringify(status));
      toast.success('✔️ Бүртгэл амжилттай хадгалагдлаа!');

      setTimeout(() => {
        setProceed(2);
        router.push('/admin/hotel');
      }, 2000);
    } catch (error: any) {
      console.error('Error in final submission:', error);
      toast.error(error.message || 'Алдаа гарлаа');
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
    stored.step6 = data;
    localStorage.setItem('propertyData', JSON.stringify(stored));

    const status = JSON.parse(localStorage.getItem('submissionStatus') || '{}');
    if (!status.step1 || !status.step2 || !status.step4 || !status.step5 || !status.step6) {
      toast.info('Мэдээллийг илгээж байна...');
    }

    await submitAllSteps(data);
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
          <label className="text-black">{t('3')}</label>
          {facilities.map((facility) => (
            <div key={facility.id} className="flex items-center">
              <input
                type="checkbox"
                value={facility.id}
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
