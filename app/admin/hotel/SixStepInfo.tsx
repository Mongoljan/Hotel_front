'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  IconPhoto,
  IconPencil,
  IconFileInfo,
  IconCalendar,
  IconBed,
  IconMoodKid,
  IconCar,
  IconInfoCircle,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

import ServicesTab from './ServicesTab';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Import types
import type {
  PropertyPhoto,
  PropertyDetail,
  AdditionalInformation,
  PropertyPolicy,
  Address,
  BasicInfo,
  PropertyBaseInfo,
  Province,
  Soum,
  District,
  PropertyType,
} from './types';

// Import extracted components
import {
  LoadingSkeleton,
  HotelHeader,
  AboutVideoSection,
  EditAboutVideoDialog,
  EditMapDialog,
  ImageLightbox,
  EditBasicInfoDialog,
  EditLocationDialog,
  EditImagesDialog,
} from './components';

interface ProceedProps {
  proceed: number;
  setProceed: (value: number) => void;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

// Helper function to extract coordinates from Google Maps URL
const extractCoordinates = (url: string | null | undefined): { lat: number; lng: number } | null => {
  if (!url) return null;
  const match = url.match(/q=([-\d.]+),([-\d.]+)/);
  if (match) {
    const [, lat, lng] = match;
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return null;
};

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
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInformation | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [soums, setSoums] = useState<Soum[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

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
        
        // Sort provinces to show Улаанбаатар first
        const sortedProvinces = [...(combinedData.province || [])].sort((a, b) => {
          if (a.name === 'Улаанбаатар') return -1;
          if (b.name === 'Улаанбаатар') return 1;
          return 0;
        });
        
        setProvinces(sortedProvinces);
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
        value: propertyPolicy?.child_policy?.allow_children ?? null,
        icon: IconMoodKid,
        type: 'boolean' as const,
      },
      {
        label: 'Зогсоолын нөхцөл',
        value: (() => {
          const outdoor = propertyPolicy?.parking_policy?.outdoor_parking;
          const indoor = propertyPolicy?.parking_policy?.indoor_parking;
          if (!outdoor && !indoor) return '—';
          const parts = [];
          if (outdoor === 'free') parts.push('Гадна (үнэгүй)');
          else if (outdoor === 'paid') parts.push('Гадна (төлбөртэй)');
          if (indoor === 'free') parts.push('Дотор (үнэгүй)');
          else if (indoor === 'paid') parts.push('Дотор (төлбөртэй)');
          return parts.length > 0 ? parts.join(', ') : 'Байхгүй';
        })(),
        icon: IconCar,
      },
    ],
    [basicInfo, getPropertyTypeName, propertyPolicy?.parking_policy, propertyPolicy?.child_policy?.allow_children, propertyBaseInfo?.property_type]
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
      <HotelHeader basicInfo={basicInfo} propertyBaseInfo={propertyBaseInfo} />

      {/* Main Layout: Left content + Right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4">
        {/* Left Column: Image Gallery */}
        <div>
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

          {/* Tabbed Information - inside left column */}
          <div className="border rounded-lg p-4 mt-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">1. Үндсэн мэдээлэл</TabsTrigger>
                <TabsTrigger value="location">2. Байршил</TabsTrigger>
                <TabsTrigger value="map">3. Google map</TabsTrigger>
                <TabsTrigger value="policy">4. Дотоод журам</TabsTrigger>
                <TabsTrigger value="services">5. Ерөнхий үйлчилгээ</TabsTrigger>
              </TabsList>

              {/* TabsContent will continue from here */}
      {/* Edit Dialog for About & Video */}
      <EditAboutVideoDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        about={editAbout}
        youtubeUrl={editYoutubeUrl}
        onAboutChange={setEditAbout}
        onYoutubeUrlChange={setEditYoutubeUrl}
        onSave={handleSaveAboutVideo}
        isSaving={isSaving}
      />

      {/* Edit Dialog for Google Map */}
      <EditMapDialog
        open={isMapDialogOpen}
        onOpenChange={setIsMapDialogOpen}
        googleMap={editGoogleMap}
        onGoogleMapChange={setEditGoogleMap}
        onSave={handleSaveGoogleMap}
        isSaving={isMapSaving}
      />

      {/* Edit Dialog for Basic Info */}
      <EditBasicInfoDialog
        open={isBasicInfoDialogOpen}
        onOpenChange={setIsBasicInfoDialogOpen}
        editBasicInfo={editBasicInfo}
        onEditBasicInfoChange={setEditBasicInfo}
        languages={languages}
        onSave={handleSaveBasicInfo}
        isSaving={isBasicInfoSaving}
      />

      {/* Edit Dialog for Location */}
      <EditLocationDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        editLocation={editLocation}
        onEditLocationChange={setEditLocation}
        provinces={provinces}
        filteredSoums={filteredSoums}
        onProvinceChange={(value) => {
          setEditLocation({ ...editLocation, province_city: value, soum: '' });
          const filtered = soums.filter((s) => s.code === Number(value)).concat(
            districts.filter((d) => d.code === Number(value))
          );
          setFilteredSoums(filtered);
        }}
        onSave={handleSaveLocation}
        isSaving={isLocationSaving}
      />

      {/* Edit Dialog for Images */}
      <EditImagesDialog
        open={isImagesDialogOpen}
        onOpenChange={setIsImagesDialogOpen}
        propertyImages={propertyImages}
        onImagesChange={setPropertyImages}
        hotelId={user?.hotel}
      />

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
                          <p className="font-medium">
                            {basicInfo?.part_of_group
                              ? `Тийм${basicInfo.group_name ? ` /${basicInfo.group_name}/` : ''}`
                              : 'Үгүй'}
                          </p>
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
                    {propertyBaseInfo?.location && (
                      <div>
                        <p className="text-sm text-muted-foreground">Байршил</p>
                        <p className="font-medium">{propertyBaseInfo.location}</p>
                      </div>
                    )}
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
                    {(() => {
                      const coordinates = extractCoordinates(propertyDetail?.google_map);
                      console.log('Google Map URL:', propertyDetail?.google_map);
                      console.log('Extracted Coordinates:', coordinates);

                      if (coordinates) {
                        return (
                          <div>
                            {isMapLoaded ? (
                              <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={coordinates}
                                zoom={15}
                                options={{
                                  streetViewControl: false,
                                  mapTypeControl: true,
                                  fullscreenControl: true,
                                }}
                              >
                                <Marker position={coordinates} />
                              </GoogleMap>
                            ) : (
                              <div className="w-full h-[400px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <p className="text-sm text-gray-500">Loading Google Maps...</p>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div className="w-full h-[400px] bg-muted flex items-center justify-center rounded-md">
                            <p className="text-muted-foreground">Google Map байхгүй</p>
                            {propertyDetail?.google_map && (
                              <p className="text-xs text-muted-foreground mt-2">URL: {propertyDetail.google_map}</p>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </TabsContent>

              {/* Дотоод журам Tab */}
              <TabsContent value="policy" className="mt-4">
                <div className="border rounded-lg p-4 space-y-6">
                  {propertyPolicy ? (
                    <>
                      {/* Check-in / Check-out Times */}
                      <div>
                        <h4 className="font-semibold mb-3">Бүртгэх болон гарах цаг</h4>
                        <div className="grid grid-cols-2 gap-4 pl-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Бүртгэх цаг:</p>
                            <p className="font-medium">
                              {formatTime(propertyPolicy.check_in_from)} - {formatTime(propertyPolicy.check_in_until)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Гарах цаг:</p>
                            <p className="font-medium">
                              {formatTime(propertyPolicy.check_out_from)} - {formatTime(propertyPolicy.check_out_until)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Policy */}
                      {propertyPolicy.cancellation_fee && (
                        <div>
                          <h4 className="font-semibold mb-3">Цуцлалтын бодлого</h4>
                          <div className="pl-4 space-y-2 text-sm">
                            <p className="text-muted-foreground mb-2">
                              Цуцлах боломжтой цаг: <span className="font-medium text-foreground">{formatTime(propertyPolicy.cancellation_fee.cancel_time)}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-muted-foreground">1 өрөөний цуцлалт (өмнө):</p>
                                <p className="font-medium">{propertyPolicy.cancellation_fee.single_before_time_percentage}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">1 өрөөний цуцлалт (хойш):</p>
                                <p className="font-medium">{propertyPolicy.cancellation_fee.single_after_time_percentage}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">5 хоногийн өмнө:</p>
                                <p className="font-medium">{propertyPolicy.cancellation_fee.multi_5days_before_percentage}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">3 хоногийн өмнө:</p>
                                <p className="font-medium">{propertyPolicy.cancellation_fee.multi_3days_before_percentage}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">2 хоногийн өмнө:</p>
                                <p className="font-medium">{propertyPolicy.cancellation_fee.multi_2days_before_percentage}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">1 хоногийн өмнө:</p>
                                <p className="font-medium">{propertyPolicy.cancellation_fee.multi_1day_before_percentage}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Breakfast Policy */}
                      <div>
                        <h4 className="font-semibold mb-3">Өглөөний цай</h4>
                        <div className="pl-4 space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-muted-foreground">Төлөв:</p>
                              <p className="font-medium">
                                {propertyPolicy.breakfast_policy?.status === 'no' ? 'Байхгүй' : 
                                 propertyPolicy.breakfast_policy?.status === 'free' ? 'Үнэгүй' : 
                                 propertyPolicy.breakfast_policy?.status === 'paid' ? 'Төлбөртэй' : '—'}
                              </p>
                            </div>
                            {propertyPolicy.breakfast_policy?.status !== 'no' && propertyPolicy.breakfast_policy && (
                              <>
                                <div>
                                  <p className="text-muted-foreground">Цаг:</p>
                                  <p className="font-medium">
                                    {formatTime(propertyPolicy.breakfast_policy.start_time)} - {formatTime(propertyPolicy.breakfast_policy.end_time)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Төрөл:</p>
                                  <p className="font-medium">
                                    {propertyPolicy.breakfast_policy.breakfast_type === 'buffet' ? 'Buffet' :
                                     propertyPolicy.breakfast_policy.breakfast_type === 'room' ? 'Өрөөнд' :
                                     propertyPolicy.breakfast_policy.breakfast_type === 'plate' ? 'Тавгаар' : '—'}
                                  </p>
                                </div>
                                {propertyPolicy.breakfast_policy.status === 'paid' && propertyPolicy.breakfast_policy.price && (
                                  <div>
                                    <p className="text-muted-foreground">Үнэ:</p>
                                    <p className="font-medium">{propertyPolicy.breakfast_policy.price}₮</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Parking Policy */}
                      <div>
                        <h4 className="font-semibold mb-3">Зогсоол</h4>
                        <div className="pl-4 space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-muted-foreground">Гадна зогсоол:</p>
                              <p className="font-medium">
                                {propertyPolicy.parking_policy?.outdoor_parking === 'no' ? 'Байхгүй' :
                                 propertyPolicy.parking_policy?.outdoor_parking === 'free' ? 'Үнэгүй' :
                                 propertyPolicy.parking_policy?.outdoor_parking === 'paid' ? 
                                   `Төлбөртэй ${propertyPolicy.parking_policy.outdoor_price ? `(${propertyPolicy.parking_policy.outdoor_price}₮/${propertyPolicy.parking_policy.outdoor_fee_type === 'hour' ? 'цаг' : 'хоног'})` : ''}` : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Дотор зогсоол:</p>
                              <p className="font-medium">
                                {propertyPolicy.parking_policy?.indoor_parking === 'no' ? 'Байхгүй' :
                                 propertyPolicy.parking_policy?.indoor_parking === 'free' ? 'Үнэгүй' :
                                 propertyPolicy.parking_policy?.indoor_parking === 'paid' ? 
                                   `Төлбөртэй ${propertyPolicy.parking_policy.indoor_price ? `(${propertyPolicy.parking_policy.indoor_price}₮/${propertyPolicy.parking_policy.indoor_fee_type === 'hour' ? 'цаг' : 'хоног'})` : ''}` : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Child Policy */}
                      <div>
                        <h4 className="font-semibold mb-3">Хүүхэд болон нэмэлт ор</h4>
                        <div className="pl-4 space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-muted-foreground">Хүүхэд үйлчлүүлэх боломжтой:</p>
                              <p className="font-medium">{propertyPolicy.child_policy?.allow_children ? 'Тийм' : 'Үгүй'}</p>
                            </div>
                            {propertyPolicy.child_policy?.allow_children && (
                              <>
                                <div>
                                  <p className="text-muted-foreground">Хүүхдийн дээд нас:</p>
                                  <p className="font-medium">{propertyPolicy.child_policy.max_child_age || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Хүүхдийн ор байгаа эсэх:</p>
                                  <p className="font-medium">
                                    {propertyPolicy.child_policy.child_bed_available === 'yes' ? 'Тийм' :
                                     propertyPolicy.child_policy.child_bed_available === 'no' ? 'Үгүй' : '—'}
                                  </p>
                                </div>
                              </>
                            )}
                            <div>
                              <p className="text-muted-foreground">Нэмэлт ор:</p>
                              <p className="font-medium">
                                {propertyPolicy.child_policy?.allow_extra_bed ? 
                                  `Тийм ${propertyPolicy.child_policy.extra_bed_price ? `(${propertyPolicy.child_policy.extra_bed_price}₮)` : ''}` : 
                                  'Үгүй'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Дотоод журмын мэдээлэл байхгүй байна
                    </div>
                  )}
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
        </div>

        {/* Right Column: Бидний тухай + Видео */}
        <AboutVideoSection
          additionalInfo={additionalInfo}
          onEdit={handleEditAboutVideo}
        />
      </div>

        {/* Image Lightbox Modal */}
        <ImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          images={propertyImages}
          currentImage={lightboxImage}
          onImageChange={setLightboxImage}
        />

    </div>
  );
}

