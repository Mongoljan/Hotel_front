'use client';

import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaRegistrationEmployee } from '../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import PhoneInput from "react-phone-input-2";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

type Location = {
  lat: number;
  lng: number;
};

const DefaultLocation: Location = { lat: 47.918873, lng: 106.917017 }; // Example: Ulaanbaatar
const DefaultZoom = 10;

type FormFields = z.infer<typeof schemaRegistrationEmployee>;

type UserType = {
  pk: number;
  name: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [location, setLocation] = useState<Location>(DefaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [userTypes, setUserTypes] = useState<UserType[]>([]); // State to store user types
  const modalRef = useRef<HTMLDialogElement>(null);

  // Handle form validation and submission using react-hook-form
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaRegistrationEmployee),
    mode: 'onChange',
  });

  // Fetch user types on component mount and filter out "Owner" and "SuperAdmin"
  useEffect(() => {
    async function fetchUserTypes() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-type/`);
        const data: UserType[] = await response.json();

        // Filter out "Owner" and "SuperAdmin" (pk: 1 and 2)
        const filteredUserTypes = data.filter(type => type.pk !== 1 && type.pk !== 2);
        setUserTypes(filteredUserTypes);
      } catch (error) {
        console.error('Error fetching user types:', error);
      }
    }

    fetchUserTypes();
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const requestBody = {
        owner_pk: Cookies.get('pk'), // Fixed value for owner registration
        owner_token: Cookies.get('jwtToken'), // Fixed empty value for owner_token
        user_type: data.user_type, // Selected user type from the form

        // Values from the form
        user_name: data.contact_person_name,
        hotel_name: "", // Hotel name (only for owners)
        hotel_address: "",// Hotel address (only for owners)
        user_pass: data.password,
        user_mail: data.email,
        user_phone: data.contact_number,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        toast.success('Бүртгэл амжилттай! Таны бүртгэлийн зөвшөөрөл хүлээгдэж байна.');
        router.push('/admin/hotel');
      } else {
        const errorData = await response.json();
        
        // Display dynamic error messages from the API
        if (errorData.email && errorData.email.length > 0) {
          toast.error(errorData.email[0]); // Display the first email error message
        } else if (errorData.password && errorData.password.length > 0) {
          toast.error(errorData.password[0]); // Display the first password error message
        } else {
          toast.error('Бүртгэл амжилтгүй. Оруулсан мэдээллээ шалгана уу.');
        }
      }
    } catch (error) {
      toast.error('Бүртгэлийн явцад санаандгүй алдаа гарлаа');
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen h-full py-[100px] bg-[#E5FDoD] rounded-[12px]">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border-primary border-solid border-[1px] p-10 px-10 max-w-[600px] rounded-md text-gray-600"
      >
        <h2 className="text-2xl font-bold mx-auto text-center text-blue-500 mb-10">Бүртүүлэх</h2>

        <div className="mb-5">Аккаунт байгаа юу?
          <Link className="text-blue-500 ml-[4px] hover:text-blue-300" href={"/auth/login"}>
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
          country={"mn"}
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
        {errors.contact_number && (
          <div className="text-red text-sm">{errors.contact_number.message}</div>
        )}

        {/* Dropdown for selecting user type */}
        <select
          {...register('user_type')}
          className="border p-2 w-full mb-4 h-14 rounded-md"
          required
        >
          <option value="">Хэрэглэгчийн төрөл сонгоно уу</option>
          {userTypes.map((type) => (
            <option key={type.pk} value={type.pk}>
              {type.name}
            </option>
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
          className="w-full h-12 bg-primary  text-white font-semibold rounded-[10px] shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>
    </div>
  );
}
