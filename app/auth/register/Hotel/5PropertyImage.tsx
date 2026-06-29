'use client';

import React, { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Star,
  Upload,
  X,
  ChevronLeft as CarouselPrev,
  ChevronRight as CarouselNext,
} from 'lucide-react';
import { schemaHotelSteps5 } from '../../../schema';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { getImageCategories, ImageCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const API_URL = 'https://dev.kacc.mn/api/property-images/';
const MIN_IMAGES = 5;
const GRID_IMAGE_SLOTS = 5;

type FormFields = z.infer<typeof schemaHotelSteps5>;
type ModalMode = 'add' | 'change' | 'featured' | null;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

const defaultImageEntry = { images: '', descriptions: '', category: 3, is_profile: false };

export default function RegisterHotel5({ onNext, onBack }: Props) {
  const t = useTranslations('5PropertyImages');
  const locale = useLocale();
  const { user } = useAuth();
  const [imageCategories, setImageCategories] = useState<ImageCategory[]>([]);
  const [initialValues, setInitialValues] = React.useState<FormFields | null>(null);
  const [existingImages, setExistingImages] = React.useState<any[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [draftCategory, setDraftCategory] = useState<number | undefined>(undefined);
  const [draftImage, setDraftImage] = useState<string>('');
  const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const propertyDataStr = user?.id ? UserStorage.getItem<string>('propertyData', user.id) : null;
  const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};

  const defaultValues: FormFields = stored?.step5?.entries
    ? stored.step5
    : {
        entries: Array.from({ length: MIN_IMAGES }, () => ({ ...defaultImageEntry })),
      };

  useEffect(() => {
    getImageCategories().then(setImageCategories).catch(() => setImageCategories([]));
  }, []);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps5) as any,
    mode: 'onChange',
    defaultValues,
  });

  const watchedEntries = form.watch('entries');
  const filledCount = watchedEntries.filter((e) => e.images).length;
  const hasProfileSelected = watchedEntries.some((e) => e.is_profile && e.images);
  const hasValidImage = filledCount > 0;
  const hasMinCount = filledCount >= MIN_IMAGES;
  const filledIndexes = watchedEntries
    .map((e, i) => (e.images ? i : -1))
    .filter((i) => i >= 0);

  const { fields, append, replace } = useFieldArray({
    control: form.control,
    name: 'entries',
  });

  useEffect(() => {
    const fetchExistingImages = async () => {
      if (!user?.id || !user?.hotel) return;

      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
      const propertyId = stored.propertyId || user.hotel;

      const restoreFromData = (raw: any[], restored: typeof watchedEntries) => {
        while (restored.length < MIN_IMAGES) {
          restored.push({ ...defaultImageEntry });
        }
        replace(restored);
        setInitialValues({ entries: restored });
        setExistingImages(
          raw.map((img: any, idx: number) => ({
            ...img,
            is_profile: restored[idx]?.is_profile ?? Boolean(img.is_profile),
          }))
        );
      };

      if (stored?.step5?.raw) {
        let restored = stored.step5.raw.map((item: any) => ({
          images: item.image,
          descriptions: item.description,
          category: item.category ?? 3,
          is_profile: Boolean(item.is_profile),
        }));
        const profileIdx = restored.findIndex((item: any) => item.is_profile);
        if (profileIdx === -1 && restored.length > 0) {
          restored = restored.map((item: any, idx: number) => ({ ...item, is_profile: idx === 0 }));
        } else if (profileIdx > -1) {
          restored = restored.map((item: any, idx: number) => ({
            ...item,
            is_profile: idx === profileIdx,
          }));
        }
        restoreFromData(stored.step5.raw, restored);
        return;
      }

      try {
        const res = await fetch(`${API_URL}?property=${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            let restored = data.map((item: any) => ({
              images: item.image,
              descriptions: item.description || '',
              category: item.category ?? 3,
              is_profile: Boolean(item.is_profile),
            }));
            const profileIdx = restored.findIndex((item: any) => item.is_profile);
            if (profileIdx === -1 && restored.length > 0) {
              restored = restored.map((item: any, idx: number) => ({ ...item, is_profile: idx === 0 }));
            } else if (profileIdx > -1) {
              restored = restored.map((item: any, idx: number) => ({
                ...item,
                is_profile: idx === profileIdx,
              }));
            }
            restoreFromData(data, restored);
            UserStorage.setItem(
              'propertyData',
              JSON.stringify({
                ...stored,
                step5: {
                  entries: restored,
                  property_photos: data.map((img: any) => img.id),
                  raw: data,
                },
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

  const closeModal = () => {
    setModalMode(null);
    setActiveIndex(null);
    setDraftImage('');
    setDraftCategory(undefined);
  };

  const openAddModal = (index: number) => {
    setModalMode('add');
    setActiveIndex(index);
    setDraftImage('');
    setDraftCategory(undefined);
  };

  const openChangeModal = (index: number) => {
    const entry = watchedEntries[index];
    setModalMode('change');
    setActiveIndex(index);
    setDraftImage(entry?.images || '');
    setDraftCategory(entry?.category || 3);
  };

  const removeImage = (index: number) => {
    form.setValue(`entries.${index}.images`, '', { shouldValidate: true, shouldDirty: true });
    form.setValue(`entries.${index}.is_profile`, false, { shouldValidate: true, shouldDirty: true });
  };

  const setAsProfile = (index: number) => {
    watchedEntries.forEach((_, i) => {
      form.setValue(`entries.${i}.is_profile`, i === index, { shouldValidate: true, shouldDirty: true });
    });
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('image_format_error'));
      return false;
    }
    if (file.size / 1024 < 100) {
      toast.error(t('image_size_error'));
      return false;
    }
    return true;
  };

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
      event.target.value = '';
      return;
    }
    const b64 = await readFileAsBase64(file);
    setDraftImage(b64);
    const nextEmpty = watchedEntries.findIndex((e) => !e.images);
    setActiveIndex(nextEmpty >= 0 ? nextEmpty : watchedEntries.length);
    setModalMode('add');
    event.target.value = '';
  };

  const saveImageModal = () => {
    if (!draftCategory) {
      toast.error(t('category_placeholder'));
      return;
    }
    if (!draftImage) {
      toast.error(t('image_format_error'));
      return;
    }
    if (activeIndex === null) return;

    const isFirstImage = !watchedEntries.some((e) => e.images);
    const targetIndex = activeIndex;

    if (targetIndex >= watchedEntries.length) {
      append({
        images: draftImage,
        descriptions: '',
        category: draftCategory,
        is_profile: isFirstImage,
      });
    } else {
      form.setValue(`entries.${targetIndex}.images`, draftImage, { shouldValidate: true, shouldDirty: true });
      form.setValue(`entries.${targetIndex}.category`, draftCategory, { shouldValidate: true, shouldDirty: true });
      if (isFirstImage) {
        form.setValue(`entries.${targetIndex}.is_profile`, true, { shouldValidate: true });
      }
    }

    closeModal();
  };

  const applyFeaturedImage = () => {
    if (filledIndexes.length === 0) return;
    const targetIndex = filledIndexes[featuredCarouselIndex];
    if (targetIndex === undefined) return;

    fields.forEach((_, idx) => {
      form.setValue(`entries.${idx}.is_profile`, idx === targetIndex, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
    if (draftCategory) {
      form.setValue(`entries.${targetIndex}.category`, draftCategory, { shouldValidate: true });
    }
    closeModal();
  };

  const handleFeaturedUploadNew = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
      event.target.value = '';
      return;
    }
    const b64 = await readFileAsBase64(file);
    const nextEmpty = watchedEntries.findIndex((e) => !e.images);
    const targetIndex = nextEmpty >= 0 ? nextEmpty : watchedEntries.length;

    if (targetIndex >= watchedEntries.length) {
      append({
        images: b64,
        descriptions: '',
        category: draftCategory || 3,
        is_profile: true,
      });
    } else {
      form.setValue(`entries.${targetIndex}.images`, b64, { shouldValidate: true, shouldDirty: true });
      form.setValue(`entries.${targetIndex}.category`, draftCategory || 3, { shouldValidate: true });
      fields.forEach((_, idx) => {
        form.setValue(`entries.${idx}.is_profile`, idx === targetIndex, { shouldValidate: true });
      });
    }
    event.target.value = '';
    closeModal();
  };

  const onInvalid = () => {
    const entriesErrors = form.formState.errors.entries;
    let msg: string | undefined;
    if (entriesErrors) {
      if (typeof entriesErrors.message === 'string') {
        msg = entriesErrors.message;
      } else if (Array.isArray(entriesErrors)) {
        const first = entriesErrors.find(Boolean);
        msg = first?.root?.message || first?.message;
      } else if (entriesErrors.root?.message) {
        msg = entriesErrors.root.message;
      }
    }
    if (msg) {
      toast.error(msg);
    } else if (!watchedEntries.some((e) => e.is_profile && e.images)) {
      toast.error(t('profile_image_required'));
    } else {
      toast.error(t('please_fix_errors'));
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

    const normalizedEntries = data.entries.map((entry, idx) => ({
      ...entry,
      is_profile: idx === profileIndex,
    }));

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
      const newEntries: { index: number; entry: typeof data.entries[0] }[] = [];
      const patchTasks: { index: number; entry: typeof data.entries[0]; existingImage: any }[] = [];
      const keepTasks: { index: number; existingImage: any }[] = [];

      for (let i = 0; i < normalizedEntries.length; i++) {
        const entry = normalizedEntries[i];
        if (!entry.images) continue;
        const existingImage = existingImages[i];
        const isNewImage = entry.images.startsWith('data:');

        if (isNewImage) {
          newEntries.push({ index: i, entry });
        } else if (existingImage) {
          const isDescriptionChanged = existingImage.description !== entry.descriptions;
          const isCategoryChanged = existingImage.category !== entry.category;
          const isProfileChanged = Boolean(existingImage.is_profile) !== Boolean(entry.is_profile);
          if (isDescriptionChanged || isCategoryChanged || isProfileChanged) {
            patchTasks.push({ index: i, entry, existingImage });
          } else {
            keepTasks.push({ index: i, existingImage });
          }
        }
      }

      let uploadedImages: any[] = [];
      if (newEntries.length > 0) {
        const payload = newEntries.map(({ entry }) => ({
          property: propertyId,
          image: entry.images,
          category: entry.category,
          description: entry.descriptions,
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

      const patchResults = await Promise.all(
        patchTasks.map(async ({ index, entry, existingImage }) => {
          const updateRes = await fetch(`${API_URL}${existingImage.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: entry.descriptions,
              category: entry.category,
            }),
          });
          if (updateRes.ok) {
            return { index, json: await updateRes.json() };
          }
          return { index, json: existingImage };
        })
      );

      const resultMap = new Map<number, any>();
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
      for (let i = 0; i < normalizedEntries.length; i++) {
        if (resultMap.has(i)) result.push(resultMap.get(i));
      }

      const storedEntries = normalizedEntries.map((entry, idx) => ({
        ...entry,
        images: resultMap.get(idx)?.image || entry.images,
      }));

      UserStorage.setItem(
        'propertyData',
        JSON.stringify({
          ...stored,
          step5: { entries: storedEntries, property_photos: allImageIds, raw: result },
          property_photos: allImageIds,
        }),
        user.id
      );

      onNext();
    } catch (error) {
      console.error(error);
      toast.error(t('error_try_again'));
    }
  };

  const featuredCarouselImage =
    filledIndexes.length > 0
      ? watchedEntries[filledIndexes[featuredCarouselIndex]]?.images
      : '';

  const modalTitle =
    modalMode === 'add'
      ? t('add_image_title')
      : modalMode === 'change'
        ? t('change_image_title')
        : t('featured_image_title');

  const renderImagePreview = (src: string, onClick?: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="relative mx-auto flex aspect-square w-full  items-center justify-center overflow-hidden rounded-xl border-2 border-[#4A7BF7] bg-[#E8F0FE]/30"
    >
      {src ? (
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Upload className="h-10 w-10 text-[#4A7BF7]/60" />
      )}
    </button>
  );

  return (
    <div className="flex justify-center px-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={modalMode === 'featured' ? handleFeaturedUploadNew : handleFileChange}
      />
      <input
        id="featured-file-input"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFeaturedUploadNew}
      />

      <Card className="w-full max-w-[640px]">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
      
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm font-semibold text-foreground">{t('upload_heading')}</p>

          <div className="mb-5 rounded-xl bg-[#F4F5FA] px-4 py-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {[
                { met: hasValidImage, label: t('req_min_size') },
                { met: hasMinCount, label: t('req_min_count') },
                { met: hasValidImage, label: t('req_format') },
                { met: hasProfileSelected, label: t('req_profile') },
              ].map(({ met, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                      met ? 'bg-primary' : 'bg-muted-foreground/25'
                    }`}
                  >
                    {met && <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs leading-snug transition-colors ${
                      met ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="relative flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#4A7BF7]/40 bg-[#E8F0FE]/50 text-[#4A7BF7] transition-colors hover:border-[#4A7BF7] hover:bg-[#E8F0FE]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A7BF7]/10">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium leading-tight px-1 text-center">
                    {t('upload_slot_label')}
                  </span>
                </button>

                {watchedEntries.map((entry, index) => {
                  if (!entry.images) return null;
                  const isProfile = Boolean(entry.is_profile);
                  return (
                    <div
                      key={index}
                      className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-colors border-border hover:border-primary/50 group ${
                        isProfile ? 'ring-2 ring-[#4A7BF7] ring-offset-2' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openChangeModal(index)}
                        className="w-full h-full"
                      >
                        <img src={entry.images} alt="" className="h-full w-full object-cover" />
                      </button>

                      {/* Star profile button - left side */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsProfile(index);
                        }}
                        className={`absolute top-1.5 left-1.5 rounded-full p-1.5 shadow transition-all hover:scale-110 ${
                          isProfile
                            ? 'bg-[#4A7BF7] text-white'
                            : 'bg-white/80 text-muted-foreground hover:bg-white'
                        }`}
                        title="Профайл болгох"
                      >
                        <Star className={`h-3.5 w-3.5 ${isProfile ? 'fill-white' : ''}`} />
                      </button>

                      {/* X delete button - top right, on hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute top-1.5 right-1.5 rounded-full bg-black/50 text-white p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        title="Устгах"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-10 rounded-xl">
                  <ChevronLeft className="mr-1.5 h-4 w-4" />
                  {t('5')}
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1 h-10 rounded-xl bg-[#4A7BF7] hover:bg-[#3d6ae0]"
                >
                  {t('finish')}
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Add / Change image modal */}
      <Dialog open={modalMode === 'add' || modalMode === 'change'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-[400px] rounded-2xl p-6 gap-0">
          <DialogTitle className="text-base font-semibold text-center pb-4 border-b mb-4">
            {modalTitle}
          </DialogTitle>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t('image_type_label')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={draftCategory ? String(draftCategory) : undefined}
                onValueChange={(v) => setDraftCategory(Number(v))}
               
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder={<span className="text-muted-foreground">{t('select_placeholder_short')}</span>} />
                </SelectTrigger>
                <SelectContent>
                  {imageCategories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {locale === 'en' ? cat.name_en : cat.name_mn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {renderImagePreview(draftImage, triggerFilePicker)}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 rounded-xl"
                onClick={triggerFilePicker}
              >
                {t('replace_image')}
              </Button>
              <Button
                type="button"
                className="flex-1 h-11 rounded-xl bg-[#4A7BF7] hover:bg-[#3d6ae0]"
                onClick={saveImageModal}
              >
                {t('save_image')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
