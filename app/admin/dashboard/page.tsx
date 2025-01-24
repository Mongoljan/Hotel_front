'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { LuHotel } from "react-icons/lu";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdClose } from "react-icons/md";
import Room from './Room';
import { Hotel } from 'lucide-react';

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
  room_type_counts: [];
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
    room_type_counts: [],
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
        room_type_counts: [],
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
      room_type_counts: [],
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="text-black bg-white mt-5 p-5 relative">
      <ToastContainer />

      <div className="flex flex-wrap gap-3">
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <div
              key={hotel.pk}
              onClick={() => setSelectedHotel(hotel)}
              className={`relative flex justify-between hover:bg-background bg-white rounded-lg w-[350px]  min-h-[125px] p-5 cursor-pointer overflow-hidden ${
                selectedHotel?.pk === hotel.pk ? 'border-[2px] border-blue-500 ' : 'border-blue-300 border'
              }`}
            >
      <div>
  
 
              <div className="relative font-medium text-sm text-muted-foreground z-10"> {hotel.contact}</div>
              <h3 className="text-2xl font-bold relative z-10">{hotel.hotel_name}</h3>
              <div className="relative font-medium text-muted-foreground  text-sm z-10"> {hotel.email}</div>

              {/* <div className="relative z-10">{hotel.address}</div> */}
            </div>
                <LuHotel
                className={`  ${
                  selectedHotel?.pk === hotel.pk ? 'text-blue-500' : 'text-blue-300'
                }`}
                size={25}
              />
               </div>   
          ))
        ) : (
          <div>No Hotels Available</div>
        )}
      </div>


      {hotelInfo && (
            <div className=" gap-x-3 mt-[40px]  bg-white rounded-lg h-[50vh] max-w-[1500px]">
              <div className="flex gap-x-[30px]">
              <div className="flex ">
                <div className="content-center text-xl text-muted-foreground  mr-[20px]">Нийт өрөө :</div>
                
                <div className=" content-center text-xl text-black">{hotelInfo[0].total_rooms} </div>
                </div>
                <div className="flex">
                <div className=" content-center mr-[20px] text-xl text-muted-foreground">Боломжит өрөө :</div>
                <div className="content-center text-xl text-black">{hotelInfo[0].selling_room} </div>
                </div>
                </div>      
              <div>
                <div className="flex flex-wrap gap-7 pt-[20px]">


  </div>
</div>
{/* <div>{hotelInfo[0].joined_date}</div> */}
<Room number={selectedHotel?.pk ?? null} />
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
            
           
            <div className="flex justify-between">


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
