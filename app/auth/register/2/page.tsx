'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import PhoneInput from "react-phone-input-2";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { schemaRegistrationEmployee2 } from '@/app/schema';
import { useTranslations } from "next-intl";

type FormFields = z.infer<typeof schemaRegistrationEmployee2>;

export default function RegisterEmployee() {
  const t = useTranslations("RegisterStaff");
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [userTypes, setUserTypes] = useState<{ pk: number; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaRegistrationEmployee2),
  });

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const res = await fetch("https://dev.kacc.mn/api/user-type/");
        const data = await res.json();
        setUserTypes(data);
      } catch (err) {
        console.error("Failed to fetch user types:", err);
        toast.error("Хэрэглэгчийн төрөл ачаалагдсангүй.");
      }
    };
    fetchUserTypes();
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (Object.keys(errors).length > 0) {
      toast.error('Формыг бүрэн бөглөнө үү!');
      return;
    }

    try {
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const hotel = propertyData?.property;
      console.log(hotel);

      const requestBody = {
        name: data.contact_person_name,
        position: data.position,
        contact_number: data.contact_number,
        email: data.email,
        password: data.password,
        user_type: data.user_type,
        hotel: hotel,
      };

      const response = await fetch('https://dev.kacc.mn/api/EmployeeRegister/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success('Ажилтны бүртгэл амжилттай!');
        router.push('/admin/hotel');
      } else {
        const errorData = await response.json();
        console.log(errorData);
        toast.error(errorData || 'Бүртгэл амжилтгүй боллоо.');
      }
    } catch (error) {
      toast.error('Алдаа гарлаа, дахин оролдоно уу.');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen h-full py-[100px] rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:max-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black mb-10">{t("staff_info")}</h2>

        <label className="text-black">{t("name")}</label>
        <input
          type="text"
          {...register('contact_person_name')}
          className="border border-soft p-2 w-full mb-2 h-[45px] rounded-[15px]"
        />
        {errors.contact_person_name && <p className="text-red-500 text-sm">{errors.contact_person_name.message}</p>}

        <label className="text-black">{t("title")}</label>
        <input
          type="text"
          {...register('position')}
          className="border border-soft p-2 w-full mb-2 h-[45px] rounded-[15px]"
        />
        {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}

        <label className="text-black">{t("user_type")}</label>
<select
  {...register('user_type', { valueAsNumber: true })} // cast value to number
  className="border border-soft p-2 w-full mb-2 h-[45px] rounded-[15px]"
  defaultValue=""
>
  <option value="" disabled>-- Хэрэглэгчийн төрөл сонгоно уу --</option>
  {userTypes.map((type) => (
    <option key={type.pk} value={type.pk}>{type.name}</option>
  ))}
</select>
{errors.user_type && <p className="text-red-500 text-sm">{errors.user_type.message}</p>}

        <label className="text-black">{t("phone_number")}</label>
        <PhoneInput
          country="mn"
          enableSearch
          disableSearchIcon
          value={getValues("contact_number")}
          onChange={(phone) => setValue("contact_number", phone)}
          containerStyle={{ borderRadius: "15px", background: "white" }}
          inputStyle={{ width: "100%", borderColor: "#9DA4B0", padding: "14px", borderRadius: "15px" }}
        />
        {errors.contact_number && <p className="text-red-500 text-sm">{errors.contact_number.message}</p>}

        <label className="text-black">{t("email")}</label>
        <input
          type="email"
          {...register('email')}
          className="border border-soft p-2 w-full mb-2 h-[45px] rounded-[15px]"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <label className="text-black">{t("password")}</label>
        <div className="relative mb-2">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            {...register('password')}
            className="border border-soft p-2 w-full h-[45px] rounded-[15px]"
          />
          <button type="button" className="absolute right-3 top-2" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? <HiEye size={20} /> : <HiEyeSlash size={20} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <label className="text-black">{t("password_again")}</label>
        <div className="relative mb-2">
          <input
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            {...register('confirmPassword')}
            className="border border-soft p-2 w-full h-[45px] rounded-[15px]"
          />
          <button type="button" className="absolute right-3 top-2" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
            {isConfirmPasswordVisible ? <HiEye size={20} /> : <HiEyeSlash size={20} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}

        <div className="flex gap-x-4">
          <Link
            href={"/auth/register"}
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
