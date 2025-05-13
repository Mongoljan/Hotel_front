'use client';

import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaRegistration } from '../../../schema';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import PhoneInput from 'react-phone-input-2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
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

type Location = { lat: number; lng: number };

interface ProceedProps {
  proceed: number;
  setProceed: (value: number) => void;
  setView: (view: 'proceed' | 'register') => void;
}

type FormFields = z.infer<typeof schemaRegistration>;

export default function Proceed({ proceed, setProceed, setView }: ProceedProps) {
  const t = useTranslations('Proceed');
  const router = useRouter();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location>({ lat: 47.918873, lng: 106.917017 });
  const [zoom, setZoom] = useState(10);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(schemaRegistration) });

  const getHotelId = (): string | null => {
    try {
      const u = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return u.hotel || null;
    } catch {
      return null;
    }
  };

  const fetchHotel = async () => {
    try {
      const id = getHotelId();
      if (!id) throw new Error('Hotel ID not found');
      const res = await fetch(`https://dev.kacc.mn/api/properties/${id}`);
      if (!res.ok) throw new Error('Failed to fetch hotel');
      const data: Hotel = await res.json();
      setHotel(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, []);

  useEffect(() => {
    if (!loading && hotel && !hotel.is_approved) {
      const intervalId = setInterval(fetchHotel, 5000);
      return () => clearInterval(intervalId);
    }
  }, [loading, hotel]);

  useEffect(() => {
    const savedLoc = localStorage.getItem('mapLocation');
    const savedZoom = localStorage.getItem('mapZoom');
    if (savedLoc) setLocation(JSON.parse(savedLoc));
    if (savedZoom) setZoom(JSON.parse(savedZoom));
  }, []);

  useEffect(() => {
    localStorage.setItem('mapLocation', JSON.stringify(location));
    localStorage.setItem('mapZoom', JSON.stringify(zoom));
  }, [location, zoom]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const body = {
        owner_pk: 0,
        owner_token: '',
        user_type: 2,
        user_name: data.contact_person_name,
        hotel_name: data.hotel_name,
        hotel_address: data.address_location,
        user_pass: data.password,
        user_mail: data.email,
        user_phone: data.contact_number,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        toast.success('Registration submitted! Approval is pending. You can log in once approved.');
        router.push('/auth/login');
      } else {
        const err = await res.json();
        const msg =
          err.email?.[0] ||
          err.password?.[0] ||
          'Registration failed, please check your input.';
        toast.error(msg);
      }
    } catch (e) {
      console.error(e);
      toast.error('Unexpected error during registration.');
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setZoom(15);
      },
      () => alert('Unable to get location')
    );
  };

  return (
    <div className="flex items-left h-full py-12 ">
      <div className="w-full max-w-[450px] mx-auto ">
        <ToastContainer />
        <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 mb-10 border border-primary rounded-[15px] shadow-sm"
        >
          <section className="mb-6 text-center">
            <h3 className="text-xl font-semibold">
              {hotel?.PropertyName || '…'}
            </h3>
          </section>

          <div className="space-y-4 mb-6">
            <Info label={t('1')} value={hotel?.CompanyName || '-'} />
            <Info label={t('2')} value={hotel?.phone || '-'} />
            <Info label={t('3')} value={hotel?.mail || '-'} />
            <Info
              label='Төлөв'
              value={hotel?.is_approved ? 'Баталгаажсан' : 'Баталгаажаагүй'}
              valueClassName={
                hotel?.is_approved ? 'text-green-600' : 'text-red-600'
              }
            />
          </div>

          <div className="flex gap-4">
          <div className="relative group w-full">
  <button
    type="button"
    onClick={() => {
      if (hotel?.is_approved) {
        setProceed(1);
        setView('register');
      }
    }}
    disabled={!hotel?.is_approved}
    className={`
      w-full py-3 rounded-lg font-semibold transition
      ${hotel?.is_approved
        ? 'bg-primary text-white hover:bg-primary-dark'
        : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
    `}
  >
    {t('5')} <FaArrowRight className="inline ml-2" />
  </button>

  {!hotel?.is_approved && (
    <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-300 text-sm text-gray-700 rounded-lg px-4 py-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      {t('tooltip_wait_approval')}
    </div>
  )}
</div>

          </div>
        </form>
      </div>
    </div>
  );
}

// Info component

interface InfoProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export function Info({ label, value, valueClassName = '' }: InfoProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}:</p>
      <p className={`font-medium ${valueClassName}`}>{value}</p>
    </div>
  );
}