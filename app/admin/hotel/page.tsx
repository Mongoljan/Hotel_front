'use client';

import React, { useEffect, useState } from 'react';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import SixStepInfo from './SixStepInfo';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';

interface UserInfo {
  name?: string;
  email?: string;
  hotel?: number;
}

export default function RegisterHotel() {
  const t = useTranslations('AdminPage');
  const [proceed, setProceed] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({});

  // Helper to build a per-user storage key
  const getProceedKey = () => {
    // Use email or hotel ID as namespace
    return `proceed_${userInfo.email || userInfo.hotel || 'guest'}`;
  };

  // Load userInfo once
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch {
        // ignore malformed JSON
      }
    }
  }, []);

  // Once userInfo is loaded, determine or load proceed
  useEffect(() => {
    if (!userInfo.email && !userInfo.hotel) {
      // still loading userInfo
      return;
    }
    const key = getProceedKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      setProceed(parseInt(saved, 10));
    } else {
      determineStep();
    }
  }, [userInfo]);

  // Persist proceed to user-specific key
  useEffect(() => {
    if (proceed !== null && (userInfo.email || userInfo.hotel)) {
      localStorage.setItem(getProceedKey(), proceed.toString());
    }
  }, [proceed, userInfo]);

  // Logic to decide which step to show
  const determineStep = async () => {
    // Step 1 check
    const pd = JSON.parse(localStorage.getItem('propertyData') || '{}');
    if (Array.isArray(pd.general_facilities) && pd.general_facilities.length > 0) {
      setProceed(1);
      return;
    }

    // Use hotel ID from cookie or userInfo
    const hotelId = Number(Cookies.get('hotel') || pd.property || userInfo.hotel);
    if (hotelId) {
      try {
        const res = await fetch(
          `https://dev.kacc.mn/api/property-details/?property=${hotelId}`,
          { cache: 'no-store' }
        );
        const details = await res.json();
        if (Array.isArray(details) && details.length > 0) {
          setProceed(2);
          return;
        }
      } catch {
        // fetch failed; fallback
      }
    }

    // Default to step 0
    setProceed(0);
  };

  if (proceed === null) {
    return <div>Loading…</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-xl">
        {t('Hi')}, {t('Welcome')} {userInfo.name || ''}!
      </h2>
      {userInfo.email && <p className="mb-6 text-gray-600">{userInfo.email}</p>}

      {proceed === 0 && <Proceed proceed={proceed} setProceed={setProceed} />}
      {proceed === 1 && <RegisterPage proceed={proceed} setProceed={setProceed} />}
      {proceed === 2 && <SixStepInfo proceed={proceed} setProceed={setProceed} />}
    </div>
  );
}
