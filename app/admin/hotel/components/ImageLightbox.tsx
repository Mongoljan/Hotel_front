'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PropertyPhoto } from '../types';

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: PropertyPhoto[];
  currentImage: string | null;
  onImageChange: (image: string) => void;
}

export function ImageLightbox({
  open,
  onOpenChange,
  images,
  currentImage,
  onImageChange,
}: ImageLightboxProps) {
  const currentIndex = images.findIndex(img => img.image === currentImage);

  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageChange(images[prevIndex].image);
  };

  const goToNext = () => {
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageChange(images[nextIndex].image);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-2">
        <DialogTitle className="sr-only">Hotel Image Gallery</DialogTitle>
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
                
                {/* Navigation Buttons */}
                {images.length > 1 && (
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
          
          {/* Image Indicators (Dots) */}
          {images.length > 1 && (
            <div className="flex gap-2 pb-4">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  className={`h-2 rounded-full transition-all ${
                    img.image === currentImage 
                      ? 'w-8 bg-white' 
                      : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={() => onImageChange(img.image)}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
