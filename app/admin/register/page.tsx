'use client';

import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaRegistrationEmployee } from '../../schema';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import PhoneInput from "react-phone-input-2";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Location = {
  lat: number;
  lng: number;
};

const DefaultLocation: Location = { lat: 47.918873, lng: 106.917017 };
const DefaultZoom = 10;

type FormFields = z.infer<typeof schemaRegistrationEmployee>;

type UserType = {
  pk: number;
  name: string;
};

export default function RegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [location, setLocation] = useState<Location>(DefaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const modalRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaRegistrationEmployee),
  });

  useEffect(() => {
    async function fetchUserTypes() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-type/`);
        const data: UserType[] = await response.json();
        const filtered = data.filter(type => type.pk !== 1 && type.pk !== 2);
        setUserTypes(filtered);
      } catch (error) {
        console.error('Error fetching user types:', error);
      }
    }

    fetchUserTypes();
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const requestBody = {
        owner_pk: session?.user?.id,
        owner_token: session?.accessToken,
        user_type: data.user_type,
        user_name: data.contact_person_name,
        hotel_name: "",
        hotel_address: "",
        user_pass: data.password,
        user_mail: data.email,
        user_phone: data.contact_number,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        toast.success('Бүртгэл амжилттай! Зөвшөөрөл хүлээгдэж байна.');
        router.push('/admin/hotel');
      } else {
        const errorData = await response.json();
        if (errorData.email?.[0]) toast.error(errorData.email[0]);
        else if (errorData.password?.[0]) toast.error(errorData.password[0]);
        else toast.error('Бүртгэл амжилтгүй боллоо.');
      }
    } catch (error) {
      toast.error('Алдаа гарлаа.');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-[100px] bg-[#E5FDoD] rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border-primary border-[1px] p-10 max-w-[600px] rounded-md text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-10">Бүртгүүлэх</h2>

        <div className="mb-5">
          Аккаунт байгаа юу?
          <Link href="/auth/login" className="text-blue-500 ml-2 hover:text-blue-300">
            Нэвтрэх
          </Link>
        </div>

        <input
          type="text"
          placeholder="Холбоо барих хүний нэр"
          {...register('contact_person_name')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
          required
        />
        {errors.contact_person_name && <div className="text-red">{errors.contact_person_name.message}</div>}

        <input
          type="email"
          placeholder="И-мэйл хаяг"
          {...register('email')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
          required
        />
        {errors.email && <div className="text-red">{errors.email.message}</div>}

        <PhoneInput
          country="mn"
          enableSearch
          disableSearchIcon
          value={getValues("contact_number")}
          onChange={(phone) => setValue("contact_number", phone)}
          containerStyle={{ borderRadius: "12px", background: "white" }}
          inputStyle={{
            width: "100%",
            fontSize: "0.875rem",
            border: "solid",
            borderColor: "#E5E7EB",
            background: "inherit",
            padding: "14px",
            marginBottom: "15px",
            borderRadius: "4px",
          }}
        />
        {errors.contact_number && <div className="text-red text-sm">{errors.contact_number.message}</div>}

        <select
          {...register('user_type')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
          required
        >
          <option value="">Хэрэглэгчийн төрөл сонгоно уу</option>
          {userTypes.map(type => (
            <option key={type.pk} value={type.pk}>{type.name}</option>
          ))}
        </select>
        {errors.user_type && <div className="text-red">{errors.user_type.message}</div>}

        <div className="relative mb-4">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder="Нууц үг"
            {...register('password')}
            className="border p-2 w-full h-14 rounded-md"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-2"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {isPasswordVisible ? <HiEye size={20} /> : <HiEyeSlash size={20} />}
          </button>
        </div>
        {errors.password && <div className="text-red">{errors.password.message}</div>}

        <div className="relative mb-4">
          <input
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            placeholder="Нууц үг баталгаажуулах"
            {...register('confirmPassword')}
            className="border p-2 w-full h-14 rounded-md"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-2"
            onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
          >
            {isConfirmPasswordVisible ? <HiEye size={20} /> : <HiEyeSlash size={20} />}
          </button>
        </div>
        {errors.confirmPassword && <div className="text-red">{errors.confirmPassword.message}</div>}

        <button
          type="submit"
          className="w-full h-12 bg-primary text-white font-semibold rounded-[10px] shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>
    </div>
  );
}
