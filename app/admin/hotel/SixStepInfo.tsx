'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
  property_photos: PropertyPhoto[];
  google_map: string;
  parking_situation: string;
  property: number;
  general_facilities: number[];
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
}

interface ProceedProps {
  proceed: number;
  setProceed: (value: number) => void;
}

export default function SixStepInfo({ proceed, setProceed }: ProceedProps) {
  const t = useTranslations("SixStepInfo");

  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyPhoto[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [propertyBaseInfo, setPropertyBaseInfo] = useState<PropertyBaseInfo | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PropertyPhoto | null>(null);

  useEffect(() => {
    async function loadData() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const hotelId = userInfo.hotel || propertyData.property || Number(Cookies.get('hotel'));

      if (!hotelId) {
        setProceed(0);
        return;
      }

      try {
        const cachedDetail = localStorage.getItem('propertyDetail');
        const cachedPolicy = localStorage.getItem('propertyPolicy');
        const cachedAddress = localStorage.getItem('propertyAddress');
        const cachedBasic = localStorage.getItem('propertyBasicInfo');
        const cachedBaseInfo = localStorage.getItem('propertyBaseInfo');

        if (cachedDetail && cachedPolicy && cachedAddress && cachedBasic && cachedBaseInfo) {
          setPropertyDetail(JSON.parse(cachedDetail));
          setPropertyImages(JSON.parse(cachedDetail).property_photos);
          setPropertyPolicy(JSON.parse(cachedPolicy));
          setAddress(JSON.parse(cachedAddress));
          setBasicInfo(JSON.parse(cachedBasic));
          setPropertyBaseInfo(JSON.parse(cachedBaseInfo));
        } else {
          const baseInfoRes = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}/`);
          const baseInfo = await baseInfoRes.json();
          setPropertyBaseInfo(baseInfo);
          localStorage.setItem('propertyBaseInfo', JSON.stringify(baseInfo));

          const detailRes = await fetch(`https://dev.kacc.mn/api/property-details/?property=${hotelId}`, {
            cache: 'no-store',
          });
          const details: PropertyDetail[] = await detailRes.json();
          const matchedDetail = details?.[0];
          if (!matchedDetail) {
            setProceed(0);
            return;
          }

          setPropertyDetail(matchedDetail);
          setPropertyImages(matchedDetail.property_photos);
          localStorage.setItem('propertyDetail', JSON.stringify(matchedDetail));

          const [policyRes, addressRes, basicInfoRes] = await Promise.all([
            fetch(`https://dev.kacc.mn/api/property-policies/${matchedDetail.propertyPolicies}/`),
            fetch(`https://dev.kacc.mn/api/confirm-address/${matchedDetail.confirmAddress}/`),
            fetch(`https://dev.kacc.mn/api/property-basic-info/${matchedDetail.propertyBasicInfo}/`),
          ]);

          const [policy, addressData, basicInfoData] = await Promise.all([
            policyRes.json(),
            addressRes.json(),
            basicInfoRes.json(),
          ]);

          setPropertyPolicy(policy);
          setAddress(addressData);
          setBasicInfo(basicInfoData);

          localStorage.setItem('propertyPolicy', JSON.stringify(policy));
          localStorage.setItem('propertyAddress', JSON.stringify(addressData));
          localStorage.setItem('propertyBasicInfo', JSON.stringify(basicInfoData));
        }

        const combinedDataRes = await fetch("https://dev.kacc.mn/api/combined-data/");
        const combinedData = await combinedDataRes.json();
        setPropertyTypes(combinedData.property_types || []);
      } catch (error) {
        console.error("Error loading property data:", error);
        setProceed(0);
      }
    }

    loadData();
  }, [setProceed]);

  const getPropertyTypeName = (id: number): string => {
    const type = propertyTypes.find(pt => pt.id === id);
    return type ? type.name_mn : t("loading");
  };

  const goPrev = () => {
    setImageIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setImageIndex((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1));
  };

  if (!propertyDetail) {
    return <div>{t("8")}</div>;
  }

  return (
    <div className="text-black">
      <div className="flex gap-x-10 flex-wrap">
        <div className="w-full max-w-2xl mb-6 relative">
          {propertyImages.length > 0 && (
            <div className="relative bg-white rounded-xl overflow-hidden shadow-md">
              <img
                src={propertyImages[imageIndex].image}
                alt={propertyImages[imageIndex].description}
                className="w-full h-auto object-contain max-h-[300px]"
              />
              {propertyImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button onClick={goPrev} className="text-white text-xl bg-black/50 rounded-full p-2">
                    <FaChevronLeft />
                  </button>
                  <button onClick={goNext} className="text-white text-xl bg-black/50 rounded-full p-2">
                    <FaChevronRight />
                  </button>
                </div>
              )}
              <div className="px-4 py-2">
                <p className="text-sm text-gray-800 text-center">{propertyImages[imageIndex].description}</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-md">
          {basicInfo && (
            <>
              <p className="text-primary text-2xl font-semibold">{basicInfo.property_name_mn}</p>
              <p className="text-soft">{basicInfo.property_name_en}</p>

              <div className="flex justify-between mt-2">
                <p className="text-muted">Үл хөдлөх хөрөнгийн төрөл:</p>
                <p>{propertyBaseInfo && getPropertyTypeName(propertyBaseInfo.property_type)}</p>
              </div>

              <div className="flex justify-between mt-2">
                <p className="text-muted">Үйл ажиллагаа эхэлсэн огноо:</p>
                <p>{basicInfo.start_date}</p>
              </div>

              <div className="flex justify-between mt-2">
                <p className="text-muted">Буудлын нийт өрөөний тоо:</p>
                <p>{basicInfo.total_hotel_rooms}</p>
              </div>

              <div className="flex justify-between mt-2">
                <p className="text-muted">Хүүхэд үйлчлүүлэх боломжтой эсэх:</p>
                <p>{propertyPolicy?.allow_children ? <span className="text-green-500">Тийм</span> : <span className="text-red-500">Үгүй</span>}</p>
              </div>

              <div className="flex justify-between mt-2">
                <p className="text-muted">Зогсоолтой эсэх:</p>
                <p>{propertyDetail?.parking_situation}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {address && (
        <div className="mb-4">
          <p className="font-semibold">{t("2")}:</p>
          <p>{address.zipCode}</p>
        </div>
      )}

      {propertyPolicy && (
        <div className="mb-4">
          <p className="font-semibold">{t("3")}:</p>
          <p>{propertyPolicy.check_in_from} – {propertyPolicy.check_in_until}</p>
          <p className="font-semibold">{t("4")}:</p>
          <p>{propertyPolicy.check_out_from} – {propertyPolicy.check_out_until}</p>
        </div>
      )}

      <div className="mb-4">
        <p className="font-semibold">{t("5")}:</p>
        <a
          href={propertyDetail.google_map}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          {t("6")}
        </a>
      </div>

      {propertyBaseInfo && (
        <div className="mb-4 space-y-1">
          <p className="font-semibold">{t("10")}:</p>
          <p>{propertyBaseInfo.CompanyName}</p>
          <p><span className="font-semibold">{t("11")}:</span> {propertyBaseInfo.PropertyName}</p>
          <p><span className="font-semibold">{t("12")}:</span> {propertyBaseInfo.location}</p>
          <p><span className="font-semibold">{t("13")}:</span> {propertyBaseInfo.phone}</p>
          <p><span className="font-semibold">{t("14")}:</span> {propertyBaseInfo.mail}</p>
          <p><span className="font-semibold">{t("15")}:</span> {propertyBaseInfo.register}</p>
          <p><span className="font-semibold">{t("16")}:</span> {getPropertyTypeName(propertyBaseInfo.property_type)}</p>
        </div>
      )}
    </div>
  );
}
