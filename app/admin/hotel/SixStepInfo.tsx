'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { FaChevronLeft, FaChevronRight, FaRegCheckCircle } from 'react-icons/fa';
import AboutHotel from './AboutHotel';

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
  const t = useTranslations('SixStepInfo');
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyPhoto[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [Menu, setMenu] = useState(0);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [propertyBaseInfo, setPropertyBaseInfo] = useState<PropertyBaseInfo | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<{ id: number; About: string; YoutubeUrl: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const hotelId = userInfo.hotel || propertyData.property || Number(Cookies.get('hotel'));
      if (!hotelId) return setProceed(0);

      try {
        const cachedDetail = localStorage.getItem('propertyDetail');
        const cachedPolicy = localStorage.getItem('propertyPolicy');
        const cachedAddress = localStorage.getItem('propertyAddress');
        const cachedBasic = localStorage.getItem('propertyBasicInfo');

        const baseRes = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}/`);
        if (!baseRes.ok) throw new Error('Failed to fetch propertyBaseInfo');
        const baseInfo = await baseRes.json();
        setPropertyBaseInfo(baseInfo);
        localStorage.setItem('propertyBaseInfo', JSON.stringify(baseInfo));

        const additionalRes = await fetch(`https://dev.kacc.mn/api/additionalInfo/?property=${hotelId}`);
        const additionalJson = await additionalRes.json();

        if (additionalJson?.length > 0) {
          setAdditionalInfo(additionalJson[0]);
        } else {
          const createRes = await fetch(`https://dev.kacc.mn/api/additionalInfo/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              About: 'Мэдээлэл оруулаагүй байна.',
              YoutubeUrl: '',
              property: hotelId,
            }),
          });
          if (createRes.ok) {
            const created = await createRes.json();
            setAdditionalInfo(created);
          }
        }

        if (cachedDetail && cachedPolicy && cachedAddress && cachedBasic) {
          const parsedDetail = JSON.parse(cachedDetail);
          setPropertyDetail(parsedDetail);
          setPropertyImages(parsedDetail.property_photos);
          setPropertyPolicy(JSON.parse(cachedPolicy));
          setAddress(JSON.parse(cachedAddress));
          setBasicInfo(JSON.parse(cachedBasic));
        } else {
          const details = await (await fetch(`https://dev.kacc.mn/api/property-details/?property=${hotelId}`)).json();
          const matchedDetail = details?.[0];
          if (!matchedDetail) return setProceed(0);

          const [policy, addressData, basicInfoData] = await Promise.all([
            (await fetch(`https://dev.kacc.mn/api/property-policies/${matchedDetail.propertyPolicies}/`)).json(),
            (await fetch(`https://dev.kacc.mn/api/confirm-address/${matchedDetail.confirmAddress}/`)).json(),
            (await fetch(`https://dev.kacc.mn/api/property-basic-info/${matchedDetail.propertyBasicInfo}/`)).json(),
          ]);

          setPropertyDetail(matchedDetail);
          setPropertyImages(matchedDetail.property_photos);
          setPropertyPolicy(policy);
          setAddress(addressData);
          setBasicInfo(basicInfoData);

          localStorage.setItem('propertyDetail', JSON.stringify(matchedDetail));
          localStorage.setItem('propertyPolicy', JSON.stringify(policy));
          localStorage.setItem('propertyAddress', JSON.stringify(addressData));
          localStorage.setItem('propertyBasicInfo', JSON.stringify(basicInfoData));
        }

        const combinedData = await (await fetch('https://dev.kacc.mn/api/combined-data/')).json();
        setPropertyTypes(combinedData.property_types || []);
      } catch (err) {
        console.error(err);
        setProceed(0);
      }
    }

    loadData();
  }, [setProceed]);

  const getPropertyTypeName = (id: number) => propertyTypes.find(pt => pt.id === id)?.name_mn || t('loading');
  const goPrev = () => setImageIndex(prev => (prev === 0 ? propertyImages.length - 1 : prev - 1));
  const goNext = () => setImageIndex(prev => (prev === propertyImages.length - 1 ? 0 : prev + 1));
  const formatTime = (t: string) => t?.slice(0, 5);

  if (!propertyDetail) return <div>{t('8')}</div>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <p className="text-lg text-black font-semibold">Үндсэн мэдээлэл</p>
        {propertyBaseInfo?.is_approved ? (
          <div className="text-green-500 flex gap-x-1 text-[18px]">
            Баталгаажсан <FaRegCheckCircle className="text-xl mt-[4px]" />
          </div>
        ) : (
          <div className="text-red">Баталгаажаагүй</div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start min-h-[300px]">
        <div className="w-full md:w-2/5">
          {propertyImages.length > 0 && (
            <div className="relative bg-white rounded-xl overflow-hidden border border-cloud">
              <img
                src={propertyImages[imageIndex].image}
                alt={propertyImages[imageIndex].description}
                className="w-full object-cover h-[250px]"
              />
              {propertyImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button onClick={goPrev} className="text-white text-xl bg-black/50 rounded-full p-2"><FaChevronLeft /></button>
                  <button onClick={goNext} className="text-white text-xl bg-black/50 rounded-full p-2"><FaChevronRight /></button>
                </div>
              )}
              <p className="text-sm text-center text-gray-800 py-2">{propertyImages[imageIndex].description}</p>
            </div>
          )}
        </div>

        <div className="w-full md:w-3/5 flex flex-col">
          <div className="mb-2 min-h-[50px]">
            {basicInfo && (
              <>
                <p className="text-primary text-2xl font-semibold">{basicInfo.property_name_mn}</p>
                <p className="text-soft -translate-y-1">{basicInfo.property_name_en}</p>
              </>
            )}
          </div>

          <div className="border border-cloud rounded-[15px] p-4 space-y-4">
            <InfoRow label="Үл хөдлөх хөрөнгийн төрөл" value={getPropertyTypeName(propertyBaseInfo?.property_type ?? 0)} />
            <InfoRow label="Үйл ажиллагаа эхэлсэн огноо" value={basicInfo?.start_date} />
            <InfoRow label="Буудлын нийт өрөөний тоо" value={basicInfo?.total_hotel_rooms} />
            <InfoRow label="Хүүхэд үйлчлүүлэх боломжтой эсэх" value={propertyPolicy?.allow_children} isBoolean />
            <InfoRow label="Зогсоолтой эсэх" value={propertyDetail?.parking_situation} />
          </div>
        </div>
      </div>

      <div className="flex max-w-[700px] justify-between text-black text-[17px] mt-3 font-semibold mb-4">
        {['Бидний тухай', 'Байршил', 'Үйлчилгээ', 'Түгээмэл асуулт, хариулт'].map((label, index) => (
          <button key={index} className={Menu === index ? 'text-primary' : ''} onClick={() => setMenu(index)}>
            {index + 1}.{label}
          </button>
        ))}
      </div>

      {Menu === 0 && (
       <AboutHotel
  image={propertyImages[imageIndex] || null}
  aboutUs={additionalInfo?.About || ""}
  youtubeUrl={additionalInfo?.YoutubeUrl || ""}
  additionalId={additionalInfo?.id || null}
  hotelId={propertyDetail.property}
/>

      )}
    </div>
  );
}

const InfoRow = ({
  label,
  value,
  isBoolean = false,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  isBoolean?: boolean;
}) => (
  <div className="flex justify-between">
    <p className="text-muted">{label}:</p>
    {isBoolean && typeof value === 'boolean' ? (
      <span className={value ? 'text-green-500' : 'text-red'}>{value ? 'Тийм' : 'Үгүй'}</span>
    ) : (
      <p>{value ?? '-'}</p>
    )}
  </div>
);