'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import StepIndicator from './StepIndicator';
import SixStepInfo from './SixStepInfo';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
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
  IconPhoto
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
  const [stepStatus, setStepStatus] = useState(2);
  const [view, setView] = useState<'proceed' | 'register'>('proceed');
  
  // Hotel data state
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [propertyBaseInfo, setPropertyBaseInfo] = useState<PropertyBaseInfo | null>(null);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);
  const [propertyImages, setPropertyImages] = useState<{ id: number; image: string; description: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ✅ Determine proceed state based on approval and completion status
  useEffect(() => {
    console.log('🚀 decideStep effect triggered. Dependencies:', {
      hotel: user?.hotel,
      userId: user?.id,
      userApproved: user?.approved,
      hotelApproved: hotelApproved,
      isLoadingData: isLoadingData
    });

    const decideStep = async () => {
      if (!user?.hotel || !user?.id) {
        console.log('⏸️ Waiting for user data...');
        return; // Wait for user data
      }

      console.log('Deciding proceed step. User approval status:', {
        userApproved: user?.approved,
        hotelApproved: hotelApproved, // Use state from API, not JWT
        hotelApprovedFromJWT: user?.hotelApproved
      });

      // Wait for hotel approval status to be loaded from API
      if (isLoadingData) {
        console.log('Still loading hotel data, waiting...');
        return;
      }

      // 🔥 PRIORITY: If user is not approved or hotel is not approved, show approval waiting
      if (!user?.approved || !hotelApproved) {
        console.log('User/Hotel not approved - showing Proceed component');
        setProceed(0); // Show approval waiting component
        return;
      }

      // User is approved - now check if 6-step registration is complete
      try {
        const hid = user.hotel;
        console.log('🔍 Checking property details for hotel:', hid);
        
        if (hid) {
          const res = await fetch(
            `https://dev.kacc.mn/api/property-details/?property=${hid}`,
            { cache: 'no-store' }
          );
          
          console.log('📡 Property details fetch response:', {
            ok: res.ok,
            status: res.status,
            statusText: res.statusText
          });
          
          if (!res.ok) {
            console.error('❌ Property details fetch failed:', res.status);
            setProceed(0);
            return;
          }
          
          let details;
          try {
            details = await res.json();
          } catch (parseError) {
            console.error('❌ Failed to parse property details JSON:', parseError);
            setProceed(0);
            return;
          }
          
          console.log('🔍 Property details API response:', {
            hotelId: hid,
            detailsResponse: details,
            isArray: Array.isArray(details),
            length: Array.isArray(details) ? details.length : 'N/A',
            firstItem: Array.isArray(details) && details.length > 0 ? details[0] : null
          });
          
          if (Array.isArray(details) && details.length > 0) {
            // Six steps completed - show SixStepInfo
            console.log('✅ Six steps completed - setting proceed to 2');
            setProceed(2);
            return;
          } else {
            console.log('⚠️ Property details not found or empty - user needs to complete 6 steps');
          }
        }

        // Check if user has started but not completed registration
        const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
        if (propertyDataStr) {
          const pd = JSON.parse(propertyDataStr);
          if (Array.isArray(pd.general_facilities) && pd.general_facilities.length) {
            console.log('📝 Found incomplete registration data in storage');
            setProceed(1);
            return;
          }
        }
      } catch (err) {
        console.error('❌ Error in decideStep:', err);
      }

      // Default: show proceed/start registration
      console.log('🔄 No completion data found - setting proceed to 0');
      setProceed(0);
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
        const [hotelRes, basicRes, policyRes, combinedRes, imagesRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/properties/${hid}`),
          fetch(`https://dev.kacc.mn/api/property-basic-info/?property=${hid}`),
          fetch(`https://dev.kacc.mn/api/property-policies/?property=${hid}`),
          fetch(`https://dev.kacc.mn/api/combined-data/`),
          fetch(`https://dev.kacc.mn/api/property-images/?property=${hid}`)
        ]);
        
        if (hotelRes.ok) {
          const hotelData: Hotel = await hotelRes.json();
          setHotelApproved(hotelData.is_approved);
          setStepStatus(hotelData.is_approved ? 3 : 2);
          setPropertyBaseInfo(hotelData as any);
        }
        
        if (basicRes.ok) {
          const [basicData] = await basicRes.json();
          setBasicInfo(basicData);
        }
        
        if (policyRes.ok) {
          const [policyData] = await policyRes.json();
          setPropertyPolicy(policyData);
        }
        
        if (combinedRes.ok) {
          const combinedData = await combinedRes.json();
          setPropertyTypes(combinedData.property_types || []);
        }
        
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

  // ✅ Separate lighter approval polling (less frequent, only approval status)
  useEffect(() => {
    const checkApproval = async () => {
      const hid = user?.hotel;
      if (!hid) return;
      
      try {
        const res = await fetch(`https://dev.kacc.mn/api/properties/${hid}`);
        if (res.ok) {
          const data: Hotel = await res.json();
          setHotelApproved(data.is_approved);
          setStepStatus(data.is_approved ? 3 : 2);
        }
      } catch (e) {
        console.error('Error checking approval', e);
      }
    };

    if (user?.hotel) {
      // Only poll approval status every 30 seconds (much less aggressive)
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
      return new Date(dateString).toLocaleDateString('mn-MN');
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
    hotelId: user?.hotel || '—'
  }), [basicInfo, propertyBaseInfo, propertyPolicy, user?.hotel, getPropertyTypeName, formatDate, t]);

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
    <div className="space-y-6 p-4">
      {/* Hero Gradient Card */}
      {proceed === 2 && (
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),transparent_45%)]" />
          
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left side - Image */}
            <div className="flex-shrink-0 space-y-4">
              <Badge variant="outline" className="w-fit border-white/30 bg-white/10 text-white/90 backdrop-blur">
                <IconBuildingBank className="mr-2 h-3.5 w-3.5" /> {t('hero_badge')}
              </Badge>
              
              {/* Hotel Image */}
              {isLoadingData ? (
                <div className="flex items-center justify-center w-[400px] h-[280px] rounded-2xl border border-white/20 bg-white/5">
                  <div className="text-center">
                    <div className="h-8 w-8 mx-auto border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-white/60 mt-3">Уншиж байна...</p>
                  </div>
                </div>
              ) : propertyImages.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                  <Image
                    src={propertyImages[0].image}
                    alt={propertyImages[0].description || hotelDisplayData.hotelName}
                    width={400}
                    height={280}
                    className="w-[400px] h-[280px] object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-[400px] h-[280px] rounded-2xl border border-dashed border-white/30 bg-white/5">
                  <div className="text-center">
                    <IconPhoto className="mx-auto h-12 w-12 text-white/40" />
                    <p className="text-sm text-white/60 mt-3">Зураг байхгүй байна</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Hotel Info Panel */}
            <div className="flex-1 max-w-sm rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60 mb-4">
                <span>{t('status_label')}</span>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  <IconCheck className="mr-1 h-3 w-3" />
                  {t('status_approved')}
                </Badge>
              </div>
              
              {isLoadingData ? (
                <div className="space-y-3 text-white/90">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Loading...</p>
                    <div className="h-4 w-16 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-white/90">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{t('hotel_name')}</p>
                    <p className="text-sm font-semibold">{hotelDisplayData.hotelName}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{t('property_type')}</p>
                    <p className="text-sm font-semibold">{hotelDisplayData.propertyType}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{t('start_date')}</p>
                    <p className="text-sm font-semibold">{hotelDisplayData.startDate}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{t('total_rooms')}</p>
                    <p className="text-sm font-semibold">{hotelDisplayData.totalRooms}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{t('children_allowed')}</p>
                    <p className="text-sm font-semibold">{hotelDisplayData.childrenAllowed}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{t('hotel_id')}</p>
                    <p className="text-sm font-semibold">{hotelDisplayData.hotelId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {view === 'proceed' && proceed !== 2 && (
        <div className="w-full">
          <StepIndicator steps={steps} currentStep={stepStatus} />
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
