'use client';

import React, { useEffect, useState } from 'react';

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
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyPhoto[]>([]);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const targetPropertyId = propertyData.property;

      const detailRes = await fetch(`https://dev.kacc.mn/api/property-details/?property=${targetPropertyId}`);
      const details = await detailRes.json();
      const matchedDetail: PropertyDetail | undefined = details[0];

      if (!matchedDetail) {
        setProceed(0);
        return;
      }

      setProceed(2);
      setPropertyDetail(matchedDetail);

      // Fetch individual resources by ID
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

      // Load property images from the list and filter based on photo IDs
      const imagesRes = await fetch('https://dev.kacc.mn/api/property-images/');
      const allImages = await imagesRes.json();

      const filteredImages = allImages.filter((img: PropertyPhoto) =>
        matchedDetail.property_photos.map(p => p.id).includes(img.id)
      );
      setPropertyImages(filteredImages);
    };

    loadData();
  }, [setProceed]);

  if (!propertyDetail) return <div>Loading hotel details...</div>;

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Property Dashboard</h1>

      {basicInfo && (
        <div className="mb-4">
          <p className="font-semibold">Hotel Name (EN):</p>
          <p>{basicInfo.property_name_en}</p>
        </div>
      )}

      {address && (
        <div className="mb-4">
          <p className="font-semibold">Zip Code:</p>
          <p>{address.zipCode}</p>
        </div>
      )}

      {propertyPolicy && (
        <div className="mb-4">
          <p className="font-semibold">Check-in:</p>
          <p>{propertyPolicy.check_in_from} - {propertyPolicy.check_in_until}</p>
          <p className="font-semibold">Check-out:</p>
          <p>{propertyPolicy.check_out_from} - {propertyPolicy.check_out_until}</p>
        </div>
      )}

      <div className="mb-4">
        <p className="font-semibold">Google Map:</p>
        <a href={propertyDetail.google_map} target="_blank" rel="noopener noreferrer" className="text-blue-500">
          View Location
        </a>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Parking:</p>
        <p>{propertyDetail.parking_situation}</p>
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {propertyImages.map(photo => (
          <div key={photo.id} className="rounded-lg shadow p-2">
            <img src={photo.image} alt={photo.description} className="w-full h-40 object-cover rounded-md mb-2" />
            <p className="text-sm text-gray-700">{photo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
