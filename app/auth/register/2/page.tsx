'use client';

import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaRegistration } from '../../../schema';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import PhoneInput from "react-phone-input-2";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

type Location = {
  lat: number;
  lng: number;
};

const DefaultLocation: Location = { lat: 47.918873, lng: 106.917017 }; // Example: Ulaanbaatar
const DefaultZoom = 10;

type FormFields = z.infer<typeof schemaRegistration>;

export default function RegisterPage() {
  const router = useRouter();
  const [location, setLocation] = useState<Location>(DefaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

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
    resolver: zodResolver(schemaRegistration),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('mapLocation');
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }

      const savedZoom = localStorage.getItem('mapZoom');
      if (savedZoom) {
        setZoom(JSON.parse(savedZoom));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapLocation', JSON.stringify(location));
      localStorage.setItem('mapZoom', JSON.stringify(zoom));
    }
  }, [location, zoom]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const requestBody = {
        owner_pk: 0, // Fixed value for owner registration
        owner_token: "", // Fixed empty value for owner_token
        user_type: 2, // Fixed value for user_type

        // Values from the form
        user_name: data.contact_person_name,
        hotel_name: data.hotel_name, // Hotel name (only for owners)
        hotel_address: data.address_location, // Hotel address (only for owners)
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
        router.push('/auth/login');
              toast.success('Registration successful! Your registration approval is pending. Log in with our credientials');
      } else {
        const errorData = await response.json();
        
        // Display dynamic error messages from the API
        if (errorData.email && errorData.email.length > 0) {
          toast.error(errorData.email[0]); // Display the first email error message
        } else if (errorData.password && errorData.password.length > 0) {
          toast.error(errorData.password[0]); // Display the first password error message
        } else {
          toast.error('Registration failed. Please check your input.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred during registration');
      console.error('Error during registration:', error);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setZoom(15);
        },
        () => {
          alert('Error getting your location');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="flex justify-center   items-center min-h-screen h-full py-[100px]  rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black mb-10">Ажилтны мэдээлэл</h2>

        
  
<section>
        <div className="text-black">
        Таны нэр 
        </div>
        <input
          type="text"
          placeholder=""
          {...register('hotel_name')}
          className="border border-soft p-2 w-full mb-4 h-[45px] rounded-[15px]"
          required
        />
        </section>
       
<section>
  <div className="text-black">Албан тушаал</div>
        <input
          type="email"
          placeholder=""
          {...register('email')}
          className="border border-soft p-2 w-full mb-4 h-[45px] rounded-[15px]"
          required
        />
        {errors.email && <div className="text-red-500">{errors.email.message}</div>}

        </section>


<section>
  <div className="text-black">
<PhoneInput
  country={"mn"}
  enableSearch
  disableSearchIcon
  value={getValues("contact_number")}
  onChange={(phone) => setValue("contact_number", phone)}
  specialLabel="Утасны дугаар"
  containerStyle={{ borderRadius: "15px", background: "white" }}
  inputStyle={{
    width: "100%",
    fontSize: "0.875rem",
    border: "solid",
    borderColor: "#9DA4B0",
    background: "inherit",
    padding: "14px",
    borderWidth: "1px",
    marginBottom: "15px",
    borderRadius: "15px",
  }}
/>
</div>
        </section>
        
        <section>
<div className="text-black"> И-мэйл хаяг </div>
        <input
          type="text"
          placeholder=""
          {...register('address_location')}
          className="border border-soft p-2 w-full mb-4 h-[45px] rounded-[15px]"
        />
  
        {errors.contact_number && (
          <div className="text-red-500 text-sm">{errors.contact_number.message}</div>
        )}
              </section>

              <section>
              <div className="text-black"> Нууц үг </div>
        <div className="relative mb-4">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder=""
            {...register('password')}
            className="border border-soft p-2 w-full h-[45px] rounded-[15px]"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-2"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {isPasswordVisible ? <HiEye className="self-center"  size={20} /> : <HiEyeSlash size={20} />}
          </button>
        </div>
        {errors.password && <div className="text-red-500">{errors.password.message}</div>}
        </section>

<section>
<div className="text-black">Нууц үг давтах</div>
        <div className="relative mb-4">
          <input
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            placeholder=""
            {...register('confirmPassword')}
            className="border border-soft p-2 w-full h-[45px] rounded-[15px] "
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
        {errors.confirmPassword && (
          <div className="text-red-500">{errors.confirmPassword.message}</div>
        )}
        </section>
<div className="flex gap-x-4">
<Link
            href={"/auth/register"}
          className="w-full flex justify-center  mt-[35px] text-black py-3 hover:bg-bg px-4  border-primary border-[1px] border-solid font-semibold rounded-[15px]"
      
        >
      <div className="flex ">  <FaArrowLeft className="self-center mx-1" />   Буцах</div> 
    
        
          </Link>
          <Link
            href={"/auth/register/3"}
          className="w-full flex justify-center  mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
     
        >
     <div className="flex">    Дараах
          <FaArrowRight className=" self-center mx-1" />
          </div> 
        </Link>
        </div>
      </form>
    </div>
  );
}
