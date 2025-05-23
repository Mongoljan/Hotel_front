'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { schemaHotelSteps3 } from '../../../schema';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel3({ onNext, onBack }: Props) {
  const t = useTranslations("4PropertyPolicies");

  // Restore and flatten nested cancellation_fee structure
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
        className="bg-white p-8 px-8 border-primary border-solid border-[1px] max-w-[600px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-6">{t("title")}</h2>

        <section className="mb-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">{t("1")}</label>
              <input type="time" {...register('cancel_time')} className="border p-2 w-full rounded-[15px]" />
              {errors.cancel_time && <div className="text-red text-sm">{errors.cancel_time.message}</div>}
            </div>
            <div className="w-1/2">
              <label className="text-black">{t("2")} (%)</label>
              <input type="text" {...register('before_fee')} className="border p-2 w-full rounded-[15px]" />
              {errors.before_fee && <div className="text-red text-sm">{errors.before_fee.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">{t("3")} (%)</label>
              <input type="text" {...register('after_fee')} className="border p-2 w-full rounded-[15px]" />
              {errors.after_fee && <div className="text-red text-sm">{errors.after_fee.message}</div>}
            </div>
            <div className="w-1/2">
              <label className="text-black">{t("4")} (%)</label>
              <input type="text" {...register('subsequent_days_percentage')} className="border p-2 w-full rounded-[15px]" />
              {errors.subsequent_days_percentage && <div className="text-red text-sm">{errors.subsequent_days_percentage.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <label className="text-black">{t("5")} (%)</label>
          <input type="text" {...register('special_condition_percentage')} className="border p-2 w-full rounded-[15px]" />
          {errors.special_condition_percentage && <div className="text-red text-sm">{errors.special_condition_percentage.message}</div>}
        </section>

        <section className="mb-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">{t("6")}</label>
              <input type="time" {...register('check_in_from')} className="border p-2 w-full rounded-[15px]" />
              {errors.check_in_from && <div className="text-red text-sm">{errors.check_in_from.message}</div>}
            </div>
            <div className="w-1/2">
              <label className="text-black">{t("7")}</label>
              <input type="time" {...register('check_in_until')} className="border p-2 w-full rounded-[15px]" />
              {errors.check_in_until && <div className="text-red text-sm">{errors.check_in_until.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-black">{t("8")}</label>
              <input type="time" {...register('check_out_from')} className="border p-2 w-full rounded-[15px]" />
              {errors.check_out_from && <div className="text-red text-sm">{errors.check_out_from.message}</div>}
            </div>
            <div className="w-1/2">
              <label className="text-black">{t("9")}</label>
              <input type="time" {...register('check_out_until')} className="border p-2 w-full rounded-[15px]" />
              {errors.check_out_until && <div className="text-red text-sm">{errors.check_out_until.message}</div>}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <label className="text-black">{t("10")}</label>
          <select {...register('breakfast_policy')} className="border p-2 w-full rounded-[15px]">
            <option value="">{t("16")}</option>
            <option value="no">{t("17")}</option>
            <option value="free">{t("18")}</option>
            <option value="paid">{t("19")}</option>
          </select>
          {errors.breakfast_policy && <div className="text-red text-sm">{errors.breakfast_policy.message}</div>}
        </section>

        <section className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="text-black">{t("11")}</label>
            <div className="flex items-center">
              <input type="checkbox" id="allowChildren" {...register("allow_children")} className="hidden peer" />
              <label htmlFor="allowChildren" className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer select-none transition peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white peer-hover:bg-gray-100">
                {t("15")}
              </label>
            </div>
          </div>

          <div className="w-1/2">
            <label className="text-black">{t("12")}</label>
            <div className="flex items-center">
              <input type="checkbox" id="allowPets" {...register('allow_pets')} className="hidden peer" />
              <label htmlFor="allowPets" className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer select-none transition peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white peer-hover:bg-gray-100">
                {t("15")}
              </label>
            </div>
          </div>
        </section>

        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <FaArrowLeft className="self-center mx-1" /> {t("13")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            {t("14")} <FaArrowRight className="self-center mx-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
