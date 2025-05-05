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
import { useTranslations } from 'next-intl';

interface Hotel {
  pk: number;
  register: string;
  CompanyName: string;
  PropertyName: string;
  location: string;
  property_type: string;
  phone: string;
  mail: string;
  is_approved: boolean;
  created_at: string;
}

type Location = {
  lat: number;
  lng: number;
};
interface ProceedProps{
    proceed: number;
    setProceed : (value: number) => void;
}

const DefaultLocation: Location = { lat: 47.918873, lng: 106.917017 }; // Example: Ulaanbaatar
const DefaultZoom = 10;

type FormFields = z.infer<typeof schemaRegistration>;

export default function Proceed({proceed, setProceed} : ProceedProps) {
  const t = useTranslations("Proceed");
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [loading, setLoading] = useState(true);
  
    const getHotelId = (): string | null => {
      try {
        const propertyData = JSON.parse(localStorage.getItem("propertyData") || "{}");
        return propertyData?.property || null;
      } catch (error) {
        console.error("Error parsing hotel ID:", error);
        return null;
      }
    };
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
  useEffect(() => {
      const fetchHotel = async () => {
        try {
          const hotelId = getHotelId();
          if (!hotelId) throw new Error("Hotel ID not found in localStorage");
  
          const response = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`);
          if (!response.ok) throw new Error("Failed to fetch hotel data");
  
          const data = await response.json();
          setHotel(data);
        } catch (error) {
          console.error("Error fetching hotel info:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchHotel();
    }, []);
  

  return (
    <div className="flex    items-center  h-full py-[50px]  rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[24px] font-bold mx-auto text-center text-black mb-10">{t("title")}</h2>

        
  
<section>

  <h2 className="text-2xl font-bold text-center text-gray-800">{hotel?.PropertyName}</h2>

  <div className="w-[200px] text-soft">
  <Info label={t("1")} value={hotel?.CompanyName || ""} />
</div>
<Info label={t("2")} value={hotel?.phone|| ""} />
<Info label={t("3")} value={hotel?.mail|| ""} />
<Info label={t("4")} value={hotel?.is_approved ? "Yes" : "No"} />
</section>


<div className="flex gap-x-4">
{/* <Link
            href={"/auth/register/2"}
          className="w-full flex justify-center  mt-[35px] text-black py-3 hover:bg-bg px-4  border-primary border-[1px] border-solid font-semibold rounded-[15px]"
      
        >
      <div className="flex ">  <FaArrowLeft className="self-center mx-1" />   Буцах</div> 
    
        
          </Link> */}
          <button
            onClick={()=>setProceed(1)}
          className="w-full flex justify-center  mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
     
        >
     <div className="flex">   {t("5")}
          <FaArrowRight className=" self-center mx-1" />
          </div> 
        </button>
        </div>
      </form>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}:</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
