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
  position?: string;
}

export default function RegisterHotel() {
  const t = useTranslations('AdminPage');
  const [proceed, setProceed] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({});

  // Load userInfo from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse userInfo:', err);
    }
  }, []);

  // Get hotel ID from multiple sources
  const getHotelId = (): number | null => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const property = JSON.parse(localStorage.getItem('propertyData') || '{}');
      return  Number(Cookies.get('hotel')) ;
    } catch {
      return null;
    }
  };

  // Decide step logic
  useEffect(() => {
    const decideStep = async () => {
      if (!userInfo.email && !userInfo.hotel) return;

      const key = `proceed_${userInfo.email || userInfo.hotel}`;
      const savedStep = localStorage.getItem(key);

      if (savedStep !== null) {
        setProceed(parseInt(savedStep, 10));
        return;
      }

      try {
        const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
        if (Array.isArray(propertyData.general_facilities) && propertyData.general_facilities.length > 0) {
          setProceed(1);
          return;
        }

        const hotelId = getHotelId();
        if (hotelId) {
          const res = await fetch(`https://dev.kacc.mn/api/property-details/?property=${hotelId}`, {
            cache: 'no-store',
          });
          const details = await res.json();
          if (Array.isArray(details) && details.length > 0) {
            setProceed(2);
            return;
          }
        }
      } catch (error) {
        console.error('Error determining registration step:', error);
      }

      setProceed(0);
    };

    decideStep();
  }, [userInfo]);

  // Persist proceed to localStorage
  useEffect(() => {
    if (proceed !== null && (userInfo.email || userInfo.hotel)) {
      const key = `proceed_${userInfo.email || userInfo.hotel}`;
      localStorage.setItem(key, proceed.toString());
    }
  }, [proceed, userInfo]);

  // Wait for decision
  if (proceed === null) return <div>Loading…</div>;

  return (
    <div className="p-12">
      {/* <h2 className="text-xl">
        {t('Hi')}, {t('Welcome')} {userInfo.name || ''}!
        {userInfo.position && <span> Your position: {userInfo.position}</span>}
      </h2>
      {userInfo.email && <p className="mb-6 text-gray-600">{userInfo.email}</p>} */}

      {proceed === 0 && <Proceed proceed={proceed} setProceed={setProceed} />}
      {proceed === 1 && <RegisterPage proceed={proceed} setProceed={setProceed} />}
      {proceed === 2 && <SixStepInfo proceed={proceed} setProceed={setProceed} />}
    </div>
  );
}
