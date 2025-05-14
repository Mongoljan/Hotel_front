'use client';

import React, { useEffect, useState } from 'react';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import StepIndicator from './StepIndicator';
import SixStepInfo from './SixStepInfo';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';

interface Hotel {
  is_approved: boolean;
  // other fields...
}

export default function RegisterHotel() {
  const t = useTranslations('AdminPage');
  const [proceed, setProceed] = useState<number | null>(null);
  const [hotelApproved, setHotelApproved] = useState(false);
  const [stepStatus, setStepStatus] = useState(2);
  const [view, setView] = useState<'proceed' | 'register'>('proceed');

  // ✅ Load proceed from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('proceed');
    if (saved !== null) {
      setProceed(Number(saved));
      return;
    }

    // ✅ Decide based on fallback data
    const decideStep = async () => {
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
  }, []);

  // ✅ Persist `proceed` in localStorage
  useEffect(() => {
    if (proceed !== null) {
      localStorage.setItem('proceed', String(proceed));
    }
  }, [proceed]);

  // ✅ Poll hotel approval
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
        <div className="w-full">
          <StepIndicator steps={steps} currentStep={stepStatus} />
        </div>
      )}

      {/* Conditionally render components */}
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
