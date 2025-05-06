'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaArrowRight, FaPlus, FaTrash } from 'react-icons/fa6';
import { schemaHotelSteps5 } from '../../../schema';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

const API_PROPERTY_IMAGES = 'https://dev.kacc.mn/api/property-images/';

type FormFields = z.infer<typeof schemaHotelSteps5>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel5({ onNext, onBack }: Props) {
  const t = useTranslations("5PropertyImages");
  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps5),
    defaultValues: {
      entries: [{ images: '', descriptions: '' }],
    },
  });

  // watch entries so previews update immediately
  const watchedEntries = watch('entries');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entries',
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        // update the form value (and trigger validation/render)
        setValue(`entries.${index}.images`, base64Image, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const formattedData = data.entries.map(entry => ({
        image: entry.images,
        description: entry.descriptions,
      }));

      const response = await fetch(API_PROPERTY_IMAGES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        const responseData = await response.json();
        const propertyPhotos = responseData.map((item: any) => item.id);

        const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
        propertyData.property_photos = propertyPhotos;
        localStorage.setItem('propertyData', JSON.stringify(propertyData));

        toast.success('Property images saved successfully!');
        onNext();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Saving property images failed.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while saving property images.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 border-primary border-solid border-[1px] max-w-[600px] md:min-w-[440px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-2xl font-bold text-center mb-6">{t("title")}</h2>

        {fields.map((field, index) => {
          const previewSrc = watchedEntries?.[index]?.images;
          return (
            <div key={field.id} className="mb-4 border p-4 rounded-lg">
              <section className="mb-2">
                <label className="text-black">{t("1")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="border p-2 w-full rounded-[15px]"
                />
                {errors.entries?.[index]?.images && (
                  <div className="text-red text-sm">
                    {errors.entries[index]?.images?.message}
                  </div>
                )}
                {previewSrc && (
                  <img
                    src={previewSrc}
                    alt={`Preview ${index + 1}`}
                    className="mt-2 max-h-40 w-auto rounded-md border"
                  />
                )}
              </section>

              <section className="mb-2">
                <label className="text-black">{t("2")}</label>
                <input
                  type="text"
                  {...register(`entries.${index}.descriptions`)}
                  className="border p-2 w-full rounded-[15px]"
                />
                {errors.entries?.[index]?.descriptions && (
                  <div className="text-red text-sm">
                    {errors.entries[index]?.descriptions?.message}
                  </div>
                )}
              </section>

              <button
                type="button"
                onClick={() => remove(index)}
                className="flex items-center justify-center w-full text-red border border-red-500 rounded-lg p-2 mt-2"
              >
                <FaTrash className="mr-2" />
                {t("3")}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => append({ images: '', descriptions: '' })}
          className="w-full flex justify-center text-black py-2 border border-primary rounded-lg mb-4"
        >
          <FaPlus className="mr-2" /> {t("4")}
        </button>

        <div className="flex gap-x-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            <FaArrowLeft className="self-center mx-1" />
            {t("5")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center mt-4 text-black py-3 hover:bg-bg px-4 border-primary border-[1px] border-solid font-semibold rounded-[15px]"
          >
            {t("6")}
            <FaArrowRight className="self-center mx-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
