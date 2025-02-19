'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { schemaHotelSteps6 } from '../../../schema';
import { z } from 'zod';

const API_PROPERTY_DETAILS = 'https://dev.kacc.mn/api/property-details/';
const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';

type FormFields = z.infer<typeof schemaHotelSteps6>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel6({ onNext, onBack }: Props) {
  const [facilities, setFacilities] = useState<{ id: number; name_en: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps6),
    defaultValues: {
      google_map: '',
      parking_situation: '',
      general_facilities: [],
    },
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(API_COMBINED_DATA);
        const data = await response.json();
        setFacilities(data.facilities);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      }
    };

    fetchFacilities();
  }, []);

  const onSubmit: SubmitHandler<FormFields> = async (formData) => {
    console.log('Form submission triggered');
    try {
      console.log('Form Data:', formData);
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const requestBody = {
        propertyBasicInfo: propertyData.propertyBasicInfo,
        confirmAddress: propertyData.confirmAddress,
        propertyPolicies: propertyData.propertyPolicies,
        google_map: formData.google_map,
        parking_situation: formData.parking_situation,
        property: propertyData.property,
        general_facilities: formData.general_facilities.map(Number),
        property_photos: propertyData.property_photos,
      };

      console.log('Submitting Request:', requestBody);

      const response = await fetch(API_PROPERTY_DETAILS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Success:', responseData);
        toast.success('Property details saved successfully!');
        onNext();
      } else {
        console.error('Failed Response:', responseData);
        toast.error(responseData.message || 'Saving property details failed.');
      }
    } catch (error: any) {
      console.error('Unexpected Error:', error);
      toast.error('An unexpected error occurred while saving property details.');
    }
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Final Property Details</h2>

        <section className="mb-4">
          <label className="text-black">Google Map URL</label>
          <input
            type="url"
            {...register('google_map')}
            className="border p-2 w-full rounded-[15px]"
            required
          />
          {errors.google_map && (
            <div className="text-red-500 text-sm">{errors.google_map.message}</div>
          )}
        </section>

        <section className="mb-4">
          <label className="text-black">Parking Situation</label>
          <input
            type="text"
            {...register('parking_situation')}
            className="border p-2 w-full rounded-[15px]"
            required
          />
          {errors.parking_situation && (
            <div className="text-red-500 text-sm">{errors.parking_situation.message}</div>
          )}
        </section>

        <section className="mb-4">
          <label className="text-black">General Facilities</label>
          {facilities.map((facility) => (
            <div key={facility.id} className="flex items-center">
              <input
                type="checkbox"
                value={facility.id}
                {...register('general_facilities')}
                className="mr-2"
              />
              <label>{facility.name_en}</label>
            </div>
          ))}
          {errors.general_facilities && (
            <div className="text-red-500 text-sm">{errors.general_facilities.message}</div>
          )}
        </section>

        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <FaArrowLeft className="self-center mx-1" /> Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            Submit <FaArrowRight className="self-center mx-1" />
          </button>
        </div>
      </form>
    </div>
  );
} 
