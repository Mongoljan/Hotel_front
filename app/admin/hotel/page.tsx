'use client';

import React, { useEffect, useState } from 'react';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import StepIndicator from './StepIndicator';
import SixStepInfo from './SixStepInfo';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

interface Hotel {
  is_approved: boolean;
  // other fields...
}

export default function RegisterHotel() {
  const t = useTranslations('AdminPage');
  const { user, isLoading, isAuthenticated } = useAuth();
  const [proceed, setProceed] = useState<number | null>(null);
  const [hotelApproved, setHotelApproved] = useState(false);
  const [stepStatus, setStepStatus] = useState(2);
  const [view, setView] = useState<'proceed' | 'register'>('proceed');

  // ✅ Load proceed from localStorage (ORIGINAL LOGIC with JWT data source)
  useEffect(() => {
    const saved = localStorage.getItem('proceed');
    if (saved !== null) {
      setProceed(Number(saved));
      return;
    }

    // ✅ Decide based on user data and API calls (ORIGINAL LOGIC)
    const decideStep = async () => {
      if (!user?.hotel) return; // Wait for user data

      try {
        const pd = JSON.parse(localStorage.getItem('propertyData') || '{}');
        if (Array.isArray(pd.general_facilities) && pd.general_facilities.length) {
          setProceed(1);
          return;
        }

        // Use JWT user.hotel instead of Cookies.get('hotel')
        const hid = user.hotel;
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
  }, [user?.hotel]); // Only depend on hotel ID being available

  // ✅ Persist `proceed` in localStorage
  useEffect(() => {
    if (proceed !== null) {
      localStorage.setItem('proceed', String(proceed));
    }
  }, [proceed]);

  // ✅ Poll hotel approval (ORIGINAL LOGIC with JWT data source)
  useEffect(() => {
    const checkApproval = async () => {
      try {
        const hid = user?.hotel;
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
  }, [user?.hotel]);

  if (isLoading || proceed === null) return <div>Loading authentication and page data…</div>;

  // Debug info
  console.log('Current state:', {
    user: user ? { hotel: user.hotel, approved: user.approved, hotelApproved: user.hotelApproved } : null,
    proceed,
    hotelApproved,
    stepStatus,
    view
  });

  const steps = [
    'Хүсэлт илгээсэн',
    'Хүлээгдэж байгаа',
    'Баталгаажсан',
    'Дэлгэрэнгүй мэдээлэл оруулах',
  ];

  return (
    <div className="min-h-screen bg-background p-8">
   

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
