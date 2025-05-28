'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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
  aboutUs: string;
  youtubeUrl: string;
  hotelId: number;
  propertyDetailId: number | null;
  getPropertyTypeName: (id: number) => string;
  formatTime: (time: string) => string;
}

export default function AboutHotel({
  image,
  basicInfo,
  propertyPolicy,
  propertyBaseInfo,
  propertyDetail,
  aboutUs,
  youtubeUrl,
  hotelId,
  propertyDetailId,
  getPropertyTypeName,
  formatTime,
}: Props) {
  const [about, setAbout] = useState(aboutUs || '');
  const [youtube, setYoutube] = useState(youtubeUrl || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAbout(aboutUs || '');
  }, [aboutUs]);

  useEffect(() => {
    setYoutube(youtubeUrl || '');
  }, [youtubeUrl]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await fetch('https://dev.kacc.mn/api/additionalInfo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          About: about,
          YoutubeUrl: youtube,
          property: hotelId,
        }),
      });

      if (!res.ok) throw new Error('Хадгалах үед алдаа гарлаа');

      const data = await res.json();

      if (!propertyDetailId) throw new Error('Property Detail ID байхгүй байна');

      const patch = await fetch(`https://dev.kacc.mn/api/property-details/${propertyDetailId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Additional_Information: data.id }),
      });

      if (!patch.ok) throw new Error('Additional Info-г холбох үед алдаа гарлаа');

      toast.success('Амжилттай хадгалагдлаа');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* About + YouTube */}
      <div className="flex  justify-end mb-2">
          <button
            onClick={editing ? handleSave : () => setEditing(true)}
            className="bg-primary text-white px-4 py-2 rounded-[10px] disabled:opacity-50"
            disabled={loading}
          >
            {editing ? 'Хадгалах' : 'Засварлах'}
          </button>
        </div>
      <div className="flex min-h-[200px] gap-x-6 max-h-[500px] mb-6">
        <textarea
          disabled={!editing}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="border-[1px] border-cloud border-solid rounded-[15px] w-full min-h-[200px] p-2"
        />
        <div className="min-w-[300px] border-cloud border-solid border-[1px] rounded-[15px] min-h-[200px] text-center p-2">
          {editing ? (
            <input
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-[10px]"
              placeholder="YouTube URL"
            />
          ) : youtube ? (
            <iframe
              className="w-full h-[200px] rounded-[10px]"
              src={youtube.replace('watch?v=', 'embed/')}
              allowFullScreen
            />
          ) : (
            <span className="text-gray-400">Youtube URL байхгүй байна</span>
          )}
        </div>
        
      </div>
      

      {/* Policy Section */}
      {propertyPolicy && (
        <>
          <div className="font-semibold mb-4 text-[17px]">Дотоод журам</div>
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
                  <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">
                    {formatTime(propertyPolicy.check_out_from)}
                  </div>
                  <span>–</span>
                  <div className="rounded-[10px] border-cloud border-[1px] p-1 px-5 w-fit">
                    {formatTime(propertyPolicy.check_out_until)}
                  </div>
                </p>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="grid grid-cols-1 gap-y-2 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <div className="">Цуцлах боломжтой хугацаа</div>
                <div className="">Цуцлалтын шимтгэл</div>
              </div>

              <div>
                <div className="grid grid-cols-1 mb-2 sm:grid-cols-2 gap-x-12">
                  <div className="text-muted my-auto">
                    тухайн өдрийн {formatTime(propertyPolicy.cancellation_fee.cancel_time)} цагаас өмнө
                  </div>
                  <div className="border border-cloud p-1 px-[14px] w-fit text-center rounded-[10px]">
                    {propertyPolicy.cancellation_fee.before_fee}%
                  </div>
                </div>

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
        </>
      )}
    </div>
  );
}
