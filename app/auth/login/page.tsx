'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaLogin } from '../../schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useTranslations } from "next-intl";


type FormFields = z.infer<typeof schemaLogin>;

export default  function LoginPage() {
  const t = useTranslations('AuthLogin');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaLogin),
  });

  // useEffect(() => {
  //   const token = Cookies.get('jwtToken');
  //   const userType = Cookies.get('userType');

  //   if (token) {
  //     if (userType === 'Owner') {
  //       router.push('/admin/dashboard');
  //     } else if (userType === 'SuperAdmin') {
  //       router.push('/superadmin/dashboard');
  //     }
  //   }
  // }, [router]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const requestBody = {
        email: data.email,
        password: data.password,
      };

      const response = await fetch('https://dev.kacc.mn/api/EmployeeLogin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        
        const responseData = await response.json();
        const property=responseData.hotel;

        const propertyData = {
          propertyBasicInfo: 1,
          confirmAddress: 1,
          propertyPolicies: 1,
          google_map: '',
          parking_situation: 'free',
          property: property,
          general_facilities: [],
          property_photos: [],
        };
        const userInfo ={
          hotel: responseData?.hotel,
          name: responseData?.name,
          position:responseData?.position,
          contact_number:responseData?.contact_number,
          email:responseData?.email,

        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        localStorage.setItem('propertyData', JSON.stringify(propertyData));

        Cookies.set('token', responseData.token, {
          expires: 0.02083,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
        });

        Cookies.set('userName', responseData.name, {
          expires: 0.02083,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
        });

        Cookies.set('userEmail', responseData.email, {
          expires: 0.02083,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
        });

        toast.success('Login successful!');
        router.push('/admin/hotel');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred during login');
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen h-full py-[100px] rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-10 px-10 max-w-[600px] md:min-w-[440px] min-w-[250px] border-primary border-solid border-[1px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black mb-10">{t("signIn")}</h2>

        <div className="text-black">{t("email")}</div>
        <input
          type="email"
          {...register('email')}
          className="border border-soft p-4 w-full mb-6 h-[45px] rounded-[15px]"
          required
        />
        {errors.email && <div className="text-red-500">{errors.email.message}</div>}

        <div className="text-black">{t("password")}</div>
        <div className="relative">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            {...register('password')}
            className="border p-4 w-full mb-2 h-[45px] border-soft rounded-[15px]"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-2"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {isPasswordVisible ? <HiEye className="center mt-2" size={20} /> : <HiEyeSlash className="place-content-center mt-2" size={20} />}
          </button>
        </div>

        <div className="flex justify-between text-black">
          <Link className="ml-[4px] hover:text-blue-300" href={"/auth/resetpassword"}>{t("remember")}</Link>
          <Link className="ml-[4px] hover:text-blue-300" href={"/auth/resetpassword"}>{t("savePassword")}</Link>
        </div>

        {errors.password && <div className="text-red-500">{errors.password.message}</div>}

        <button
          type="submit"
          className="w-full border-primary border-solid border-[1px] hover:bg-bg mt-[50px] text-black py-2 px-4 font-semibold rounded-[15px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("wait") : t("signIn")}
        </button>

        <Link
          className="block text-center bg-primary w-full hover:bg text-white py-2 px-4 font-semibold rounded-[15px] mt-[20px] hover:bg-bg-3 hover:text-black border-primary border-solid border-[1px]"
          href={"/auth/register"}
        >
      {t("signUp")}
        </Link>
      </form>
    </div>
  );
}
