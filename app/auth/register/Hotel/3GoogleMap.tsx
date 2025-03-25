'use client';

import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaRegistration } from '../../../schema';
import { z } from 'zod';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

const DefaultLocation = { lat: 47.918873, lng: 106.917017 };
const DefaultZoom = 10;

type FormFields = z.infer<typeof schemaRegistration>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel2({ onNext, onBack }: Props) {
  const [location, setLocation] = useState(DefaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaRegistration),
  });

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    console.log(data);
    toast.success('Form data saved. Moving to the next step.');
    onNext();
  };

  return (
 <div className="flex justify-center items-center ">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Google map</h2>

     

      

      

        <div className="flex gap-x-4">
<button
          onClick={onBack}
          className="w-full flex justify-center  mt-[35px] text-black py-3 hover:bg-bg px-4  border-primary border-[1px] border-solid font-semibold rounded-[15px]"
      
        >
      <div className="flex ">  <FaArrowLeft className="self-center mx-1" />   Буцах</div> 
    
        
          </button>
          <button
            onClick={onNext}
          className="w-full flex justify-center  mt-[35px] text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
     
        >
     <div className="flex">    Дараах
          <FaArrowRight className=" self-center mx-1" />
          </div> 
        </button>
        </div>
      </form>
    </div>
  );
}
