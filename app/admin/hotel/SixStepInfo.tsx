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

  useEffect(() => {
    async function loadData() {
      const propertyData = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const targetPropertyId = propertyData.hotel;

      // 1) Fetch the detail
      const detailRes = await fetch(
        `https://dev.kacc.mn/api/property-details/?property=${targetPropertyId}`,
        { cache: 'no-store' }
      );
      const details: PropertyDetail[] = await detailRes.json();
      const matchedDetail = details[0];

      if (!matchedDetail) {
        setProceed(0);
        return;
      }

      console.log("its worked — matchedDetail:", matchedDetail);
      setProceed(2);
      setPropertyDetail(matchedDetail);

      // 2) **Directly** use the returned photos
      setPropertyImages(matchedDetail.property_photos);

      // 3) Fetch the other pieces in parallel
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
        <div className="mb-4">
          <p className="font-semibold">{t("1")}:</p>
          <p>{basicInfo.property_name_en}</p>
        </div>
      )}
      {basicInfo && (
        <div className="mb-4">
          <p className="font-semibold">{t("9")}:</p>
          <p>{basicInfo.property_name_mn}</p>
        </div>
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
          <p>
            {propertyPolicy.check_in_from} – {propertyPolicy.check_in_until}
          </p>
          <p className="font-semibold">{t("4")}:</p>
          <p>
            {propertyPolicy.check_out_from} – {propertyPolicy.check_out_until}
          </p>
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

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {propertyImages.map(photo => (
          <div key={photo.id} className="rounded-lg shadow p-2">
            <img
              src={photo.image}
              alt={photo.description}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
            <p className="text-sm text-gray-700">{photo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
