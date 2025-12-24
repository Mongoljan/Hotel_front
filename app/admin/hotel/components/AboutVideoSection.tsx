'use client';

import { Button } from '@/components/ui/button';
import { IconPencil } from '@tabler/icons-react';
import type { AdditionalInformation } from '../types';

interface AboutVideoSectionProps {
  additionalInfo: AdditionalInformation | null;
  onEdit: () => void;
}

export function AboutVideoSection({ additionalInfo, onEdit }: AboutVideoSectionProps) {
  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  return (
    <div className="space-y-4">
      {/* Бидний тухай */}
      <div className="relative border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Бидний тухай</h3>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <IconPencil className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {additionalInfo?.About || 'Та өөрийн зочид буудлын талаар мэдээлэл оруулна уу.'}
        </p>
      </div>

      {/* Видео */}
      <div className="relative border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Видео</h3>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <IconPencil className="h-4 w-4" />
          </Button>
        </div>
        {additionalInfo?.YoutubeUrl ? (
          <div className="space-y-2">
            <div className="aspect-video rounded-md overflow-hidden">
              <iframe
                className="w-full h-full"
                src={getYoutubeEmbedUrl(additionalInfo.YoutubeUrl)}
                allowFullScreen
              />
            </div>
            <p className="text-xs text-muted-foreground">Hotel Introduction</p>
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-md">
            <p className="text-sm text-muted-foreground">Та зочид буудлынхаа тухай танилцуулга видео холбоосыг оруулна уу.</p>
          </div>
        )}
      </div>
    </div>
  );
}
