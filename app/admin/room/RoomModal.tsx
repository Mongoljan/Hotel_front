'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { schemaCreateRoom } from '@/app/schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowRight, FaArrowLeft, FaTrash, FaPlus } from "react-icons/fa6";
import Cookies from 'js-cookie';
import { IoIosCloseCircleOutline } from "react-icons/io";
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

interface room_category{
    id: number;
    name: string;
    is_custom: boolean;
}

interface CombinedData {
  roomTypes: RoomType[];
  bedTypes: BedType[];
  facilities: Facility[];
  bathroom_items:Bathroom_items[];
  free_Toiletries: free_Toiletries[];
  food_and_drink : food_and_drink[];
  outdoor_and_view : outdoor_and_view[];
  room_category: room_category[];
  
}

type FormFields = z.infer<typeof schemaCreateRoom>;

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    isRoomAdded: boolean,
    setIsRoomAdded: (value: boolean) => void;
  }
  

export default function RegisterRoom({ isOpen, onClose, isRoomAdded, setIsRoomAdded} : RoomModalProps) {
    const [step, setStep] = useState(1);
    const isBathroomTrue = true;
    const isBathroomFalse = false
  const [combinedData, setCombinedData] = useState<CombinedData>({
    roomTypes: [],
    bedTypes: [],
    facilities: [],
    bathroom_items: [],
    free_Toiletries :[],
    food_and_drink: [],
    outdoor_and_view: [],
    room_category : [],
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


    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result as string;
          setValue(`entries.${index}.images`, base64Image);
        };
        reader.readAsDataURL(file);
      }
    };
  



  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
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
      number_of_rooms: 0,
      number_of_rooms_to_sell: "",
      room_Description: "",
      smoking_allowed: "",
      RoomNo: "",
      room_Facilities: [],
      is_Bathroom: "",
      bathroom_Items: [],
      free_Toiletries :[],
      food_And_Drink: [],
      outdoor_And_View: [],
      entries: [{ images: '', descriptions: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entries',
  });
  const watchedEntries = watch('entries');

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
          room_category: data.room_category || [],
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

      const token= Cookies.get('token');
      const hotel = Cookies.get('hotel');
      const hotel1= propertyData.property;
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

   
      const transformedData = {
        token: token ,
        hotel: userInfo?.hotel,
        room_number: 0,
        room_type: Number(formData.room_type),
        room_category: Number(formData.room_category),
        room_size: parseFloat(formData.room_size.toString()),
        bed_type: Number(formData.bed_type),
        is_Bathroom: Boolean(formData.is_Bathroom),
        room_Facilities: formData.room_Facilities?.map(Number) || [],
        bathroom_Items: formData.bathroom_Items?.map(Number) || [],
        free_Toiletries: formData.free_Toiletries?.map(Number) || [],
        food_And_Drink: formData.food_And_Drink?.map(Number) || [],
        outdoor_And_View: formData.outdoor_And_View?.map(Number) || [],
        number_of_rooms: parseInt(formData.number_of_rooms.toString()),
        number_of_rooms_to_sell: parseInt(formData.number_of_rooms_to_sell.toString()),
        room_Description: formData.room_Description,
        smoking_allowed: Boolean(formData.smoking_allowed),
        RoomNo: roomNumbers, // Now it's a valid array of numbers
        images: formData.entries.map(entry => ({
          image: entry.images,
          description: entry.descriptions,
        }))
      };
      console.log("Transformed Data:", transformedData);
    
      const response = await fetch(API_CREATE_ROOM, {
        // credentials: 'include',    
        method: 'POST',
        headers: {
        
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        setIsRoomAdded(true);
     
        
        const responseData = await response.json();

        // Store submitted data in localStorage
        const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
        propertyData.roomDetails = responseData.id;
        localStorage.setItem('propertyData', JSON.stringify(propertyData));

        toast.success('Room registered successfully!');
        setTimeout(() => {
            onClose();
          }, 2000);
      
      } else {
        const errorData = await response.json();
        console.log("here is error data:" ,errorData);
        toast.error(errorData?.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred while registering the room.');
      console.error(' Error in Room modal:', error);
    }
  };
  if (!isOpen) return null;
  return (
 
    <div onClick={onClose}   className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[150] `}>


      <form onSubmit={handleSubmit(onSubmit)}  onClick={(e) => e.stopPropagation()} className="p-6 bg-white border max-w-[60%] w-full max-h-[80vh] overflow-y-auto rounded-lg shadow-lg relative">
     <ToastContainer className="mt-10" />
     <div className="flex justify-between mb-2"> 
     <h2 className="text-lg font-bold text-center">Өрөө нэмэх</h2>
        <button onClick={onClose}> <IoIosCloseCircleOutline className="text-3xl text-black hover:text-primary " /></button>
     </div>
 

{/* Header */}
  <section className="mb-5">


 
  {step === 1 &&
  <div className="flex rounded-[10px]">
  <div className="h-1 w-1/2 rounded-[10px] bg-blue-500"></div>
  <div className="h-1 w-1/2 rounded-r-[10px] bg-gray-200"></div>
  </div>
}
{step === 2 &&
  <div className="flex rounded-[10px]">
      <div className="h-1 w-1/2 rounded-r-[10px] bg-gray-200"></div>
  <div className="h-1 w-1/2  rounded-[10px] bg-blue-500"></div>
 
  </div>
}
</section>

  {step === 1 && (
    <div>

<section className="flex justify-between ">
<div className="mb-4 w-[45%] rounded-[10px] ">
    <label>Room Type</label>
    <select {...register('room_type')} className="border  rounded-[10px] p-2 w-full">
      {combinedData.roomTypes.map((type) => (
        <option key={type.id} value={type.id}>{type.name}</option>
      ))}
    </select>
    {errors.room_type && <span className="text-red">{errors.room_type.message}</span>}
  </div>

<div className="mb-4 w-[45%]"> 
    <label>Room Category</label>
    <select {...register('room_category')} className="border  rounded-[10px] p-2 w-full">
      {combinedData.room_category.map((type) => (
        <option key={type.id} value={type.id}>{type.name}</option>
      ))}
    </select>
    {errors.room_category && <span className="text-red">{errors.room_category.message}</span>}
  </div>
  </section>

<section className="flex justify-between ">
  <div className="mb-4 w-[45%] rounded-[10px]">
    <label>Room Size (sqm)</label>
    <input type="string" step="0.1" {...register('room_size')} className="border rounded-sd p-2 w-full" />
    {errors.room_size && <span className="text-red">{errors.room_size.message}</span>}
  </div>

  <div className="w-[45%] rounded-[10px]"> Өрөөнд орох боломжтой хүний тоог оруулна уу?</div>


  </section>
  

<section className="flex justify-between">
<div className="mb-4 w-[45%]">
    <label>Bed Type</label>
    <select {...register('bed_type')} className="border rounded-sd p-2 w-full">
      {combinedData.bedTypes.map((type) => (
        <option key={type.id} value={type.id}>{type.name}</option>
      ))}
    </select>
    {errors.bed_type && <span className="text-red">{errors.bed_type.message}</span>}
  </div>
 

  <div className="mb-4 w-[45%]">
  <label className="block font-medium">Өрөөнд ариун цэврийн өрөө байгаа эсэх</label>
  <div className="flex justify-between mx-6 mt-2">
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        {...register('is_Bathroom', { required: "Энэ талбарыг бөглөнө үү" })}
        value="true"
        className="hidden peer"
      />
      <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-2 py-1 rounded-lg transition duration-300">Тийм</span>
    </label>

    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        {...register('is_Bathroom', { required: "Энэ талбарыг бөглөнө үү" })}
        value="false"
        className="hidden peer"
      />
      <span className="peer-checked:bg-blue-500 peer-checked:text-white border border-gray-300 px-2 py-1 rounded-lg transition duration-300">Үгүй</span>
    </label>
  </div>
  {errors.is_Bathroom && <span className="text-red">{errors.is_Bathroom.message}</span>}
</div>





 
  </section>

  <section className=" w-1/2">
    <h2 className="text-2xl font-bold text-center mb-6">Property Images</h2>
   
           {fields.map((field, index) => (
             <div key={field.id} className="mb-4 border p-4 rounded-lg">
               <section className="mb-2">
                 <label className="text-black">Upload Image</label>
                 <input
                   type="file"
                   accept="image/*"
                   onChange={(e) => handleImageChange(e, index)}
                   className="border p-2 w-full rounded-[15px]"
                 />
                 {errors.entries?.[index]?.images && (
                   <div className="text-red text-sm">{errors.entries[index]?.images?.message}</div>
                 )}
               </section>
   
               <section className="mb-2">
                 <label className="text-black">Description</label>
                 <input
                   type="text"
                   {...register(`entries.${index}.descriptions`)}
                   className="border p-2 w-full rounded-[15px]"
                 />
                 {errors.entries?.[index]?.descriptions && (
                   <div className="text-red text-sm">{errors.entries[index]?.descriptions?.message}</div>
                 )}
                  {watchedEntries?.[index]?.images && (
        <img
          src={watchedEntries[index].images}
          alt={`Room image ${index + 1}`}
          className="mt-2 max-h-20 w-auto rounded-md border"
        />
      )}
               </section>
   
               <button
                 type="button"
                 onClick={() => remove(index)}
                 className="flex items-center justify-center w-full text-red border border-red-500 rounded-lg p-2 mt-2"
               >
                 <FaTrash className="mr-2" /> Remove
               </button>
             </div>
           ))}
   
           <button
             type="button"
             onClick={() => append({ images: '', descriptions: '' })}
             className="w-full flex justify-center text-black py-2 border border-primary rounded-lg mb-4"
           >
             <FaPlus className="mr-2" /> Add More
           </button>
   
  </section>
  

  <section className="flex justify-between">

  <div className="mb-4 w-[45%]">
    <label>Number of Rooms</label>
    <input type="number" min="0" placeholder='0'  {...register('number_of_rooms')} className="border rounded-sd p-2 w-16 block" />
    {errors.number_of_rooms && <span className="text-red">{errors.number_of_rooms.message}</span>}
  </div>

  <div className="mb-4 w-[45%]">
    <label>Number of Rooms to Sell</label>
    <input type="number" min="0"  placeholder='0' {...register('number_of_rooms_to_sell')} className="border p-2 rounded-sd w-16 block" />
    {errors.number_of_rooms_to_sell && <span className="text-red">{errors.number_of_rooms_to_sell.message}</span>}
  </div>

  </section>

<section>
  <div className="mb-4 ">
    <label>Өрөөний дугаарууд (таслалаар тусгаарлан оруулна уу?)</label>
    <input
      type="text"
    {...register('RoomNo')}
      className="border p-2 w-full rounded-sd"
      placeholder="E.g. 342, 343"
    />
        {errors.RoomNo && <span className="text-red">{errors.RoomNo.message}</span>}
  </div>

  </section>
  
  {/* <div className="mb-4 ">
    <label>Room Number</label>
    <input type="text" {...register('room_number')} className="border p-2 w-full" />
    {errors.room_number && <span className="text-red">{errors.room_number.message}</span>}
  </div> */}



  <div className="mb-4 w-1/2">

  <label className="block font-medium mb-2">Smoking Allowed</label>

  <div className="flex gap-20">
    {/* Smoking Allowed - Yes */}
    <input
      type="radio"
      {...register('smoking_allowed', { required: "Энэ талбарыг бөглөнө үү" })}
      value="true"
      id="smoking-yes"
      className="hidden peer/smoking-yes"
    />
    <label
      htmlFor="smoking-yes"
      className="peer-checked/smoking-yes:bg-blue-500 peer-checked/smoking-yes:text-white 
               border border-gray-400 px-2 py-1 rounded-md transition duration-300 
               cursor-pointer inline-block text-center"
    >
      Тийм
    </label>

    {/* Smoking Allowed - No */}
    <input
      type="radio"
      {...register('smoking_allowed', { required: "Энэ талбарыг бөглөнө үү" })}
      value="false"
      id="smoking-no"
      className="hidden peer/smoking-no"
    />
    <label
      htmlFor="smoking-no"
      className="peer-checked/smoking-no:bg-blue-500 peer-checked/smoking-no:text-white 
               border border-gray-400 px-2 py-1 rounded-md transition duration-300 
               cursor-pointer inline-block text-center"
    >
      Үгүй
    </label>
  </div>

  {errors.smoking_allowed && <span className="text-red block mt-1">{errors.smoking_allowed.message}</span>}
</div>





<div className="flex justify-end">
  <button type="button" onClick={() => setStep(2)} className="rounded-sm bg-white border border-solid font-semibold text-xs border-primary hover:border-blue-400 transition-colors flex items-center justify-center hover:blue-100  sm:text-base h-7 sm:h-8 px-1 sm:px-1 sm:min-w-24 text-black  hover:bg-background">Next</button>
  
  </div></div>
  
)}

{step === 2 && (
    <div>
        <section className="flex justify-between">
  {/* Room Facilities */}
  <div className="mb-4 w-[45%]">
    <label>Room Facilities</label>
    <div className="border p-2 rounded-md max-h-60 overflow-y-auto flex flex-col gap-2">
      {combinedData.facilities.map((fac) => (
        <label key={fac.id} className="flex items-center space-x-2">
          <input type="checkbox" value={fac.id} {...register('room_Facilities')} />
          <span>{fac.name_en}</span>
        </label>
      ))}
    </div>
    {errors.room_Facilities && <span className="text-red">{errors.room_Facilities.message}</span>}
  </div>

  {/* Bathroom Items */}
  <div className="mb-4 w-[45%]">
    <label>Bathroom Items</label>
    <div className="border p-2 rounded-md max-h-60 overflow-y-auto flex flex-col gap-2">
      {combinedData.bathroom_items.map((item) => (
        <label key={item.id} className="flex items-center space-x-2">
          <input type="checkbox" value={item.id} {...register('bathroom_Items')} />
          <span>{item.name_en}</span>
        </label>
      ))}
    </div>
    {errors.bathroom_Items && <span className="text-red">{errors.bathroom_Items.message}</span>}
  </div>
</section>

<div className="mb-4">
  <label className="block mb-2 font-medium">Free Toiletries</label>
  <div className="flex flex-wrap gap-2">
    {combinedData.free_Toiletries.map((item) => (
      <div key={item.id}>
        <input
          type="checkbox"
          value={item.id}
          id={`freeToiletry-${item.id}`}
          {...register('free_Toiletries')}
          className="peer hidden"
        />
        <label
          htmlFor={`freeToiletry-${item.id}`}
          className="peer-checked:bg-blue-500 peer-checked:text-white 
                     flex items-center justify-center border rounded-lg 
                     px-2 py-2 cursor-pointer bg-gray-100 text-gray-800 
                     transition duration-300 hover:bg-blue-300 text-sm"
        >
          {item.name_en}
        </label>
      </div>
    ))}
  </div>
  {errors.free_Toiletries && <span className="text-red">{errors.free_Toiletries.message}</span>}
</div>



 
<div className="mb-4">
  <label className="block mb-2 font-medium">Outdoor and View</label>
  <div className="flex flex-wrap gap-2">
    {combinedData.outdoor_and_view.map((item) => (
      <div key={item.id}>
        {/* Hidden Checkbox */}
        <input
          type="checkbox"
          value={item.id}
          id={`outdoorAndView-${item.id}`}
          {...register('outdoor_And_View')}
          className="peer hidden"
        />
        {/* Styled Label as Button */}
        <label
          htmlFor={`outdoorAndView-${item.id}`}
          className="peer-checked:bg-blue-500 peer-checked:text-white 
                     flex items-center justify-center border rounded-lg 
                     px-4 py-2 cursor-pointer bg-gray-100 text-gray-800 
                     transition duration-300 hover:bg-blue-300"
        >
          {item.name_en}
        </label>
      </div>
    ))}
  </div>
  {errors.outdoor_And_View && <span className="text-red">{errors.outdoor_And_View.message}</span>}
</div>

<div className="mb-4">
  <label className="block mb-2 font-medium">Food and Drink</label>
  <div className="flex flex-wrap gap-2">
    {combinedData.food_and_drink.map((item) => (
      <div key={item.id}>
        {/* Hidden Checkbox */}
        <input
          type="checkbox"
          value={item.id}
          id={`foodAndDrink-${item.id}`}
          {...register('food_And_Drink')}
          className="peer hidden"
        />
        {/* Styled Label as Button */}
        <label
          htmlFor={`foodAndDrink-${item.id}`}
          className="peer-checked:bg-blue-500 peer-checked:text-white 
                     flex items-center justify-center border rounded-lg 
                     px-4 py-2 cursor-pointer bg-gray-100 text-gray-800 
                     transition duration-300 hover:bg-blue-300"
        >
          {item.name_en}
        </label>
      </div>
    ))}
  </div>
  {errors.food_And_Drink && <span className="text-red">{errors.food_And_Drink.message}</span>}
</div>
<div className="mb-4">
    <label>Room Description</label>
    <textarea {...register('room_Description')} className="border p-2 w-full"></textarea>
    {errors.room_Description && <span className="text-red">{errors.room_Description.message}</span>}
  </div>


  

 
  
  <div className="flex justify-between">
  <button type="button" onClick={() => setStep(1)} className="rounded-sm bg-white border border-solid font-semibold text-xs border-primary hover:border-blue-400 transition-colors flex items-center justify-center hover:blue-100  sm:text-base h-7 sm:h-8 px-1 sm:px-1 sm:min-w-24 text-black  hover:bg-background">Back</button>
   
    <button type="submit" disabled={isSubmitting} className="rounded-sm bg-white border border-solid font-semibold text-xs border-primary hover:border-blue-400 transition-colors flex items-center justify-center hover:blue-100  sm:text-base h-7 sm:h-8 px-1 sm:px-1 sm:min-w-24 text-black  hover:bg-background">Submit</button>
  </div>
  </div>
)}
</form>
</div>

  );
}
