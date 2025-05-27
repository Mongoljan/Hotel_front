'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { schemaHotelSteps3 } from '../../../schema';
import { z } from 'zod';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel3({ onNext, onBack }: Props) {
  const stored = JSON.parse(localStorage.getItem('propertyData') || '{}');
  const defaultValues = stored.step4
    ? {
        ...stored.step4,
        ...(stored.step4.cancellation_fee || {}),
      }
    : {};

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps3),
    defaultValues,
  });

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    const formattedData = {
      cancellation_fee: {
        cancel_time: data.cancel_time,
        before_fee: data.before_fee,
        after_fee: data.after_fee,
        beforeManyRoom_fee: data.beforeManyRoom_fee,
        afterManyRoom_fee: data.afterManyRoom_fee,
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
      parking_situation: data.parking_situation,
    };

    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    propertyData.step4 = formattedData;
    localStorage.setItem('propertyData', JSON.stringify(propertyData));

    toast.success('Property policy data saved!');
    onNext();
  };

  return (
    <div className="flex justify-center items-center">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[650px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Property Policies</h2>

        <section className="mb-6">
          <div className="flex gap-4 place">
            <div className="w-1/2 place-content-end">
              <label className="text-black mb-10 ">Цуцлах цаг</label>
      
              <input type="time" {...register('cancel_time')} className="border block p-2 w-[160px] rounded-[15px]" />
              {errors.cancel_time && <div className="text-red text-sm">{errors.cancel_time.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex gap-4 place">
     
            <div className="w-1/2 ">
              <label className="text-black">Цуцлах цагаас өмнө цуцлах бол (%)</label>
              <input type="number" {...register('before_fee')} className="border p-2 w-[90px] rounded-[15px]" />
              {errors.before_fee && <div className="text-red text-sm">{errors.before_fee.message}</div>}
            </div>
             <div className="w-1/2">
              <label className="text-black">Цуцлах цагаас хойш цуцлах бол (%)</label>
              <input type="number" {...register('after_fee')} className="border p-2 w-[90px] rounded-[15px]" />
              {errors.after_fee && <div className="text-red text-sm">{errors.after_fee.message}</div>}
            </div>
          </div>
        </section>


        <section className="mb-6">
          <div className="flex gap-4">
          
            <div className="w-1/2 place-content-end">
              <label className="text-black ">2 дахь өдрөөс цуцлах бол (%)</label>
                
              <input type="number" {...register('subsequent_days_percentage')} className="border p-2 w-[90px] rounded-[15px]" />
              {errors.subsequent_days_percentage && <div className="text-red text-sm">{errors.subsequent_days_percentage.message}</div>}
            </div>

          <div className="">
          <label className="text-black my-auto">Онцгой нөхцөлд (%)</label>
          <input type="number" {...register('special_condition_percentage')} className="border block p-2 w-[90px] rounded-[15px]" />
        
          {errors.special_condition_percentage && <div className="text-red text-sm">{errors.special_condition_percentage.message}</div>}
       </div>
          </div>
        </section>


        <section className="mb-6">
            <label className=" text-soft text-sm">Олон өрөө цуцлах тохиолдол</label>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">цуцлах цагаас өмнө (%)</label>
              <input type="text" {...register('beforeManyRoom_fee')} className=" block border p-2 w-[90px]  rounded-[15px]" />
              {errors.beforeManyRoom_fee && <div className="text-red text-sm">{errors.beforeManyRoom_fee.message}</div>}
            </div>
            <div className="w-1/2">
              <label className="text-black">цуцлах цагаас хойш (%)</label>
              <input type="text" {...register('afterManyRoom_fee')} className="border p-2 w-[90px] block rounded-[15px]" />
              {errors.afterManyRoom_fee && <div className="text-red text-sm">{errors.afterManyRoom_fee.message}</div>}
            </div>
          </div>
        </section>

        <div className='text-soft text-sm pt-2'>Та зочны өрөөнд орох болон гарах цагийг тохируулж өгнө үү.</div>

        <section className="mb-6">
          <label className="text-black">Орох цаг (check in)</label>
          <div className="flex">
            <div className='flex'>
              <input type="time" {...register('check_in_from')} className="border p-2 w-[150px] rounded-[15px]" />
              <div className='place-content-center mx-2'>- цагаас</div>
            </div>
            <div className='flex'>
              <input type="time" {...register('check_in_until')} className="border p-2 w-[150px] rounded-[15px]" />
              <div className='place-content-center mx-2'>цаг хүртэл</div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <label className="text-black">Гарах цаг (check out)</label>
          <div className="flex">
            <div className='flex'>
              <input type="time" {...register('check_out_from')} className="border p-2 w-[150px] rounded-[15px]" />
              <div className='place-content-center mx-2'>- цагаас</div>
            </div>
            <div className='flex'>
              <input type="time" {...register('check_out_until')} className="border p-2 w-[150px] rounded-[15px]" />
              <div className='place-content-center mx-2'>цаг хүртэл</div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <label className="text-black">Өглөөний цай</label>
          <select {...register('breakfast_policy')} className="border p-2 w-full rounded-[15px]">
            <option value="">Сонгох</option>
            <option value="no">Байхгүй</option>
            <option value="free">Байгаа, үнэгүй</option>
            <option value="paid">Байгаа, төлбөртэй</option>
          </select>
          {errors.breakfast_policy && <div className="text-red text-sm">{errors.breakfast_policy.message}</div>}
        </section>

        <section className="mb-6">
          <label className="text-black">Зогсоолын мэдээлэл</label>
          <select {...register('parking_situation')} className="border p-2 w-full rounded-[15px]">
            <option value="">Сонгох</option>
            <option value="no">Байхгүй</option>
            <option value="free">Төлбөргүй</option>
            <option value="paid">Төлбөртэй</option>
          </select>
          {errors.parking_situation && <div className="text-red text-sm">{errors.parking_situation.message}</div>}
        </section>

     <section className="flex gap-4 mb-6">
  <div className="w-1/2">
    <label className="text-black block mb-2">Хүүхэд хүлээн авах эсэх</label>
    <div className="flex items-center gap-2">
      <input type="checkbox" id="allowChildren" {...register("allow_children")} className="w-4 h-4" />
      <label htmlFor="allowChildren" className="cursor-pointer">Тийм</label>
    </div>
  </div>

  <div className="w-1/2">
    <label className="text-black block mb-2">Тэжээвэр амьтан оруулах боломжтой эсэх</label>
    <div className="flex items-center gap-2">
      <input type="checkbox" id="allowPets" {...register("allow_pets")} className="w-4 h-4" />
      <label htmlFor="allowPets" className="cursor-pointer">Тийм</label>
    </div>
  </div>
</section>


        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <FaArrowLeft className="self-center mx-1" /> Буцах
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            Үргэлжлүүлэх <FaArrowRight className="self-center mx-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
