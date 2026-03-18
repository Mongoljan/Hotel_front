'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IconPhoto } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { PropertyPhoto } from '../types';

interface EditImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyImages: PropertyPhoto[];
  onImagesChange: (images: PropertyPhoto[]) => void;
  hotelId: string | number | undefined;
}

export function EditImagesDialog({
  open,
  onOpenChange,
  propertyImages,
  onImagesChange,
  hotelId,
}: EditImagesDialogProps) {
  const [uploadDescription, setUploadDescription] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hotelId) {
      toast.error('Зочид буудлын ID олдсонгүй. Та дахин оролдоно уу.');
      e.target.value = '';
      return;
    }

    const fileSizeKB = file.size / 1024;
    if (fileSizeKB < 100) {
      toast.error('Зургийн хэмжээ хамгийн багадаа 100KB байх ёстой');
      e.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('property', String(hotelId));
      formData.append('image', file);
      formData.append('description', uploadDescription || '');
      formData.append('is_profile', 'false');

      const res = await fetch('https://dev.kacc.mn/api/property-images/', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.image?.[0] || 'Зураг оруулахад алдаа гарлаа';
        throw new Error(msg);
      }

      toast.success('Зураг амжилттай нэмэгдлээ');
      // Reload images
      const imagesRes = await fetch(`https://dev.kacc.mn/api/property-images/?property=${hotelId}`);
      if (imagesRes.ok) {
        const images = await imagesRes.json();
        onImagesChange(images);
      }
      setUploadDescription('');
      e.target.value = '';
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    }
  };

  const handleSetProfile = async (imageId: number) => {
    try {
      // Optimistically mark selected as profile, others false
      const tasks = propertyImages.map((img) => {
        const shouldBeProfile = img.id === imageId;
        if (Boolean(img.is_profile) === shouldBeProfile) return null;
        return fetch(`https://dev.kacc.mn/api/property-images/${img.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_profile: shouldBeProfile }),
        });
      }).filter(Boolean) as Promise<Response>[];

      if (tasks.length > 0) {
        const responses = await Promise.all(tasks);
        const failed = responses.find((res) => !res.ok);
        if (failed) throw new Error('Профайл зураг солиход алдаа гарлаа');
      }

      // Reload images to reflect new profile ordering
      const imagesRes = await fetch(`https://dev.kacc.mn/api/property-images/?property=${hotelId}`);
      if (imagesRes.ok) {
        const images = await imagesRes.json();
        onImagesChange(images);
        toast.success('Профайл зураг шинэчлэгдлээ');
      }
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Энэ зургийг устгах уу?')) return;

    try {
      const res = await fetch(`https://dev.kacc.mn/api/property-images/${imageId}/`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Зураг устгахад алдаа гарлаа');

      toast.success('Зураг амжилттай устгагдлаа');
      onImagesChange(propertyImages.filter(i => i.id !== imageId));
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" preventOutsideClose hideCloseButton>
        <DialogHeader>
          <DialogTitle>Зургууд засах</DialogTitle>
          <DialogDescription>
            Буудлын зургийг оруулах, устгах боломжтой
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Upload new image */}
          <div className="border-2 border-dashed rounded-lg p-6 space-y-3">
            <Label htmlFor="imageUpload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <IconPhoto className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Зураг оруулах</p>
                <p className="text-xs text-muted-foreground">Хамгийн багадаа 100KB</p>
              </div>
            </Label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="space-y-1">
              <Label htmlFor="imageDescription" className="text-sm">Тайлбар (сонголттой)</Label>
              <Input
                id="imageDescription"
                placeholder="Зурагны тайлбар"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Existing images */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {propertyImages.map((img, idx) => (
              <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border group">
                <Image
                  src={img.image}
                  alt={img.description || `Image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                {img.description && (
                  <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/65 via-black/35 to-transparent backdrop-blur-sm">
                    <p className="text-white text-xs leading-relaxed line-clamp-2 drop-shadow-sm">
                      {img.description}
                    </p>
                  </div>
                )}
                {img.is_profile && (
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow">
                    Профайл
                  </span>
                )}
                <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant={img.is_profile ? 'secondary' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSetProfile(img.id)}
                  >
                    {img.is_profile ? 'Профайл' : 'Профайл болгох'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Хаах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
