'use client';

import { IconPencil, IconWorld } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

const SOCIAL_ICONS = [
  { key: 'web', label: 'Web' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
];

export function SocialLinksSection() {
  const t = useTranslations('SixStepInfo');

  return (
    <div className="relative border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{t('socialLinksTitle')}</h3>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled aria-label={t('editDisabled')}>
          <IconPencil className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {SOCIAL_ICONS.map((icon, index) => (
          <div
            key={icon.key}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted/40 text-muted-foreground"
            title={icon.label}
          >
            {index === 0 ? <IconWorld className="h-4 w-4" /> : <span className="text-[10px] font-semibold">{icon.label[0]}</span>}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground rounded-md bg-muted/50 px-3 py-2">{t('apiNeeded')}</p>
    </div>
  );
}
