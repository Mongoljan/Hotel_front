'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface PropertyPhoto {
  id: number;
  image: string;
  description: string;
}

interface Props {
  image: PropertyPhoto | null;
  aboutUs: string;
  youtubeUrl: string;
  additionalId: number | null;
  hotelId: number;
}

const AboutHotel: React.FC<Props> = ({ image, aboutUs, youtubeUrl, additionalId, hotelId }) => {
  const [about, setAbout] = useState(aboutUs || '');
  const [youtube, setYoutube] = useState(youtubeUrl || '');
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    try {
      if (additionalId) {
        toast.error('Өмнө хадгалсан мэдээллийг шинэчлэх боломжгүй байна.');
        return;
      }

      const res = await fetch('https://dev.kacc.mn/api/additionalInfo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          About: about,
          YoutubeUrl: youtube,
          property: hotelId,
        }),
      });

      if (!res.ok) throw new Error('Failed to save additional info');

      toast.success('Амжилттай хадгалагдлаа');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex gap-x-6 max-h-[500px] mb-6">
      <textarea
        disabled={!editing}
        className="border-[1px] border-cloud border-solid rounded-[15px] w-full min-h-[200px] p-2"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
      />

      <div className="min-w-[300px] border-cloud border-solid border-[1px] rounded-[15px] min-h-[200px] text-center p-2">
        {editing ? (
          <input
            type="url"
            className="w-full border border-gray-300 p-2 rounded-[10px]"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
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

      <div className="flex flex-col justify-center">
        <button
          onClick={editing ? handleSave : () => setEditing(true)}
          className="bg-primary text-white px-4 py-2 rounded-[10px]"
        >
          {editing ? 'Хадгалах' : 'Засварлах'}
        </button>
      </div>
    </div>
  );
};

export default AboutHotel;
