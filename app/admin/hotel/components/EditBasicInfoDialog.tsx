'use client';

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

export function EditBasicInfoDialog({
  open,
  onOpenChange,
  editBasicInfo,
  onEditBasicInfoChange,
  languages,
  onSave,
  isSaving,
}: EditBasicInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                value={editBasicInfo.property_name_mn}
                onChange={(e) => onEditBasicInfoChange({ ...editBasicInfo, property_name_mn: e.target.value })}
                placeholder="Шангри-Ла Улаанбаатар Зочид Буудал"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">Буудлын нэр (англиар)</Label>
              <Input
                id="nameEn"
                value={editBasicInfo.property_name_en}
                onChange={(e) => onEditBasicInfoChange({ ...editBasicInfo, property_name_en: e.target.value })}
                placeholder="Shangri-La Ulaanbaatar Hotel"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Үйл ажиллагаа эхэлсэн огноо</Label>
              <DatePickerWithValue
                value={editBasicInfo.start_date}
                onChange={(value) => onEditBasicInfoChange({ ...editBasicInfo, start_date: value })}
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
                value={editBasicInfo.star_rating}
                onChange={(e) => onEditBasicInfoChange({ ...editBasicInfo, star_rating: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Танай буудал сүлжээ буудал эсэх</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onEditBasicInfoChange({ ...editBasicInfo, part_of_group: true })}
                className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                  editBasicInfo.part_of_group === true
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Тийм
              </button>
              <button
                type="button"
                onClick={() => onEditBasicInfoChange({ ...editBasicInfo, part_of_group: false, group_name: '' })}
                className={`px-8 py-2 rounded-md text-sm font-medium transition-all border ${
                  editBasicInfo.part_of_group === false
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Үгүй
              </button>
            </div>
            {editBasicInfo.part_of_group && (
              <div className="space-y-2 mt-3">
                <Label htmlFor="groupName">Сүлжээ буудлын нэр</Label>
                <Input
                  id="groupName"
                  value={editBasicInfo.group_name}
                  onChange={(e) => onEditBasicInfoChange({ ...editBasicInfo, group_name: e.target.value })}
                  placeholder="Marriott, Hilton гэх мэт"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalRooms">Нийт өрөөний тоо</Label>
              <Input
                id="totalRooms"
                type="number"
                value={editBasicInfo.total_hotel_rooms}
                onChange={(e) => onEditBasicInfoChange({ ...editBasicInfo, total_hotel_rooms: e.target.value })}
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableRooms">Манай сайтаар зарах өрөө</Label>
              <Input
                id="availableRooms"
                type="number"
                value={editBasicInfo.available_rooms}
                onChange={(e) => onEditBasicInfoChange({ ...editBasicInfo, available_rooms: e.target.value })}
                placeholder="50"
              />
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
                    checked={editBasicInfo.languages.includes(lang.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onEditBasicInfoChange({ ...editBasicInfo, languages: [...editBasicInfo.languages, lang.id] });
                      } else {
                        onEditBasicInfoChange({ ...editBasicInfo, languages: editBasicInfo.languages.filter(id => id !== lang.id) });
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
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
