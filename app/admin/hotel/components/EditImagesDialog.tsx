'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronRight, ImageIcon, Info, Star, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { OptionButton } from '@/components/ui/option-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { getImageCategories, type ImageCategory } from '@/lib/api';
import type { PropertyPhoto } from '../types';

const API_URL = 'https://dev.kacc.mn/api/property-images/';
const MIN_IMAGES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const GALLERY_PANEL_WIDTH = 600;
const UPLOAD_PANEL_WIDTH = 440;
const PANEL_TRANSITION_MS = 450;
const PANEL_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';

interface EditImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyImages: PropertyPhoto[];
  onImagesChange: (images: PropertyPhoto[]) => void;
  hotelId: string | number | undefined;
}

type SubPanelMode = 'add' | 'edit' | null;

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          met ? 'bg-primary' : 'bg-muted-foreground/25'
        )}
      >
        {met && <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />}
      </div>
      <span
        className={cn(
          'text-xs leading-snug',
          met ? 'text-primary font-medium' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  );
}

function InfoRequirementRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/25">
        <Info className="h-3 w-3 text-muted-foreground" />
      </div>
      <span className="text-xs leading-snug text-muted-foreground">{label}</span>
    </div>
  );
}

export function EditImagesDialog({
  open,
  onOpenChange,
  propertyImages,
  onImagesChange,
  hotelId,
}: EditImagesDialogProps) {
  const t = useTranslations('SixStepInfo');
  const locale = useLocale();

  const [imageCategories, setImageCategories] = useState<ImageCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [subPanelMode, setSubPanelMode] = useState<SubPanelMode>(null);
  const [editingImage, setEditingImage] = useState<PropertyPhoto | null>(null);
  const [draftCategory, setDraftCategory] = useState<number | undefined>();
  const [draftPreview, setDraftPreview] = useState('');
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const subPanelFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      getImageCategories().then(setImageCategories).catch(() => setImageCategories([]));
    }
  }, [open]);

  const hasMinCount = propertyImages.length >= MIN_IMAGES;
  const hasProfileSelected = propertyImages.some((img) => img.is_profile);

  const draftMeetsFormat = useMemo(() => {
    if (draftFile) {
      return VALID_IMAGE_TYPES.includes(draftFile.type) && draftFile.size <= MAX_FILE_BYTES;
    }
    return subPanelMode === 'edit' && Boolean(draftPreview);
  }, [draftFile, draftPreview, subPanelMode]);

  const draftMeetsMinSize = useMemo(() => {
    if (draftFile) return draftFile.size / 1024 >= 100;
    return subPanelMode === 'edit' && Boolean(draftPreview);
  }, [draftFile, draftPreview, subPanelMode]);

  const categoryCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    propertyImages.forEach((img) => {
      if (img.category) {
        counts[img.category] = (counts[img.category] || 0) + 1;
      }
    });
    return counts;
  }, [propertyImages]);

  const filteredImages = useMemo(() => {
    if (categoryFilter === 'all') return propertyImages;
    return propertyImages.filter((img) => img.category === categoryFilter);
  }, [categoryFilter, propertyImages]);

  const reloadImages = useCallback(async () => {
    if (!hotelId) return;
    const imagesRes = await fetch(`${API_URL}?property=${hotelId}`);
    if (imagesRes.ok) {
      onImagesChange(await imagesRes.json());
    }
  }, [hotelId, onImagesChange]);

  const closeSubPanel = () => {
    setSubPanelMode(null);
    setEditingImage(null);
    setDraftCategory(undefined);
    setDraftPreview('');
    setDraftFile(null);
  };

  const handleSheetOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeSubPanel();
    onOpenChange(isOpen);
  };

  const validateFile = (file: File): boolean => {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast.error(t('imageFormatError'));
      return false;
    }
    if (file.size / 1024 < 100) {
      toast.error(t('imageSizeError'));
      return false;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error(t('imageMaxSizeError'));
      return false;
    }
    return true;
  };

  const readFilePreview = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const openAddPanel = () => {
    setSubPanelMode('add');
    setEditingImage(null);
    setDraftCategory(undefined);
    setDraftPreview('');
    setDraftFile(null);
  };

  const openEditPanel = (img: PropertyPhoto) => {
    setSubPanelMode('edit');
    setEditingImage(img);
    setDraftCategory(img.category ?? undefined);
    setDraftPreview(img.image);
    setDraftFile(null);
  };

  const handleFileSelected = async (file: File) => {
    if (!validateFile(file)) return;
    setDraftFile(file);
    setDraftPreview(await readFilePreview(file));
    if (subPanelMode === null) setSubPanelMode('add');
  };

  const handleSubPanelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileSelected(file);
    e.target.value = '';
  };

  const handleSetProfile = async (imageId: number) => {
    try {
      const tasks = propertyImages
        .map((img) => {
          const shouldBeProfile = img.id === imageId;
          if (Boolean(img.is_profile) === shouldBeProfile) return null;
          return fetch(`${API_URL}${img.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_profile: shouldBeProfile }),
          });
        })
        .filter(Boolean) as Promise<Response>[];

      if (tasks.length > 0) {
        const responses = await Promise.all(tasks);
        if (responses.some((res) => !res.ok)) throw new Error(t('profileError'));
      }

      await reloadImages();
      toast.success(t('profileUpdated'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('genericError'));
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (propertyImages.length <= MIN_IMAGES) {
      toast.error(t('cannotDeleteMin'));
      return;
    }

    try {
      const res = await fetch(`${API_URL}${imageId}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error(t('deleteError'));

      toast.success(t('deleteSuccess'));
      onImagesChange(propertyImages.filter((i) => i.id !== imageId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('genericError'));
    }
  };

  const uploadImage = async (file: File, category: number, isProfile: boolean) => {
    if (!hotelId) throw new Error(t('hotelIdMissing'));

    const formData = new FormData();
    formData.append('property', String(hotelId));
    formData.append('image', file);
    formData.append('category', String(category));
    formData.append('description', '');
    formData.append('is_profile', isProfile ? 'true' : 'false');

    const res = await fetch(API_URL, { method: 'POST', body: formData });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.image?.[0] || t('uploadError'));
    }
    return res.json();
  };

  const handleSaveSubPanel = async () => {
    if (!draftCategory) {
      toast.error(t('categoryRequired'));
      return;
    }
    if (subPanelMode === 'add' && !draftFile) {
      toast.error(t('imageFormatError'));
      return;
    }
    if (subPanelMode === 'edit' && !draftPreview) {
      toast.error(t('imageFormatError'));
      return;
    }
    if (!hotelId) {
      toast.error(t('hotelIdMissing'));
      return;
    }

    setIsSaving(true);
    try {
      if (subPanelMode === 'add' && draftFile) {
        const shouldBeProfile = !hasProfileSelected && propertyImages.length === 0;
        await uploadImage(draftFile, draftCategory, shouldBeProfile);
        toast.success(t('uploadSuccess'));
      } else if (subPanelMode === 'edit' && editingImage) {
        if (draftFile) {
          const wasProfile = Boolean(editingImage.is_profile);
          await uploadImage(draftFile, draftCategory, wasProfile);
          await fetch(`${API_URL}${editingImage.id}/`, { method: 'DELETE' });
          toast.success(t('updateSuccess'));
        } else if (draftCategory !== editingImage.category) {
          const res = await fetch(`${API_URL}${editingImage.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: draftCategory }),
          });
          if (!res.ok) throw new Error(t('uploadError'));
          toast.success(t('updateSuccess'));
        }
      }

      await reloadImages();
      closeSubPanel();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setIsSaving(false);
    }
  };

  const subPanelTitle =
    subPanelMode === 'add' ? t('addImageTitle') : t('editImagePanelTitle');
  const isExtendedOpen = subPanelMode !== null;
  const sheetWidth = isExtendedOpen
    ? GALLERY_PANEL_WIDTH + UPLOAD_PANEL_WIDTH
    : GALLERY_PANEL_WIDTH;

  const extendedDraftRequirements = [
    { met: draftMeetsFormat, label: t('reqFormat') },
    { met: draftMeetsMinSize, label: t('reqMinSize') },
  ];

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        fallbackTitle={t('editImagesTitle')}
        className={cn(
          'flex h-full flex-col gap-0 p-0 border-l shadow-xl sm:max-w-none z-[51]',
          '[&>button]:hidden'
        )}
        style={{
          width: sheetWidth,
          maxWidth: sheetWidth,
          transition: `width ${PANEL_TRANSITION_MS}ms ${PANEL_EASING}, max-width ${PANEL_TRANSITION_MS}ms ${PANEL_EASING}`,
        }}
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement;
          if (
            target.closest('[data-radix-select-content]') ||
            target.closest('[data-radix-select-viewport]')
          ) {
            event.preventDefault();
          }
        }}
      >
        <div className="flex h-full min-h-0 w-full">
          {/* Extended panel — left column; sheet grows to reveal it */}
          <div
            className={cn(
              'flex shrink-0 flex-col border-r bg-background overflow-hidden',
              'transition-[width,opacity] ease-[cubic-bezier(0.32,0.72,0,1)]',
              isExtendedOpen
                ? 'w-[440px] opacity-100'
                : 'w-0 opacity-0 pointer-events-none border-r-0'
            )}
            style={{ transitionDuration: `${PANEL_TRANSITION_MS}ms` }}
          >
            <input
              ref={subPanelFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleSubPanelFileChange}
            />

            <SheetHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-4 shrink-0">
              <SheetTitle className="text-base font-semibold">{subPanelTitle}</SheetTitle>
              <button
                type="button"
                onClick={closeSubPanel}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t('goBack')}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </SheetHeader>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4">
              <div className="rounded-xl bg-[#F4F5FA] px-4 py-3.5 space-y-3">
                {extendedDraftRequirements.map(({ met, label }) => (
                  <RequirementRow key={label} met={met} label={label} />
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {t('imageTypeLabel')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={draftCategory !== undefined ? String(draftCategory) : undefined}
                  onValueChange={(v) => setDraftCategory(Number(v))}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={t('selectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[100]"
                    position="popper"
                    onPointerDownOutside={(e) => e.preventDefault()}
                  >
                    {imageCategories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {locale === 'en' ? cat.name_en : cat.name_mn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <button
                type="button"
                onClick={() => subPanelFileInputRef.current?.click()}
                className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center overflow-hidden rounded-xl border-2 border-[#4A7BF7] bg-[#E8F0FE]/30"
              >
                {draftPreview ? (
                  <img src={draftPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <Upload className="h-10 w-10 text-[#4A7BF7]/60" />
                )}
              </button>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => subPanelFileInputRef.current?.click()}
                  disabled={isSaving}
                >
                  {t('replaceImage')}
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-11 rounded-xl bg-[#4A7BF7] hover:bg-[#3d6ae0]"
                  onClick={handleSaveSubPanel}
                  disabled={isSaving}
                >
                  {t('saveImage')}
                </Button>
              </div>
            </div>
          </div>

          {/* Gallery — fixed 600px column */}
          <div
            className="relative flex h-full w-[600px] shrink-0 flex-col overflow-hidden bg-background"
            style={{ width: GALLERY_PANEL_WIDTH, maxWidth: GALLERY_PANEL_WIDTH }}
          >
          <div
            className={cn(
              'pointer-events-none absolute inset-0 z-20 transition-opacity',
              isExtendedOpen ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              transitionDuration: `${PANEL_TRANSITION_MS}ms`,
              transitionTimingFunction: PANEL_EASING,
              backgroundColor: isExtendedOpen ? 'rgba(255,255,255,0.55)' : 'transparent',
            }}
            aria-hidden
          />
          <div
            className={cn(
              'relative flex h-full min-h-0 flex-col',
              isExtendedOpen && 'pointer-events-none'
            )}
          >
          <SheetHeader className="flex-row items-center justify-between space-y-0 border-b px-5 py-4">
            <SheetTitle className="text-base font-semibold">{t('editImagesTitle')}</SheetTitle>
            <button
              type="button"
              onClick={() => handleSheetOpenChange(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t('close')}
            >
              <X className="h-5 w-5" />
            </button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <button
                type="button"
                onClick={openAddPanel}
                className="flex aspect-square w-full max-w-[140px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#4A7BF7]/40 bg-[#E8F0FE]/40 text-[#4A7BF7] transition-colors hover:border-[#4A7BF7] hover:bg-[#E8F0FE]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A7BF7]/10">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium leading-tight px-2 text-center">
                  {t('addNewImage')}
                </span>
              </button>

              <div className="flex-1 rounded-xl bg-[#F4F5FA] px-4 py-3.5 space-y-3">
                <RequirementRow met={hasMinCount} label={t('reqMinCount')} />
                <RequirementRow met={hasProfileSelected} label={t('reqProfile')} />
                <InfoRequirementRow label={t('reqFormat')} />
                <InfoRequirementRow label={t('reqMinSize')} />
              </div>
            </div>

            <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <OptionButton
                selected={categoryFilter === 'all'}
                onClick={() => setCategoryFilter('all')}
                className="shrink-0 rounded-full px-3 py-1 text-xs whitespace-nowrap"
              >
                {t('filterAll')} ({propertyImages.length})
              </OptionButton>
              {imageCategories.map((cat) => (
                <OptionButton
                  key={cat.id}
                  selected={categoryFilter === cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className="shrink-0 rounded-full px-3 py-1 text-xs whitespace-nowrap"
                >
                  {locale === 'en' ? cat.name_en : cat.name_mn} ({categoryCounts[cat.id] || 0})
                </OptionButton>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {filteredImages.map((img) => {
                const isProfile = Boolean(img.is_profile);
                return (
                  <div
                    key={img.id}
                    className={cn(
                      'group relative aspect-square overflow-hidden rounded-xl border transition-colors',
                      isProfile ? 'ring-2 ring-[#4A7BF7] ring-offset-2 border-[#4A7BF7]/30' : 'border-border'
                    )}
                  >
                    <button type="button" onClick={() => openEditPanel(img)} className="absolute inset-0 z-0">
                      <Image
                        src={img.image}
                        alt={img.description || 'Hotel image'}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isProfile) handleSetProfile(img.id);
                      }}
                      className={cn(
                        'group/star absolute top-1.5 left-1.5 z-10 rounded-full p-1.5 shadow transition-all',
                        isProfile
                          ? 'bg-[#F5B800] text-white'
                          : 'bg-white/90 text-muted-foreground hover:bg-white'
                      )}
                      aria-label={!isProfile ? t('setAsProfile') : undefined}
                    >
                      <Star className={cn('h-3.5 w-3.5', isProfile && 'fill-white')} />
                      {!isProfile && (
                        <span
                          className="pointer-events-none absolute left-full top-1/2 z-30 ml-1.5 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover/star:opacity-100"
                        >
                          {t('setAsProfile')}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img.id);
                      }}
                      className="absolute top-1.5 right-1.5 z-20 rounded-full bg-black/55 p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-black/75"
                      aria-label={t('deleteImage')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
