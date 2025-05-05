'use client';

import React, { useEffect, useState } from 'react';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import SixStepInfo from './SixStepInfo';
import { useTranslations } from 'next-intl';

export default function RegisterHotel() {
  const t = useTranslations('AdminPage');

  // Safely read userInfo from localStorage on the client
  const userInfo =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('userInfo') || '{}')
      : {};

  // Determine initial step based on saved "proceed" or existing propertyData
  const getInitialProceed = () => {
    if (typeof window === 'undefined') return 0;

    // 1) if we've explicitly saved a proceed value, use it
    const saved = localStorage.getItem('proceed');
    if (saved) return parseInt(saved, 10);

    // 2) else infer from propertyData in localStorage
    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    if (propertyData.property_photos?.length) return 2;
    if (propertyData.general_facilities?.length) return 1;

    // 3) default to step 0
    return 0;
  };

  const [proceed, setProceed] = useState<number>(getInitialProceed);

  // Persist the proceed value so a refresh "remembers" the step
  useEffect(() => {
    localStorage.setItem('proceed', proceed.toString());
  }, [proceed]);

  return (
    <div className="p-8">
      <h2 className="text-xl">
        {t('Hi')}, {t('Welcome')} {userInfo.name}!
      </h2>
      <p className="mb-6 text-gray-600">{userInfo.email}</p>

      {proceed === 0 && (
        <Proceed proceed={proceed} setProceed={setProceed} />
      )}

      {proceed === 1 && (
        <RegisterPage proceed={proceed} setProceed={setProceed} />
      )}

      {proceed === 2 && (
        <SixStepInfo proceed={proceed} setProceed={setProceed} />
      )}
    </div>
  );
}
