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
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { FaArrowAltCircleRight } from "react-icons/fa";
import { PatternFormat } from 'react-number-format';
import { useTranslations } from 'next-intl';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const EBARIMT_API = 'https://info.ebarimt.mn/rest/merchant/info?regno=';

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

  // Restore saved values
  const saved = typeof window !== "undefined" ? localStorage.getItem("hotelFormData") : null;
  const parsedDefaults: Partial<FormFields> = saved ? JSON.parse(saved) : {};
  if (parsedDefaults.phone?.startsWith("976")) {
    parsedDefaults.phone = parsedDefaults.phone.slice(3);
  }
  const [regNo, setRegNo] = useState(parsedDefaults.register || '');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelRegistration2),
    defaultValues: parsedDefaults,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_COMBINED_DATA);
        const data = await response.json();
        if (data.property_types) {
          setPropertyTypes(data.property_types);
        }
      } catch (error) {
        console.error("Error fetching combined data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('hotelFormData', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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
        toast.success(`РД: ${trimmedRegNo} -тай компани олдлоо!`);
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

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    const phoneRaw = data.phone.replace(/\s/g, '');
    const dataToSave = { ...data, phone: phoneRaw };
    localStorage.setItem('hotelFormData', JSON.stringify(dataToSave));

    const submitData = { ...data, phone: `976${phoneRaw}` };

    toast.success('Мэдээллийг хадгаллаа. Дараагийн алхам руу шилжиж байна...');
    setTimeout(() => {
      router.push('/auth/register/2');
    }, 1000);
  };

  const inputStyle = (hasError: boolean) =>
    `border ${hasError ? 'border-red' : 'border-soft'} p-2 w-full mb-4 h-[45px] rounded-[15px]`;

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
                  const value = e.target.value;
                  setRegNo(value);
                  setValue('register', value);
                }}
                className={inputStyle(!!errors.register)}
                required
              />
              <button
                type="button"
                onClick={fetchCompanyName}
                disabled={loadingCompany}
                className="text-3xl hover:text-primary -translate-y-2 place-items-center w-[50px] px-3 py-2 "
              >
                {loadingCompany ? "..." : <FaArrowAltCircleRight />}
              </button>
            </div>
            {errors.register && <div className="text-red text-sm">{errors.register.message}</div>}
          </div>

          <div className="w-full group relative">
            <div className="text-black">{t("company_name")}</div>
            <input
              type="text"
              {...register('CompanyName')}
              className={`${inputStyle(!!errors.CompanyName)} bg-gray-100 border-opacity-10 text-soft`}
              required
              disabled
            />
            <div className="absolute left-0 -top-8 opacity-0 -translate-y-[100px] group-hover:opacity-100 transition bg-gray-800 text-white px-3 py-2 rounded-[15px] shadow-md pointer-events-none">
              Хажууд байрлах товч дээр дарснаар ebarimt-аас таны компаний нэрийг оруулсан РД-аар хайх болно
            </div>
            {errors.CompanyName && <div className="text-red text-sm">{errors.CompanyName.message}</div>}
          </div>
        </section>

        <section className="flex gap-x-4 justify-between">
          <div className="min-w-[220px]">
            <div className="text-black">{t("hotel_name")}</div>
            <input
              type="text"
              {...register('PropertyName')}
              className={inputStyle(!!errors.PropertyName)}
              required
            />
            {errors.PropertyName && <div className="text-red text-sm">{errors.PropertyName.message}</div>}
          </div>
          <div>
            <div className="text-black">{t("hotel_type")}</div>
            <select
              {...register('property_type')}
              className={inputStyle(!!errors.property_type)}
              required
            >
              <option value="">{t("select")}</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name_mn}</option>
              ))}
            </select>
            {errors.property_type && <div className="text-red text-sm">{errors.property_type.message}</div>}
          </div>
        </section>

        <section>
          <div className="text-black">{t("location")}</div>
          <textarea
            rows={3}
            {...register('location')}
            className={`${inputStyle(!!errors.location)} resize min-h-[60px]`}
            required
          />
          {errors.location && <div className="text-red text-sm">{errors.location.message}</div>}
        </section>

        {/* Phone number field */}
        <section>
          <div className="text-black">{t("phone_number")}</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 h-full mb-4">+976</span>
            <PatternFormat
              format="#### ####"
              allowEmptyFormatting
              mask="_"
              value={getValues('phone') || ''}
              onValueChange={({ value }) => {
                setValue('phone', value);
              }}
              className={inputStyle(!!errors.phone)}
              placeholder="9512 9418"
              required
            />
          </div>
          {errors.phone && <div className="text-red text-sm">{errors.phone.message}</div>}
        </section>

        <section>
          <div className="text-black">{t("email")}</div>
          <input
            type="email"
            {...register('mail')}
            className={inputStyle(!!errors.mail)}
            required
          />
          {errors.mail && <div className="text-red text-sm">{errors.mail.message}</div>}
        </section>

        <div className="flex gap-x-4">
          <Link
            href="/auth/login"
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
