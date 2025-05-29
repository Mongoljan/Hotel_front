'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { schemaHotelSteps3 } from '../../../schema';
import { z } from 'zod';

const API_URL = 'https://dev.kacc.mn/api/property-policies/';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel4({ onNext, onBack }: Props) {
  const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
  const defaultValues = stored.step4
    ? { ...stored.step4[0], ...(stored.step4[0]?.cancellation_fee || {}) }
    : {};

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps3),
    defaultValues,
  });

  const cancelTime = watch('cancel_time');

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const propertyId = stored.propertyId;

    if (!propertyId) {
      toast.error('Property ID not found. Please complete Step 1.');
      return;
    }

    const formattedData = {
      cancellation_fee: {
        cancel_time: data.cancel_time,
        before_fee: data.before_fee,
        after_fee: data.after_fee,
        beforeManyRoom_fee: data.beforeManyRoom_fee,
        afterManyRoom_fee: data.afterManyRoom_fee,
        subsequent_days_percentage: data.subsequent_days_percentage,
        special_condition_percentage: data.special_condition_percentage,
        property: propertyId,
      },
      check_in_from: data.check_in_from,
      check_in_until: data.check_in_until,
      check_out_from: data.check_out_from,
      check_out_until: data.check_out_until,
      breakfast_policy: data.breakfast_policy,
      allow_children: data.allow_children,
      allow_pets: data.allow_pets,
      parking_situation: data.parking_situation,
      property: propertyId,
    };

    try {
      const checkRes = await fetch(`${API_URL}?property=${propertyId}`);
      const existing = await checkRes.json();

      const response = await fetch(
        existing?.length > 0 ? `${API_URL}${existing[0].id}/` : API_URL,
        {
          method: existing?.length > 0 ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) throw new Error('Failed to save property policy');
      const result = await response.json();

      localStorage.setItem('propertyData', JSON.stringify({
        ...stored,
        step4: [{ id: result.id }],
      }));

      toast.success('Property policy data saved!');
      onNext();
    } catch (error) {
      console.error(error);
      toast.error('Алдаа гарлаа. Дахин оролдоно уу.');
    }
  };

  return (
    <div className="flex justify-center items-center">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[650px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Дотоод журам</h2>
        <div className="text-soft text-sm pt-2">
          Та зочны өрөөнд орох болон гарах цагийг тохируулж өгнө үү.
        </div>

        {/* Check-in/out */}
        <div className="border-soft border-dotted border-[1px] rounded-[10px] p-2">
          <section className="mb-6">
            <label className="text-black">Орох цаг (check in)</label>
            <div className="flex">
              <div className="flex">
                <input type="time" {...register('check_in_from')} className="border p-2 w-[150px] rounded-[15px]" />
                <div className="mx-2">- цагаас</div>
              </div>
              <div className="flex">
                <input type="time" {...register('check_in_until')} className="border p-2 w-[150px] rounded-[15px]" />
                <div className="mx-2">цаг хүртэл</div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <label className="text-black">Гарах цаг (check out)</label>
            <div className="flex">
              <div className="flex">
                <input type="time" {...register('check_out_from')} className="border p-2 w-[150px] rounded-[15px]" />
                <div className="mx-2">- цагаас</div>
              </div>
              <div className="flex">
                <input type="time" {...register('check_out_until')} className="border p-2 w-[150px] rounded-[15px]" />
                <div className="mx-2">цаг хүртэл</div>
              </div>
            </div>
          </section>
        </div>

        {/* Cancellation Policy */}
        <label className="text-soft text-sm mt-4">Цуцлалтын нөхцөл</label>
        <div className="border-soft border-[1px] border-dotted p-2 rounded-[10px] mb-6">
          <section className="mb-6">
            <label className="text-black mb-2">Цуцлах цаг</label>
            <input type="time" {...register('cancel_time')} className="border p-2 w-[160px] rounded-[15px]" />
            {errors.cancel_time && <div className="text-red text-sm">{errors.cancel_time.message}</div>}
          </section>

          <section className="mb-6">
            <label className="text-soft text-sm mb-2 block">Өрөө цуцлах нөхцлүүд</label>
            <div className="flex justify-between">
              <div className="w-[45%]">
                <label className="text-black">Цуцлахаас өмнө (%)</label>
                <input type="number" {...register('before_fee')} className="border p-2 w-[90px] rounded-[15px]" />
              </div>
              <div className="w-[45%]">
                <label className="text-black">Цуцласны дараа (%)</label>
                <input type="number" {...register('after_fee')} className="border p-2 w-[90px] rounded-[15px]" />
              </div>
            </div>
          </section>

          <section className="mb-6">
            <label className="text-soft text-sm mb-2 block">Олон өрөө цуцлах</label>
            <div className="flex justify-between">
              <div className="w-[45%]">
                <label className="text-black">Цуцлахаас өмнө (%)</label>
                <input type="text" {...register('beforeManyRoom_fee')} className="border p-2 w-[90px] rounded-[15px]" />
              </div>
              <div className="w-[45%]">
                <label className="text-black">Цуцласны дараа (%)</label>
                <input type="text" {...register('afterManyRoom_fee')} className="border p-2 w-[90px] rounded-[15px]" />
              </div>
            </div>
          </section>

          <section className="mb-6">
            <div className="flex justify-between">
              <div className="w-[45%]">
                <label className="text-black">2 дахь өдрөөс цуцлах хувь (%)</label>
                <input type="number" {...register('subsequent_days_percentage')} className="border p-2 w-[90px] rounded-[15px]" />
              </div>
              <div className="w-[45%]">
                <label className="text-black">Онцгой нөхцөл (%)</label>
                <input type="number" {...register('special_condition_percentage')} className="border p-2 w-[90px] rounded-[15px]" />
              </div>
            </div>
          </section>
        </div>

        {/* Other Rules */}
        <section className="mb-6">
          <label className="text-black">Өглөөний цай</label>
          <select {...register('breakfast_policy')} className="border p-2 w-full rounded-[15px]">
            <option value="">Сонгох</option>
            <option value="no">Байхгүй</option>
            <option value="free">Байгаа, үнэгүй</option>
            <option value="paid">Байгаа, төлбөртэй</option>
          </select>
        </section>

        <section className="mb-6">
          <label className="text-black">Зогсоолын мэдээлэл</label>
          <select {...register('parking_situation')} className="border p-2 w-full rounded-[15px]">
            <option value="">Сонгох</option>
            <option value="no">Байхгүй</option>
            <option value="free">Төлбөргүй</option>
            <option value="paid">Төлбөртэй</option>
          </select>
        </section>

        <section className="mb-6 flex justify-between gap-4">
          <div>
            <label className="text-black mb-2 block">Хүүхэдтэй хамт үйлчлүүлэх боломжтой</label>
            <input type="checkbox" {...register('allow_children')} />
          </div>
          <div>
            <label className="text-black mb-2 block">Тэжээвэр амьтан оруулах боломжтой</label>
            <input type="checkbox" {...register('allow_pets')} />
          </div>
        </section>

        {/* Buttons */}
        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] font-semibold rounded-[15px]"
          >
            <FaArrowLeft className="self-center mx-1" /> Буцах
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] font-semibold rounded-[15px]"
          >
            Үргэлжлүүлэх <FaArrowRight className="self-center mx-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
