'use client';

import { BadgeCheck } from 'lucide-react';
import type { BasicInfo, PropertyBaseInfo } from '../types';

interface HotelHeaderProps {
  basicInfo: BasicInfo | null;
  propertyBaseInfo: PropertyBaseInfo | null;
}

export function HotelHeader({ basicInfo, propertyBaseInfo }: HotelHeaderProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <h1 className="text-2xl font-semibold">
          {basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || 'Шангри-Ла Улаанбаатар Зочид Буудал'}
        </h1>
        {basicInfo?.property_name_en && (
          <p className="text-sm text-muted-foreground">{basicInfo.property_name_en}</p>
        )}
      </div>
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
        title="Баталгаажсан буудал"
      >
        <BadgeCheck className="h-3.5 w-3.5 fill-primary text-primary-foreground" />
        Баталгаажсан
      </span>
    </div>
  );
}
