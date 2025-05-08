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
  const t = useTranslations('SixStepInfo');
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyPhoto[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [propertyPolicy, setPropertyPolicy] = useState<PropertyPolicy | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [propertyBaseInfo, setPropertyBaseInfo] = useState<PropertyBaseInfo | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);

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
        const cachedBaseInfo = localStorage.getItem('propertyBaseInfo');

        if (cachedDetail && cachedPolicy && cachedAddress && cachedBasic && cachedBaseInfo) {
          const parsedDetail = JSON.parse(cachedDetail);
          setPropertyDetail(parsedDetail);
          setPropertyImages(parsedDetail.property_photos);
          setPropertyPolicy(JSON.parse(cachedPolicy));
          setAddress(JSON.parse(cachedAddress));
          setBasicInfo(JSON.parse(cachedBasic));
          setPropertyBaseInfo(JSON.parse(cachedBaseInfo));
        } else {
          const baseInfo = await (await fetch(`https://dev.kacc.mn/api/properties/${hotelId}/`)).json();
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
          setPropertyBaseInfo(baseInfo);

          localStorage.setItem('propertyDetail', JSON.stringify(matchedDetail));
          localStorage.setItem('propertyPolicy', JSON.stringify(policy));
          localStorage.setItem('propertyAddress', JSON.stringify(addressData));
          localStorage.setItem('propertyBasicInfo', JSON.stringify(basicInfoData));
          localStorage.setItem('propertyBaseInfo', JSON.stringify(baseInfo));
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
    <div className="">
      <div className="flex justify-between mb-10">
        <p className="text-2xl text-black font-semibold">Үндсэн мэдээлэл</p>
        <p>Хүсэлт хүлээгдэж байгаа (API тавигдах)</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-stretch min-h-[300px]">
        <div className="w-full md:w-2/5 h-full">
          {propertyImages.length > 0 && (
            <div className="relative bg-white rounded-xl overflow-hidden shadow-md h-full flex flex-col justify-between">
              <img src={propertyImages[imageIndex].image} alt={propertyImages[imageIndex].description} className="w-full object-cover h-[250px]" />
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

        <div className="w-full md:w-3/5 h-full flex flex-col justify-between">
          {basicInfo && (
            <div className="mb-2">
              <p className="text-primary text-2xl font-semibold">{basicInfo.property_name_mn}</p>
              <p className="text-soft -translate-y-1">{basicInfo.property_name_en}</p>
            </div>
          )}
          <div className="border border-cloud rounded-[15px] p-4 space-y-4 h-full">
            <InfoRow label="Үл хөдлөх хөрөнгийн төрөл" value={getPropertyTypeName(propertyBaseInfo?.property_type ?? 0)} />
            <InfoRow label="Үйл ажиллагаа эхэлсэн огноо" value={basicInfo?.start_date} />
            <InfoRow label="Буудлын нийт өрөөний тоо" value={basicInfo?.total_hotel_rooms} />
            <InfoRow label="Хүүхэд үйлчлүүлэх боломжтой эсэх" value={propertyPolicy?.allow_children} isBoolean />
            <InfoRow label="Зогсоолтой эсэх" value={propertyDetail?.parking_situation} />
          </div>
        </div>
      </div>

      <div className="my-10">
        <div className="text-black font-semibold mb-4">Бидний тухай</div>
        <textarea className="border-[1px] border-cloud border-solid rounded-[15px] w-full min-h-[200px]" />
      </div>

      <div className="text-black font-semibold mb-4">Дотоод журам</div>
      {propertyPolicy && (
        <div className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
            <div>
              <p className=" mb-2">{t('3')}:</p>
              <p className="flex items-center gap-2">
                <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">{formatTime(propertyPolicy.check_in_from)}</div>
                <span>–</span>
                <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">{formatTime(propertyPolicy.check_in_until)}</div>
              </p>
            </div>
            <div>
              <p className=" mb-2">{t('4')}:</p>
              <p className="flex items-center gap-2">
                <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">{formatTime(propertyPolicy.check_out_from)}</div>
                <span>–</span>
                <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">{formatTime(propertyPolicy.check_out_until)}</div>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 mt-6">
            <div>
              <div className="mb-2">Цуцлах боломжтой хугацаа</div>
              <div className="text-muted">тухайн өдрийн {formatTime(propertyPolicy.cancellation_fee.cancel_time)} цагаас өмнө</div>
              <div className="text-muted">тухайн өдрийн {formatTime(propertyPolicy.cancellation_fee.cancel_time)} цагаас дараа</div>
            </div>
            <div>
              <div className=" mb-2">Цуцлалтын шимтгэл</div>
              <div className=" border border-soft py-1 w-[100px] text-center rounded-[10px] mb-2">{propertyPolicy.cancellation_fee.before_fee}%</div>
              <div className=" border border-soft w-[100px] py-1 text-center rounded-[10px]">{propertyPolicy.cancellation_fee.after_fee}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="font-semibold">{t('5')}:</p>
        <a href={propertyDetail.google_map} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          {t('6')}
        </a>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value, isBoolean = false }: { label: string; value: string | number | boolean | null | undefined; isBoolean?: boolean }) => (
  <div className="flex justify-between">
    <p className="text-muted">{label}:</p>
    {isBoolean && typeof value === 'boolean' ? (
      <span className={value ? 'text-green-500' : 'text-red-500'}>{value ? 'Тийм' : 'Үгүй'}</span>
    ) : (
      <p>{value ?? '-'}</p>
    )}
  </div>
);
