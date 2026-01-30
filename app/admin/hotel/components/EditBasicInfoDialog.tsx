'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DatePickerWithValue } from '@/components/ui/date-picker';

interface Language {
  id: number;
  languages_name_mn: string;
}

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
  languages: number[];
}

interface EditBasicInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editBasicInfo: EditBasicInfoData;
  onEditBasicInfoChange: (data: EditBasicInfoData) => void;
  languages: Language[];
  onSave: () => void;
  isSaving: boolean;
}

// Helper to compare basic info objects
const basicInfoEqual = (a: EditBasicInfoData, b: EditBasicInfoData): boolean => {
  return (
    a.property_name_mn === b.property_name_mn &&
    a.property_name_en === b.property_name_en &&
    a.start_date === b.start_date &&
    a.star_rating === b.star_rating &&
    a.part_of_group === b.part_of_group &&
    a.group_name === b.group_name &&
    a.total_hotel_rooms === b.total_hotel_rooms &&
    a.available_rooms === b.available_rooms &&
    a.sales_room_limitation === b.sales_room_limitation &&
    JSON.stringify(a.languages) === JSON.stringify(b.languages)
  );
};

export function EditBasicInfoDialog({
  open,
  onOpenChange,
  editBasicInfo,
  onEditBasicInfoChange,
  languages,
  onSave,
  isSaving,
}: EditBasicInfoDialogProps) {
  // Track draft state separately
  const [draftBasicInfo, setDraftBasicInfo] = useState<EditBasicInfoData>(editBasicInfo);
  const lastSavedRef = useRef<EditBasicInfoData>(editBasicInfo);

  // Sync draft with original values when they change from parent (after save)
  useEffect(() => {
    if (!basicInfoEqual(editBasicInfo, lastSavedRef.current)) {
      setDraftBasicInfo(editBasicInfo);
      lastSavedRef.current = editBasicInfo;
    }
  }, [editBasicInfo]);

  // Sync draft to parent when changed
  useEffect(() => {
    onEditBasicInfoChange(draftBasicInfo);
  }, [draftBasicInfo, onEditBasicInfoChange]);
  // Real-time validation errors
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    
    // Validate property name (Mongolian)
    if (draftBasicInfo.property_name_mn && !/^[А-Яа-яӨөҮүЁё0-9\s.,'-]+$/.test(draftBasicInfo.property_name_mn)) {
      errors.property_name_mn = 'Зөвхөн кирилл үсэг ашиглана уу';
    }
    
    // Validate property name (English)
    if (draftBasicInfo.property_name_en && !/^[A-Za-z0-9\s.,'-]+$/.test(draftBasicInfo.property_name_en)) {
      errors.property_name_en = 'Зөвхөн латин үсэг ашиглана уу';
    }
    
    // Validate star rating
    const rating = parseInt(draftBasicInfo.star_rating);
    if (draftBasicInfo.star_rating && (isNaN(rating) || rating < 1 || rating > 5)) {
      errors.star_rating = 'Зэрэглэл 1-5 хооронд байх ёстой';
    }
    
    // Validate total rooms
    const totalRooms = parseInt(draftBasicInfo.total_hotel_rooms);
    if (draftBasicInfo.total_hotel_rooms && (isNaN(totalRooms) || totalRooms < 1)) {
      errors.total_hotel_rooms = 'Нийт өрөөний тоо хамгийн багадаа 1 байх ёстой';
    }
    
    // Validate available rooms
    const availableRooms = parseInt(draftBasicInfo.available_rooms);
    if (draftBasicInfo.available_rooms && (isNaN(availableRooms) || availableRooms < 1)) {
      errors.available_rooms = 'Боломжит өрөөний тоог оруулна уу';
    }
    
    // Validate available rooms <= total rooms
    if (!isNaN(totalRooms) && !isNaN(availableRooms) && availableRooms > totalRooms) {
      errors.available_rooms = 'Боломжит өрөөний тоо нь нийт өрөөний тооноос их байж болохгүй';
    }
    
    // Validate group name when part_of_group is true
    if (draftBasicInfo.part_of_group && (!draftBasicInfo.group_name || draftBasicInfo.group_name.trim() === '')) {
      errors.group_name = 'Бүлгийн нэрийг заавал оруулна уу';
    }
    
    return errors;
  }, [draftBasicInfo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" preventOutsideClose hideCloseButton>
        <DialogHeader>
          <DialogTitle>Үндсэн мэдээлэл засах</DialogTitle>
          <DialogDescription>
            Зочид буудлын үндсэн мэдээллийг шинэчилнэ үү
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameMn">Буудлын нэр (монголоор)</Label>
              <Input
                id="nameMn"
                value={draftBasicInfo.property_name_mn}
                onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, property_name_mn: e.target.value })}
                placeholder="Буудлын нэрийг оруулах"
                className={validationErrors.property_name_mn ? 'border-destructive' : ''}
              />
              {validationErrors.property_name_mn && (
                <p className="text-sm text-destructive">{validationErrors.property_name_mn}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">Буудлын нэр (англиар)</Label>
              <Input
                id="nameEn"
                value={draftBasicInfo.property_name_en}
                onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, property_name_en: e.target.value })}
                placeholder="Enter hotel name"
                className={validationErrors.property_name_en ? 'border-destructive' : ''}
              />
              {validationErrors.property_name_en && (
                <p className="text-sm text-destructive">{validationErrors.property_name_en}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Үйл ажиллагаа эхэлсэн огноо</Label>
              <DatePickerWithValue
                value={draftBasicInfo.start_date}
                onChange={(value) => setDraftBasicInfo({ ...draftBasicInfo, start_date: value })}
                placeholder="Огноо сонгох"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Буудлын зэрэглэл</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={draftBasicInfo.star_rating}
                onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, star_rating: e.target.value })}
                placeholder="5"
                className={validationErrors.star_rating ? 'border-destructive' : ''}
              />
              {validationErrors.star_rating && (
                <p className="text-sm text-destructive">{validationErrors.star_rating}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Танай буудал сүлжээ буудал эсэх</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDraftBasicInfo({ ...draftBasicInfo, part_of_group: true })}
                className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                  draftBasicInfo.part_of_group === true
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Тийм
              </button>
              <button
                type="button"
                onClick={() => setDraftBasicInfo({ ...draftBasicInfo, part_of_group: false, group_name: '' })}
                className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                  draftBasicInfo.part_of_group === false
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Үгүй
              </button>
            </div>
            {draftBasicInfo.part_of_group && (
              <div className="space-y-2 mt-3">
                <Label htmlFor="groupName">Сүлжээ буудлын нэр</Label>
                <Input
                  id="groupName"
                  value={draftBasicInfo.group_name}
                  onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, group_name: e.target.value })}
                  placeholder="Сүлжээ буудлын нэр оруулах"
                  className={validationErrors.group_name ? 'border-destructive' : ''}
                />
                {validationErrors.group_name && (
                  <p className="text-sm text-destructive">{validationErrors.group_name}</p>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalRooms">Нийт өрөөний тоо</Label>
              <Input
                id="totalRooms"
                type="number"
                value={draftBasicInfo.total_hotel_rooms}
                onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, total_hotel_rooms: e.target.value })}
                placeholder="200"
                className={validationErrors.total_hotel_rooms ? 'border-destructive' : ''}
              />
              {validationErrors.total_hotel_rooms && (
                <p className="text-sm text-destructive">{validationErrors.total_hotel_rooms}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableRooms">Манай сайтаар зарах өрөө</Label>
              <Input
                id="availableRooms"
                type="number"
                value={draftBasicInfo.available_rooms}
                onChange={(e) => setDraftBasicInfo({ ...draftBasicInfo, available_rooms: e.target.value })}
                placeholder="50"
                className={validationErrors.available_rooms ? 'border-destructive' : ''}
              />
              {validationErrors.available_rooms && (
                <p className="text-sm text-destructive">{validationErrors.available_rooms}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Зочдод үйлчлэх боломжтой хэл</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`lang-${lang.id}`}
                    checked={draftBasicInfo.languages.includes(lang.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDraftBasicInfo({ ...draftBasicInfo, languages: [...draftBasicInfo.languages, lang.id] });
                      } else {
                        setDraftBasicInfo({ ...draftBasicInfo, languages: draftBasicInfo.languages.filter(id => id !== lang.id) });
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`lang-${lang.id}`} className="cursor-pointer text-sm">{lang.languages_name_mn}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Болих
          </Button>
          <Button onClick={onSave} disabled={isSaving || Object.keys(validationErrors).length > 0}>
            {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
