'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { schemaHotelSteps3 } from '../../../schema';
import { z } from 'zod';

const API_PROPERTY_POLICIES = 'https://dev.kacc.mn/api/property-policies/';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel3({ onNext, onBack }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps3),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const formattedData = {
      cancellation_fee: {
        cancel_time: data.cancel_time,
        before_fee: data.before_fee,
        after_fee: data.after_fee,
        subsequent_days_percentage: data.subsequent_days_percentage,
        special_condition_percentage: data.special_condition_percentage,
      },
      check_in_from: data.check_in_from,
      check_in_until: data.check_in_until,
      check_out_from: data.check_out_from,
      check_out_until: data.check_out_until,
      breakfast_policy: data.breakfast_policy,
      allow_children: data.allow_children,
      allow_pets: data.allow_pets,
    };

    try {
      const response = await fetch(API_PROPERTY_POLICIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        const responseData = await response.json();
        const propertyPoliciesId = responseData.id;

        const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
        propertyData.propertyPolicies = propertyPoliciesId;
        localStorage.setItem('propertyData', JSON.stringify(propertyData));

        toast.success('Property policies saved successfully!');
        onNext();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Saving property policies failed.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while saving property policies.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Property Policies</h2>

        <section className="mb-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">Cancel Time</label>
              <input type="time" {...register('cancel_time')} className="border p-2 w-full rounded-[15px]" />
              {errors.cancel_time && <div className="text-red-500 text-sm">{errors.cancel_time.message}</div>}
            </div>

            <div className="w-1/2">
              <label className="text-black">Before Fee (%)</label>
              <input type="text" {...register('before_fee')} className="border p-2 w-full rounded-[15px]" />
              {errors.before_fee && <div className="text-red-500 text-sm">{errors.before_fee.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">After Fee (%)</label>
              <input type="text" {...register('after_fee')} className="border p-2 w-full rounded-[15px]" />
              {errors.after_fee && <div className="text-red-500 text-sm">{errors.after_fee.message}</div>}
            </div>

            <div className="w-1/2">
              <label className="text-black">Subsequent Days (%)</label>
              <input type="text" {...register('subsequent_days_percentage')} className="border p-2 w-full rounded-[15px]" />
              {errors.subsequent_days_percentage && <div className="text-red-500 text-sm">{errors.subsequent_days_percentage.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <label className="text-black">Special Condition (%)</label>
          <input type="text" {...register('special_condition_percentage')} className="border p-2 w-full rounded-[15px]" />
          {errors.special_condition_percentage && <div className="text-red-500 text-sm">{errors.special_condition_percentage.message}</div>}
        </section>

        <section className="mb-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">Check-in From</label>
              <input type="time" {...register('check_in_from')} className="border p-2 w-full rounded-[15px]" />
              {errors.check_in_from && <div className="text-red-500 text-sm">{errors.check_in_from.message}</div>}
            </div>

            <div className="w-1/2">
              <label className="text-black">Check-in Until</label>
              <input type="time" {...register('check_in_until')} className="border p-2 w-full rounded-[15px]" />
              {errors.check_in_until && <div className="text-red-500 text-sm">{errors.check_in_until.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">Check-out From</label>
              <input type="time" {...register('check_out_from')} className="border p-2 w-full rounded-[15px]" />
              {errors.check_out_from && <div className="text-red-500 text-sm">{errors.check_out_from.message}</div>}
            </div>

            <div className="w-1/2">
              <label className="text-black">Check-out Until</label>
              <input type="time" {...register('check_out_until')} className="border p-2 w-full rounded-[15px]" />
              {errors.check_out_until && <div className="text-red-500 text-sm">{errors.check_out_until.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <label className="text-black">Breakfast Policy (%)</label>
          <input type="number" {...register('breakfast_policy')} className="border p-2 w-full rounded-[15px]" />
          {errors.breakfast_policy && <div className="text-red-500 text-sm">{errors.breakfast_policy.message}</div>}
        </section>

        <section className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="text-black">Allow Children</label>
            <input type="checkbox" {...register('allow_children')} className="ml-2" />
          </div>

          <div className="w-1/2">
            <label className="text-black">Allow Pets</label>
            <input type="checkbox" {...register('allow_pets')} className="ml-2" />
          </div>
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
            Next <FaArrowRight className="self-center mx-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
