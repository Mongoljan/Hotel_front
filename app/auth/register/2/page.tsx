'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { PatternFormat } from 'react-number-format';
import { schemaRegistrationEmployee2 } from '@/app/schema';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { registerHotelAndEmployeeAction } from '../registerHotelAndEmployeeAction';

type FormFields = z.infer<typeof schemaRegistrationEmployee2>;

export default function RegisterEmployee() {
  const t = useTranslations('RegisterStaff');
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const saved = typeof window !== 'undefined' ? localStorage.getItem('employeeFormData') : null;
  const parsedDefaults: Partial<FormFields> = saved ? JSON.parse(saved) : {};

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaRegistrationEmployee2),
    defaultValues: parsedDefaults,
  });

  // ✅ Conditional input border class
  const inputBorderClass = (hasError: boolean) =>
    `border ${hasError ? 'border-red' : 'border-soft'} p-2 w-full h-[45px] rounded-[15px]`;

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('employeeFormData', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    setValue('user_type', 2);
  }, [setValue]);

  const onError = (formErrors: typeof errors) => {
    console.log('Validation errors:', formErrors);
    toast.error('Формыг бүрэн бөглөнө үү!');
  };

  const onSubmit: SubmitHandler<FormFields> = async (employeeData) => {
    const hotelData = JSON.parse(localStorage.getItem('hotelFormData') || '{}');

    if (!hotelData || !hotelData.register) {
      toast.error('Зочид буудлын мэдээлэл олдсонгүй. Та эхлээд бүртгэлээ бөглөнө үү.');
      return;
    }

    // ✅ Normalize phone number
    employeeData.contact_number = `976${employeeData.contact_number.replace(/\s/g, '')}`;

    const result = await registerHotelAndEmployeeAction(hotelData, employeeData);

    if (result.success) {
      toast.success('Бүртгэл амжилттай. Нэвтрэх хуудас руу чиглүүлж байна...');

      setTimeout(() => {
        Object.keys(Cookies.get()).forEach((cookieName) => Cookies.remove(cookieName));
        localStorage.removeItem('hotelFormData');
        localStorage.removeItem('employeeFormData');
        router.push('/auth/login');
      }, 1500);
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

        <label className="text-black">{t('name')}</label>
        <input
          type="text"
          {...register('contact_person_name')}
          className={inputBorderClass(!!errors.contact_person_name)}
        />
        {errors.contact_person_name && (
          <p className="text-red text-sm">{errors.contact_person_name.message}</p>
        )}

        <label className="text-black">{t('title')}</label>
        <input
          type="text"
          {...register('position')}
          className={inputBorderClass(!!errors.position)}
        />
        {errors.position && (
          <p className="text-red text-sm">{errors.position.message}</p>
        )}

        <label className="text-black">{t('phone_number')}</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">+976</span>
          <PatternFormat
            format="#### ####"
            allowEmptyFormatting
            mask="_"
            value={getValues('contact_number') || ''}
            onValueChange={({ value }) => {
              setValue('contact_number', value); // raw: 95129418
            }}
            className={inputBorderClass(!!errors.contact_number)}
            placeholder="9512 9418"
            required
          />
        </div>
        {errors.contact_number && (
          <p className="text-red text-sm">{errors.contact_number.message}</p>
        )}

        <label className="text-black">{t('email')}</label>
        <input
          type="email"
          {...register('email')}
          className={inputBorderClass(!!errors.email)}
        />
        {errors.email && <p className="text-red text-sm">{errors.email.message}</p>}

        <label className="text-black">{t('password')}</label>
        <div className="relative mb-2">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            {...register('password')}
            className={inputBorderClass(!!errors.password)}
          />
          <button
            type="button"
            className="absolute right-3 top-2"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <HiEye size={20} /> : <HiEyeSlash size={20} />}
          </button>
        </div>
        {errors.password && <p className="text-red text-sm">{errors.password.message}</p>}

        <label className="text-black">{t('password_again')}</label>
        <div className="relative mb-2">
          <input
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            {...register('confirmPassword')}
            className={inputBorderClass(!!errors.confirmPassword)}
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
          <p className="text-red text-sm">{errors.confirmPassword.message}</p>
        )}

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
