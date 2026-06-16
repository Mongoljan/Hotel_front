'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  IconPhoto,
  IconPencil,
  IconFileInfo,
  IconMapPin,
  IconSparkles,
  IconMessageQuestion,
} from '@tabler/icons-react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleMap, useJsApiLoader, Marker, Libraries } from '@react-google-maps/api';

import ServicesTab from './ServicesTab';
import { useCombinedData } from '@/app/hooks/useCombinedData';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
} from './types';

// Import extracted components
import {
  LoadingSkeleton,
  HotelHeader,
  AboutVideoSection,
  EditAboutDialog,
  EditVideoDialog,
  EditImagesDialog,
  ImageLightbox,
  EditBasicInfoDialog,
  EditLocationDialog,
  SocialLinksSection,
} from './components';
import { ApiNeededLabel } from '@/components/ApiNeededLabel';

interface ProceedProps {
  proceed: number;
  setProceed: (value: number) => void;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];
const PROPERTY_COMMISSIONS_API = 'https://dev.kacc.mn/api/property-commissions/';

interface PropertyCommission {
  id: number;
  is_active: boolean;
  property_obj: number;
  status?: string;
}

// Helper function to extract coordinates from Google Maps URL
const extractCoordinates = (url: string | null | undefined): { lat: number; lng: number } | null => {
  if (!url) return null;

  // Format: ...?q=47.918873,106.917017
  const qMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (qMatch?.[1] && qMatch?.[2]) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }

  // Format: .../@47.918873,106.917017,15z
  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch?.[1] && atMatch?.[2]) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  // Embed format contains !3d{lat}!4d{lng}
  const embedMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (embedMatch?.[1] && embedMatch?.[2]) {
    return { lat: parseFloat(embedMatch[1]), lng: parseFloat(embedMatch[2]) };
  }

  return null;
};

export default function SixStepInfo({ proceed, setProceed }: ProceedProps) {
  const t = useTranslations('SixStepInfo');
  const { user } = useAuth();

  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyPhoto[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'services' | 'faq'>('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [cancellationFee, setCancellationFee] = useState<PropertyPolicy['cancellation_fee'] | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [propertyBaseInfo, setPropertyBaseInfo] = useState<PropertyBaseInfo | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInformation | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [soums, setSoums] = useState<Soum[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [contractIsActive, setContractIsActive] = useState<boolean | null>(null);

  const { data: combinedHook } = useCombinedData();
  const ratings = combinedHook?.ratings || [];
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const orderImagesByProfile = useCallback((images: PropertyPhoto[]) => {
    const profile = images.find((img) => img.is_profile);
    if (!profile) return images;
    const rest = images.filter((img) => img.id !== profile.id);
    return [profile, ...rest];
  }, []);

  // About & Video dialog state
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isAboutSaving, setIsAboutSaving] = useState(false);
  const [isVideoSaving, setIsVideoSaving] = useState(false);

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
    total_floor_number: '',
  });
  const [isBasicInfoSaving, setIsBasicInfoSaving] = useState(false);

  // Location/Address edit state
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editLocation, setEditLocation] = useState({
    province_city: '',
    soum: '',
    district: '',
    total_floor_number: '',
    detailed_address: '',
    google_map: '',
  });
  const [isLocationSaving, setIsLocationSaving] = useState(false);
  const [filteredSoums, setFilteredSoums] = useState<{ id: number; name: string; code: number }[]>([]);

  // Images edit state
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false);

  const openImagesSheet = () => {
    setIsImagesDialogOpen(true);
  };

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
        const [detailRes, policyRes, addressRes, basicInfoRes, combinedDataRes, baseRes, imagesRes, cancellationRes, commissionsRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/property-details/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/property-policies/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/confirm-address/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/property-basic-info/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/combined-data/`),
          fetch(`https://dev.kacc.mn/api/properties/${hotelId}/`),
          fetch(`https://dev.kacc.mn/api/property-images/?property=${hotelId}`),
          fetch(`https://dev.kacc.mn/api/cancellation-fees/?property=${hotelId}`),
          fetch(PROPERTY_COMMISSIONS_API),
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
        const cancellationJson = cancellationRes.ok ? await cancellationRes.json() : [];

        setPropertyDetail(detail);
        setPropertyPolicy(policy);
        setCancellationFee(Array.isArray(cancellationJson) && cancellationJson.length > 0 ? cancellationJson[0] : null);
        setAddress(fetchedAddress);
        setBasicInfo(basic);
        setPropertyBaseInfo(baseInfo);
        setPropertyImages(orderImagesByProfile(imageJson));

        if (commissionsRes.ok) {
          const commissions: PropertyCommission[] = await commissionsRes.json();
          const propertyId = Number(hotelId);
          const propertyCommissions = Array.isArray(commissions)
            ? commissions.filter((c) => c.property_obj === propertyId)
            : [];
          const hasActiveContract = propertyCommissions.some((c) => c.is_active);
          setContractIsActive(hasActiveContract);
        } else {
          setContractIsActive(false);
        }
        
        // Sort provinces to show Улаанбаатар first
        const sortedProvinces = [...(combinedData.province || [])].sort((a, b) => {
          if (a.name === 'Улаанбаатар') return -1;
          if (b.name === 'Улаанбаатар') return 1;
          return 0;
        });
        
        setProvinces(sortedProvinces);
        setSoums(combinedData.soum || []);
        setDistricts(combinedData.district || []);
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
        setContractIsActive(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [orderImagesByProfile, setProceed, user?.hotel]);



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

  const saveAdditionalInfo = async (about: string, youtubeUrl: string) => {
    if (!propertyDetail?.property || !propertyDetail?.id) {
      toast.error('Зочид буудлын мэдээлэл олдсонгүй');
      return false;
    }

    const res = await fetch('https://dev.kacc.mn/api/additionalInfo/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        About: about,
        YoutubeUrl: youtubeUrl,
        property: propertyDetail.property,
      }),
    });

    if (!res.ok) throw new Error('Хадгалах үед алдаа гарлаа');

    const data = await res.json();

    const patch = await fetch(`https://dev.kacc.mn/api/property-details/${propertyDetail.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Additional_Information: data.id }),
    });

    if (!patch.ok) throw new Error('Additional Info-г холбох үед алдаа гарлаа');

    setAdditionalInfo(data);
    return true;
  };

  const handleEditAbout = () => {
    setIsAboutDialogOpen(true);
  };

  const handleAddVideo = () => {
    setIsVideoDialogOpen(true);
  };

  const handleSaveAbout = async (about: string) => {
    try {
      setIsAboutSaving(true);
      const ok = await saveAdditionalInfo(about, additionalInfo?.YoutubeUrl || '');
      if (ok) {
        toast.success('Амжилттай хадгалагдлаа');
        setIsAboutDialogOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setIsAboutSaving(false);
    }
  };

  const handleSaveVideo = async (youtubeUrl: string) => {
    try {
      setIsVideoSaving(true);
      const ok = await saveAdditionalInfo(additionalInfo?.About || '', youtubeUrl);
      if (ok) {
        toast.success('Амжилттай хадгалагдлаа');
        setIsVideoDialogOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setIsVideoSaving(false);
    }
  };

  const handleEditVideo = () => {
    setIsVideoDialogOpen(true);
  };

  const handleDeleteVideo = async () => {
    try {
      setIsVideoSaving(true);
      const ok = await saveAdditionalInfo(additionalInfo?.About || '', '');
      if (ok) {
        toast.success('Видео амжилттай устгагдлаа');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setIsVideoSaving(false);
    }
  };



  const handleEditBasicInfo = () => {
    const ratingId = basicInfo?.star_rating
      ? ratings.find((r) => parseInt(r.rating) === basicInfo.star_rating)?.id?.toString() ||
        String(basicInfo.star_rating)
      : '';

    setEditBasicInfo({
      property_name_mn: basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || '',
      property_name_en: basicInfo?.property_name_en || '',
      start_date: basicInfo?.start_date || '',
      star_rating: ratingId,
      part_of_group: basicInfo?.part_of_group || false,
      group_name: basicInfo?.group_name || '',
      total_hotel_rooms: basicInfo?.total_hotel_rooms?.toString() || '',
      available_rooms: basicInfo?.available_rooms?.toString() || '',
      sales_room_limitation: basicInfo?.sales_room_limitation || false,
      total_floor_number: address?.total_floor_number?.toString() || '',
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

      if (address?.id && editBasicInfo.total_floor_number) {
        const floorRes = await fetch(`https://dev.kacc.mn/api/confirm-address/${address.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            province_city: address.province_city,
            soum: address.soum || address.district,
            district: address.district || 1,
            zipCode: address.zipCode || '00000',
            total_floor_number: parseInt(editBasicInfo.total_floor_number) || address.total_floor_number,
            property: user?.hotel,
          }),
        });
        if (floorRes.ok) {
          const addressData = await floorRes.json();
          setAddress(addressData);
        }
      }

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
      soum: (address?.soum || '').toString(),
      district: String(address?.district || ''),
      total_floor_number: (address?.total_floor_number || '').toString(),
      detailed_address: propertyBaseInfo?.location || '',
      google_map: propertyDetail?.google_map || '',
    });

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

      const addressPayload = {
        province_city: parseInt(editLocation.province_city),
        soum: parseInt(editLocation.soum),
        district: parseInt(editLocation.district) || 1,
        zipCode: address.zipCode || '00000',
        total_floor_number: parseInt(editLocation.total_floor_number) || 1,
        property: user?.hotel,
      };

      const addressRes = await fetch(`https://dev.kacc.mn/api/confirm-address/${address.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressPayload),
      });

      if (!addressRes.ok) throw new Error('Байршил хадгалах үед алдаа гарлаа');

      const addressData = await addressRes.json();
      setAddress(addressData);

      if (propertyBaseInfo?.pk) {
        const propertyRes = await fetch(`https://dev.kacc.mn/api/properties/${propertyBaseInfo.pk}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: editLocation.detailed_address }),
        });
        if (propertyRes.ok) {
          const propData = await propertyRes.json();
          setPropertyBaseInfo(propData);
        }
      }

      if (propertyDetail?.id) {
        const detailRes = await fetch(`https://dev.kacc.mn/api/property-details/${propertyDetail.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ google_map: editLocation.google_map }),
        });
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setPropertyDetail(detailData);
        }
      }

      toast.success('Байршил амжилттай хадгалагдлаа');
      setIsLocationDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setIsLocationSaving(false);
    }
  };

  const starCount = useMemo(() => {
    if (!basicInfo?.star_rating) return 0;
    const byId = ratings.find((r) => r.id === basicInfo.star_rating);
    if (byId) {
      const n = parseInt(byId.rating);
      return Number.isNaN(n) ? 0 : n;
    }
    return basicInfo.star_rating <= 5 ? basicInfo.star_rating : 0;
  }, [basicInfo?.star_rating, ratings]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!propertyDetail) {
    return (
      <Card className="border border-dashed border-border bg-card">
        <CardHeader className="items-start gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconFileInfo className="h-4 w-4 text-muted-foreground" />
            {t('8')}
          </CardTitle>
          <CardDescription>
            Тохиргооны мэдээлэл хараахан бүртгэгдээгүй байна. Мэдээллээ шинэчилсний дараа энд харагдана.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const PREVIEW_IMAGE_COUNT = 5;
  const rightGallerySlots = 4;
  const showGalleryMoreCount = propertyImages.length > PREVIEW_IMAGE_COUNT;
  const galleryExtraCount = propertyImages.length - PREVIEW_IMAGE_COUNT;
  const galleryHeightClass = 'h-[400px]';

  const stepTabTriggerClass =
    'relative flex items-center gap-2 rounded-t-lg rounded-b-none border-0 border-b-[3px] border-transparent px-3 py-2.5 text-sm text-muted-foreground shadow-none transition-colors hover:bg-muted/30 hover:text-foreground data-[state=active]:z-10 data-[state=active]:-mb-px data-[state=active]:border-primary data-[state=active]:bg-muted/50 data-[state=active]:text-primary data-[state=active]:shadow-none';

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      {/* Hotel Name Header */}
      <HotelHeader
        basicInfo={basicInfo}
        propertyBaseInfo={propertyBaseInfo}
        starCount={starCount}
        contractIsActive={contractIsActive}
      />

      {/* Main Layout: gallery + tabs (left) and sidebar widgets (right) */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_350px]">
        {/* Left Column: Image Gallery + Tabs */}
        <div className="min-w-0 w-full">
          <div className="w-full border rounded-lg bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">
                {t('gallerySectionTitle', { count: propertyImages.length })}
              </h2>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => openImagesSheet()}
              >
                <IconPencil className="h-4 w-4" />
              </Button>
            </div>
            <div className={`grid grid-cols-2 gap-3 ${galleryHeightClass}`}>
              {/* Left: Hero image */}
              <div
                className="relative rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  openImagesSheet();
                }}
              >
                {propertyImages[0] ? (
                  <>
                    <Image
                      src={propertyImages[0].image}
                      alt={propertyImages[0].description || 'Hotel image'}
                      fill
                      sizes="(max-width: 1024px) 50vw, 400px"
                      className="object-cover"
                      priority
                    />
                    {propertyImages[0].is_profile && (
                      <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#F5B800] text-white shadow">
                        <Star className="h-4 w-4 fill-white text-white" />
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <IconPhoto className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Right: adaptive thumbnail grid (4 or 6 slots) */}
              <div className="grid grid-cols-2 gap-3 grid-rows-2">
                {Array.from({ length: rightGallerySlots }).map((_, slotIndex) => {
                  const imageIndex = slotIndex + 1;
                  const image = propertyImages[imageIndex];
                  const isLastPreviewSlot = imageIndex === PREVIEW_IMAGE_COUNT - 1;
                  const shouldShowMoreOverlay = Boolean(image) && isLastPreviewSlot && showGalleryMoreCount;

                  return (
                    <div
                      key={imageIndex}
                      className="relative rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        if (image) {
                          openImagesSheet();
                        }
                      }}
                    >
                      {image ? (
                        <>
                          <Image
                            src={image.image}
                            alt={image.description || `Hotel image ${imageIndex + 1}`}
                            fill
                            sizes="(max-width: 1024px) 25vw, 200px"
                            className="object-cover"
                          />
                          {image.is_profile && (
                            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded-full shadow">
                              Профайл
                            </span>
                          )}
                          {shouldShowMoreOverlay && (
                            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                              <span className="text-white text-xl font-semibold">+{galleryExtraCount}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <IconPhoto className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabbed Information */}
          <div className="mt-4 w-full border rounded-lg bg-card p-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto items-end gap-0 rounded-none bg-transparent p-0 border-b border-border">
                <TabsTrigger value="basic" className={stepTabTriggerClass}>
                  <IconFileInfo className="h-4 w-4" />
                  <span>{t('tabBasic')}</span>
                </TabsTrigger>
                <TabsTrigger value="location" className={stepTabTriggerClass}>
                  <IconMapPin className="h-4 w-4" />
                  <span>{t('tabLocation')}</span>
                </TabsTrigger>
                <TabsTrigger value="services" className={stepTabTriggerClass}>
                  <IconSparkles className="h-4 w-4" />
                  <span>{t('tabServices')}</span>
                </TabsTrigger>
                <TabsTrigger value="faq" className={stepTabTriggerClass}>
                  <IconMessageQuestion className="h-4 w-4" />
                  <span>{t('tabFaq')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-4">
                <div className="relative ">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base">{t('basicInfoSectionTitle')}</h3>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleEditBasicInfo}>
                      <IconPencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                      <p className="text-sm text-muted-foreground mb-1">{t('hotelNameMnLabel')}</p>
                      <p className="text-base font-medium">{basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                      <p className="text-sm text-muted-foreground mb-1">{t('hotelNameEnLabel')}</p>
                      <p className="text-base font-medium">{basicInfo?.property_name_en || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                      <p className="text-sm text-muted-foreground mb-1">{t('starRatingLabel')}</p>
                      <div className="flex items-center gap-0.5">
                        {starCount > 0 ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < starCount ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                            />
                          ))
                        ) : (
                          <span className="text-base font-medium">—</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                      <p className="text-sm text-muted-foreground mb-1">{t('openingDateLabel')}</p>
                      <p className="text-base font-medium">{basicInfo?.start_date || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                      <p className="text-sm text-muted-foreground mb-1">{t('totalFloorsLabel')}</p>
                      <p className="text-base font-medium">{address?.total_floor_number || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                      <p className="text-sm text-muted-foreground mb-1">{t('totalRoomsLabel')}</p>
                      <p className="text-base font-medium">{basicInfo?.total_hotel_rooms || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-4 py-3 sm:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">{t('chainHotelLabel')}</p>
                      <p className="text-base font-medium">
                        {basicInfo?.part_of_group
                          ? `${t('yes')}${basicInfo.group_name ? ` (${basicInfo.group_name})` : ''}`
                          : t('no')}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-4">
                <div className="relative ">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-base">{t('locationSectionTitle')}</h3>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleEditLocation}>
                      <IconPencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                    <div className="flex flex-col gap-3 lg:h-[320px]">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
                        <div className="rounded-lg bg-muted/40 px-4 py-3">
                          <p className="text-sm text-muted-foreground mb-1">{t('cityProvinceLabel')}</p>
                          <p className="text-base font-medium">{getProvinceName(address?.province_city)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-4 py-3">
                          <p className="text-sm text-muted-foreground mb-1">{t('districtSumLabel')}</p>
                          <p className="text-base font-medium">{getSoumName(address?.soum)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-4 py-3">
                          <p className="text-sm text-muted-foreground mb-1">{t('bagKhorooLabel')}</p>
                          <p className="text-base font-medium">{address?.district ? `${address.district}` : '—'}</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/40 px-4 py-3 flex flex-col flex-1 min-h-0">
                        <p className="text-sm text-muted-foreground mb-2 shrink-0">{t('detailedAddressLabel')}</p>
                        <p className="text-base leading-relaxed flex-1">{propertyBaseInfo?.location || '—'}</p>
                      </div>
                    </div>
                    <div className="h-[250px] rounded-lg overflow-hidden border bg-muted/30 mb-4">
                      {(() => {
                        const coordinates = extractCoordinates(propertyDetail?.google_map);
                        if (coordinates && isMapLoaded) {
                          return (
                            <GoogleMap
                              mapContainerStyle={{ width: '100%', height: '100%' }}
                              center={coordinates}
                              zoom={14}
                              options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                            >
                              <Marker position={coordinates} />
                            </GoogleMap>
                          );
                        }
                        return (
                          <div className="h-full flex items-center justify-center text-sm text-muted-foreground px-3 text-center">
                            {t('mapLoading')}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="mt-4">
                <div className="text-center py-6">
                  <IconMessageQuestion className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ApiNeededLabel />
                  </div>
                  <p className="text-sm text-muted-foreground">{t('faqApiNeeded')}</p>
                </div>
              </TabsContent>

              <TabsContent value="services" className="mt-4">
                <ServicesTab
                  generalFacilities={propertyDetail?.general_facilities || []}
                  additionalFacilities={propertyDetail?.additional_facilities || []}
                  activities={propertyDetail?.activities || []}
                  accessibilityFeatures={
                    propertyDetail?.accessibility_features ||
                    (propertyDetail as any)?.accessibility_feature ||
                    []
                  }
                  propertyDetailId={propertyDetail?.id || null}
                  onUpdate={() => {
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

        <div className="min-w-0 w-full space-y-4">
          <SocialLinksSection />
          <AboutVideoSection
            additionalInfo={additionalInfo}
            onEditAbout={handleEditAbout}
            onAddVideo={handleAddVideo}
            onEditVideo={handleEditVideo}
            onDeleteVideo={handleDeleteVideo}
            isVideoActionLoading={isVideoSaving}
          />
        </div>
      </div>

      <EditAboutDialog
        open={isAboutDialogOpen}
        onOpenChange={setIsAboutDialogOpen}
        about={additionalInfo?.About || ''}
        onSave={handleSaveAbout}
        isSaving={isAboutSaving}
      />

      <EditVideoDialog
        open={isVideoDialogOpen}
        onOpenChange={setIsVideoDialogOpen}
        youtubeUrl={additionalInfo?.YoutubeUrl || ''}
        onSave={handleSaveVideo}
        isSaving={isVideoSaving}
      />

      <EditBasicInfoDialog
        open={isBasicInfoDialogOpen}
        onOpenChange={setIsBasicInfoDialogOpen}
        editBasicInfo={editBasicInfo}
        onEditBasicInfoChange={setEditBasicInfo}
        onSave={handleSaveBasicInfo}
        isSaving={isBasicInfoSaving}
      />

      <EditLocationDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        editLocation={editLocation}
        onEditLocationChange={setEditLocation}
        provinces={provinces}
        filteredSoums={filteredSoums}
        isMapLoaded={isMapLoaded}
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

      <EditImagesDialog
        open={isImagesDialogOpen}
        onOpenChange={setIsImagesDialogOpen}
        propertyImages={propertyImages}
        onImagesChange={(images) => setPropertyImages(orderImagesByProfile(images))}
        hotelId={user?.hotel}
      />

      <ImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          images={propertyImages}
          currentImage={lightboxImage}
          onImageChange={setLightboxImage}
          hotelId={user?.hotel}
          onImagesChange={(imgs) => setPropertyImages(orderImagesByProfile(imgs))}
        />

    </div>
  );
}

