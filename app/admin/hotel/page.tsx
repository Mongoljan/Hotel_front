'use client';

import React, { useEffect, useState } from 'react';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import SixStepInfo from './SixStepInfo';
import { useTranslations } from 'next-intl';

interface UserInfo {
  name?: string;
  email?: string;
}

export default function RegisterHotel() {
  const t = useTranslations('AdminPage');
  const [proceed, setProceed] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({});

  // Hydrate userInfo and determine initial step
  useEffect(() => {
    async function init() {
      // Load user info
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          setUserInfo(JSON.parse(storedUser));
        } catch {
          // ignore malformed JSON
        }
      }

      // If a manual proceed was saved, respect it
      const saved = localStorage.getItem('proceed');
      if (saved) {
        setProceed(parseInt(saved, 10));
        return;
      }

      // Load propertyData for potential step2
      const pd = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const propertyId = pd.hotel;

      if (propertyId) {
        try {
          const res = await fetch(
            `https://dev.kacc.mn/api/property-details/?property=${propertyId}`
          );
          const details = await res.json();
          if (Array.isArray(details) && details.length > 0) {
            setProceed(2);
            console.log("its worked")
            return;
          }
        } catch {
          // fetch failed, fall through to step0
        }
      }

      // Fallback based on what data is in storage
      if (Array.isArray(pd.general_facilities) && pd.general_facilities.length > 0) {
        setProceed(1);
      } else {
        setProceed(0);
      }
    }

    init();
  }, []);

  // Persist proceed whenever it changes
  useEffect(() => {
    if (proceed !== null) {
      localStorage.setItem('proceed', proceed.toString());
    }
  }, [proceed]);

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
