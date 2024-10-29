'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { LuHotel } from "react-icons/lu";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface RoomType {
  id: number;
  name: string;
  is_custom: boolean;
}

interface RoomTypeCount {
  room_type: RoomType;
  room_count: number;
  id: number;
}

interface Hotel {
  pk: number;
  hotel_name: string;
  email: string;
  contact: string;
  address: string;
  map_url: string;
  gst_number: string;
  food_gst_percentage: string;
  room_gst_percentage: string;
  joined_date: string;
  hotel_owner: number;
}

interface HotelInfo {
  id: number;
  hotel: number;
  total_rooms: number;
  selling_room: number;
  joined_date: string;
  room_type_counts: RoomTypeCount[];
}

export default function Dashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<HotelInfo>({
    id: 0,
    hotel: 0,
    total_rooms: 0,
    selling_room: 0,
    joined_date: new Date().toISOString(),
    room_type_counts: [{ room_type: { id: 1, name: "", is_custom: false }, room_count: 0, id: 0 }],
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const requestBody = {
          hotel_owner: Cookies.get('pk'),
          token: Cookies.get('jwtToken'),
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotels/owner/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data: Hotel[] = await response.json();
        setHotels(data);
        setSelectedHotel(data[0]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError((err as Error).message);
        toast.error(`Error fetching hotels: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleFormSubmit = async () => {
    setSubmitting(true);
    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotel-info/update/${formData.id}/`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotel-info/create/`;
      const method = isEditMode ? 'PUT' : 'POST';

      const body = {
        hotel: selectedHotel?.pk,
        total_rooms: formData.total_rooms,
        selling_room: formData.selling_room,
        joined_date: formData.joined_date,
        room_type_counts: formData.room_type_counts.map(({ room_count, room_type }) => ({
          room_type: room_type.id,
          room_count,
          id: room_type.id,
        })),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      toast.success('Hotel information submitted successfully!');
      resetForm();
      setShowForm(false);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error(`Error submitting form: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHotelInfo = async (hotelPk: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hotel-info/${hotelPk}/`);
      if (response.ok) {
        const data = await response.json();
        setHotelInfo(data);
        setFormData(data);
        setShowForm(true);
        setIsEditMode(true);
      } else if (response.status === 404) {
        resetForm();
        setShowForm(true);
        setIsEditMode(false);
      }
    } catch (err) {
      console.error('Error fetching hotel info:', err);
      toast.error(`Error fetching hotel info: ${(err as Error).message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      hotel: 0,
      total_rooms: 0,
      selling_room: 0,
      joined_date: new Date().toISOString(),
      room_type_counts: [{ room_type: { id: 1, name: "", is_custom: false }, room_count: 0, id: 0 }],
    });
    setHotelInfo(null);
    setIsEditMode(false);
  };

  useEffect(() => {
    if (selectedHotel) {
      fetchHotelInfo(selectedHotel.pk);
    }
  }, [selectedHotel, fetchHotelInfo]);

  const addRoomType = () => {
    const newRoomType: RoomType = {
      id: formData.room_type_counts.length + 1,
      name: "",
      is_custom: false,
    };

    setFormData((prev) => ({
      ...prev,
      room_type_counts: [
        ...prev.room_type_counts,
        { room_type: newRoomType, room_count: 0, id: 0 },
      ],
    }));
  };

  const updateRoomTypeCount = (index: number, field: keyof RoomTypeCount, value: number | RoomType) => {
    setFormData((prev) => {
      const updatedRoomTypeCounts = [...prev.room_type_counts];
      if (field === 'room_count') {
        updatedRoomTypeCounts[index].room_count = value as number;
      } else {
        updatedRoomTypeCounts[index].room_type = value as RoomType;
      }
      return { ...prev, room_type_counts: updatedRoomTypeCounts };
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="text-black mt-5 p-5 relative">
      <ToastContainer />

      <div className="flex flex-wrap gap-3">
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <div
              key={hotel.pk}
              onClick={() => setSelectedHotel(hotel)}
              className={`relative bg-white rounded-lg w-80 h-52 p-5 cursor-pointer overflow-hidden ${
                selectedHotel?.pk === hotel.pk ? 'border-2 border-blue-500 text-blue-500' : 'border'
              }`}
            >
              <LuHotel
                className={`absolute -left-4 top-1 opacity-70 transform -rotate-12 ${
                  selectedHotel?.pk === hotel.pk ? 'text-blue-100' : 'text-gray-200'
                }`}
                size={250}
              />
              <h3 className="text-3xl relative z-10">{hotel.hotel_name}</h3>
            </div>
          ))
        ) : (
          <p>No hotels available.</p>
        )}
      </div>

      {hotelInfo && (
        <div className="mt-8 p-4 border-t-2 border-gray-300">
          <h2 className="text-2xl font-bold mb-2">{hotelInfo.hotel} Details</h2>
          <p>Total Rooms: {hotelInfo.total_rooms}</p>
          <p>Selling Rooms: {hotelInfo.selling_room}</p>
          <p>Joined Date: {new Date(hotelInfo.joined_date).toLocaleDateString()}</p>

          {hotelInfo.room_type_counts.map((roomTypeCount) => (
            <div key={roomTypeCount.id} className="mt-2">
              <p>Room Type: {roomTypeCount.room_type.name}</p>
              <p>Room Count: {roomTypeCount.room_count}</p>
            </div>
          ))}
          
          {hotelInfo ? (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-500 text-white p-2 rounded"
            >
              Edit
            </button>
          ) : null}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleFormSubmit} className="mt-4 p-4 border-t-2 border-gray-300">
          <div className="mb-4">
            <label>Total Rooms</label>
            <input
              type="number"
              value={formData.total_rooms}
              onChange={(e) => setFormData((prev) => ({ ...prev, total_rooms: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Add Room Types */}
          <button onClick={addRoomType} type="button" className="bg-green-500 text-white p-2 rounded">
            Add Room Type
          </button>

          {/* Render room types */}
          {formData.room_type_counts.map((roomTypeCount, index) => (
            <div key={index} className="flex items-center gap-2 mt-4">
              <input
                type="text"
                value={roomTypeCount.room_type.name}
                onChange={(e) =>
                  updateRoomTypeCount(index, 'room_type', { ...roomTypeCount.room_type, name: e.target.value })
                }
                className="flex-1 p-2 border rounded"
              />
              <input
                type="number"
                value={roomTypeCount.room_count}
                onChange={(e) =>
                  updateRoomTypeCount(index, 'room_count', parseInt(e.target.value))
                }
                className="w-20 p-2 border rounded"
              />
            </div>
          ))}

          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white p-2 rounded"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : isEditMode ? 'Update' : 'Create'}
          </button>
        </form>
      )}
    </div>
  );
}
