'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import StepIndicator from './StepIndicator';
import SixStepInfo from './SixStepInfo';
import StaffWaitingView from './StaffWaitingView';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { useCombinedData } from '@/app/hooks/useCombinedData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconBuilding,
  IconSettings,
  IconCheck,
  IconClock,
  IconBuildingBank,
  IconBed,
  IconPhoto,
  IconCalendar,
  IconMoodKid
} from "@tabler/icons-react";

interface BasicInfo {
  id: number;
  property_name_mn: string;
  property_name_en: string;
  start_date: string;
  total_hotel_rooms: number;
  available_rooms: number;
  star_rating: number;
}

interface PropertyBaseInfo {
  pk: number;
  register: string;
  CompanyName: string;
  PropertyName: string;
  location: string;
  property_type: number;
  phone: string;
  mail: string;
  is_approved: boolean;
  created_at: string;
  groupName?: string;
}

interface PropertyPolicy {
  id: number;
  check_in_from: string;
  check_in_until: string;
  check_out_from: string;
  check_out_until: string;
  breakfast_policy: string;
  allow_children: boolean;
  allow_pets: boolean;
}

interface Hotel {
  is_approved: boolean;
  // other fields...
}

export default function RegisterHotel() {
  const t = useTranslations('HotelPage');
  const { user, isLoading, isAuthenticated } = useAuth();
  const [proceed, setProceed] = useState<number | null>(null);
  const [hotelApproved, setHotelApproved] = useState(false);
  const [view, setView] = useState<'proceed' | 'register'>('proceed');
  
  // Check if user is staff (Manager=3 or Reception=4)
  const isStaffUser = user?.user_type === 3 || user?.user_type === 4;
  
  // Hotel data state
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [propertyBaseInfo, setPropertyBaseInfo] = useState<PropertyBaseInfo | null>(null);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);
  const [propertyImages, setPropertyImages] = useState<{ id: number; image: string; description: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Use cached singleton hook — avoids re-fetching combined-data on every render
  const { data: combinedHookData } = useCombinedData();
  useEffect(() => {
    if (combinedHookData) setPropertyTypes(combinedHookData.property_types || []);
  }, [combinedHookData]);

  // ✅ Determine proceed state based on approval and completion status
  useEffect(() => {

    const decideStep = async () => {
      if (!user?.hotel || !user?.id) {
        return; // Wait for user data
      }

      // Wait for hotel approval status to be loaded from API
      if (isLoadingData) {
        return;
      }

      // 🔥 PRIORITY: If user is not approved or hotel is not approved, show approval waiting
      if (!user?.approved || !hotelApproved) {
        setProceed(0); // Show approval waiting component
        return;
      }

      // ✨ Check cache first for instant UI (tied to user + hotel)
      const cacheKey = `hotelCompletion_${user.id}_${user.hotel}`;
      const cachedStatus = localStorage.getItem(cacheKey);

      if (cachedStatus === 'completed') {
        setProceed(2);
        // Continue to verify with API in background, but don't change proceed if cache exists
      }

      // User is approved - now check if 7-step registration is complete (details + images)
      try {
        const hid = user.hotel;

        if (hid) {
          const [detailsRes, imagesRes] = await Promise.all([
            fetch(`https://dev.kacc.mn/api/property-details/?property=${hid}`, { cache: 'no-store' }),
            fetch(`https://dev.kacc.mn/api/property-images/?property=${hid}`, { cache: 'no-store' }),
          ]);

          if (!detailsRes.ok || !imagesRes.ok) {
            console.error('❌ Onboarding status fetch failed:', detailsRes.status, imagesRes.status);
            if (cachedStatus !== 'completed') {
              setProceed(0);
            }
            return;
          }

          let details;
          let images;
          try {
            details = await detailsRes.json();
            images = await imagesRes.json();
          } catch (parseError) {
            console.error('❌ Failed to parse onboarding status JSON:', parseError);
            if (cachedStatus !== 'completed') {
              setProceed(0);
            }
            return;
          }

          const hasDetails = Array.isArray(details) && details.length > 0;
          const hasImages = Array.isArray(images) && images.length > 0;

          if (hasDetails && hasImages) {
            localStorage.setItem(cacheKey, 'completed');
            window.dispatchEvent(new Event('hotel-registration-complete'));
            setProceed(2);
            return;
          }

          if (hasDetails && !hasImages) {
            if (cachedStatus === 'completed') {
              localStorage.removeItem(cacheKey);
            }
            setProceed(1);
            return;
          }

          if (cachedStatus !== 'completed') {
            localStorage.removeItem(cacheKey);
          }
        }

        // Check if user has started but not completed registration
        // But only if we don't already have a completed cache
        if (cachedStatus !== 'completed') {
          const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
          if (propertyDataStr) {
            const pd = JSON.parse(propertyDataStr);
            if (Array.isArray(pd.general_facilities) && pd.general_facilities.length) {
              setProceed(1);
              return;
            }
          }
        }
      } catch (err) {
        console.error('❌ Error in decideStep:', err);
        // Even on error, if we have cache, trust it
        if (cachedStatus === 'completed') {
          return;
        }
      }

      // Default: show proceed/start registration
      // But only if we don't have completed cache
      if (cachedStatus !== 'completed') {
        setProceed(0);
      } else {
      }
    };

    decideStep();
  }, [user?.hotel, user?.approved, hotelApproved, user?.id, isLoadingData]); // Depend on API-loaded approval status

  // ✅ Load hotel data once on mount or when hotel ID changes
  useEffect(() => {
    const loadHotelData = async () => {
      const hid = user?.hotel;
      if (!hid) return;
      
      setIsLoadingData(true);
      
      try {
        const [basicRes, policyRes, imagesRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/property-basic-info/?property=${hid}`),
          fetch(`https://dev.kacc.mn/api/property-policies/?property=${hid}`),
          fetch(`https://dev.kacc.mn/api/property-images/?property=${hid}`)
        ]);
        // Note: properties/${hid} is fetched by the polling effect below (fires immediately + every 30 s)
        
        if (basicRes.ok) {
          const [basicData] = await basicRes.json();
          setBasicInfo(basicData);
        }
        
        if (policyRes.ok) {
          const [policyData] = await policyRes.json();
          setPropertyPolicy(policyData);
        }
        // propertyTypes populated via useCombinedData hook (see above)
        
        if (imagesRes.ok) {
          const imagesData = await imagesRes.json();
          setPropertyImages(imagesData);
        }
      } catch (e) {
        console.error('Error loading hotel data', e);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user?.hotel) {
      loadHotelData();
    }
  }, [user?.hotel]);

  // Approval polling — fires immediately on mount AND every 30 s (replaces the duplicate mount fetch in loadHotelData)
  useEffect(() => {
    const checkApproval = async () => {
      const hid = user?.hotel;
      if (!hid) return;
      
      try {
        const res = await fetch(`https://dev.kacc.mn/api/properties/${hid}`);
        if (res.ok) {
          const data: Hotel = await res.json();
          setHotelApproved(data.is_approved);
          setPropertyBaseInfo(data as any);
        }
      } catch (e) {
        console.error('Error checking approval', e);
      }
    };

    if (user?.hotel) {
      checkApproval(); // immediate fetch on mount (no duplicate — loadHotelData no longer fetches properties)
      const id = setInterval(checkApproval, 30000);
      return () => clearInterval(id);
    }
  }, [user?.hotel]);

  // Memoized helper functions
  const getPropertyTypeName = React.useCallback((id?: number | null) => {
    if (!id) return '—';
    return propertyTypes.find((pt) => pt.id === id)?.name_mn ?? '—';
  }, [propertyTypes]);

  const formatDate = React.useCallback((dateString?: string | null) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch {
      return dateString;
    }
  }, []);

  // Memoized computed values
  const hotelDisplayData = React.useMemo(() => ({
    hotelName: basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || '—',
    propertyType: getPropertyTypeName(propertyBaseInfo?.property_type),
    startDate: formatDate(basicInfo?.start_date),
    totalRooms: basicInfo?.total_hotel_rooms || '—',
    childrenAllowed: propertyPolicy?.allow_children ? t('yes') : t('no'),
    petsAllowed: propertyPolicy?.allow_pets ? t('yes') : t('no'),
    breakfast: propertyPolicy?.breakfast_policy || '—',
    starRating: basicInfo?.star_rating ? `${basicInfo.star_rating > 5 ? basicInfo.star_rating - 2 : basicInfo.star_rating} ⭐` : '—',
    hotelId: user?.hotel || '—'
  }), [basicInfo, propertyBaseInfo, propertyPolicy, user?.hotel, getPropertyTypeName, formatDate, t]);

  if (isLoading || proceed === null) return <div>Loading authentication and page data…</div>;

  // Staff users (Manager/Reception) see simplified view
  if (isStaffUser) {
    return <StaffWaitingView />;
  }

  // Debug info
 

  const steps = [
    'Компанийн мэдээлэл',
    'Буудлын үндсэн бүртгэл',
  ];

  // Two-step registration: step 1 done after signup; step 2 until full hotel onboarding
  const registrationStepStatuses: ('completed' | 'active' | 'pending')[] = [
    'completed',
    proceed === 2 ? 'completed' : hotelApproved ? 'active' : 'pending',
  ];

  return (
    <div className="space-y-3">

      {view === 'proceed' && proceed !== 2 && (
        <div className="w-full">
          <StepIndicator steps={steps} stepStatuses={registrationStepStatuses} />
        </div>
      )}

      {/* Conditionally render components */}
      {proceed === 2 && <SixStepInfo proceed={proceed} setProceed={setProceed} />}
      {proceed < 2 && view === 'proceed' && (
        <Proceed 
          proceed={proceed} 
          setProceed={setProceed} 
          setView={setView}
          hotelId={user?.hotel}
          hotelApproved={hotelApproved}
          basicInfo={basicInfo}
          getPropertyTypeName={(id: number) => {
            const type = propertyTypes.find(pt => pt.id === id);
            return type?.name_mn || '—';
          }}
        />
      )}
      {proceed < 2 && view === 'register' && (
        <RegisterPage proceed={proceed} setProceed={setProceed} setView={setView} />
      )}
    </div>
  );
}
