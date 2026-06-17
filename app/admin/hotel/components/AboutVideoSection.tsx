'use client';

import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AdditionalInformation } from '../types';

interface AboutVideoSectionProps {
  additionalInfo: AdditionalInformation | null;
  onEditAbout: () => void;
  onAddVideo: () => void;
  onEditVideo: () => void;
  onDeleteVideo: () => void;
  isVideoActionLoading?: boolean;
}

const ABOUT_TRUNCATE_MIN_LENGTH = 120;

export function AboutVideoSection({
  additionalInfo,
  onEditAbout,
  onAddVideo,
  onEditVideo,
  onDeleteVideo,
  isVideoActionLoading = false,
}: AboutVideoSectionProps) {
  const t = useTranslations('SixStepInfo');

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  const aboutText = additionalInfo?.About?.trim();
  const showTruncated = Boolean(aboutText && aboutText.length > ABOUT_TRUNCATE_MIN_LENGTH);

  return (
    <div className="space-y-4 min-w-0">
      <div className="relative border rounded-lg bg-card p-4 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-semibold text-sm shrink-0">{t('aboutTitle')}</h3>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={onEditAbout}>
            <IconPencil className="h-4 w-4" />
          </Button>
        </div>
        {aboutText ? (
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm text-muted-foreground leading-relaxed [overflow-wrap:anywhere]',
                showTruncated && 'line-clamp-4'
              )}
            >
              {aboutText}
            </p>
            {showTruncated && (
              <button
                type="button"
                onClick={onEditAbout}
                className="mt-2 text-sm font-medium text-[#4A7BF7] hover:underline"
              >
                {t('readMore')}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed break-words">
            {t('aboutPlaceholder')}
          </p>
        )}
      </div>

      <div className="relative border rounded-lg bg-card p-4 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-semibold text-sm shrink-0">{t('videoTitle')}</h3>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={onAddVideo}>
            <IconPlus className="h-4 w-4" />
          </Button>
        </div>
        {additionalInfo?.YoutubeUrl ? (
          <div className="space-y-2 min-w-0">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                className="w-full h-full"
                src={getYoutubeEmbedUrl(additionalInfo.YoutubeUrl)}
                allowFullScreen
                title={t('videoIntro')}
              />
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{t('videoIntro')}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    disabled={isVideoActionLoading}
                    aria-label={t('videoMenuLabel')}
                  >
                    <IconDotsVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={onEditVideo} disabled={isVideoActionLoading}>
                    <IconPencil className="h-4 w-4 mr-2" />
                    {t('videoEdit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDeleteVideo}
                    disabled={isVideoActionLoading}
                    className="text-destructive focus:text-destructive"
                  >
                    <IconTrash className="h-4 w-4 mr-2" />
                    {t('videoDelete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
