'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PropertyPhoto } from '../types';

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: PropertyPhoto[];
  currentImage: string | null;
  onImageChange: (image: string) => void;
  hotelId?: string | number;
  onImagesChange?: (images: PropertyPhoto[]) => void;
}

export function ImageLightbox({
  open,
  onOpenChange,
  images,
  currentImage,
  onImageChange,
  hotelId,
  onImagesChange,
}: ImageLightboxProps) {
  const orderedImages = useMemo(() => {
    const profile = images.find((img) => img.is_profile);
    if (!profile) return images;
    const rest = images.filter((img) => img.id !== profile.id);
    return [profile, ...rest];
  }, [images]);

  const currentIndex = orderedImages.findIndex(img => img.image === currentImage);
  const currentPhoto = currentIndex >= 0 ? orderedImages[currentIndex] : null;
  const [isEditing, setIsEditing] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');

  useEffect(() => {
    setIsEditing(false);
    setDraftDescription(currentPhoto?.description || '');
  }, [currentPhoto?.description, currentPhoto?.id]);

  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : orderedImages.length - 1;
    onImageChange(orderedImages[prevIndex].image);
  };

  const goToNext = () => {
    const nextIndex = currentIndex < orderedImages.length - 1 ? currentIndex + 1 : 0;
    onImageChange(orderedImages[nextIndex].image);
  };

  const refreshImages = async () => {
    if (!hotelId || !onImagesChange) return;
    const res = await fetch(`https://dev.kacc.mn/api/property-images/?property=${hotelId}`);
    if (res.ok) {
      const imgs = await res.json();
      const profile = imgs.find((img: PropertyPhoto) => img.is_profile);
      const ordered = profile ? [profile, ...imgs.filter((i: PropertyPhoto) => i.id !== profile.id)] : imgs;
      onImagesChange(ordered);
      if (ordered.length && !ordered.find((img: PropertyPhoto) => img.image === currentImage)) {
        onImageChange(ordered[0].image);
      }
    }
  };

  const handleSetProfile = async () => {
    if (!hotelId || !currentPhoto) return;
    try {
      const res = await fetch(`https://dev.kacc.mn/api/property-images/${currentPhoto.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_profile: true }),
      });
      if (!res.ok) throw new Error('Профайл зураг болгоход алдаа гарлаа');
      await refreshImages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDescription = async () => {
    if (!hotelId || !currentPhoto) return;
    try {
      const res = await fetch(`https://dev.kacc.mn/api/property-images/${currentPhoto.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: draftDescription }),
      });
      if (!res.ok) throw new Error('Тайлбар хадгалахад алдаа гарлаа');
      setIsEditing(false);
      await refreshImages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-2">
        <DialogTitle className="sr-only">Hotel Image Gallery</DialogTitle>
        <DialogDescription className="sr-only">Full screen hotel image viewer</DialogDescription>
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
          {/* Main Image */}
          <div className="relative w-full flex-1 flex items-center justify-center">
            {currentImage && (
              <>
                <Image
                  src={currentImage}
                  alt="Hotel image full view"
                  fill
                  className="object-contain"
                  priority
                />

                {currentPhoto?.description && (
                  <div className="absolute inset-x-0 bottom-0 px-4 pb-6 pt-10 bg-gradient-to-t from-black/65 via-black/30 to-transparent backdrop-blur-sm">
                    <p className="text-white text-sm leading-relaxed drop-shadow-sm max-w-4xl mx-auto text-center">
                      {currentPhoto.description}
                    </p>
                  </div>
                )}

                {/* Top-right controls */}
                {currentPhoto && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditing((v) => !v)}
                    >
                      {isEditing ? 'Болих' : 'Тайлбар засах'}
                    </Button>
                    <Button
                      variant={currentPhoto.is_profile ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={handleSetProfile}
                    >
                      {currentPhoto.is_profile ? 'Профайл' : 'Профайл болгох'}
                    </Button>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                {orderedImages.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                      onClick={goToPrevious}
                    >
                      <IconChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                      onClick={goToNext}
                    >
                      <IconChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Description editor */}
          {isEditing && currentPhoto && (
            <div className="w-full max-w-3xl space-y-2 pb-2">
              <Textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                placeholder="Зургийн тайлбар"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Цуцлах
                </Button>
                <Button size="sm" onClick={handleSaveDescription}>
                  Хадгалах
                </Button>
              </div>
            </div>
          )}

          {/* Thumbnail grid */}
          {orderedImages.length > 1 && (
            <div className="w-full max-w-5xl pb-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {orderedImages.map((img) => {
                  const isActive = img.image === currentImage;
                  return (
                    <button
                      key={img.id}
                      className={`relative h-20 rounded-md overflow-hidden border ${isActive ? 'ring-2 ring-primary' : 'border-border'} hover:opacity-90 transition`}
                      onClick={() => onImageChange(img.image)}
                    >
                      <Image
                        src={img.image}
                        alt={img.description || 'Thumbnail'}
                        fill
                        className="object-cover"
                      />
                      {img.is_profile && (
                        <span className="absolute top-1 right-1 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                          Профайл
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
