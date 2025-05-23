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

type FormFields = z.infer<typeof schemaHotelSteps2>;

interface Province { id: number; name: string }
interface Soum { id: number; name: string; code: number }
interface District { id: number; name: string; code: number }

interface CombinedData {
  province: Province[];
  soum: Soum[];
  district: District[];
}

export default function RegisterHotel2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const t = useTranslations("2ConfirmAddress");

  const [combinedData, setCombinedData] = useState<CombinedData>({
    province: [],
    soum: [],
    district: [],
  });

  const [filteredSoum, setFilteredSoum] = useState<Soum[]>([]);
  

  const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
  const defaultValues = stored.step2 || {};

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps2),
    defaultValues,
  });

  const selectedProvinceId = watch('province_city');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_COMBINED_DATA);
        const data = await response.json();
        setCombinedData(data);
      } catch (error) {
        console.error('Error fetching combined data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const provinceId = Number(selectedProvinceId);
    const filteredSoumList = combinedData.soum.filter((s) => s.code === provinceId);

    setFilteredSoum(filteredSoumList);

  }, [selectedProvinceId, combinedData]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    propertyData.step2 = data;
    localStorage.setItem('propertyData', JSON.stringify(propertyData));

    toast.success('Хаягийн мэдээлэл хадгалагдлаа!');
    onNext();
  };

  return (
    <div className="flex justify-center items-center min-h-screen h-full rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[440px] md:max-w-[500px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold text-center text-black mb-8">{t("title")}</h2>

        <div className="mb-4">
          <label className="text-black">Хот/Аймаг</label>
          <select {...register('province_city')} defaultValue="" className="border p-2 w-full h-[45px] rounded-[15px]">
            <option value="" disabled>-- Хот Аймаг сонгох --</option>
            {combinedData.province.map((province) => (
              <option key={province.id} value={province.id}>{province.name}</option>
            ))}
          </select>
          {errors.province_city && <div className="text-red text-sm">{errors.province_city.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">Сум/Дүүрэг</label>
          <select {...register('soum')} defaultValue="" className="border p-2 w-full h-[45px] rounded-[15px]">
            <option value="" disabled>-- Сум/Дүүрэг сонгох --</option>
            {filteredSoum.map((soum) => (
              <option key={soum.id} value={soum.id}>{soum.name}</option>
            ))}
          </select>
          {errors.soum && <div className="text-red text-sm">{errors.soum.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">Баг/Хороо</label>
          <input type="text" {...register('district')} className="border p-2 w-full h-[45px] rounded-[15px]" />
          {errors.district && <div className="text-red text-sm">{errors.district.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">Zip Code</label>
          <input type="text" {...register('zipCode')} className="border p-2 w-full h-[45px] rounded-[15px]" />
          {errors.zipCode && <div className="text-red text-sm">{errors.zipCode.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">Давхрын тоо</label>
          <input type="number" {...register('total_floor_number')} className="border p-2 w-full h-[45px] rounded-[15px]" />
          {errors.total_floor_number && <div className="text-red text-sm">{errors.total_floor_number.message}</div>}
        </div>

        <div className="flex gap-x-4">
          <button type="button" onClick={onBack} className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]">
            <div className="flex items-center"><FaArrowLeft className="mr-1" /> Back</div>
          </button>
          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]">
            <div className="flex items-center">Next <FaArrowRight className="ml-1" /></div>
          </button>
        </div>
      </form>
    </div>
  );
}
