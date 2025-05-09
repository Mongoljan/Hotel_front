'use client';

import React from 'react';

interface PropertyPhoto {
  id: number;
  image: string;
  description: string;
}

interface PropertyDetail {
  parking_situation: string;
  google_map: string;
}

interface PropertyPolicy {
  check_in_from: string;
  check_in_until: string;
  check_out_from: string;
  check_out_until: string;
  allow_children: boolean;
  cancellation_fee: {
    cancel_time: string;
    before_fee: string;
    after_fee: string;
  };
}

interface BasicInfo {
  property_name_mn: string;
  property_name_en: string;
  start_date: string;
  total_hotel_rooms: number;
}

interface PropertyBaseInfo {
  property_type: number;
}

interface Props {
  image: PropertyPhoto | null;
  basicInfo: BasicInfo | null;
  propertyPolicy: PropertyPolicy | null;
  propertyBaseInfo: PropertyBaseInfo | null;
  propertyDetail: PropertyDetail | null;
  getPropertyTypeName: (id: number) => string;
  formatTime: (time: string) => string;
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
      <span className={value ? 'text-green-500' : 'text-red-500'}>
        {value ? 'Тийм' : 'Үгүй'}
      </span>
    ) : (
      <p>{value ?? '-'}</p>
    )}
  </div>
);

export default function AboutHotel({
  image,
  basicInfo,
  propertyPolicy,
  propertyBaseInfo,
  propertyDetail,
  getPropertyTypeName,
  formatTime,
}: Props) {
  return (
    <>


<div className="flex min-h-[200px] gap-x-6 max-h-[500px] mb-6">
    

      <textarea className="border-[1px] border-cloud border-solid rounded-[15px] w-full min-h-[200px]" />
      <div className="min-w-[300px] border-cloud border-solid border-[1px] rounded-[15px] min-h-[200px] text-center place-content-center"> Youtube url тавигдаад embed хийх хэсэг ( API бас гаргуулж авна)</div>
      </div>
<div className="font-semibold mb-4 text-[17px]"> Дотоод журам</div>
      {propertyPolicy && (
        <div className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
            <div>
              <p className="mb-2">Бүртгэх цаг:</p>
              <p className="flex items-center gap-2">
                <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">
                  {formatTime(propertyPolicy.check_in_from)}
                </div>
                <span>–</span>
                <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">
                  {formatTime(propertyPolicy.check_in_until)}
                </div>
              </p>
            </div>
            <div>
              <p className="mb-2">Гарах цаг:</p>
              <p className="flex items-center gap-2">
                <div className="rounded-[10px] border-cloud border-[1px] p-1  px-5 w-fit">
                  {formatTime(propertyPolicy.check_out_from)}
                </div>
                <span>–</span>
                <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">
                  {formatTime(propertyPolicy.check_out_until)}
                </div>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-2 mt-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
    <div className=" ">Цуцлах боломжтой хугацаа</div>
    <div className=" ">Цуцлалтын шимтгэл</div>
  </div>

  {/* Row 1: Before cancel time */}
  <div>
  <div className="grid grid-cols-1 mb-2 sm:grid-cols-2 gap-x-12">
    <div className="text-muted my-auto">
      тухайн өдрийн {formatTime(propertyPolicy.cancellation_fee.cancel_time)} цагаас өмнө
    </div>
    <div className="border border-cloud p-1 px-[14px] w-fit text-center rounded-[10px]">
      {propertyPolicy.cancellation_fee.before_fee}%
    </div>
  </div>

  {/* Row 2: After cancel time */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
    <div className="text-muted my-auto">
      тухайн өдрийн {formatTime(propertyPolicy.cancellation_fee.cancel_time)} цагаас дараа
    </div>
    <div className="border border-cloud p-1 px-[14px] w-fit text-center rounded-[10px]">
      {propertyPolicy.cancellation_fee.after_fee}%
    </div>
  </div>
</div>
</div>

        </div>
      )}

    </>
  );
}
