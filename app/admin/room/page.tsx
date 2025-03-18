'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaCreateRoom } from '@/app/schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import Cookies from 'js-cookie';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/all-data/';
const API_CREATE_ROOM = 'https://dev.kacc.mn/api/roomsNew/';

interface RoomType {
  id: number;
  name: string;
  is_custom: boolean
}

interface BedType {
  id: number;
  name: string;
  is_custom: boolean;
}

interface Facility {
  id: number;
  name_en: string;
}
interface Bathroom_items{
  id: number;
  name_en:string;
  name_mn:string;
}
interface free_Toiletries{
  id: number;
  name_en:string;
  name_mn:string;
}
interface food_and_drink{
  id: number;
  name_en:string;
  name_mn:string;
}
interface outdoor_and_view{
  id: number;
  name_en:string;
  name_mn:string;
}

interface CombinedData {
  roomTypes: RoomType[];
  bedTypes: BedType[];
  facilities: Facility[];
  bathroom_items:Bathroom_items[];
  free_Toiletries: free_Toiletries[];
  food_and_drink : food_and_drink[];
  outdoor_and_view : outdoor_and_view[];
  
}

type FormFields = z.infer<typeof schemaCreateRoom>;

export default function RegisterRoom() {
  const [combinedData, setCombinedData] = useState<CombinedData>({
    roomTypes: [],
    bedTypes: [],
    facilities: [],
    bathroom_items: [],
    free_Toiletries :[],
    food_and_drink: [],
    outdoor_and_view: [],
  });


  // Retrieve hotel ID from localStorage
  const getHotelId = (): string | null => {
    try {
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      return propertyData?.property?.id || null;
    } catch (error) {
      console.error('Error parsing hotel ID:', error);
      return null;
    }
  };

  const hotelId = getHotelId();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaCreateRoom),
    defaultValues: {
      // token: localStorage.getItem('token') || '',
      // hotel: hotelId || "",
      room_type: "",
      room_category: "",
      room_size: "",
      bed_type: "",
      number_of_rooms: "",
      number_of_rooms_to_sell: "",
      room_Description: "",
      smoking_allowed: false,
      RoomNo: "",
      room_Facilities: [],
      is_Bathroom: false,
      bathroom_Items: [],
      free_Toiletries :[],
      food_And_Drink: [],
      outdoor_And_View: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_COMBINED_DATA);
        const data = await response.json();
        setCombinedData({
          roomTypes: data.room_types || [],
          bedTypes: data.bed_types || [],
          facilities: data.room_facilities || [],
          bathroom_items: data.bathroom_items || [],
          free_Toiletries: data.free_toiletries || [],
          food_and_drink : data. food_and_drink || [],
          outdoor_and_view : data.outdoor_and_view || [],
        });
      } catch (error) {
        console.error('Error fetching combined data:', error);
        toast.error('Failed to fetch room data.');
      }
    };

    fetchData();
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (formData) => {
    
    console.log("Submitting form with:", formData);
    console.log("Validation Errors:", JSON.stringify(errors));
    Object.entries(errors).forEach(([key, value]) => {
      console.log(`Field: ${key}`, value);
    });
    
  
    let roomNumbers = formData.RoomNo
    .split(',')
    .map(num => parseInt(num.trim(), 10))
    .filter(num => !isNaN(num)); // Remove invalid values

  if (roomNumbers.length === 0) {
    toast.error("Enter at least one valid room number.");
    return;
  }



 

    try {
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const hotel = propertyData?.property;
      const token= Cookies.get('token');
      const transformedData = {
        token: token || '',
        hotel: hotel || 0,
        room_number: Number(formData.room_number),
        room_type: Number(formData.room_type),
        room_category: Number(formData.room_category),
        room_size: parseFloat(formData.room_size.toString()),
        bed_type: Number(formData.bed_type),
        is_Bathroom: formData.is_Bathroom,
        room_Facilities: formData.room_Facilities?.map(Number) || [],
        bathroom_Items: formData.bathroom_Items?.map(Number) || [],
        free_Toiletries: formData.free_Toiletries?.map(Number) || [],
        food_And_Drink: formData.food_And_Drink?.map(Number) || [],
        outdoor_And_View: formData.outdoor_And_View?.map(Number) || [],
        number_of_rooms: parseInt(formData.number_of_rooms.toString()),
        number_of_rooms_to_sell: parseInt(formData.number_of_rooms_to_sell.toString()),
        room_Description: formData.room_Description,
        smoking_allowed: formData.smoking_allowed,
        RoomNo: roomNumbers, // Now it's a valid array of numbers
      };
      console.log("Transformed Data:", transformedData);
    
      const response = await fetch(API_CREATE_ROOM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Store submitted data in localStorage
        const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
        propertyData.roomDetails = responseData.id;
        localStorage.setItem('propertyData', JSON.stringify(propertyData));

        toast.success('Room registered successfully!');
      
      } else {
        const errorData = await response.json();
        console.log(errorData);
        toast.error(errorData || 'Room registration failed.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while registering the room.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen h-full py-[100px] rounded-[12px]">
      <ToastContainer />
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-white border rounded-lg">
  <ToastContainer />
  <h2 className="text-lg font-bold text-center">Room Registration</h2>

  {/* Room Number */}
  <div className="mb-4">
    <label>Room Number</label>
    <input type="text" {...register('room_number')} className="border p-2 w-full" />
    {errors.room_number && <span className="text-red-500">{errors.room_number.message}</span>}
  </div>


  {/* Room Type */}
  <div className="mb-4">
    <label>Room Type</label>
    <select {...register('room_type')} className="border p-2 w-full">
      {combinedData.roomTypes.map((type) => (
        <option key={type.id} value={type.id}>{type.name}</option>
      ))}
    </select>
    {errors.room_type && <span className="text-red-500">{errors.room_type.message}</span>}
  </div>


  {/* Room Category */}
  <div className="mb-4">
  <label>Room Category</label>
    <input type="text" {...register('room_category')} className="border p-2 w-full" />
    {errors.room_category && <span className="text-red-500">{errors.room_category.message}</span>}
  </div>


  {/* Room Size */}
  <div className="mb-4">
    <label>Room Size (sqm)</label>
    <input type="string" step="0.1" {...register('room_size')} className="border p-2 w-full" />
    {errors.room_size && <span className="text-red-500">{errors.room_size.message}</span>}
  </div>


  {/* Bed Type */}
  <div className="mb-4">
    <label>Bed Type</label>
    <select {...register('bed_type')} className="border p-2 w-full">
      {combinedData.bedTypes.map((type) => (
        <option key={type.id} value={type.id}>{type.name}</option>
      ))}
    </select>
    {errors.bed_type && <span className="text-red-500">{errors.bed_type.message}</span>}
  </div>


  {/* Smoking Allowed */}
  <div className="mb-4">
    <label className="flex items-center space-x-2">
      <input type="checkbox" {...register('smoking_allowed')} />
      <span>Smoking Allowed</span>
    </label>
    {errors.smoking_allowed && <span className="text-red-500">{errors.smoking_allowed.message}</span>}
  </div>


  {/* Is Bathroom */}
  <div className="mb-4">
    <label className="flex items-center space-x-2">
      <input type="checkbox" {...register('is_Bathroom')}  onChange={(e) => setValue("is_Bathroom", e.target.checked)} />
      <span>Has Bathroom</span>
    </label>
    {errors.is_Bathroom && <span className="text-red-500">{errors.is_Bathroom.message}</span>}
  </div>
 

  {/* Room Description */}
  <div className="mb-4">
    <label>Room Description</label>
    <textarea {...register('room_Description')} className="border p-2 w-full"></textarea>
    {errors.room_Description && <span className="text-red-500">{errors.room_Description.message}</span>}
  </div>

  {/* Room Facilities */}
  <div className="mb-4">
    <label>Room Facilities</label>
    <div className="flex flex-wrap gap-2">
      {combinedData.facilities.map((fac) => (
        <label key={fac.id} className="flex items-center space-x-2">
          <input type="checkbox" value={fac.id} {...register('room_Facilities')} />
          <span>{fac.name_en}</span>
        </label>
      ))}
    </div>
    {errors.room_Facilities && <span className="text-red-500">{errors.room_Facilities.message}</span>}
  </div>


  {/* Bathroom Items */}
  <div className="mb-4">
    <label>Bathroom Items</label>
    <div className="flex flex-wrap gap-2">
      {combinedData.bathroom_items.map((item) => (
        <label key={item.id} className="flex items-center space-x-2">
          <input type="checkbox" value={item.id} {...register('bathroom_Items')} />
          <span>{item.name_en}</span>
        </label>
      ))}
    </div>
    {errors.bathroom_Items && <span className="text-red-500">{errors.bathroom_Items.message}</span>}

  </div>

  {/* Free Toiletries */}
  <div className="mb-4">
    <label>Free Toiletries</label>
    <div className="flex flex-wrap gap-2">
      {combinedData.free_Toiletries.map((item) => (
        <label key={item.id} className="flex items-center space-x-2">
          <input type="checkbox" value={item.id} {...register('free_Toiletries')} />
          <span>{item.name_en}</span>
        </label>
      ))}
    </div>
    {errors.free_Toiletries && <span className="text-red-500">{errors.free_Toiletries.message}</span>}
  </div>


  {/* Food and Drink */}
  <div className="mb-4">
    <label>Food and Drink</label>
    <div className="flex flex-wrap gap-2">
      {combinedData.food_and_drink.map((item) => (
        <label key={item.id} className="flex items-center space-x-2">
          <input type="checkbox" value={item.id} {...register('food_And_Drink')} />
          <span>{item.name_en}</span>
        </label>
      ))}
    </div>
    {errors.food_And_Drink && <span className="text-red-500">{errors.food_And_Drink.message}</span>}
  </div>


  {/* Outdoor and View */}
  <div className="mb-4">
    <label>Outdoor and View</label>
    <div className="flex flex-wrap gap-2">
      {combinedData.outdoor_and_view.map((item) => (
        <label key={item.id} className="flex items-center space-x-2">
          <input type="checkbox" value={item.id} {...register('outdoor_And_View')} />
          <span>{item.name_en}</span>
        </label>
      ))}
    </div>
    {errors.outdoor_And_View && <span className="text-red-500">{errors.outdoor_And_View.message}</span>}
  </div>

  {/* Number of Rooms */}
  <div className="mb-4">
    <label>Number of Rooms</label>
    <input type="number" {...register('number_of_rooms')} className="border p-2 w-full" />
    {errors.number_of_rooms && <span className="text-red-500">{errors.number_of_rooms.message}</span>}
  </div>

  {/* Number of Rooms to Sell */}
  <div className="mb-4">
    <label>Number of Rooms to Sell</label>
    <input type="number" {...register('number_of_rooms_to_sell')} className="border p-2 w-full" />
    {errors.number_of_rooms_to_sell && <span className="text-red-500">{errors.number_of_rooms_to_sell.message}</span>}
  </div>

  {/* Room Numbers */}
  <div className="mb-4">
    <label>Room Numbers (comma-separated)</label>
    <input
      type="text"
    {...register('RoomNo')}
      className="border p-2 w-full"
      placeholder="E.g. 342, 343"
    />
        {errors.RoomNo && <span className="text-red-500">{errors.RoomNo.message}</span>}
  </div>

  <div className="flex justify-between">
    {/* <button type="button" onClick={onBack} className="border px-4 py-2">Back</button> */}
    <button type="submit" disabled={isSubmitting} className="border px-4 py-2">Next</button>
  </div>
</form>

    </div>
  );
}
