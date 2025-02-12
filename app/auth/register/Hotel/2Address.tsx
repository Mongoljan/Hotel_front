'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelSteps2 } from '../../../schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_CONFIRM_ADDRESS = 'https://dev.kacc.mn/api/confirm-address/';

interface Province {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface Soum {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

interface CombinedData {
  province: Province[];
  city: City[];
  soum: Soum[];
  district: District[];
}

type FormFields = z.infer<typeof schemaHotelSteps2>;

export default function RegisterHotel2({ onNext, onBack }: { onNext: () => void; onBack: () => void; }) {
  const [combinedData, setCombinedData] = useState<CombinedData>({
    province: [],
    city: [],
    soum: [],
    district: [],
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps2),
  });

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

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const response = await fetch(API_CONFIRM_ADDRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();

        const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
        propertyData.confirmAddress = responseData.id;
        localStorage.setItem('propertyData', JSON.stringify(propertyData));

        toast.success('Address confirmed successfully!');
        onNext();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Address confirmation failed.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while confirming the address.');
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
        <h2 className="text-[30px] font-bold text-center text-black mb-8">Confirm Address</h2>

        <div className="mb-4">
          <label className="text-black">Province</label>
          <select {...register('province_city')} className="border p-2 w-full h-[45px] rounded-[15px]">
            {combinedData.province.map((province) => (
              <option key={province.id} value={province.id}>{province.name}</option>
            ))}
          </select>
          {errors.province_city && <div className="text-red-500 text-sm">{errors.province_city.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">City</label>
          <select {...register('city')} className="border p-2 w-full h-[45px] rounded-[15px]">
            {combinedData.city.map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
          {errors.city && <div className="text-red-500 text-sm">{errors.city.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">Soum</label>
          <select {...register('soum')} className="border p-2 w-full h-[45px] rounded-[15px]">
            {combinedData.soum.map((soum) => (
              <option key={soum.id} value={soum.id}>{soum.name}</option>
            ))}
          </select>
          {errors.soum && <div className="text-red-500 text-sm">{errors.soum.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">District</label>
          <select {...register('district')} className="border p-2 w-full h-[45px] rounded-[15px]">
            {combinedData.district.map((district) => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>
          {errors.district && <div className="text-red-500 text-sm">{errors.district.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">Zip Code</label>
          <input
            type="text"
            {...register('zipCode')}
            className="border p-2 w-full h-[45px] rounded-[15px]"
          />
          {errors.zipCode && <div className="text-red-500 text-sm">{errors.zipCode.message}</div>}
        </div>

        <div className="mb-4">
          <label className="text-black">Total Floor Number</label>
          <input
            type="number"
            {...register('total_floor_number')}
            className="border p-2 w-full h-[45px] rounded-[15px]"
          />
          {errors.total_floor_number && <div className="text-red-500 text-sm">{errors.total_floor_number.message}</div>}
        </div>

        <div className="flex gap-x-4">
          <button type="button" onClick={onBack} className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]">
            <div className="flex items-center">
              <FaArrowLeft className="mr-1" /> Back
            </div>
          </button>
          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]">
            <div className="flex items-center">
              Next <FaArrowRight className="ml-1" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
