'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Trash2, Image as ImageIcon, Upload, X, Expand, Star } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [existingImages, setExistingImages] = React.useState<any[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; index: number }>({ src: '', index: 0 });

  const propertyDataStr = user?.id ? UserStorage.getItem<string>('propertyData', user.id) : null;
  const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};

  const defaultValues: FormFields = stored?.step5?.entries
    ? stored.step5
    : {
        entries: [
          { images: '', descriptions: '', is_profile: false },
          { images: '', descriptions: '', is_profile: false },
          { images: '', descriptions: '', is_profile: false },
          { images: '', descriptions: '', is_profile: false },
          { images: '', descriptions: '', is_profile: false },
        ],
      };

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps5),
    mode: 'onChange',
    defaultValues,
  });

  const watchedEntries = form.watch('entries');
  const hasProfileSelected = watchedEntries.some((e) => e.is_profile && e.images);

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'entries',
  });

  useEffect(() => {
    const fetchExistingImages = async () => {
      if (!user?.id || !user?.hotel) return;
      
      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
      const propertyId = stored.propertyId || user.hotel;

      // First check localStorage
      if (stored?.step5?.raw) {
        let restored = stored.step5.raw.map((item: any) => ({
          images: item.image,
          descriptions: item.description,
          is_profile: Boolean(item.is_profile),
        }));

        const storedProfileIndex = restored.findIndex((item: any) => item.is_profile);
        if (storedProfileIndex === -1 && restored.length > 0) {
          restored = restored.map((item: any, idx: number) => ({
            ...item,
            is_profile: idx === 0,
          }));
        } else if (storedProfileIndex > -1) {
          restored = restored.map((item: any, idx: number) => ({
            ...item,
            is_profile: idx === storedProfileIndex,
          }));
        }
        replace(restored);
        setInitialValues({ entries: restored });
        setExistingImages(
          stored.step5.raw.map((img: any, idx: number) => ({
            ...img,
            is_profile: restored[idx]?.is_profile ?? Boolean(img.is_profile),
          }))
        ); // Store existing image data
        return;
      }

      // If not in localStorage, fetch from API
      try {
        const res = await fetch(`${API_URL}?property=${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            let restored = data.map((item: any) => ({
              images: item.image,
              descriptions: item.description || '',
              is_profile: Boolean(item.is_profile),
            }));

            const profileIndex = restored.findIndex((item: any) => item.is_profile);
            if (profileIndex === -1 && restored.length > 0) {
              restored = restored.map((item: any, idx: number) => ({
                ...item,
                is_profile: idx === 0,
              }));
            } else if (profileIndex > -1) {
              restored = restored.map((item: any, idx: number) => ({
                ...item,
                is_profile: idx === profileIndex,
              }));
            }
            replace(restored);
            setInitialValues({ entries: restored });
            setExistingImages(
              data.map((img: any, idx: number) => ({
                ...img,
                is_profile: restored[idx]?.is_profile ?? Boolean(img.is_profile),
              }))
            ); // Store existing image data

            // Save to localStorage
            const step5Data = {
              entries: restored,
              property_photos: data.map((img: any) => img.id),
              raw: data,
            };
            UserStorage.setItem(
              'propertyData',
              JSON.stringify({
                ...stored,
                step5: step5Data,
              }),
              user.id
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch existing images:', error);
      }
    };
    fetchExistingImages();
  }, [replace, user?.id, user?.hotel]);
  const openLightbox = (src: string, index: number) => {
    setLightboxImage({ src, index });
    setLightboxOpen(true);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const accepted: File[] = [];
    for (const file of selectedFiles) {
      if (!validTypes.includes(file.type)) {
        toast.error(t('image_format_error'));
        continue;
      }
      if (file.size / 1024 < 100) {
        toast.error(t('image_size_error'));
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) {
      event.target.value = '';
      return;
    }

    // Build a queue of indexes to fill: start at the clicked slot, then fill
    // any subsequent empty slots, then append new entries at the end.
    const currentEntries = form.getValues('entries') || [];
    const targetIndexes: number[] = [index];
    for (let i = 0; i < currentEntries.length && targetIndexes.length < accepted.length; i++) {
      if (i === index) continue;
      if (!currentEntries[i]?.images) targetIndexes.push(i);
    }

    // Read all files in parallel then assign
    Promise.all(
      accepted.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).then((base64s) => {
      base64s.forEach((b64, i) => {
        const targetIdx = targetIndexes[i];
        if (targetIdx !== undefined && targetIdx < currentEntries.length) {
          form.setValue(`entries.${targetIdx}.images`, b64, { shouldValidate: true, shouldDirty: true });
        } else {
          // Overflow — append new entries
          append({ images: b64, descriptions: '', is_profile: false });
        }
      });
    });

    event.target.value = '';
  };

  const onInvalid = () => {
    if (!watchedEntries.some((e) => e.is_profile && e.images)) {
      toast.error(t('profile_image_required'));
    } else {
      toast.error(t('please_fix_errors') || 'Please fix the errors before continuing');
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!user?.id || !user?.hotel) {
      toast.error(t('user_info_missing'));
      return;
    }

    const profileIndex = data.entries.findIndex((entry) => entry.is_profile);
    if (profileIndex === -1) {
      toast.error(t('profile_image_required'));
      return;
    }

    // Normalize to ensure only one profile image is sent
    const normalizedEntries = data.entries.map((entry, idx) => ({
      ...entry,
      is_profile: idx === profileIndex,
    }));

    // Check if data has changed
    if (initialValues && JSON.stringify(normalizedEntries) === JSON.stringify(initialValues.entries)) {
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
      const allImageIds: number[] = [];

      // Separate new uploads from existing images
      const newEntries: { index: number; entry: typeof data.entries[0] }[] = [];
      const patchTasks: { index: number; entry: typeof data.entries[0]; existingImage: any }[] = [];
      const keepTasks: { index: number; existingImage: any }[] = [];
      for (let i = 0; i < normalizedEntries.length; i++) {
        const entry = normalizedEntries[i];
        const existingImage = existingImages[i];
        const isNewImage = entry.images.startsWith('data:');

        if (isNewImage) {
          newEntries.push({ index: i, entry });
        } else if (existingImage) {
          const isDescriptionChanged = existingImage.description !== entry.descriptions;
          const isProfileChanged = Boolean(existingImage.is_profile) !== Boolean(entry.is_profile);
          if (isDescriptionChanged || isProfileChanged) {
            patchTasks.push({ index: i, entry, existingImage });
          } else {
            keepTasks.push({ index: i, existingImage });
          }
        }
      }

      // Batch upload all new images in a single POST request
      let uploadedImages: any[] = [];
      if (newEntries.length > 0) {
        const payload = newEntries.map(({ entry }) => ({
          property: propertyId,
          image: entry.images,
          description: entry.descriptions,
          is_profile: Boolean(entry.is_profile),
        }));

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Image upload failed.');
        const json = await res.json();
        uploadedImages = Array.isArray(json) ? json : [json];
      }

      // Update descriptions in parallel
      const patchResults = await Promise.all(
        patchTasks.map(async ({ index, entry, existingImage }) => {
          const updateRes = await fetch(`${API_URL}${existingImage.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: entry.descriptions,
              is_profile: Boolean(entry.is_profile),
            }),
          });

          if (updateRes.ok) {
            return { index, json: await updateRes.json() };
          }
          return { index, json: existingImage };
        })
      );

      // Combine all results in original order
      const resultMap = new Map<number, any>();

      // Map uploaded images back to their original indices
      for (let i = 0; i < newEntries.length; i++) {
        const img = uploadedImages[i];
        if (img) {
          resultMap.set(newEntries[i].index, img);
          allImageIds.push(img.id);
        }
      }

      for (const { index, json } of patchResults) {
        resultMap.set(index, json);
        allImageIds.push(json.id);
      }

      for (const { index, existingImage } of keepTasks) {
        resultMap.set(index, existingImage);
        allImageIds.push(existingImage.id);
      }

      // Build result array in original order
      for (let i = 0; i < normalizedEntries.length; i++) {
        if (resultMap.has(i)) {
          result.push(resultMap.get(i));
        }
      }

      const storedEntries = normalizedEntries.map((entry, idx) => ({
        ...entry,
        images: result[idx]?.image || entry.images,
      }));

      const step5Data = {
        entries: storedEntries,
        property_photos: allImageIds,
        raw: result,
      };

      UserStorage.setItem(
        'propertyData',
        JSON.stringify({
          ...stored,
          step5: step5Data,
          property_photos: allImageIds,
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
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-[640px]">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-center text-sm">
            <div>{t('description')}</div>
            <div className="text-xs text-muted-foreground/80 mt-1">
              {t('hotel_image_suggestions')}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-3 py-2">
            <AlertDescription>
              <div className="flex items-center justify-between text-xs">
                <div className="space-y-0.5 text-muted-foreground">
                  <div>{t('alert_min_images')} • {t('alert_min_size')}</div>
                  <div className="text-[11px]">{t('alert_formats')}</div>
                </div>
                <div className="text-sm font-medium text-right space-y-0.5">
                  <div>
                    <span className={`${watchedEntries.filter(e => e.images).length >= 5 ? 'text-green-600' : 'text-orange-600'}`}>
                      {watchedEntries.filter(e => e.images).length}
                    </span>
                    <span className="text-muted-foreground">/5</span>
                  </div>
                  <div className={`text-[11px] ${hasProfileSelected ? 'text-green-600' : 'text-orange-600'}`}>
                    {hasProfileSelected ? '✓ ' + (t('profile_selected') || 'Profile selected') : '⚠ ' + (t('profile_image_required') || 'No profile selected')}
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="">

              {fields.map((field, index) => {
                const previewSrc = watchedEntries?.[index]?.images;
                const isProfile = Boolean(watchedEntries?.[index]?.is_profile);
                return (
                  <div key={field.id} className={`border-dashed ${isProfile ? 'border-yellow-400/70 bg-yellow-50/30' : ''}`}>
                    <div className="p-2.5">
                      <div className="flex gap-2.5">
                        {/* Image preview or placeholder */}
                        <div className="flex-shrink-0 w-16 h-16">
                          {previewSrc ? (
                            <div
                              className="relative w-full h-full group cursor-pointer"
                              onClick={() => openLightbox(previewSrc, index)}
                            >
                              <img
                                src={previewSrc}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full rounded border object-cover transition-opacity group-hover:opacity-90"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-black/50 rounded-full p-1.5">
                                  <Expand className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              {isProfile && (
                                <div className="absolute -top-2 -right-2 rounded-full p-1 bg-yellow-400 shadow-md ring-2 ring-white">
                                  <Star className="h-3.5 w-3.5 fill-white text-white" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex-1">
                          <div className="flex gap-2">
                     
                            <FormField
                              control={form.control}
                              name={`entries.${index}.images`}
                              render={({ field: fieldProps }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        multiple
                                        onChange={(e) => handleImageChange(e, index)}
                                        className="text-xs  file:text-xs cursor-pointer"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                        
                            <Button
                              type="button"
                              variant={isProfile ? 'default' : 'outline'}
                              size="sm"
                              disabled={!previewSrc}
                              onClick={() => {
                                fields.forEach((_, idx) => {
                                  form.setValue(`entries.${idx}.is_profile`, idx === index, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                });
                              }}
                              className=" px-2 text-xs gap-1"
                            >
                              <Star className={`h-3 w-3 flex-shrink-0 ${isProfile ? 'fill-current' : ''}`} />
                              {t('set_as_profile')}
                            </Button>
                            {fields.length > 5 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>

                          <FormField
                          
                            control={form.control}
                            name={`entries.${index}.descriptions`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder={t('description_placeholder')}
                                    rows={1}
                                    className="text-xs resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                         
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ images: '', descriptions: '', is_profile: false })}
                className="w-full h-9 text-sm"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {t('4')}
              </Button>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 h-9"
                >
                  <ChevronLeft className="mr-1.5 h-4 w-4" />
                  {t('5')}
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1 h-9"
                >
                  {t('6')}
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Image Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden">
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">
            {t('hotel_image')} {lightboxImage.index + 1}
          </DialogTitle>

          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">
                {t('hotel_image')} {lightboxImage.index + 1}
                {watchedEntries?.[lightboxImage.index]?.is_profile && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({t('profile_image_label')})
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="relative px-4 pb-4">
            <div className="flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
              <img
                src={lightboxImage.src}
                alt={`Image ${lightboxImage.index + 1}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            {watchedEntries?.[lightboxImage.index]?.descriptions && (
              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">{t('2')}:</p>
                <p className="text-sm mt-1">{watchedEntries[lightboxImage.index].descriptions}</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevIndex = lightboxImage.index - 1;
                  const prevImage = watchedEntries?.[prevIndex]?.images;
                  if (prevIndex >= 0 && prevImage) {
                    openLightbox(prevImage, prevIndex);
                  }
                }}
                disabled={lightboxImage.index === 0 || !watchedEntries?.[lightboxImage.index - 1]?.images}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {watchedEntries.filter(e => e.images).findIndex((_, idx) =>
                  watchedEntries.findIndex(e => e.images) + idx === lightboxImage.index
                ) + 1} / {watchedEntries.filter(e => e.images).length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextIndex = lightboxImage.index + 1;
                  const nextImage = watchedEntries?.[nextIndex]?.images;
                  if (nextIndex < watchedEntries.length && nextImage) {
                    openLightbox(nextImage, nextIndex);
                  }
                }}
                disabled={lightboxImage.index >= watchedEntries.length - 1 || !watchedEntries?.[lightboxImage.index + 1]?.images}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}