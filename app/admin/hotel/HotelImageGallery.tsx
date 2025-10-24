'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyPhoto {
  id: number;
  image: string;
  description: string;
}

interface Props {
  images: PropertyPhoto[];
}

export default function HotelImageGallery({ images }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Зураг байхгүй байна</p>
        </CardContent>
      </Card>
    );
  }

  const currentImage = images[selectedIndex];

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Main Image */}
          <div className="relative aspect-[16/9] bg-muted">
            <Image
              src={currentImage.image}
              alt={currentImage.description || 'Hotel image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow-lg"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full shadow-lg"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="shadow-lg">
                {selectedIndex + 1} / {images.length}
              </Badge>
            </div>

            {/* Expand Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 right-3 shadow-lg"
              onClick={() => setIsDialogOpen(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Дэлгэрэнгүй
            </Button>
          </div>

          {/* Description */}
          {currentImage.description && (
            <div className="p-4 bg-muted/30 border-t">
              <p className="text-sm text-muted-foreground">{currentImage.description}</p>
            </div>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={cn(
                    "relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                    selectedIndex === idx
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img.image}
                    alt={img.description || `Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>
                Зураг {selectedIndex + 1} / {images.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex-1 p-6 pt-2">
            <div className="relative h-full w-full">
              <Image
                src={currentImage.image}
                alt={currentImage.description || 'Hotel image'}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>

            {/* Navigation in Dialog */}
            {images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-xl"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-xl"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Description in Dialog */}
            {currentImage.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur p-4 border-t">
                <p className="text-sm">{currentImage.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
