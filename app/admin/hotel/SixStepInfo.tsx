'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  IconBed,
  IconCalendar,
  IconCar,
  IconChevronLeft,
  IconChevronRight,
  IconFileInfo,
  IconInfoCircle,
  IconMoodKid,
  IconPhoto,
} from '@tabler/icons-react';

import AboutHotel from './AboutHotel';
import HotelImageGallery from './HotelImageGallery';
import LocationTab from './LocationTab';
import ServicesTab from './ServicesTab';
import FAQTab from './FAQTab';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyPhoto {
  id: number;
  image: string;
  description: string;
}

interface PropertyDetail {
  id: number;
  propertyBasicInfo: number;
  confirmAddress: number;
  propertyPolicies: number;
  google_map: string;
  parking_situation: string;
  property: number;
  general_facilities: number[];
  Additional_Information: number | null;
}

interface AdditionalInformation {
  id: number;
  About: string;
  YoutubeUrl: string;
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
  cancellation_fee: {
    cancel_time: string;
    before_fee: string;
    after_fee: string;
    special_condition_percentage: string;
  };
}

interface Address {
  id: number;
  zipCode: string;
  total_floor_number: number;
  province_city: number;
  soum: number;
  district: number;
}

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

interface ProceedProps {
  proceed: number;
  setProceed: (value: number) => void;
}

export default function SixStepInfo({ proceed, setProceed }: ProceedProps) {
  const t = useTranslations('SixStepInfo');
  const { user } = useAuth();

  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyPhoto[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'about' | 'images' | 'location' | 'services' | 'faq'>('about');
  const [isLoading, setIsLoading] = useState(true);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [propertyBaseInfo, setPropertyBaseInfo] = useState<PropertyBaseInfo | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInformation | null>(null);

  useEffect(() => {
    async function loadData() {
      const hotelId = user?.hotel;
      if (!hotelId) {
        console.log('⏸️ SixStepInfo: No hotel ID yet - waiting for user data...');
        return; // Just wait, don't change proceed
      }

      try {
        setIsLoading(true);
        console.log('🔄 SixStepInfo: Loading data for hotel:', hotelId);
        const [detailRes, policyRes, addressRes, basicInfoRes, combinedDataRes, baseRes, imagesRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/property-details/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/property-policies/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/confirm-address/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/property-basic-info/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/combined-data/`),
          fetch(`https://dev.kacc.mn/api/properties/${hotelId}/`),
          fetch(`https://dev.kacc.mn/api/property-images/?property=${hotelId}`),
        ]);

        console.log('📡 SixStepInfo: API responses:', {
          detailRes: detailRes.ok,
          policyRes: policyRes.ok,
          addressRes: addressRes.ok,
          basicInfoRes: basicInfoRes.ok,
          baseRes: baseRes.ok
        });

        if (!detailRes.ok || !policyRes.ok || !addressRes.ok || !basicInfoRes.ok || !baseRes.ok) {
          console.error('❌ SixStepInfo: One or more API calls failed - setting proceed to 0');
          setProceed(0);
          return;
        }

        console.log('✅ SixStepInfo: All API calls successful, loading data...');

        const [detail] = await detailRes.json();
        const [policy] = await policyRes.json();
        const [fetchedAddress] = await addressRes.json();
        const [basic] = await basicInfoRes.json();
        const combinedData = await combinedDataRes.json();
        const baseInfo = await baseRes.json();
        const imageJson = imagesRes.ok ? await imagesRes.json() : [];

        setPropertyDetail(detail);
        setPropertyPolicy(policy);
        setAddress(fetchedAddress);
        setBasicInfo(basic);
        setPropertyBaseInfo(baseInfo);
        setPropertyTypes(combinedData.property_types || []);
        setPropertyImages(imageJson);

        if (detail?.Additional_Information && typeof detail.Additional_Information === 'number') {
          const additionalRes = await fetch(`https://dev.kacc.mn/api/additionalInfo/${detail.Additional_Information}/`);
          if (additionalRes.ok) {
            const additionalData = await additionalRes.json();
            setAdditionalInfo(additionalData);
          }
        }
      } catch (error) {
        console.error(error);
        setProceed(0);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [setProceed, user?.hotel]);

  useEffect(() => {
    if (!propertyImages.length) {
      setImageIndex(0);
      return;
    }
    setImageIndex((prev) => Math.min(prev, propertyImages.length - 1));
  }, [propertyImages.length]);

  const getPropertyTypeName = useCallback(
    (id?: number | null) => {
      if (!id) return '—';
      return propertyTypes.find((pt) => pt.id === id)?.name_mn ?? t('loading');
    },
    [propertyTypes, t]
  );

  const formatTime = useCallback((time?: string | null) => {
    if (!time) return '—';
    return time.slice(0, 5);
  }, []);

  const hasImages = propertyImages.length > 0;
  const currentImage = hasImages ? propertyImages[imageIndex] : null;

  const detailItems = useMemo(
    () => [
      {
        label: 'Үл хөдлөх хөрөнгийн төрөл',
        value: getPropertyTypeName(propertyBaseInfo?.property_type),
        icon: IconFileInfo,
      },
      {
        label: 'Үйл ажиллагаа эхэлсэн огноо',
        value: basicInfo?.start_date ?? '—',
        icon: IconCalendar,
      },
      {
        label: 'Буудлын нийт өрөөний тоо',
        value: basicInfo?.total_hotel_rooms ?? '—',
        icon: IconBed,
      },
      {
        label: 'Хүүхэд үйлчлүүлэх боломжтой эсэх',
        value: propertyPolicy?.allow_children ?? null,
        icon: IconMoodKid,
        type: 'boolean' as const,
      },
      {
        label: 'Зогсоолын нөхцөл',
        value: propertyDetail?.parking_situation ?? '—',
        icon: IconCar,
      },
    ],
    [basicInfo, getPropertyTypeName, propertyDetail?.parking_situation, propertyPolicy?.allow_children, propertyBaseInfo?.property_type]
  );

  const policyItems = useMemo(
    () => [
      {
        label: 'Check-in',
        value: `${formatTime(propertyPolicy?.check_in_from)} - ${formatTime(propertyPolicy?.check_in_until)}`,
      },
      {
        label: 'Check-out',
        value: `${formatTime(propertyPolicy?.check_out_from)} - ${formatTime(propertyPolicy?.check_out_until)}`,
      },
      {
        label: 'Өрөөнүүд үйлчилгээнд',
        value: basicInfo?.available_rooms ?? '—',
      },
    ],
    [basicInfo?.available_rooms, formatTime, propertyPolicy?.check_in_from, propertyPolicy?.check_in_until, propertyPolicy?.check_out_from, propertyPolicy?.check_out_until]
  );

  const tabs = useMemo(
    () => [
      { value: 'about' as const, label: 'Бидний тухай', description: 'Зочид буудлын ерөнхий танилцуулга' },
      { value: 'images' as const, label: 'Зургийн цомог', description: `${propertyImages.length} зураг` },
      { value: 'location' as const, label: 'Байршил', description: 'Байршил, хүрэх заавар' },
      { value: 'services' as const, label: 'Үйлчилгээ', description: 'Үйлчилгээ, нэмэлт боломжууд' },
      { value: 'faq' as const, label: 'Түгээмэл асуулт', description: 'Асуулт, хариултууд' },
    ],
    [propertyImages.length]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!propertyDetail) {
    return (
      <Card className="border border-dashed border-border bg-muted/30">
        <CardHeader className="items-start gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
            {t('8')}
          </CardTitle>
          <CardDescription>
            Тохиргооны мэдээлэл хараахан бүртгэгдээгүй байна. Мэдээллээ шинэчилсний дараа энд харагдана.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Dashboard-style Header */}
      {/* <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-cyrillic">
          {basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || 'Зочид буудал'}
        </h2>
        <Badge
          variant="outline"
          className={cn('gap-1 px-3 py-1 text-xs font-semibold', statusBadge.className)}
        >
          <IconShieldCheck className="h-3 w-3" />
          {statusBadge.label}
        </Badge>
      </div> */}

      {/* Stats Cards - Dashboard Style */}
      {/* COMMENTED OUT: Redundant info now shown in hero card
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {detailItems.slice(0, 4).map((item) => {
          const formattedValue = (() => {
            if (item.type === 'boolean') {
              if (typeof item.value !== 'boolean') return '—';
              return item.value ? 'Тийм' : 'Үгүй';
            }
            if (item.value === null || item.value === undefined || item.value === '') return '—';
            return item.value;
          })();

          return (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyrillic">
                  {item.label}
                </CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedValue}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      */}

      {/* Additional Info & Image */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-cyrillic">Нэмэлт мэдээлэл</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detailItems.slice(4).map((item) => {
                const formattedValue = (() => {
                  if (item.type === 'boolean') {
                    if (typeof item.value !== 'boolean') return '—';
                    return item.value ? 'Тийм' : 'Үгүй';
                  }
                  if (item.value === null || item.value === undefined || item.value === '') return '—';
                  return item.value;
                })();

                return (
                  <div key={item.label} className="flex items-center">
                    <item.icon className="h-4 w-4 text-muted-foreground mr-3" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none text-cyrillic">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formattedValue}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card> */}

        {/* <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-cyrillic">Зураг</CardTitle>
            <CardDescription className="text-cyrillic">
              {propertyImages.length} фото
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasImages ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border">
                  <Image
                    src={currentImage?.image ?? ''}
                    alt={currentImage?.description || t('hotelImage')}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                </div>
                {propertyImages.length > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setImageIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1))
                      }
                    >
                      <IconChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {imageIndex + 1} / {propertyImages.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setImageIndex((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1))
                      }
                    >
                      <IconChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 border border-dashed rounded-lg bg-muted/30">
                <div className="text-center">
                  <IconPhoto className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Зураг байхгүй</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>



      {/* Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-cyrillic">Дэлгэрэнгүй мэдээлэл</CardTitle>
          <CardDescription>Зочид буудлын бүх мэдээллийг энд үзнэ үү</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="about" className="mt-0">
                <AboutHotel
                  image={currentImage}
                  aboutUs={additionalInfo?.About || ''}
                  youtubeUrl={additionalInfo?.YoutubeUrl || ''}
                  hotelId={propertyDetail.property}
                  propertyDetailId={propertyDetail.id}
                  basicInfo={basicInfo}
                  propertyPolicy={propertyPolicy}
                  propertyBaseInfo={propertyBaseInfo}
                  propertyDetail={propertyDetail}
                  getPropertyTypeName={(id) => getPropertyTypeName(id)}
                  formatTime={(time) => formatTime(time)}
                />
              </TabsContent>

              <TabsContent value="images" className="mt-0">
                <HotelImageGallery images={propertyImages} />
              </TabsContent>

              <TabsContent value="location" className="mt-0">
                <LocationTab
                  address={address}
                  propertyBaseInfo={propertyBaseInfo}
                  propertyDetail={propertyDetail}
                />
              </TabsContent>

              <TabsContent value="services" className="mt-0">
                <ServicesTab
                  facilityIds={propertyDetail.general_facilities || []}
                  hotelId={propertyDetail.property}
                />
              </TabsContent>

              <TabsContent value="faq" className="mt-0">
                <FAQTab hotelId={propertyDetail.property} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}



function LoadingSkeleton() {
  return (
    <div className="flex-1 space-y-6 pt-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
      <IconInfoCircle className="h-6 w-6 text-muted-foreground" />
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
