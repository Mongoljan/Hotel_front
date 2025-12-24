'use client';

import { Badge } from '@/components/ui/badge';
import type { BasicInfo, PropertyBaseInfo } from '../types';

interface HotelHeaderProps {
  basicInfo: BasicInfo | null;
  propertyBaseInfo: PropertyBaseInfo | null;
}

export function HotelHeader({ basicInfo, propertyBaseInfo }: HotelHeaderProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <h1 className="text-2xl font-bold">
          {basicInfo?.property_name_mn || propertyBaseInfo?.PropertyName || 'Шангри-Ла Улаанбаатар Зочид Буудал'}
        </h1>
        {basicInfo?.property_name_en && (
          <p className="text-sm text-muted-foreground">{basicInfo.property_name_en}</p>
        )}
      </div>
      <Badge
        variant="default"
        className="bg-green-600 hover:bg-green-600 cursor-default px-4 py-2 text-sm font-medium"
      >
        Баталгаажсан ✓
      </Badge>
    </div>
  );
}
