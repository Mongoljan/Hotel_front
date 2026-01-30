'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeKB = file.size / 1024;
    if (fileSizeKB < 100) {
      toast.error('Зургийн хэмжээ хамгийн багадаа 100KB байх ёстой');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result as string;
        const res = await fetch('https://dev.kacc.mn/api/property-images/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property: hotelId,
            image: base64Image,
            description: '',
          }),
        });

        if (!res.ok) throw new Error('Зураг оруулахад алдаа гарлаа');

        toast.success('Зураг амжилттай нэмэгдлээ');
        // Reload images
        const imagesRes = await fetch(`https://dev.kacc.mn/api/property-images/?property=${hotelId}`);
        if (imagesRes.ok) {
          const images = await imagesRes.json();
          onImagesChange(images);
        }
        e.target.value = '';
      } catch (err: any) {
        toast.error(err.message || 'Алдаа гарлаа');
      }
    };
    reader.readAsDataURL(file);
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
          <div className="border-2 border-dashed rounded-lg p-6">
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
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteImage(img.id)}
                >
                  ×
                </Button>
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
