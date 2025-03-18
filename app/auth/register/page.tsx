'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelRegistration2 } from '../../schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_CREATE_PROPERTY = 'https://dev.kacc.mn/api/properties/create/';

interface PropertyType {
  id: number;
  name_mn: string;
  name_en: string;
}

type FormFields = z.infer<typeof schemaHotelRegistration2>;

export default function RegisterPage() {
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelRegistration2),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_COMBINED_DATA);
        const data = await response.json();
        console.log("API Response:", data);
        if (data.property_types) {
          setPropertyTypes([...data.property_types]); // Ensure React re-renders
        }
      } catch (error) {
        console.error("Error fetching combined data:", error);
      }
    };
  
    fetchData();
  }, []);
  
  

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const response = await fetch(API_CREATE_PROPERTY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        const propertyId = responseData.pk;

        const propertyData = {
          propertyBasicInfo: 1,
          confirmAddress: 1,
          propertyPolicies: 1,
          google_map: '',
          parking_situation: 'free',
          property: propertyId,
          general_facilities: [],
          property_photos: [],
        };

        localStorage.setItem('propertyData', JSON.stringify(propertyData));

        toast.success('Registration successful!');
        router.push('/auth/register/2');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Registration failed.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred during registration');
      console.error('Error during registration:', error);
    }
  };

  // console.log("property types:", propertyTypes)

  return (
    <div className="flex justify-center items-center min-h-screen h-full py-[100px] rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black mb-10">Буудлын мэдээлэл</h2>

        <section className="flex gap-x-4">
          <div>
            <div className="text-black">ААН-н РД</div>
            <input
              type="text"
              {...register('register')}
              className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
              required
            />
            {errors.register && <div className="text-red-500">{errors.register.message}</div>}
          </div>

          <div>
            <div className="text-black">ААН-н нэр</div>
            <input
              type="text"
              {...register('CompanyName')}
              className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
              required
            />
            {errors.CompanyName && <div className="text-red-500">{errors.CompanyName.message}</div>}
          </div>
        </section>

        <section>
          <div className="text-black">Буудлын нэр</div>
          <input
            type="text"
            {...register('PropertyName')}
            className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
            required
          />
          {errors.PropertyName && <div className="text-red-500">{errors.PropertyName.message}</div>}
        </section>

        <section className="flex gap-x-4">
          <div>
            <div className="text-black">Байршил</div>
            <input
              type="text"
              {...register('location')}
              className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
              required
            />
            {errors.location && <div className="text-red-500">{errors.location.message}</div>}
          </div>

          <div>
            <div className="text-black">Буудлын төрөл</div>
            <select
              {...register('property_type')}
              className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
              required
            >
              <option value="">Сонгох</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name_mn}
                </option>
              ))}
            </select>
            {errors.property_type && <div className="text-red-500">{errors.property_type.message}</div>}
          </div>
        </section>

        <section>
          <div className="text-black">Утасны дугаар</div>
          <PhoneInput
            country={'mn'}
            onChange={(phone) => setValue('phone', phone)}
            inputClass="border p-2 w-full h-[45px] rounded-[15px]"
          />
          {errors.phone && <div className="text-red-500">{errors.phone.message}</div>}
        </section>

        <section>
          <div className="text-black">И-мэйл хаяг</div>
          <input
            type="email"
            {...register('mail')}
            className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
            required
          />
          {errors.mail && <div className="text-red-500">{errors.mail.message}</div>}
        </section>

        <div className="flex gap-x-4">
          <Link
            href={"/auth/login"}
            className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <div className="flex">
              <FaArrowLeft className="self-center mx-1" /> Буцах
            </div>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <div className="flex">
              Дараах <FaArrowRight className="self-center mx-1" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}