'use client';

import { CheckCircle2, Clock, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import type { BasicInfo, PropertyBaseInfo } from '../types';

interface HotelHeaderProps {
  basicInfo: BasicInfo | null;
  propertyBaseInfo: PropertyBaseInfo | null;
  starCount?: number;
  contractIsActive?: boolean | null;
}

export function HotelHeader({
  basicInfo,
  propertyBaseInfo,
  starCount = 0,
  contractIsActive = null,
}: HotelHeaderProps) {
  const t = useTranslations('SixStepInfo');
  const displayStars = starCount > 0 && starCount <= 5 ? starCount : 0;

  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[30px] font-semibold tracking-tight">
            {basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || '—'}
          </h1>
          {displayStars > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < displayStars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/35'}`}
                />
              ))}
            </div>
          )}
        </div>
        {basicInfo?.property_name_en && (
          <p className="text-sm text-muted-foreground mt-0.5">{basicInfo.property_name_en}</p>
        )}
      </div>
      {contractIsActive !== null && (
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
            contractIsActive
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-red bg-red-50 text-red-600'
          )}
        >
          {contractIsActive ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
          ) : (
            <Clock className="h-3.5 w-3.5 shrink-0 text-red" aria-hidden />
          )}
          <span className={contractIsActive ? 'text-emerald-600' : 'text-red'}>
            {contractIsActive ? t('contractActive') : t('contractPending')}
          </span>
        </span>
      )}
    </div>
  );
}
