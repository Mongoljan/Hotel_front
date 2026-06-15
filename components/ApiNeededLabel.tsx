'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface ApiNeededLabelProps {
  className?: string;
}

export function ApiNeededLabel({ className }: ApiNeededLabelProps) {
  const t = useTranslations('SixStepInfo');

  return (
    <span className={cn('text-sm font-bold text-primary shrink-0', className)}>
      {t('apiNeededLabel')}
    </span>
  );
}
