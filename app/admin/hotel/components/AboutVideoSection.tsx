'use client';

import { IconPencil, IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import type { AdditionalInformation } from '../types';

interface AboutVideoSectionProps {
  additionalInfo: AdditionalInformation | null;
  onEdit: () => void;
}

export function AboutVideoSection({ additionalInfo, onEdit }: AboutVideoSectionProps) {
  const t = useTranslations('SixStepInfo');

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  const aboutText = additionalInfo?.About?.trim();
  const previewText = aboutText || t('aboutPlaceholder');
  const isLong = aboutText && aboutText.length > 180;

  return (
    <div className="space-y-4">
      <div className="relative border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">{t('aboutTitle')}</h3>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
            <IconPencil className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isLong ? `${aboutText!.slice(0, 180)}…` : previewText}
        </p>
        {isLong && (
          <button type="button" onClick={onEdit} className="mt-2 text-sm font-medium text-[#4A7BF7] hover:underline">
            {t('readMore')}
          </button>
        )}
      </div>

      <div className="relative border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">{t('videoTitle')}</h3>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
            {additionalInfo?.YoutubeUrl ? <IconPencil className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
          </Button>
        </div>
        {additionalInfo?.YoutubeUrl ? (
          <div className="space-y-2">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                className="w-full h-full"
                src={getYoutubeEmbedUrl(additionalInfo.YoutubeUrl)}
                allowFullScreen
                title={t('videoIntro')}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t('videoIntro')}</p>
          </div>
        ) : (
          <div className="aspect-video bg-muted/60 flex items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground px-4 text-center">{t('videoPlaceholder')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
