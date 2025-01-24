'use client';

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdClose } from "react-icons/md";

interface HotelPk {
  number: number | null;
}
interface Room {
  hotel: number | null;
  room_number: number;
  room_type: number;
  bed_type: number;
  bed_size: number;
  number_of_beds: number;
  number_of_rooms: number;
  room_size: number;
  smoking_allowed: boolean;
  total_rooms: number;
  rooms_for_sale: number;
  room_rate: number;
  extra_bed: number;
  breakfast_option: number;
  features: number[];
  images: [],
}
interface Feature {
  pk: number;
  name: string;
  feature_type: string;
}

interface RoomData {
  room_types: { id: number; name: string }[];
  bed_types: { id: number; name: string }[];
  bed_sizes: { id: number; size: string }[];
  breakfast_options: { id: number; option: string }[];
  room_rates: { id: number; base_price: string }[];
  extra_beds: { id: number; has_extra_bed: boolean }[];
}

export default function Room({ number }: HotelPk) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({});

  useEffect(() => {
    if (number) {
      fetch(`https://dev.kacc.mn/api/rooms/${number}/`)
        .then(res => res.json())
        .then(setRooms)
        .catch(err => toast.error(`Error fetching rooms: ${err.message}`));

      fetch(`https://dev.kacc.mn/api/features/`)
        .then(res => res.json())
        .then(setFeatures)
        .catch(err => toast.error(`Error fetching features: ${err.message}`));

      fetch(`https://dev.kacc.mn/api/all-room-data/`)
        .then(res => res.json())
        .then(setRoomData)
        .catch(err => toast.error(`Error fetching room data: ${err.message}`));
    }
  }, [number]);

  // 🔹 Auto-fill default values when opening modal
  const handleOpenModal = () => {
    if (!roomData) return;
    
    setNewRoom({
      hotel:number,
      room_number: 0,
      room_type: roomData.room_types[0]?.id || 1,
      bed_type: roomData.bed_types[0]?.id || 1,
      bed_size: roomData.bed_sizes[0]?.id || 1,
      number_of_beds: 1,
      number_of_rooms: 1,
      room_size: 10,
      smoking_allowed: false,
      total_rooms: 1,
      rooms_for_sale: 1,
      room_rate: roomData.room_rates[0]?.id || 1,
      extra_bed: roomData.extra_beds[0]?.id || 1,
      breakfast_option: roomData.breakfast_options[0]?.id || 1,
      features: [],
      images: [],
    });

    setIsAddingRoom(true);
  };

  // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewRoom(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // 🔹 Handle multi-select feature input
  const handleFeatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewRoom(prev => ({
      ...prev,
      features: Array.from(e.target.selectedOptions, option => Number(option.value)),
    }));
  };

  // 🔹 Handle form submission
  const handleCreateRoom = async () => {
    if (!number) return;
    if (!newRoom.room_number) {
      toast.error("Please enter a room number.");
      return;
    }

    try {
      console.log("Submitting:", JSON.stringify({ ...newRoom}));

      const response = await fetch('https://dev.kacc.mn/api/rooms/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  ...newRoom, }),
      });

      if (!response.ok) throw new Error('Failed to create room');

      const createdRoom = await response.json();
      setRooms(prev => [...prev, createdRoom]);

      toast.success('Room created successfully!');
      setIsAddingRoom(false);
    } catch (error) {
      toast.error(`Error: ${(error as Error).message}
`);
    }
  };

  return (
    <div className="">
      
      <ToastContainer className="relative z-[100]"  />
      {/* <h2 className="text-xl font-bold mb-4">Hotel ID: {number}</h2> */}

      <button onClick={handleOpenModal} className="hover:bg-background border-blue-500 border-solid border-[1px] text-blue-500  px-4 py-2 mt-4 rounded-md">
        Add Room
      </button>

 {isAddingRoom && (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
  <div className="bg-white p-6 rounded-md w-[600px]">
    <div className="flex justify-between mb-6">
      <div></div>
    <h3 className="text-lg font-bold mb-4">Create Room</h3>
    <button onClick={() => setIsAddingRoom(false)} className="text-red-500 text-2xl">
          <MdClose />
        </button>
    
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label>Room Number</label>
        <input type="number" className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, room_number: Number(e.target.value) })} />

        <label>Room Type</label>
        <select className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, room_type: Number(e.target.value) })}>
          {roomData?.room_types.map((type) => 
            <option key={type.id} value={type.id}>{type.name}</option>
          )}
        </select>

        <label>Bed Type</label>
        <select className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, bed_type: Number(e.target.value) })}>
          {roomData?.bed_types.map((type) => 
            <option key={type.id} value={type.id}>{type.name}</option>
          )}
        </select>

        <label>Number of Beds</label>
        <input type="number" className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, number_of_beds: Number(e.target.value) })} />

        <label>Total rooms</label>
        <input type="number" className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, total_rooms: Number(e.target.value) })} />

        <label>Room for sale</label>
        <input type="number" className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, rooms_for_sale: Number(e.target.value) })} />
      </div>

      <div>
        <label>Room Size (sqm)</label>
        <input type="number" className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, room_size: Number(e.target.value) })} />

        <label>Room Rate</label>
        <select className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, room_rate: Number(e.target.value) })}>
          {roomData?.room_rates.map((rate) => 
            <option key={rate.id} value={rate.id}>{rate.base_price}</option>
          )}
        </select>

        <label>Extra Bed</label>
        <select className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, extra_bed: Number(e.target.value) })}>
          {roomData?.extra_beds.map((bed) => 
            <option key={bed.id} value={bed.id}>{bed.has_extra_bed ? 'Yes' : 'No'}</option>
          )}
        </select>

        <label>Features</label>
        <select multiple className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, features: Array.from(e.target.selectedOptions, option => Number(option.value)) })}>
          {features.map((feature) => <option key={feature.pk} value={feature.pk}>{feature.name}</option>)}
        </select>

        <label>Smoking Allowed</label>
        <select className="w-full p-2 border mb-2" 
          onChange={(e) => setNewRoom({ ...newRoom, smoking_allowed: e.target.value === "true" })}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </div>

    <div className="flex justify-end mt-4">
      <button onClick={handleCreateRoom} className="bg-blue-500 text-white px-4 py-2 rounded-md">Save</button>

    </div>
  </div>
</div>

 
      )}
      <div className="mt-6">
  {/* <h3 className="text-lg font-bold mb-3">Room List</h3> */}
  <div className="overflow-x-auto rounded-[12px] border-blue-500 border-solid border-[1px]">
  <table className="min-w-full ">
    <thead className="border-b-gray-200 border-solid border-[1px]">
      <tr className=" ">
        <th className="px-4 py-2 ">Room #</th>
        <th className="px-4 py-2">Room Type</th>
        <th className="px-4 py-2">Bed Type</th>
        <th className="px-4 py-2">Bed Size</th>
        <th className="px-4 py-2">Number of Beds</th>
        <th className="px-4 py-2">Room Size</th>
        <th className="px-4 py-2">Smoking</th>
        <th className="px-4 py-2">Total Rooms</th>
        <th className="px-4 py-2">Rooms for Sale</th>
        <th className="px-4 py-2">Room Rate</th>
        <th className="px-4 py-2">Extra Bed</th>
        <th className="px-4 py-2">Breakfast</th>
        <th className="px-4 py-2  ] ">Features</th>
      </tr>
    </thead>
    <tbody>
      {rooms.length > 0 ? (
        rooms.map((room, index) => (
          <tr key={index} className="even:bg-background odd:bg-white hover:bg-blue-200">
            <td className="px-4 py-2">{room.room_number}</td>
            <td className="px-4 py-2">{roomData?.room_types.find(type => type.id === room.room_type)?.name || 'N/A'}</td>
            <td className="px-4 py-2">{roomData?.bed_types.find(type => type.id === room.bed_type)?.name || 'N/A'}</td>
            <td className="px-4 py-2">{roomData?.bed_sizes.find(size => size.id === room.bed_size)?.size || 'N/A'}</td>
            <td className="px-4 py-2">{room.number_of_beds}</td>
            <td className="px-4 py-2">{room.room_size} sqm</td>
            <td className="px-4 py-2">{room.smoking_allowed ? 'Yes' : 'No'}</td>
            <td className="px-4 py-2">{room.total_rooms}</td>
            <td className="px-4 py-2">{room.rooms_for_sale}</td>
            <td className="px-4 py-2">{roomData?.room_rates.find(rate => rate.id === room.room_rate)?.base_price || 'N/A'}</td>
            <td className="px-4 py-2">{roomData?.extra_beds.find(bed => bed.id === room.extra_bed)?.has_extra_bed ? 'Yes' : 'No'}</td>
            <td className="px-4 py-2">{roomData?.breakfast_options.find(option => option.id === room.breakfast_option)?.option || 'N/A'}</td>
            <td className="px-4 py-2">
              {room.features.map(featureId => features.find(f => f.pk === featureId)?.name).join(', ') || 'None'}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={13} className="px-4 py-2 text-center">No rooms available</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

</div>


    </div>
  );
}
