'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { LuHotel } from "react-icons/lu";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdClose } from "react-icons/md";

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
      if (selectedHotel) {
        await fetchHotelInfo(selectedHotel.pk);
      }
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
    <div className="text-black bg-white mt-5 p-5 relative">
      <ToastContainer />

      <div className="flex flex-wrap gap-3">
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <div
              key={hotel.pk}
              onClick={() => setSelectedHotel(hotel)}
              className={`relative bg-white rounded-lg w-[340px]  min-h-[250px] p-5 cursor-pointer overflow-hidden ${
                selectedHotel?.pk === hotel.pk ? 'border-2 border-blue-500 text-blue-500' : 'border-muted border'
              }`}
            >
              <LuHotel
                className={`absolute -left-4 top-1 opacity-70 transform translate-x-[150px] -translate-y-[50px] -rotate-12 ${
                  selectedHotel?.pk === hotel.pk ? 'text-blue-100' : 'text-gray-200'
                }`}
                size={250}
              />
              <h3 className="text-3xl relative z-10">{hotel.hotel_name}</h3>
              <div className="relative z-10"> {hotel.email}</div>
              
              <div className="relative z-10"> {hotel.contact}</div>
              <div className="relative z-10">{hotel.address}</div>

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
            <div className=" gap-x-3 mt-[40px]  bg-white rounded-lg h-[50vh] max-w-[1500px]">
              <div className="flex gap-x-[100px]">
              <div className="flex ">
                <div className="content-center text-xl  mr-[20px]">Нийт өрөө :</div>
                
                <div className=" content-center text-[40px] text-primary">{hotelInfo[0].total_rooms} </div>
                </div>
                <div className="flex">
                <div className=" content-center mr-[20px] text-xl">Боломжит өрөө :</div>
                <div className="content-center text-[40px] text-primary">{hotelInfo[0].selling_room} </div>
                </div>
                </div>



              
          
      
              <div>
                <div className="flex flex-wrap gap-7 pt-[20px]">

  {
    hotelInfo[0].room_type_counts.map((type) => (
      <div key={type.id}>
        <div className="border-primary w-max-[340px] w-[340px] h-[172px] rounded-[10px] border-solid border-[1px] text-primary ">
    {/* Id.{type.id}:  */}
    <div className="p-6 flex justify-between">
<div >
        <div className="text-[18px]"> {type.room_type.name} 
        
          </ div>
         <div className="text-[60px] pt-[20px]">
          {type.room_count} 
          </div>
</div>
<div className=" ">
  <div className="flex justify-end">
<svg width="46" height="25" viewBox="0 0 46 25" className="" fill="none" xmlns="http://www.w3.org/2000/svg">

<path d="M45.0809 9.5924H39.5608C39.3168 9.5924 39.0825 9.69314 38.9101 9.87347C38.7376 10.0532 38.6405 10.297 38.6405 10.5519V13.4293H14.6469C14.4249 11.8331 13.6594 10.3733 12.4904 9.31633C11.3214 8.25996 9.82732 7.67666 8.28028 7.67395H7.36053L7.36 0.958968C7.36 0.704611 7.26338 0.460843 7.09042 0.281075C6.918 0.100751 6.68419 0 6.44025 0H0.919743C0.67579 0 0.441991 0.100741 0.269576 0.281075C0.0971606 0.460843 0 0.704625 0 0.958968V23.981C0 24.2354 0.0966181 24.4792 0.269576 24.6589C0.441991 24.8393 0.675804 24.94 0.919743 24.94H6.44025C6.68421 24.94 6.918 24.8393 7.09042 24.6589C7.26337 24.4792 7.36 24.2354 7.36 23.981V21.1031H38.6399V23.981C38.6399 24.2359 38.737 24.4792 38.9095 24.6589C39.0819 24.8393 39.3162 24.94 39.5602 24.94H45.0803C45.3242 24.94 45.558 24.8393 45.731 24.6589C45.9034 24.4792 46 24.2354 46 23.9805V10.5517C46 10.2967 45.9034 10.053 45.731 9.8732C45.558 9.69287 45.3248 9.5924 45.0809 9.5924Z" fill="#4A90E2"/>
</svg>
</div>
<button className="pt-[60px]" onClick={() => setAction(true)}>
    {isEditMode ? <div className="px-8 py-2 rounded-[10px] hover:bg-primary hover:text-white  border-primary border-solid border-[1px]">Засах</div> : <div>Create Hotel Info</div>}
    </button>

  </div>
        </div>
      </div>
      </div>
    ))
  }
  </div>
</div>
{/* <div>{hotelInfo[0].joined_date}</div> */}


            </div>
          ) }
 
    <button onClick={() => setAction(true)}>
    {isEditMode ? <div></div> : <div className="border-primary px-4 py-2 text-primary border-solid border-[1px]">Create Hotel Info</div>}
    </button>



      {Action && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-[10px] ">
        <div className="  p-10">
          <div className="flex mb-5 justify-between">
            <button
              className="px-5 h-[40px] mt-[10px] bg-gray-300 rounded-md"
              onClick={() => resetForm()}
              disabled={submitting}
            >
              Reset
            </button>
            <button onClick={() => setAction(false)} className="mt-4 text-black text-[30px]  p-2 px-4 rounded-[10px]"><MdClose /></button>
          
          </div>

          <div className="space-y-3">
            <label>Total Rooms</label>
            <input
              type="number"
              className="w-full p-2 border border-muted rounded-md"
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
                  className="w-full py-1 border-red-500 hover:bg-red-500 hover:text-white border-solid border-[1px] text-red-500  rounded-md"
                  onClick={() => deleteRoomType(index)}
                >
                  Delete
                </button>
              </div>
            ))}
            <div className="flex justify-between">
            <button
              type="button"
              className="px-5 py-2 bg-green-500 text-white rounded-[10px] "
              onClick={addRoomType}
            >
              Add Room Type
            </button>

            <button
              className="px-5  bg-blue-500 text-white rounded-[10px] hover:bg-blue-700"
              onClick={handleFormSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Save Hotel Info'}
            </button>
            </div>
          </div>
        </div>
        </div>
        </div>
      )}
    </div>
  );
}
