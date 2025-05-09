'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import PhoneInput from 'react-phone-input-2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { schemaRegistrationEmployee2 } from '@/app/schema';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { registerEmployeeAction } from './RegisterEmployeeAction';

type FormFields = z.infer<typeof schemaRegistrationEmployee2>;

export default function RegisterEmployee() {
  const t = useTranslations('RegisterStaff');
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaRegistrationEmployee2),
  });

  // Set user_type to 2 automatically
  useEffect(() => {
    setValue('user_type', 2);
  }, [setValue]);

  const onError = (formErrors: typeof errors) => {
    console.log('Validation errors:', formErrors);
    toast.error('Формыг бүрэн бөглөнө үү!');
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    const hotel = propertyData?.property;

    const result = await registerEmployeeAction({
      ...data,
      hotel,
    });

    if (result.success) {
      toast.success('Ажилтны бүртгэл амжилттай! Та бүртгэлээрээ нэвтрэн орно уу.');
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName);
      });
      localStorage.clear();
      router.push('/auth/login');
    } else {
      toast.error(result.error || 'Бүртгэл амжилтгүй боллоо.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen h-full py-[100px] rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:max-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black mb-10">
          {t('staff_info')}
        </h2>

        {/* Name */}
        <label className="text-black">{t('name')}</label>
        <input
          type="text"
          {...register('contact_person_name')}
          className="border border-soft p-2 w-full mb-2 h-[45px] rounded-[15px]"
        />
        {errors.contact_person_name && (
          <p className="text-red-500 text-sm">{errors.contact_person_name.message}</p>
        )}

        {/* Position */}
        <label className="text-black">{t('title')}</label>
        <input
          type="text"
          {...register('position')}
          className="border border-soft p-2 w-full mb-2 h-[45px] rounded-[15px]"
        />
        {errors.position && (
          <p className="text-red-500 text-sm">{errors.position.message}</p>
        )}

        {/* Phone */}
        <label className="text-black">{t('phone_number')}</label>
        <PhoneInput
          country="mn"
          enableSearch
          disableSearchIcon
          value={getValues('contact_number')}
          onChange={(phone) => setValue('contact_number', phone)}
          inputClass="border p-2 w-full h-[45px] rounded-[15px]"
        />
        {errors.contact_number && (
          <p className="text-red-500 text-sm">{errors.contact_number.message}</p>
        )}

        {/* Email */}
        <label className="text-black">{t('email')}</label>
        <input
          type="email"
          {...register('email')}
          className="border border-soft p-2 w-full mb-2 h-[45px] rounded-[15px]"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        {/* Password */}
        <label className="text-black">{t('password')}</label>
        <div className="relative mb-2">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            {...register('password')}
            className="border border-soft p-2 w-full h-[45px] rounded-[15px]"
          />
          <button
            type="button"
            className="absolute right-3 top-2"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <HiEye size={20} /> : <HiEyeSlash size={20} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        {/* Confirm Password */}
        <label className="text-black">{t('password_again')}</label>
        <div className="relative mb-2">
          <input
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            {...register('confirmPassword')}
            className="border border-soft p-2 w-full h-[45px] rounded-[15px]"
          />
          <button
            type="button"
            className="absolute right-3 top-2"
            onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          >
            {isConfirmPasswordVisible ? <HiEye size={20} /> : <HiEyeSlash size={20} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
        )}

        {/* Navigation */}
        <div className="flex gap-x-4">
          <Link
            href="/auth/register"
            className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <FaArrowLeft className="self-center mx-1" /> {t('back')}
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            {t('next')} <FaArrowRight className="self-center mx-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
