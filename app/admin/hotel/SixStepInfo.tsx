'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';

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

interface ProceedProps {
  proceed: number;
  setProceed: (value: number) => void;
}

export default function SixStepInfo({ proceed, setProceed }: ProceedProps) {
  const t = useTranslations("SixStepInfo");

  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyPhoto[]>([]);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
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

        if (cachedDetail && cachedPolicy && cachedAddress && cachedBasic) {
          const detail = JSON.parse(cachedDetail) as PropertyDetail;
          const policy = JSON.parse(cachedPolicy) as PropertyPolicy;
          const addr = JSON.parse(cachedAddress) as Address;
          const basic = JSON.parse(cachedBasic) as BasicInfo;

          setPropertyDetail(detail);
          setPropertyImages(detail.property_photos);
          setPropertyPolicy(policy);
          setAddress(addr);
          setBasicInfo(basic);
          return;
        }

        // Fetch fresh data if not cached
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
          fetch(`https://dev.kacc.mn/api/property-basic-info/${matchedDetail.propertyBasicInfo}/`)
        ]);

        const [policy, addressData, basicInfoData] = await Promise.all([
          policyRes.json(),
          addressRes.json(),
          basicInfoRes.json()
        ]);

        setPropertyPolicy(policy);
        setAddress(addressData);
        setBasicInfo(basicInfoData);

        localStorage.setItem('propertyPolicy', JSON.stringify(policy));
        localStorage.setItem('propertyAddress', JSON.stringify(addressData));
        localStorage.setItem('propertyBasicInfo', JSON.stringify(basicInfoData));
      } catch (error) {
        console.error("Error loading property data:", error);
        setProceed(0);
      }
    }

    loadData();
  }, [setProceed]);

  if (!propertyDetail) {
    return <div>{t("8")}</div>;
  }

  return (
    <div className="text-black">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

      {basicInfo && (
        <>
          <div className="mb-4">
            <p className="font-semibold">{t("1")}:</p>
            <p>{basicInfo.property_name_en}</p>
          </div>
          <div className="mb-4">
            <p className="font-semibold">{t("9")}:</p>
            <p>{basicInfo.property_name_mn}</p>
          </div>
        </>
      )}

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

      <div className="mb-4">
        <p className="font-semibold">{t("7")}:</p>
        <p>{propertyDetail.parking_situation}</p>
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {propertyImages.map(photo => (
          <div
            key={photo.id}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.image}
              alt={photo.description}
              className="w-full h-auto object-contain max-h-[300px]"
            />
            <div className="px-4 py-2">
              <p className="text-sm text-gray-800 text-center">{photo.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] overflow-auto bg-white rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-3xl font-bold z-50"
            >
              &times;
            </button>
            <img
              src={selectedPhoto.image}
              alt={selectedPhoto.description}
              className="w-full h-auto object-contain rounded-t-xl"
              style={{ maxHeight: '80vh' }}
            />
            {selectedPhoto.description && (
              <div className="p-4 text-center text-gray-800 text-sm">
                {selectedPhoto.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
