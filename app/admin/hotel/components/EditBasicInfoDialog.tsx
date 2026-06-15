'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useCombinedData } from '@/app/hooks/useCombinedData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MonthYearPickerWithValue } from '@/components/ui/date-picker';
import { OptionButton } from '@/components/ui/option-button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { YesNoToggle } from '@/components/ui/yes-no-toggle';
import { cn } from '@/lib/utils';

interface EditBasicInfoData {
  property_name_mn: string;
  property_name_en: string;
  start_date: string;
  star_rating: string;
  part_of_group: boolean;
  group_name: string;
  total_hotel_rooms: string;
  available_rooms: string;
  sales_room_limitation: boolean;
  total_floor_number: string;
}

interface EditBasicInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editBasicInfo: EditBasicInfoData;
  onEditBasicInfoChange: (data: EditBasicInfoData) => void;
  onSave: () => void;
  isSaving: boolean;
}

const SHEET_WIDTH = 480;

const basicInfoEqual = (a: EditBasicInfoData, b: EditBasicInfoData): boolean =>
  Object.keys(a).every((key) => a[key as keyof EditBasicInfoData] === b[key as keyof EditBasicInfoData]);

export function EditBasicInfoDialog({
  open,
  onOpenChange,
  editBasicInfo,
  onEditBasicInfoChange,
  onSave,
  isSaving,
}: EditBasicInfoDialogProps) {
  const t = useTranslations('1BasicInfo');
  const tSheet = useTranslations('SixStepInfo');
  const { data: combinedHook } = useCombinedData();
  const ratings = combinedHook?.ratings || [];

  const [draftBasicInfo, setDraftBasicInfo] = useState<EditBasicInfoData>(editBasicInfo);
  const lastSavedRef = useRef<EditBasicInfoData>(editBasicInfo);

  useEffect(() => {
    if (!basicInfoEqual(editBasicInfo, lastSavedRef.current)) {
      setDraftBasicInfo(editBasicInfo);
      lastSavedRef.current = editBasicInfo;
    }
  }, [editBasicInfo]);

  useEffect(() => {
    onEditBasicInfoChange(draftBasicInfo);
  }, [draftBasicInfo, onEditBasicInfoChange]);

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (draftBasicInfo.property_name_mn && !/^[А-Яа-яӨөҮүЁё0-9\s.,'-]+$/.test(draftBasicInfo.property_name_mn)) {
      errors.property_name_mn = 'Зөвхөн кирилл үсэг ашиглана уу';
    }
    if (draftBasicInfo.property_name_en && !/^[A-Za-z0-9\s.,'-]+$/.test(draftBasicInfo.property_name_en)) {
      errors.property_name_en = 'Зөвхөн латин үсэг ашиглана уу';
    }
    const totalRooms = parseInt(draftBasicInfo.total_hotel_rooms);
    if (draftBasicInfo.total_hotel_rooms && (isNaN(totalRooms) || totalRooms < 1)) {
      errors.total_hotel_rooms = 'Нийт өрөөний тоо хамгийн багадаа 1 байх ёстой';
    }
    const availableRooms = parseInt(draftBasicInfo.available_rooms);
    if (draftBasicInfo.available_rooms && (isNaN(availableRooms) || availableRooms < 1)) {
      errors.available_rooms = 'Боломжит өрөөний тоог оруулна уу';
    }
    if (!isNaN(totalRooms) && !isNaN(availableRooms) && availableRooms > totalRooms) {
      errors.available_rooms = 'Боломжит өрөөний тоо нь нийт өрөөний тооноос их байж болохгүй';
    }
    if (draftBasicInfo.part_of_group && !draftBasicInfo.group_name?.trim()) {
      errors.group_name = 'Бүлгийн нэрийг заавал оруулна уу';
    }
    return errors;
  }, [draftBasicInfo]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        fallbackTitle={tSheet('basicInfoSheetTitle')}
        className="flex h-full flex-col gap-0 p-0 sm:max-w-none"
        style={{ width: SHEET_WIDTH, maxWidth: SHEET_WIDTH }}
      >
        <SheetHeader className="border-b px-5 py-4 space-y-0">
          <SheetTitle className="text-base font-semibold">{tSheet('basicInfoSheetTitle')}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="space-y-2">
            <Label>{t('1')}</Label>
            <Input
              value={draftBasicInfo.property_name_mn}
              onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, property_name_mn: e.target.value })}
              className={validationErrors.property_name_mn ? 'border-destructive' : ''}
            />
            {validationErrors.property_name_mn && (
              <p className="text-sm text-destructive">{validationErrors.property_name_mn}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('2')}</Label>
            <Input
              value={draftBasicInfo.property_name_en}
              onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, property_name_en: e.target.value })}
              className={validationErrors.property_name_en ? 'border-destructive' : ''}
            />
            {validationErrors.property_name_en && (
              <p className="text-sm text-destructive">{validationErrors.property_name_en}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('4')}</Label>
            <div className="flex flex-wrap gap-2">
              {ratings.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('loading_ratings')}</p>
              ) : (
                ratings.map((r) => {
                  const starCount = parseInt(r.rating) || 0;
                  const isNA = r.rating.toUpperCase() === 'N/A' || !starCount;
                  const savedValue = r.id.toString();
                  const isSelected = draftBasicInfo.star_rating === savedValue;

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setDraftBasicInfo({ ...draftBasicInfo, star_rating: savedValue })}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        isSelected
                          ? 'border-[#4A7BF7] bg-[#E8F0FE] text-[#4A7BF7]'
                          : 'border-input bg-background hover:bg-muted/50'
                      )}
                    >
                      {isNA ? (
                        <span>{t('no_rating')}</span>
                      ) : (
                        <>
                          <Star className={cn('h-4 w-4', isSelected ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40 fill-muted-foreground/20')} />
                          <span>{starCount}</span>
                        </>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('3')} *</Label>
            <MonthYearPickerWithValue
              value={draftBasicInfo.start_date}
              onChange={(value) => setDraftBasicInfo({ ...draftBasicInfo, start_date: value })}
              placeholder={t('select_date')}
            />
          </div>

          <div className="space-y-2">
            <Label>{tSheet('totalFloorsLabel')}</Label>
            <Input
              type="number"
              min={1}
              value={draftBasicInfo.total_floor_number}
              onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, total_floor_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('6')}</Label>
              <Input
                type="number"
                value={draftBasicInfo.total_hotel_rooms}
                onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, total_hotel_rooms: e.target.value })}
                className={validationErrors.total_hotel_rooms ? 'border-destructive' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label>{tSheet('listedRoomsLabel')}</Label>
              <Input
                type="number"
                value={draftBasicInfo.available_rooms}
                onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, available_rooms: e.target.value })}
                className={validationErrors.available_rooms ? 'border-destructive' : ''}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="mb-0">{tSheet('domesticChainLabel')}</Label>
            <YesNoToggle
              checked={draftBasicInfo.part_of_group}
              onCheckedChange={(checked) =>
                setDraftBasicInfo({
                  ...draftBasicInfo,
                  part_of_group: checked,
                  group_name: checked ? draftBasicInfo.group_name : '',
                })
              }
              labels={{ yes: t('yes'), no: t('no') }}
            />
          </div>

          {draftBasicInfo.part_of_group && (
            <div className="space-y-2">
              <Label>{tSheet('chainGroupNameLabel')}</Label>
              <Input
                value={draftBasicInfo.group_name}
                onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, group_name: e.target.value })}
                className={validationErrors.group_name ? 'border-destructive' : ''}
              />
            </div>
          )}
        </div>

        <SheetFooter className="border-t px-5 py-4 flex-row gap-3 sm:justify-end">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {tSheet('close')}
          </Button>
          <Button
            className="flex-1 bg-[#84CC16] hover:bg-[#73b512] text-white"
            onClick={onSave}
            disabled={isSaving || Object.keys(validationErrors).length > 0}
          >
            {isSaving ? tSheet('saving') : tSheet('save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
