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
  const [Action, setAction]= useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<HotelInfo>({

    id: 0,
    hotel: 0,
    total_rooms: 0,
    selling_room: 0,
    joined_date: new Date().toISOString(),
    room_type_counts: [{ room_type: { id: 1, name: "", is_custom: false }, room_count: 0, id: 0 }],
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo[] | null>(null); // Single hotelInfo
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

  const toggleModal = () => setIsOpen(!isOpen);
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
        room_type_counts: formData.room_type_counts
          .filter(rt => rt.room_count > 0)
          .map(({ room_count, room_type, id }) => ({
            room_type: room_type.id,
            room_count,
            id,
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
        const data: HotelInfo[] = await response.json(); // Single hotelInfo
        setHotelInfo(data); // Set hotelInfo for this hotel
        setFormData(data[0]); // Populate formData for editing
        setShowForm(true);
        setIsEditMode(true);
      } else if (response.status === 404) {
        resetForm(); // Reset form if no hotel info is found
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
    setHotelInfo(null); // Reset hotelInfo when form is reset
    setIsEditMode(false);
  };
   function action(){
     setAction(true);

  }

  useEffect(() => {
    if (selectedHotel) {
      fetchHotelInfo(selectedHotel.pk); // Fetch hotel info when a hotel is selected
    }
  }, [selectedHotel]);

  useEffect(() => {
    if (selectedHotel) {
     setAction(false); // Fetch hotel info when a hotel is selected
    }
  }, []);

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
        { room_type: newRoomType, room_count: 0, id: Date.now() },
      ],
    }));
  };

  const updateRoomTypeCount = (index: number, field: keyof RoomTypeCount, value: any) => {
    setFormData((prev) => {
      const updatedRoomTypeCounts = [...prev.room_type_counts];
      if (field === 'room_count') {
        updatedRoomTypeCounts[index].room_count = value;
      } else if (field === 'room_type') {
        updatedRoomTypeCounts[index].room_type = value;
      }
      return { ...prev, room_type_counts: updatedRoomTypeCounts };
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const deleteRoomType = (index: number) => {
    setFormData((prev) => {
      const updatedRoomTypeCounts = prev.room_type_counts.filter((_, i) => i !== index);
      return { ...prev, room_type_counts: updatedRoomTypeCounts };
    });
  };

  const roomTypeOptions = [
    { label: 'Ерөнхийлөгчийн', value: 5 },
    { label: 'Гэр бүлийн', value: 4 },
    { label: 'Бүтэн люкс', value: 3 },
    { label: 'Хагас люкс', value: 2 },
    { label: 'Энгийн', value: 1 },
  ];

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
              {/* <div className="text-md">{hotel.address}</div> */}
            </div>
          ))
        ) : (
          <div>No Hotels Available</div>
        )}
      </div>
      <div className="border-solid border-gray-400 border-b mt-[10px]">

      </div>

      {hotelInfo && (
            <div className=" gap-x-3 mt-[40px] p-10 bg-white rounded-lg h-[50vh] max-w-[1500px]">
              <h3 className="text-3xl">{selectedHotel?.hotel_name}</h3>
              
              <div className="mt-10">
              <p className="text-xl" >Total Rooms: {hotelInfo[0].total_rooms}</p>
              <p className="text-xl">Selling Rooms: {hotelInfo[0].selling_room}</p>

              </div>
              <div>
                Room types: 
                </div>
              <div>

  {
    hotelInfo[0].room_type_counts.map((type) => (
      <div key={type.id}>
        <div>
    Id.{type.id}:      {type.room_type.name} :{type.room_count} {/* Assuming you want to display the room type name */}
        </div>
      </div>
    ))
  }
</div>
<div>{hotelInfo[0].joined_date}</div>


            </div>
          ) }

    <button onClick={() => setAction(true)}>
    {isEditMode ? <div>Edit Hotel Info</div> : <div>Create Hotel Info</div>}
    </button>



      {Action && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
        <div className="mt-10 bg-gray-200  p-10">
          <div className="flex gap-5 mb-5">
            <button
              className="px-5 py-2 bg-gray-300 rounded-md"
              onClick={() => resetForm()}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleFormSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Save Hotel Info'}
            </button>
          </div>

          <div className="space-y-3">
            <label>Total Rooms</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.total_rooms}
              onChange={(e) => setFormData({ ...formData, total_rooms: +e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label>Selling Rooms</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.selling_room}
              onChange={(e) => setFormData({ ...formData, selling_room: +e.target.value })}
            />
          </div>

          
          <div className="space-y-3">
            <label>Room Types</label>
            
            {formData.room_type_counts.map((roomType, index) => (
              <div key={roomType.id} className="flex gap-3 items-center">
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={roomType.room_type.id}
                  onChange={(e) =>
                    updateRoomTypeCount(index, 'room_type', roomTypeOptions.find(rt => rt.value === +e.target.value)!)
                  }
                >
                  {roomTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="w-20 p-2 border border-gray-300 rounded-md"
                  value={roomType.room_count}
                  onChange={(e) => updateRoomTypeCount(index, 'room_count', +e.target.value)}
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-red-500 text-white rounded-md"
                  onClick={() => deleteRoomType(index)}
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              type="button"
              className="px-5 py-2 bg-green-500 text-white rounded-md mt-3"
              onClick={addRoomType}
            >
              Add Room Type
            </button>
            <button onClick={() => setAction(false)} className="mt-4 text-red-500">Close</button>
          </div>
        </div>
        </div>
        </div>
      )}
    </div>
  );
}
