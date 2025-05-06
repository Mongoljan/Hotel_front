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
import { useTranslations } from "next-intl";
import { FaArrowAltCircleRight } from "react-icons/fa";

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_CREATE_PROPERTY = 'https://dev.kacc.mn/api/properties/create/';
const EBARIMT_API = 'http://info.ebarimt.mn/rest/merchant/info?';

interface PropertyType {
  id: number;
  name_mn: string;
  name_en: string;
}

type FormFields = z.infer<typeof schemaHotelRegistration2>;

export default function RegisterPage() {
  const t = useTranslations('AuthRegister');
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [regNo, setRegNo] = useState('');

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
        if (data.property_types) {
          setPropertyTypes([...data.property_types]);
        }
      } catch (error) {
        console.error("Error fetching combined data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchCompanyName = async () => {
    const trimmedRegNo = regNo.trim();
    if (!trimmedRegNo) {
      toast.error("Please enter a registration number");
      return;
    }

    try {
      setLoadingCompany(true);
      const response = await fetch(`${EBARIMT_API}${trimmedRegNo}`);
      const data = await response.json();
      if (data.found && data.name) {
        setValue("CompanyName", data.name);
        toast.success("Company name autofilled!");
      } else {
        toast.error("Company not found.");
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
      toast.error("Failed to fetch company name.");
    } finally {
      setLoadingCompany(false);
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const response = await fetch(API_CREATE_PROPERTY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        // Show a specific error if message is available
        if (responseData?.message) {
          toast.error(responseData);
        } else if(responseData?.register) {
          console.log(responseData?.register);
          toast.error(responseData?.register[0]);
        }else{
          toast.error("Registration failed please report to sysadmin")
        }
        return;
      }
  
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
    } catch (error) {
      toast.error('An unexpected error occurred during registration');
      console.error('Error during registration:', error);
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen h-full py-[100px] rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black mb-10">{t("hotel_info")}</h2>

        <section className="flex gap-x-4">
          <div className="w-full">
            <div className="text-black">{t("company_Reg")}</div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={regNo}
                onChange={(e) => {
                  setRegNo(e.target.value);
                  setValue('register', e.target.value);
                }}
                className="border p-2 w-full h-[45px] rounded-[15px]"
                required
              />
              <button
                type="button"
                onClick={fetchCompanyName}
                disabled={loadingCompany}
                className="text-sm border w-[50px] px-3 py-2 rounded-[10px] hover:bg-bg"
              >
                {loadingCompany ? "..." : <FaArrowAltCircleRight />}
              </button>
            </div>
            {errors.register && <div className="text-red">{errors.register.message}</div>}
          </div>

          <div className="w-full">
            <div className="text-black">{t("company_name")}</div>
            <input
              type="text"
              {...register('CompanyName')}
              className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
              required
            />
            {errors.CompanyName && <div className="text-red">{errors.CompanyName.message}</div>}
          </div>
        </section>

        <section>
          <div className="text-black">{t("hotel_name")}</div>
          <input
            type="text"
            {...register('PropertyName')}
            className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
            required
          />
          {errors.PropertyName && <div className="text-red">{errors.PropertyName.message}</div>}
        </section>

        <section className="flex gap-x-4">
          <div>
            <div className="text-black">{t("location")}</div>
            <input
              type="text"
              {...register('location')}
              className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
              required
            />
            {errors.location && <div className="text-red">{errors.location.message}</div>}
          </div>

          <div>
            <div className="text-black">{t("hotel_type")}</div>
            <select
              {...register('property_type')}
              className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
              required
            >
              <option value="">{t("select")}</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name_mn}
                </option>
              ))}
            </select>
            {errors.property_type && <div className="text-red">{errors.property_type.message}</div>}
          </div>
        </section>

        <section>
          <div className="text-black">{t("phone_number")}</div>
          <PhoneInput
            country={'mn'}
            enableSearch
          disableSearchIcon
            onChange={(phone) => setValue('phone', phone)}
            inputClass="border p-2 w-full h-[45px] rounded-[15px]"
          />
          {errors.phone && <div className="text-red">{errors.phone.message}</div>}
        </section>

        <section>
          <div className="text-black">{t("email")}</div>
          <input
            type="email"
            {...register('mail')}
            className="border p-2 w-full mb-4 h-[45px] rounded-[15px]"
            required
          />
          {errors.mail && <div className="text-red">{errors.mail.message}</div>}
        </section>

        <div className="flex gap-x-4">
          <Link
            href={"/auth/login"}
            className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <div className="flex">
              <FaArrowLeft className="self-center mx-1" /> {t("back")}
            </div>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <div className="flex">
              {t("next")} <FaArrowRight className="self-center mx-1" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
