'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelSteps2 } from '../../../schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa6';
import { useTranslations } from 'next-intl';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_URL = 'https://dev.kacc.mn/api/confirm-address/';

type FormFields = z.infer<typeof schemaHotelSteps2>;

interface Province { id: number; name: string }
interface Soum { id: number; name: string; code: number }

interface CombinedData {
  province: Province[];
  soum: Soum[];
  district: { id: number; name: string; code: number }[];
}

export default function RegisterHotel2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const t = useTranslations("2ConfirmAddress");

  const [combinedData, setCombinedData] = useState<CombinedData>({ province: [], soum: [], district: [] });
  const [filteredSoum, setFilteredSoum] = useState<Soum[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps2),
  });

  const selectedProvinceId = watch('province_city');

  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        const res = await fetch(API_COMBINED_DATA);
        const data = await res.json();
        setCombinedData(data);
      } catch (err) {
        console.error('Error fetching combined data:', err);
      }
    };

    const fetchStep2Data = async () => {
      const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const propertyId = stored.propertyId;

      try {
        const res = await fetch(`${API_URL}?property=${propertyId}`);
        const data = await res.json();
        const existing = Array.isArray(data) && data.length > 0 ? data[0] : null;
        const initialValues = stored.step2 || existing;

        if (initialValues) {
          reset(initialValues);
          stored.step2 = initialValues;
          localStorage.setItem('propertyData', JSON.stringify(stored));
        }
      } catch (err) {
        console.error('Failed to fetch step 2 data', err);
      }
    };

    fetchCombinedData();
    fetchStep2Data();
  }, [reset]);

  useEffect(() => {
    const provinceId = Number(selectedProvinceId);
    const filtered = combinedData.soum.filter((s) => s.code === provinceId);
    setFilteredSoum(filtered);
  }, [selectedProvinceId, combinedData]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
    const propertyId = stored.propertyId;

    if (!propertyId) {
      toast.error('Property ID not found. Please complete Step 1 first.');
      return;
    }

    try {
      const checkRes = await fetch(`${API_URL}?property=${propertyId}`);
      const existing = await checkRes.json();

      const payload = { ...data, property: propertyId };
      let response;

      if (Array.isArray(existing) && existing.length > 0) {
        const id = existing[0].id;
        response = await fetch(`${API_URL}${id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Failed to submit confirm address data');
      const result = await response.json();

      stored.step2 = result;
      localStorage.setItem('propertyData', JSON.stringify(stored));

      toast.success('Хаягийн мэдээлэл хадгалагдлаа!');
      onNext();
    } catch (err) {
      console.error(err);
      toast.error('Алдаа гарлаа. Дахин оролдоно уу.');
    }
  };

  return (
    <div className="flex justify-center h-full rounded-[12px]">
      <ToastContainer />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 border-primary border-[1px] max-w-[440px] rounded-[15px] text-gray-600">
        <h2 className="text-[30px] font-bold text-center text-black mb-8">{t("title")}</h2>

        <div className="mb-5">
          <label className="text-black">Хот/Аймаг</label>
          <select {...register('province_city')} className="border p-2 w-full h-[45px] rounded-[15px]">
            <option value="">-- Хот Аймаг сонгох --</option>
            {combinedData.province.map((province) => (
              <option key={province.id} value={province.id}>{province.name}</option>
            ))}
          </select>
          {errors.province_city && <div className="text-red text-sm">{errors.province_city.message}</div>}
        </div>

        <div className="mb-5">
          <label className="text-black">Сум/Дүүрэг</label>
          <select {...register('soum')} className="border p-2 w-full h-[45px] rounded-[15px]">
            <option value="">-- Сум/Дүүрэг сонгох --</option>
            {filteredSoum.map((soum) => (
              <option key={soum.id} value={soum.id}>{soum.name}</option>
            ))}
          </select>
          {errors.soum && <div className="text-red text-sm">{errors.soum.message}</div>}
        </div>

        <div className="mb-5">
          <label className="text-black">Баг/Хороо</label>
          <input type="text" {...register('district')} className="border p-2 w-full h-[45px] rounded-[15px]" />
          {errors.district && <div className="text-red text-sm">{errors.district.message}</div>}
        </div>

        <div className="mb-5">
          <label className="text-black">Zip Code</label>
          <input type="text" {...register('zipCode')} className="border p-2 w-full h-[45px] rounded-[15px]" />
          {errors.zipCode && <div className="text-red text-sm">{errors.zipCode.message}</div>}
        </div>

        <div className="mb-5">
          <label className="text-black">Барилгын давхрын тоо</label>
          <input type="number" min="1" {...register('total_floor_number')} className="border p-2 w-full h-[45px] rounded-[15px]" />
          {errors.total_floor_number && <div className="text-red text-sm">{errors.total_floor_number.message}</div>}
        </div>

        <div className="flex gap-x-4">
          <button type="button" onClick={onBack} className="w-full flex justify-center mt-4 text-black py-3 px-4 border-primary border-[1px] font-semibold rounded-[15px]">
            <FaArrowLeft className="mr-1" /> Back
          </button>
          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center mt-4 text-black py-3 px-4 border-primary border-[1px] font-semibold rounded-[15px]">
            Next <FaArrowRight className="ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
