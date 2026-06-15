'use client';

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandYoutube,
  IconPencil,
  IconWorld,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ApiNeededLabel } from '@/components/ApiNeededLabel';
import { EditSocialLinksSheet } from './EditSocialLinksSheet';

const SOCIAL_ICONS = [
  { key: 'web', icon: IconWorld, className: 'text-muted-foreground' },
  { key: 'facebook', icon: IconBrandFacebook, className: 'text-[#1877F2]' },
  { key: 'instagram', icon: IconBrandInstagram, className: 'text-[#E4405F]' },
  { key: 'youtube', icon: IconBrandYoutube, className: 'text-[#FF0000]' },
  { key: 'twitter', icon: IconBrandTwitter, className: 'text-[#1DA1F2]' },
  { key: 'linkedin', icon: IconBrandLinkedin, className: 'text-[#0A66C2]' },
];

export function SocialLinksSection() {
  const t = useTranslations('SixStepInfo');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="relative border rounded-lg bg-card p-4 min-w-0">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3 className="font-semibold text-sm shrink-0">{t('socialLinksTitle')}</h3>
            <ApiNeededLabel />
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
          {SOCIAL_ICONS.map(({ key, icon: Icon, className }) => (
            <div
              key={key}
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted/40"
              title={key}
            >
              <Icon className={cn('h-4 w-4', className)} />
            </div>
          ))}
        </div>
      </div>

      <EditSocialLinksSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
