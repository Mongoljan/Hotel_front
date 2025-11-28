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
  IconEdit,
  IconPencil,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import ServicesTab from './ServicesTab';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithValue } from '@/components/ui/date-picker';

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
    single_before_time_percentage: string;
    single_after_time_percentage: string;
    multi_5days_before_percentage: string;
    multi_3days_before_percentage: string;
    multi_2days_before_percentage: string;
    multi_1day_before_percentage: string;
  };
}

interface Address {
  id: number;
  zipCode?: string;
  total_floor_number: number;
  province_city: number;
  soum?: number;
  district?: number;
}

interface BasicInfo {
  id: number;
  property_name_mn: string;
  property_name_en: string;
  start_date: string;
  total_hotel_rooms: number;
  available_rooms: number;
  star_rating: number;
  part_of_group: boolean;
  group_name?: string;
  sales_room_limitation: boolean;
  languages: number[];
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
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'map' | 'policy' | 'services'>('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [propertyBaseInfo, setPropertyBaseInfo] = useState<PropertyBaseInfo | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInformation | null>(null);
  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
  const [soums, setSoums] = useState<{ id: number; name: string; code: number }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string; code: number }[]>([]);

  // Edit dialog state for About & Video
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAbout, setEditAbout] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Google Map edit state
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [editGoogleMap, setEditGoogleMap] = useState('');
  const [isMapSaving, setIsMapSaving] = useState(false);

  // Basic Info edit state
  const [isBasicInfoDialogOpen, setIsBasicInfoDialogOpen] = useState(false);
  const [editBasicInfo, setEditBasicInfo] = useState({
    property_name_mn: '',
    property_name_en: '',
    start_date: '',
    star_rating: '',
    part_of_group: false,
    group_name: '',
    total_hotel_rooms: '',
    available_rooms: '',
    sales_room_limitation: false,
    languages: [] as number[],
  });
  const [isBasicInfoSaving, setIsBasicInfoSaving] = useState(false);
  const [languages, setLanguages] = useState<{ id: number; languages_name_mn: string }[]>([]);

  // Location/Address edit state
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editLocation, setEditLocation] = useState({
    province_city: '',
    soum: '',
    total_floor_number: '',
  });
  const [isLocationSaving, setIsLocationSaving] = useState(false);
  const [filteredSoums, setFilteredSoums] = useState<{ id: number; name: string; code: number }[]>([]);

  // Policy edit state
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [editPolicy, setEditPolicy] = useState({
    cancel_time: '',
    single_before_time_percentage: '',
    single_after_time_percentage: '',
    multi_5days_before_percentage: '',
    multi_3days_before_percentage: '',
    multi_2days_before_percentage: '',
    multi_1day_before_percentage: '',
    check_in_from: '',
    check_in_until: '',
    check_out_from: '',
    check_out_until: '',
    breakfast_policy: '',
    parking_situation: '',
    allow_pets: false,
    allow_children: false,
  });
  const [isPolicySaving, setIsPolicySaving] = useState(false);

  // Images edit state
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false);

  // Image lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      const hotelId = user?.hotel;
      if (!hotelId) {
        return; // Just wait, don't change proceed
      }

      try {
        setIsLoading(true);
        const [detailRes, policyRes, addressRes, basicInfoRes, combinedDataRes, baseRes, imagesRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/property-details/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/property-policies/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/confirm-address/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/property-basic-info/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/combined-data/`),
          fetch(`https://dev.kacc.mn/api/properties/${hotelId}/`),
          fetch(`https://dev.kacc.mn/api/property-images/?property=${hotelId}`),
        ]);

        if (!detailRes.ok || !policyRes.ok || !addressRes.ok || !basicInfoRes.ok || !baseRes.ok) {
          console.error('❌ SixStepInfo: One or more API calls failed - setting proceed to 0');
          setProceed(0);
          return;
        }

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
        setProvinces(combinedData.province || []);
        setSoums(combinedData.soum || []);
        setDistricts(combinedData.district || []);
        setLanguages(combinedData.languages || []);

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


  const getPropertyTypeName = useCallback(
    (id?: number | null) => {
      if (!id) return '—';
      return propertyTypes.find((pt) => pt.id === id)?.name_mn ?? t('loading');
    },
    [propertyTypes, t]
  );

  const getProvinceName = useCallback(
    (id?: number | null) => {
      if (!id) return '—';
      return provinces.find((p) => p.id === Number(id))?.name ?? '—';
    },
    [provinces]
  );

  const getSoumName = useCallback(
    (id?: number | null) => {
      if (!id) return '—';
      return soums.find((s) => s.id === Number(id))?.name ?? districts.find((d) => d.id === Number(id))?.name ?? '—';
    },
    [soums, districts]
  );

  const formatTime = useCallback((time?: string | null) => {
    if (!time) return '—';
    return time.slice(0, 5);
  }, []);

  const handleEditAboutVideo = () => {
    setEditAbout(additionalInfo?.About || '');
    setEditYoutubeUrl(additionalInfo?.YoutubeUrl || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveAboutVideo = async () => {
    if (!propertyDetail?.property || !propertyDetail?.id) {
      toast.error('Зочид буудлын мэдээлэл олдсонгүй');
      return;
    }

    try {
      setIsSaving(true);

      // Create or update additional info
      const res = await fetch('https://dev.kacc.mn/api/additionalInfo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          About: editAbout,
          YoutubeUrl: editYoutubeUrl,
          property: propertyDetail.property,
        }),
      });

      if (!res.ok) throw new Error('Хадгалах үед алдаа гарлаа');

      const data = await res.json();

      // Update property detail with additional info ID
      const patch = await fetch(`https://dev.kacc.mn/api/property-details/${propertyDetail.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Additional_Information: data.id }),
      });

      if (!patch.ok) throw new Error('Additional Info-г холбох үед алдаа гарлаа');

      // Update local state
      setAdditionalInfo(data);
      toast.success('Амжилттай хадгалагдлаа');
      setIsEditDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditGoogleMap = () => {
    setEditGoogleMap(propertyDetail?.google_map || '');
    setIsMapDialogOpen(true);
  };

  const handleSaveGoogleMap = async () => {
    if (!propertyDetail?.id) {
      toast.error('Зочид буудлын мэдээлэл олдсонгүй');
      return;
    }

    try {
      setIsMapSaving(true);

      const res = await fetch(`https://dev.kacc.mn/api/property-details/${propertyDetail.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_map: editGoogleMap }),
      });

      if (!res.ok) throw new Error('Google Map хадгалах үед алдаа гарлаа');

      const data = await res.json();
      setPropertyDetail(data);
      toast.success('Google Map амжилттай хадгалагдлаа');
      setIsMapDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setIsMapSaving(false);
    }
  };

  const handleEditBasicInfo = () => {
    setEditBasicInfo({
      property_name_mn: basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || '',
      property_name_en: basicInfo?.property_name_en || '',
      start_date: basicInfo?.start_date || '',
      star_rating: basicInfo?.star_rating?.toString() || '',
      part_of_group: basicInfo?.part_of_group || false,
      group_name: basicInfo?.group_name || '',
      total_hotel_rooms: basicInfo?.total_hotel_rooms?.toString() || '',
      available_rooms: basicInfo?.available_rooms?.toString() || '',
      sales_room_limitation: basicInfo?.sales_room_limitation || false,
      languages: basicInfo?.languages || [],
    });
    setIsBasicInfoDialogOpen(true);
  };

  const handleSaveBasicInfo = async () => {
    if (!basicInfo?.id) {
      toast.error('Үндсэн мэдээлэл олдсонгүй');
      return;
    }

    try {
      setIsBasicInfoSaving(true);

      const payload = {
        property_name_mn: editBasicInfo.property_name_mn,
        property_name_en: editBasicInfo.property_name_en,
        start_date: editBasicInfo.start_date,
        star_rating: parseInt(editBasicInfo.star_rating),
        part_of_group: editBasicInfo.part_of_group,
        group_name: editBasicInfo.group_name || '',
        total_hotel_rooms: parseInt(editBasicInfo.total_hotel_rooms),
        available_rooms: parseInt(editBasicInfo.available_rooms),
        sales_room_limitation: editBasicInfo.sales_room_limitation,
        languages: editBasicInfo.languages,
        property: user?.hotel,
      };

      const res = await fetch(`https://dev.kacc.mn/api/property-basic-info/${basicInfo.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Үндсэн мэдээлэл хадгалах үед алдаа гарлаа');

      const data = await res.json();
      setBasicInfo(data);
      toast.success('Үндсэн мэдээлэл амжилттай хадгалагдлаа');
      setIsBasicInfoDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setIsBasicInfoSaving(false);
    }
  };

  const handleEditLocation = () => {
    const provinceId = (address?.province_city || '').toString();
    setEditLocation({
      province_city: provinceId,
      soum: (address?.soum || address?.district || '').toString(),
      total_floor_number: (address?.total_floor_number || '').toString(),
    });

    // Filter soums based on selected province
    if (provinceId) {
      const filtered = soums.filter((s) => s.code === Number(provinceId)).concat(
        districts.filter((d) => d.code === Number(provinceId))
      );
      setFilteredSoums(filtered);
    }

    setIsLocationDialogOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!address?.id) {
      toast.error('Байршлын мэдээлэл олдсонгүй');
      return;
    }

    try {
      setIsLocationSaving(true);

      const payload = {
        province_city: parseInt(editLocation.province_city),
        soum: parseInt(editLocation.soum),
        zipCode: '00000', // Default dummy zip code
        total_floor_number: parseInt(editLocation.total_floor_number) || 1,
        property: user?.hotel,
      };

      const res = await fetch(`https://dev.kacc.mn/api/confirm-address/${address.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Байршил хадгалах үед алдаа гарлаа');

      const data = await res.json();
      setAddress(data);
      toast.success('Байршил амжилттай хадгалагдлаа');
      setIsLocationDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setIsLocationSaving(false);
    }
  };

  const handleEditPolicy = () => {
    setEditPolicy({
      cancel_time: propertyPolicy?.cancellation_fee?.cancel_time || '',
      single_before_time_percentage: propertyPolicy?.cancellation_fee?.single_before_time_percentage || '',
      single_after_time_percentage: propertyPolicy?.cancellation_fee?.single_after_time_percentage || '',
      multi_5days_before_percentage: propertyPolicy?.cancellation_fee?.multi_5days_before_percentage || '',
      multi_3days_before_percentage: propertyPolicy?.cancellation_fee?.multi_3days_before_percentage || '',
      multi_2days_before_percentage: propertyPolicy?.cancellation_fee?.multi_2days_before_percentage || '',
      multi_1day_before_percentage: propertyPolicy?.cancellation_fee?.multi_1day_before_percentage || '',
      check_in_from: propertyPolicy?.check_in_from || '',
      check_in_until: propertyPolicy?.check_in_until || '',
      check_out_from: propertyPolicy?.check_out_from || '',
      check_out_until: propertyPolicy?.check_out_until || '',
      breakfast_policy: propertyPolicy?.breakfast_policy || '',
      parking_situation: propertyDetail?.parking_situation || '',
      allow_pets: propertyPolicy?.allow_pets || false,
      allow_children: propertyPolicy?.allow_children || false,
    });
    setIsPolicyDialogOpen(true);
  };

  const handleSavePolicy = async () => {
    if (!propertyPolicy?.id) {
      toast.error('Бодлогын мэдээлэл олдсонгүй');
      return;
    }

    try {
      setIsPolicySaving(true);

      const payload = {
        check_in_from: editPolicy.check_in_from,
        check_in_until: editPolicy.check_in_until,
        check_out_from: editPolicy.check_out_from,
        check_out_until: editPolicy.check_out_until,
        breakfast_policy: editPolicy.breakfast_policy,
        parking_situation: editPolicy.parking_situation,
        allow_pets: editPolicy.allow_pets,
        allow_children: editPolicy.allow_children,
        cancellation_fee: {
          cancel_time: editPolicy.cancel_time,
          single_before_time_percentage: editPolicy.single_before_time_percentage,
          single_after_time_percentage: editPolicy.single_after_time_percentage,
          multi_5days_before_percentage: editPolicy.multi_5days_before_percentage,
          multi_3days_before_percentage: editPolicy.multi_3days_before_percentage,
          multi_2days_before_percentage: editPolicy.multi_2days_before_percentage,
          multi_1day_before_percentage: editPolicy.multi_1day_before_percentage,
          property: user?.hotel,
        },
        property: user?.hotel,
      };

      const res = await fetch(`https://dev.kacc.mn/api/property-policies/${propertyPolicy.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Бодлого хадгалах үед алдаа гарлаа');

      const data = await res.json();
      setPropertyPolicy(data);

      // Also update parking_situation in propertyDetail
      if (propertyDetail) {
        setPropertyDetail({
          ...propertyDetail,
          parking_situation: editPolicy.parking_situation,
        });
      }

      toast.success('Бодлого амжилттай хадгалагдлаа');
      setIsPolicyDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setIsPolicySaving(false);
    }
  };

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
    <div className="w-full max-w-full space-y-4">
      {/* Hotel Name Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-bold">
            {basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || 'Шангри-Ла Улаанбаатар Зочид Буудал'}
          </h1>
          {basicInfo?.property_name_en && (
            <p className="text-sm text-muted-foreground">{basicInfo.property_name_en}</p>
          )}
        </div>
        <Badge
          variant="default"
          className="bg-green-600 hover:bg-green-600 cursor-default px-4 py-2 text-sm font-medium"
        >
          Баталгаажсан ✓
        </Badge>
      </div>

      {/* Row 1: Image Gallery - 1 large + 4 smaller */}
      <div className="relative border rounded-lg overflow-hidden">
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
          <span className="text-base font-semibold bg-white/90 backdrop-blur px-2 py-1 rounded">
            Зурагнууд
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white/90 backdrop-blur"
            onClick={() => setIsImagesDialogOpen(true)}
          >
            <IconPencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-3 h-[400px]">
          {/* Left: Large Image */}
          <div
            className="relative rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
              if (propertyImages[0]) {
                setLightboxImage(propertyImages[0].image);
                setLightboxOpen(true);
              }
            }}
          >
            {propertyImages[0] ? (
              <Image
                src={propertyImages[0].image}
                alt={propertyImages[0].description || 'Hotel image'}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <IconPhoto className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Right: 4 smaller images in 2x2 grid */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="relative rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  if (propertyImages[index]) {
                    setLightboxImage(propertyImages[index].image);
                    setLightboxOpen(true);
                  }
                }}
              >
                {propertyImages[index] ? (
                  <Image
                    src={propertyImages[index].image}
                    alt={propertyImages[index].description || `Hotel image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <IconPhoto className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Бидний тухай - 2.5:1 ratio (About text : Video) */}
      <div className="grid grid-cols-[2.5fr_1fr] gap-4">
        <div className="relative border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Бидний тухай</h3>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleEditAboutVideo}
            >
              <IconPencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {additionalInfo?.About || 'Та өөрийн зочид буудлын талаар мэдээлэл оруулна уу.'}
          </p>
        </div>

        <div className="relative border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Видео</h3>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleEditAboutVideo}
            >
              <IconPencil className="h-4 w-4" />
            </Button>
          </div>
          {additionalInfo?.YoutubeUrl ? (
            <div className="space-y-2">
              <div className="aspect-video rounded-md overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src={(() => {
                    const match = additionalInfo.YoutubeUrl.match(
                      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
                    );
                    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
                  })()}
                  allowFullScreen
                />
              </div>
              <p className="text-xs text-muted-foreground">Hotel Introduction</p>
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-md">
              <p className="text-sm text-muted-foreground">Та зочид буудлынхаа тухай танилцуулга видео холбоосыг оруулна уу.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog for About & Video */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Бидний тухай болон Видео засах</DialogTitle>
            <DialogDescription>
              Зочид буудлын танилцуулга болон видео холбоосыг шинэчилнэ үү
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="about">Бидний тухай</Label>
              <Textarea
                id="about"
                value={editAbout}
                onChange={(e) => setEditAbout(e.target.value)}
                placeholder="Буудлын дэлгэрэнгүй мэдээллийг оруулна уу"
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube Video URL</Label>
              <Input
                id="youtube"
                type="url"
                value={editYoutubeUrl}
                onChange={(e) => setEditYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground">
                Youtube бичлэгийн Share-ээс холбоосыг хуулна уу
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Болих
            </Button>
            <Button onClick={handleSaveAboutVideo} disabled={isSaving}>
              {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog for Google Map */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Google Map засах</DialogTitle>
            <DialogDescription>
              Google Maps-ээс холбоос хуулж оруулна уу
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleMap">Google Maps Embed URL</Label>
              <Input
                id="googleMap"
                type="url"
                value={editGoogleMap}
                onChange={(e) => setEditGoogleMap(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-muted-foreground">
                Google Maps дээр Share → Embed a map → Copy HTML код дотрх src холбоосыг хуулна уу
              </p>
            </div>
            {editGoogleMap && (
              <div className="aspect-video rounded-md overflow-hidden border">
                <iframe
                  src={editGoogleMap}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMapDialogOpen(false)}
              disabled={isMapSaving}
            >
              Болих
            </Button>
            <Button onClick={handleSaveGoogleMap} disabled={isMapSaving}>
              {isMapSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog for Basic Info */}
      <Dialog open={isBasicInfoDialogOpen} onOpenChange={setIsBasicInfoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Үндсэн мэдээлэл засах</DialogTitle>
            <DialogDescription>
              Зочид буудлын үндсэн мэдээллийг шинэчилнэ үү
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameMn">Буудлын нэр (монголоор)</Label>
                <Input
                  id="nameMn"
                  value={editBasicInfo.property_name_mn}
                  onChange={(e) => setEditBasicInfo({ ...editBasicInfo, property_name_mn: e.target.value })}
                  placeholder="Шангри-Ла Улаанбаатар Зочид Буудал"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">Буудлын нэр (англиар)</Label>
                <Input
                  id="nameEn"
                  value={editBasicInfo.property_name_en}
                  onChange={(e) => setEditBasicInfo({ ...editBasicInfo, property_name_en: e.target.value })}
                  placeholder="Shangri-La Ulaanbaatar Hotel"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Үйл ажиллагаа эхэлсэн огноо</Label>
                <DatePickerWithValue
                  value={editBasicInfo.start_date}
                  onChange={(value) => setEditBasicInfo({ ...editBasicInfo, start_date: value })}
                  placeholder="Огноо сонгох"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Буудлын зэрэглэл</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={editBasicInfo.star_rating}
                  onChange={(e) => setEditBasicInfo({ ...editBasicInfo, star_rating: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Танай буудал сүлжээ буудал эсэх</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditBasicInfo({ ...editBasicInfo, part_of_group: true })}
                  className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                    editBasicInfo.part_of_group === true
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Тийм
                </button>
                <button
                  type="button"
                  onClick={() => setEditBasicInfo({ ...editBasicInfo, part_of_group: false, group_name: '' })}
                  className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                    editBasicInfo.part_of_group === false
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Үгүй
                </button>
              </div>
              {editBasicInfo.part_of_group && (
                <div className="space-y-2 mt-3">
                  <Label htmlFor="groupName">Сүлжээ буудлын нэр</Label>
                  <Input
                    id="groupName"
                    value={editBasicInfo.group_name}
                    onChange={(e) => setEditBasicInfo({ ...editBasicInfo, group_name: e.target.value })}
                    placeholder="Marriott, Hilton гэх мэт"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalRooms">Нийт өрөөний тоо</Label>
                <Input
                  id="totalRooms"
                  type="number"
                  value={editBasicInfo.total_hotel_rooms}
                  onChange={(e) => setEditBasicInfo({ ...editBasicInfo, total_hotel_rooms: e.target.value })}
                  placeholder="200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableRooms">Манай сайтаар зарах өрөө</Label>
                <Input
                  id="availableRooms"
                  type="number"
                  value={editBasicInfo.available_rooms}
                  onChange={(e) => setEditBasicInfo({ ...editBasicInfo, available_rooms: e.target.value })}
                  placeholder="50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Зарах өрөөний хязгаар тавих эсэх</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditBasicInfo({ ...editBasicInfo, sales_room_limitation: true })}
                  className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                    editBasicInfo.sales_room_limitation === true
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Тийм
                </button>
                <button
                  type="button"
                  onClick={() => setEditBasicInfo({ ...editBasicInfo, sales_room_limitation: false })}
                  className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                    editBasicInfo.sales_room_limitation === false
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Үгүй
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Зочдод үйлчлэх болонжтой хэл</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`lang-${lang.id}`}
                      checked={editBasicInfo.languages.includes(lang.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditBasicInfo({ ...editBasicInfo, languages: [...editBasicInfo.languages, lang.id] });
                        } else {
                          setEditBasicInfo({ ...editBasicInfo, languages: editBasicInfo.languages.filter(id => id !== lang.id) });
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`lang-${lang.id}`} className="cursor-pointer text-sm">{lang.languages_name_mn}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBasicInfoDialogOpen(false)}
              disabled={isBasicInfoSaving}
            >
              Болих
            </Button>
            <Button onClick={handleSaveBasicInfo} disabled={isBasicInfoSaving}>
              {isBasicInfoSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog for Location */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Байршил засах</DialogTitle>
            <DialogDescription>
              Буудлын байршлын мэдээллийг шинэчилнэ үү
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="province">Хот/Аймаг</Label>
              <Select
                value={editLocation.province_city}
                onValueChange={(value) => {
                  setEditLocation({ ...editLocation, province_city: value, soum: '' });
                  // Filter soums based on selected province
                  const filtered = soums.filter((s) => s.code === Number(value)).concat(
                    districts.filter((d) => d.code === Number(value))
                  );
                  setFilteredSoums(filtered);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Хот/Аймаг сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((prov) => (
                    <SelectItem key={prov.id} value={String(prov.id)}>
                      {prov.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="soum">Дүүрэг/Сум</Label>
              <Select
                value={editLocation.soum}
                onValueChange={(value) => setEditLocation({ ...editLocation, soum: value })}
                disabled={!editLocation.province_city || filteredSoums.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Дүүрэг/Сум сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSoums.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="floors">Давхрын тоо</Label>
              <Input
                id="floors"
                type="number"
                value={editLocation.total_floor_number}
                onChange={(e) => setEditLocation({ ...editLocation, total_floor_number: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLocationDialogOpen(false)}
              disabled={isLocationSaving}
            >
              Болих
            </Button>
            <Button onClick={handleSaveLocation} disabled={isLocationSaving}>
              {isLocationSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog for Policy */}
      <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Дотоод журам, бодлого засах</DialogTitle>
            <DialogDescription>
              Буудлын бодлого, журмыг шинэчилнэ үү
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Check-in/Check-out Times */}
            <div className="space-y-4">
              <h3 className="font-semibold">Цаг тохируулах</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInFrom">Бүртгэх цаг (эхлэх)</Label>
                  <Input
                    id="checkInFrom"
                    type="time"
                    value={editPolicy.check_in_from}
                    onChange={(e) => setEditPolicy({ ...editPolicy, check_in_from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkInUntil">Бүртгэх цаг (дуусах)</Label>
                  <Input
                    id="checkInUntil"
                    type="time"
                    value={editPolicy.check_in_until}
                    onChange={(e) => setEditPolicy({ ...editPolicy, check_in_until: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkOutFrom">Гарах цаг (эхлэх)</Label>
                  <Input
                    id="checkOutFrom"
                    type="time"
                    value={editPolicy.check_out_from}
                    onChange={(e) => setEditPolicy({ ...editPolicy, check_out_from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutUntil">Гарах цаг (дуусах)</Label>
                  <Input
                    id="checkOutUntil"
                    type="time"
                    value={editPolicy.check_out_until}
                    onChange={(e) => setEditPolicy({ ...editPolicy, check_out_until: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-4">
              <h3 className="font-semibold">Цуцлалтын бодлого</h3>
              <div className="space-y-2">
                <Label htmlFor="cancelTime">Цуцлах боломжтой цаг</Label>
                <Input
                  id="cancelTime"
                  type="time"
                  value={editPolicy.cancel_time}
                  onChange={(e) => setEditPolicy({ ...editPolicy, cancel_time: e.target.value })}
                  className="w-48"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">1 өрөөний захиалгад нийт төлбөрөөс суутгах хураамжийн хувь:</p>
                <div className="space-y-2">
                  <Label htmlFor="singleBefore">
                    Өмнөх өдрийн <span className="text-blue-500">{editPolicy.cancel_time || '...'}</span> цагаас өмнө цуцалвал (%)
                  </Label>
                  <Input
                    id="singleBefore"
                    type="number"
                    value={editPolicy.single_before_time_percentage}
                    onChange={(e) => setEditPolicy({ ...editPolicy, single_before_time_percentage: e.target.value })}
                    placeholder="0"
                    className="w-32"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="singleAfter">
                    Өмнөх өдрийн <span className="text-blue-500">{editPolicy.cancel_time || '...'}</span> цагаас хойш цуцалвал (%)
                  </Label>
                  <Input
                    id="singleAfter"
                    type="number"
                    value={editPolicy.single_after_time_percentage}
                    onChange={(e) => setEditPolicy({ ...editPolicy, single_after_time_percentage: e.target.value })}
                    placeholder="0"
                    className="w-32"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">2 болон түүнээс дээш өрөөнд нийт төлбөрөөс суутгах хураамжийн хувь:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="multi5days">Ирэх өдрөөсөө 5 хоногийн өмнөх хувь (%)</Label>
                    <Input
                      id="multi5days"
                      type="number"
                      value={editPolicy.multi_5days_before_percentage}
                      onChange={(e) => setEditPolicy({ ...editPolicy, multi_5days_before_percentage: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="multi3days">Ирэх өдрөөсөө 3 хоногийн өмнөх хувь (%)</Label>
                    <Input
                      id="multi3days"
                      type="number"
                      value={editPolicy.multi_3days_before_percentage}
                      onChange={(e) => setEditPolicy({ ...editPolicy, multi_3days_before_percentage: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="multi2days">Ирэх өдрөөсөө 2 хоногийн өмнөх хувь (%)</Label>
                    <Input
                      id="multi2days"
                      type="number"
                      value={editPolicy.multi_2days_before_percentage}
                      onChange={(e) => setEditPolicy({ ...editPolicy, multi_2days_before_percentage: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="multi1day">Ирэх өдрөөсөө 1 хоногийн өмнөх хувь (%)</Label>
                    <Input
                      id="multi1day"
                      type="number"
                      value={editPolicy.multi_1day_before_percentage}
                      onChange={(e) => setEditPolicy({ ...editPolicy, multi_1day_before_percentage: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Other Policies */}
            <div className="space-y-4">
              <h3 className="font-semibold">Бусад</h3>
              <div className="space-y-2">
                <Label>Өглөөний цайны бодлого</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditPolicy({ ...editPolicy, breakfast_policy: 'no' })}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
                      editPolicy.breakfast_policy === 'no'
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    Үгүй
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPolicy({ ...editPolicy, breakfast_policy: 'free' })}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
                      editPolicy.breakfast_policy === 'free'
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    Үнэгүй
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPolicy({ ...editPolicy, breakfast_policy: 'paid' })}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
                      editPolicy.breakfast_policy === 'paid'
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    Төлбөртэй
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Зогсоолын мэдээлэл</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditPolicy({ ...editPolicy, parking_situation: 'no' })}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
                      editPolicy.parking_situation === 'no'
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    Үгүй
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPolicy({ ...editPolicy, parking_situation: 'free' })}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
                      editPolicy.parking_situation === 'free'
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    Үнэгүй
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPolicy({ ...editPolicy, parking_situation: 'paid' })}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
                      editPolicy.parking_situation === 'paid'
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    Төлбөртэй
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Хүүхэд үйлчлүүлэх боломжтой эсэх</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditPolicy({ ...editPolicy, allow_children: true })}
                      className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                        editPolicy.allow_children === true
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      Тийм
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPolicy({ ...editPolicy, allow_children: false })}
                      className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                        editPolicy.allow_children === false
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      Үгүй
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Гэрийн тэжээвэр амьтан зөвшөөрөх эсэх</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditPolicy({ ...editPolicy, allow_pets: true })}
                      className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                        editPolicy.allow_pets === true
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      Тийм
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPolicy({ ...editPolicy, allow_pets: false })}
                      className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                        editPolicy.allow_pets === false
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      Үгүй
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPolicyDialogOpen(false)}
              disabled={isPolicySaving}
            >
              Болих
            </Button>
            <Button onClick={handleSavePolicy} disabled={isPolicySaving}>
              {isPolicySaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog for Images */}
      <Dialog open={isImagesDialogOpen} onOpenChange={setIsImagesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Зургууд засах</DialogTitle>
            <DialogDescription>
              Буудлын зургийг оруулах, устгах боломжтой
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Upload new image */}
            <div className="border-2 border-dashed rounded-lg p-6">
              <Label htmlFor="imageUpload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <IconPhoto className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Зураг оруулах</p>
                  <p className="text-xs text-muted-foreground">Хамгийн багадаа 100KB</p>
                </div>
              </Label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const fileSizeKB = file.size / 1024;
                  if (fileSizeKB < 100) {
                    toast.error('Зургийн хэмжээ хамгийн багадаа 100KB байх ёстой');
                    e.target.value = '';
                    return;
                  }

                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    try {
                      const base64Image = reader.result as string;
                      const res = await fetch('https://dev.kacc.mn/api/property-images/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          property: user?.hotel,
                          image: base64Image,
                          description: '',
                        }),
                      });

                      if (!res.ok) throw new Error('Зураг оруулахад алдаа гарлаа');

                      toast.success('Зураг амжилттай нэмэгдлээ');
                      // Reload images
                      const imagesRes = await fetch(`https://dev.kacc.mn/api/property-images/?property=${user?.hotel}`);
                      if (imagesRes.ok) {
                        const images = await imagesRes.json();
                        setPropertyImages(images);
                      }
                      e.target.value = '';
                    } catch (err: any) {
                      toast.error(err.message || 'Алдаа гарлаа');
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            {/* Existing images */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {propertyImages.map((img, idx) => (
                <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border group">
                  <Image
                    src={img.image}
                    alt={img.description || `Image ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={async () => {
                      if (!confirm('Энэ зургийг устгах уу?')) return;

                      try {
                        const res = await fetch(`https://dev.kacc.mn/api/property-images/${img.id}/`, {
                          method: 'DELETE',
                        });

                        if (!res.ok) throw new Error('Зураг устгахад алдаа гарлаа');

                        toast.success('Зураг амжилттай устгагдлаа');
                        setPropertyImages(propertyImages.filter(i => i.id !== img.id));
                      } catch (err: any) {
                        toast.error(err.message || 'Алдаа гарлаа');
                      }
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImagesDialogOpen(false)}
            >
              Хаах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Row 3: Tabbed Information */}
      <div className="border rounded-lg p-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">1. Үндсэн мэдээлэл</TabsTrigger>
            <TabsTrigger value="location">2. Байршил</TabsTrigger>
            <TabsTrigger value="map">3. Google map</TabsTrigger>
            <TabsTrigger value="policy">4. Дотоод журам, бодлого</TabsTrigger>
            <TabsTrigger value="services">5. Ерөнхий үйлчилгээ</TabsTrigger>
          </TabsList>

              {/* Үндсэн мэдээлэл Tab */}
              <TabsContent value="basic" className="mt-4">
                <div className="relative border rounded-lg p-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8"
                    onClick={handleEditBasicInfo}
                  >
                    <IconPencil className="h-4 w-4" />
                  </Button>
                  <div>
                    <div className="space-y-4">
                      {/* Grid layout for better spacing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">Буудлын нэр (монголоор):</p>
                          <p className="font-medium">{basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || '—'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">Буудлын нэр (англиар):</p>
                          <p className="font-medium">{basicInfo?.property_name_en || '—'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">Үйл ажиллагаа эхэлсэн огноо:</p>
                          <p className="font-medium">{basicInfo?.start_date || '—'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">Буудлын зэрэглэл:</p>
                          <p className="font-medium">
                            {basicInfo?.star_rating ? (
                              <span className="flex items-center gap-1">
                                {Array.from({ length: basicInfo.star_rating }).map((_, i) => (
                                  <span key={i}>⭐</span>
                                ))}
                              </span>
                            ) : '—'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">Танай буудал сүлжээ буудал эсэх:</p>
                          <p className="font-medium">{propertyBaseInfo?.groupName ? `Тийм /${propertyBaseInfo.groupName}/` : '—'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">Зочдод үйлчлэх болонжтой хэл:</p>
                          <p className="font-medium">{propertyDetail?.parking_situation || 'Монгол, Англи, Япон'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">Нийт өрөөний тоо:</p>
                          <p className="font-medium">{basicInfo?.total_hotel_rooms || '—'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">Манай сайтаар зарах өрөөний тоо:</p>
                          <p className="font-medium">{basicInfo?.available_rooms || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Байршил Tab */}
              <TabsContent value="location" className="mt-4">
                <div className="relative border rounded-lg p-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8"
                    onClick={handleEditLocation}
                  >
                    <IconPencil className="h-4 w-4" />
                  </Button>
                  <div className="space-y-4">
                    {address && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Хот/Аймаг</p>
                          <p className="font-medium">{getProvinceName(address.province_city)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Дүүрэг/Сум</p>
                          <p className="font-medium">{getSoumName(address.soum || address.district)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Давхрын тоо</p>
                          <p className="font-medium">{address.total_floor_number || '—'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Google Map Tab */}
              <TabsContent value="map" className="mt-4">
                <div className="relative border rounded-lg p-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8"
                    onClick={handleEditGoogleMap}
                  >
                    <IconPencil className="h-4 w-4" />
                  </Button>
                  <div>
                    {propertyDetail?.google_map ? (
                      <div className="aspect-video rounded-md overflow-hidden">
                        <iframe
                          src={propertyDetail.google_map}
                          className="w-full h-full border-0"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
                        <p className="text-muted-foreground">Google Map байхгүй</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Дотоод журам бодлого Tab */}
              <TabsContent value="policy" className="mt-4">
                <div className="relative border rounded-lg p-6">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8"
                    onClick={handleEditPolicy}
                  >
                    <IconPencil className="h-4 w-4" />
                  </Button>
                  <div className="space-y-6">
                    {propertyPolicy && (
                      <>
                        {/* Check-in/Check-out & Basic Policies */}
                        <div>
                          <h4 className="font-semibold text-base mb-4">Ерөнхий мэдээлэл</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-muted-foreground">Бүртгэх цаг:</p>
                              <p className="font-medium">
                                {formatTime(propertyPolicy.check_in_from)} - {formatTime(propertyPolicy.check_in_until)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-muted-foreground">Гарах цаг:</p>
                              <p className="font-medium">
                                {formatTime(propertyPolicy.check_out_from)} - {formatTime(propertyPolicy.check_out_until)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-muted-foreground">Өглөөний цай:</p>
                              <p className="font-medium">{propertyPolicy.breakfast_policy || '—'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-muted-foreground">Гэрийн тэжээвэр амьтан:</p>
                              <p className="font-medium">{propertyPolicy.allow_pets ? 'Зөвшөөрнө' : 'Зөвшөөрөхгүй'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-muted-foreground">Хүүхэд:</p>
                              <p className="font-medium">{propertyPolicy.allow_children ? 'Зөвшөөрнө' : 'Зөвшөөрөхгүй'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="pt-6 border-t">
                          <h4 className="font-semibold text-base mb-4">Цуцлалтын бодлого</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border rounded-lg p-4 bg-muted/20">
                              <p className="font-semibold mb-3 text-sm">1 өрөө захиалга:</p>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Цагаас өмнө:</span>
                                  <span className="font-medium">{propertyPolicy.cancellation_fee.single_before_time_percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Цагаас хойш:</span>
                                  <span className="font-medium">{propertyPolicy.cancellation_fee.single_after_time_percentage}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="border rounded-lg p-4 bg-muted/20">
                              <p className="font-semibold mb-3 text-sm">2+ өрөө захиалга:</p>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">5+ хоног өмнө:</span>
                                  <span className="font-medium">{propertyPolicy.cancellation_fee.multi_5days_before_percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">3-4 хоног өмнө:</span>
                                  <span className="font-medium">{propertyPolicy.cancellation_fee.multi_3days_before_percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">2 хоног өмнө:</span>
                                  <span className="font-medium">{propertyPolicy.cancellation_fee.multi_2days_before_percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">1 хоног өмнө:</span>
                                  <span className="font-medium">{propertyPolicy.cancellation_fee.multi_1day_before_percentage}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Ерөнхий үйлчилгээ Tab */}
              <TabsContent value="services" className="mt-4">
                <ServicesTab
                  facilityIds={propertyDetail?.general_facilities || []}
                  hotelId={typeof user?.hotel === 'number' ? user.hotel : (propertyDetail?.property || 0)}
                  propertyDetailId={propertyDetail?.id || null}
                  onUpdate={() => {
                    // Reload property detail data
                    if (user?.hotel) {
                      fetch(`https://dev.kacc.mn/api/property-details/?property=${user.hotel}`)
                        .then(res => res.json())
                        .then(([detail]) => {
                          if (detail) setPropertyDetail(detail);
                        });
                    }
                  }}
                />
              </TabsContent>
          </Tabs>
        </div>

        {/* Image Lightbox Modal */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-2">
            <DialogTitle className="sr-only">Hotel Image Gallery</DialogTitle>
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
              {/* Main Image */}
              <div className="relative w-full flex-1 flex items-center justify-center">
                {lightboxImage && (
                  <>
                    <Image
                      src={lightboxImage}
                      alt="Hotel image full view"
                      fill
                      className="object-contain"
                      priority
                    />
                    
                    {/* Navigation Buttons */}
                    {propertyImages.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => {
                            const currentIndex = propertyImages.findIndex(img => img.image === lightboxImage);
                            const prevIndex = currentIndex > 0 ? currentIndex - 1 : propertyImages.length - 1;
                            setLightboxImage(propertyImages[prevIndex].image);
                          }}
                        >
                          <IconChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => {
                            const currentIndex = propertyImages.findIndex(img => img.image === lightboxImage);
                            const nextIndex = currentIndex < propertyImages.length - 1 ? currentIndex + 1 : 0;
                            setLightboxImage(propertyImages[nextIndex].image);
                          }}
                        >
                          <IconChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Image Indicators (Dots) */}
              {propertyImages.length > 1 && (
                <div className="flex gap-2 pb-4">
                  {propertyImages.map((img, index) => (
                    <button
                      key={img.id}
                      className={`h-2 rounded-full transition-all ${
                        img.image === lightboxImage 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                      onClick={() => setLightboxImage(img.image)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
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
