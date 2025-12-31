'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { schemaHotelSteps5 } from '../../../schema';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_URL = 'https://dev.kacc.mn/api/property-images/';

type FormFields = z.infer<typeof schemaHotelSteps5>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel5({ onNext, onBack }: Props) {
  const t = useTranslations('5PropertyImages');
  const { user } = useAuth();
  const [initialValues, setInitialValues] = React.useState<FormFields | null>(null);

  const propertyDataStr = user?.id ? UserStorage.getItem<string>('propertyData', user.id) : null;
  const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};

  const defaultValues: FormFields = stored?.step5?.entries
    ? stored.step5
    : { entries: [{ images: '', descriptions: '' }, { images: '', descriptions: '' }, { images: '', descriptions: '' }, { images: '', descriptions: '' }, { images: '', descriptions: '' }] };

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps5),
    defaultValues,
  });

  const watchedEntries = form.watch('entries');

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'entries',
  });

  useEffect(() => {
    if (!user?.id) return;
    
    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    
    if (stored?.step5?.raw) {
      const restored = stored.step5.raw.map((item: any) => ({
        images: item.image,
        descriptions: item.description,
      }));
      replace(restored);
      setInitialValues({ entries: restored });
    }
  }, [replace, user?.id]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Зөвхөн PNG, JPG, JPEG, WebP форматтай зураг оруулна уу.');
        event.target.value = '';
        return;
      }

      // Check file size (minimum 100KB)
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB < 100) {
        toast.error('Зургийн хэмжээ хамгийн багадаа 100KB байх ёстой. Илүү чанартай зураг оруулна уу.');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        form.setValue(`entries.${index}.images`, base64Image, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!user?.id || !user?.hotel) {
      toast.error('User information missing');
      return;
    }

    // Check if data has changed
    if (initialValues && JSON.stringify(data) === JSON.stringify(initialValues)) {
      onNext();
      return;
    }

    try {
      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
      const propertyId = stored.propertyId || user.hotel;

      if (!propertyId) {
        toast.error(t('property_id_not_found'));
        return;
      }

      const result: any[] = [];

      for (const entry of data.entries) {
        const formData = new FormData();
        formData.append('property', propertyId.toString());
        formData.append('description', entry.descriptions);

        const base64 = entry.images;
        const blob = await (await fetch(base64)).blob();
        formData.append('image', blob, `image_${Date.now()}.jpeg`);

        const res = await fetch(API_URL, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('One of the image uploads failed.');
        const json = await res.json();

        // ✅ FIXED: flatten response array
        if (Array.isArray(json)) {
          result.push(...json);
        } else {
          result.push(json);
        }
      }

      const uploadedImageIds = result.map((img) => img.id);

      const step5Data = {
        entries: data.entries,
        property_photos: uploadedImageIds,
        raw: result,
      };

      UserStorage.setItem(
        'propertyData',
        JSON.stringify({
          ...stored,
          step5: step5Data,
          property_photos: uploadedImageIds,
        }),
        user.id
      );

      toast.success(t('images_saved_success'));
      onNext();
    } catch (error) {
      console.error(error);
      toast.error(t('error_try_again'));
    }
  };

  return (
    <div className="flex justify-center items-center">

      <Card className="w-full max-w-[600px] md:min-w-[440px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <ImageIcon className="h-6 w-6" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Хамгийн багадаа <strong>5 зураг</strong> оруулна уу</li>
                <li>Зураг бүр хамгийн багадаа <strong>100KB</strong> хэмжээтэй байх ёстой</li>
                <li>Зөвхөн <strong>PNG, JPG, JPEG, WebP</strong> форматтай зураг оруулна уу</li>
              </ul>
              <div className="mt-3 text-sm font-medium">
                Оруулсан зургийн тоо: <span className={`${watchedEntries.filter(e => e.images).length >= 5 ? 'text-green-600' : 'text-orange-600'}`}>{watchedEntries.filter(e => e.images).length}</span> / 5 (хамгийн бага)
              </div>
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {fields.map((field, index) => {
                const previewSrc = watchedEntries?.[index]?.images;
                return (
                  <Card key={field.id} className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`entries.${index}.images`}
                          render={({ field: fieldProps }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                {t('1')}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="file"
                                  accept="image/png,image/jpeg,image/jpg,image/webp"
                                  onChange={(e) => handleImageChange(e, index)}
                                  className="cursor-pointer"
                                />
                              </FormControl>
                              <FormMessage />
                              {previewSrc && (
                                <div className="mt-4">
                                  <img
                                    src={previewSrc}
                                    alt={`Preview ${index + 1}`}
                                    className="max-h-40 w-auto rounded-md border object-cover"
                                  />
                                </div>
                              )}
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`entries.${index}.descriptions`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('2')}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter image description..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {fields.length > 5 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            className="w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('3')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ images: '', descriptions: '' })}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('4')}
              </Button>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('5')}
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1"
                >
                  {t('6')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}