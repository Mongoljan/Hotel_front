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

  // Hydrate userInfo and initial proceed from localStorage once on the client
  useEffect(() => {
    // Load user info
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch {
        // ignore malformed JSON
      }
    }

    // Determine which step to start on
    const savedProceed = localStorage.getItem('proceed');
    if (savedProceed) {
      setProceed(parseInt(savedProceed, 10));
      return;
    }

    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');

    if (Array.isArray(propertyData.property_photos) && propertyData.property_photos.length > 0) {
      setProceed(2);
    } else if (Array.isArray(propertyData.general_facilities) && propertyData.general_facilities.length > 0) {
      setProceed(1);
    } else {
      setProceed(0);
    }
  }, []);

  // Persist proceed back to localStorage whenever it changes
  useEffect(() => {
    if (proceed !== null) {
      localStorage.setItem('proceed', proceed.toString());
    }
  }, [proceed]);

  // Sanity-check propertyDetails before allowing step 2
  useEffect(() => {
    if (proceed !== 2) return;

    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    const propertyId = propertyData.property;
    if (!propertyId) {
      setProceed(0);
      return;
    }

    fetch(`https://dev.kacc.mn/api/property-details/?property=${propertyId}`)
      .then((res) => res.json())
      .then((details: any[]) => {
        if (Array.isArray(details) && details.length > 0) {
          // valid property, ensure we're on step 2
          setProceed(2);
        } else {
          // no details found → restart flow
          setProceed(0);
        }
      })
      .catch(() => {
        // fetch error → restart flow
        setProceed(0);
      });
  }, [proceed, setProceed]);

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
