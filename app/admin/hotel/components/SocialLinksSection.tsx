'use client';

import { IconPencil, IconWorld } from '@tabler/icons-react';
import { FacebookIcon, InstagramIcon, TiktokIcon, XIcon, YoutubeIcon } from './SocialIcons';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditSocialLinksSheet, type SocialLinksDraft } from './EditSocialLinksSheet';
import type { AdditionalInformation } from '../types';

const SOCIAL_ICONS: {
  key: keyof SocialLinksDraft;
  field: keyof AdditionalInformation;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}[] = [
  { key: 'web', field: 'website_url', icon: IconWorld, className: 'text-muted-foreground' },
  { key: 'facebook', field: 'facebook_url', icon: FacebookIcon },
  { key: 'instagram', field: 'instagram_url', icon: InstagramIcon },
  { key: 'youtube', field: 'youtube_url', icon: YoutubeIcon },
  { key: 'tiktok', field: 'tiktok_url', icon: TiktokIcon },
  { key: 'x', field: 'twitter_url', icon: XIcon },
];

interface SocialLinksSectionProps {
  additionalInfo: AdditionalInformation | null;
  onSave: (links: {
    website_url: string;
    facebook_url: string;
    instagram_url: string;
    youtube_url: string;
    tiktok_url: string;
    twitter_url: string;
  }) => Promise<boolean | undefined>;
}

export function SocialLinksSection({ additionalInfo, onSave }: SocialLinksSectionProps) {
  const t = useTranslations('SixStepInfo');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="relative border rounded-lg bg-card p-4 min-w-0">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3 className="font-semibold text-sm shrink-0">{t('socialLinksTitle')}</h3>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setIsSheetOpen(true)}
            aria-label={t('socialLinksSheetTitle')}
          >
            <IconPencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_ICONS.map(({ key, field, icon: Icon, className }) => {
            const url = (additionalInfo?.[field] as string | null | undefined) || '';
            const hasLink = url.trim() !== '';
            const circle = (
              <div
                key={key}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border bg-muted/40',
                  hasLink ? 'opacity-100' : 'opacity-40'
                )}
                title={key}
              >
                <Icon className={cn('h-4 w-4', className)} />
              </div>
            );
            return hasLink ? (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                {circle}
              </a>
            ) : (
              circle
            );
          })}
        </div>
      </div>

      <EditSocialLinksSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        additionalInfo={additionalInfo}
        onSave={onSave}
      />
    </>
  );
}
