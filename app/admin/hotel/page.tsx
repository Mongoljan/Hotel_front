'use client';

import React, { useEffect, useState } from 'react';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import StepIndicator from './StepIndicator';
import SixStepInfo from './SixStepInfo';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';

interface UserInfo {
  name?: string;
  email?: string;
  hotel?: number;
  position?: string;
}

interface Hotel {
  is_approved: boolean;
  // other fields...
}

export default function RegisterHotel() {
  const t = useTranslations('AdminPage');
  const [proceed, setProceed] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [hotelApproved, setHotelApproved] = useState(false);
  const [stepStatus, setStepStatus] = useState(2);
  const [view, setView] = useState<'proceed' | 'register'>('proceed');

  // Load userInfo from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) setUserInfo(JSON.parse(stored));
  }, []);

  // Determine initial proceed step
  useEffect(() => {
    const decideStep = async () => {
      if (!userInfo.email && !userInfo.hotel) return;
      const key = `proceed_${userInfo.email || userInfo.hotel}`;
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setProceed(Number(saved));
        return;
      }
      try {
        const pd = JSON.parse(localStorage.getItem('propertyData') || '{}');
        if (Array.isArray(pd.general_facilities) && pd.general_facilities.length) {
          setProceed(1);
          return;
        }
        const hid = Cookies.get('hotel');
        if (hid) {
          const res = await fetch(
            `https://dev.kacc.mn/api/property-details/?property=${hid}`,
            { cache: 'no-store' }
          );
          const details = await res.json();
          if (Array.isArray(details) && details.length) {
            setProceed(2);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
      setProceed(0);
    };
    decideStep();
  }, [userInfo]);

  // Persist proceed
  useEffect(() => {
    if (proceed !== null && (userInfo.email || userInfo.hotel)) {
      localStorage.setItem(
        `proceed_${userInfo.email || userInfo.hotel}`,
        String(proceed)
      );
    }
  }, [proceed, userInfo]);

  // Poll approval status
  useEffect(() => {
    const checkApproval = async () => {
      try {
        const hid = Cookies.get('hotel');
        if (!hid) return;
        const res = await fetch(`https://dev.kacc.mn/api/properties/${hid}`);
        if (!res.ok) return;
        const data: Hotel = await res.json();
        setHotelApproved(data.is_approved);
        setStepStatus(data.is_approved ? 3 : 2);
      } catch (e) {
        console.error('Error fetching approval', e);
      }
    };
    checkApproval();
    const id = setInterval(checkApproval, 5000);
    return () => clearInterval(id);
  }, []);

  // Show loading until proceed is set
  if (proceed === null) return <div>Loading…</div>;

  const steps = [
    'Хүсэлт илгээсэн',
    'Хүлээгдэж байгаа',
    'Баталгаажсан',
    'Дэлгэрэнгүй мэдээлэл оруулах',
  ];

  return (
    <div className="p-10">
{view === 'proceed' && proceed !== 2 && (
  <div className="w-full ">
  <div className="">
  <StepIndicator steps={steps} currentStep={stepStatus} />
  </div>
  </div>
)}


      {/* Toggle buttons after approval */}
      {/* {hotelApproved && proceed < 2 && (
        <div className="flex justify-end gap-4 mb-6">
          <button
            type="button"
            onClick={() => setView('proceed')}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Хүлээгдэж буй төлөв
          </button>
          <button
            type="button"
            onClick={() => setView('register')}
            className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
          >
            Мэдээлэл оруулах
          </button>
        </div>
      )} */}

      {/* Render based on view and proceed */}
      {proceed === 2 && <SixStepInfo proceed={proceed} setProceed={setProceed} />}
      {proceed < 2 && view === 'proceed' && (
        <Proceed proceed={proceed} setProceed={setProceed} setView={setView} />
      )}
      {proceed < 2 && view === 'register' && (
        <RegisterPage proceed={proceed} setProceed={setProceed} setView={setView} />
      )}
    </div>
  );
}