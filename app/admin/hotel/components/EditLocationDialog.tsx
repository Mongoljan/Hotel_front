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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Province } from '../types';

interface SoumDistrict {
  id: number;
  name: string;
  code: number;
}

interface EditLocationData {
  province_city: string;
  soum: string;
  total_floor_number: string;
}

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLocation: EditLocationData;
  onEditLocationChange: (data: EditLocationData) => void;
  provinces: Province[];
  filteredSoums: SoumDistrict[];
  onProvinceChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function EditLocationDialog({
  open,
  onOpenChange,
  editLocation,
  onEditLocationChange,
  provinces,
  filteredSoums,
  onProvinceChange,
  onSave,
  isSaving,
}: EditLocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Байршил засах</DialogTitle>
          <DialogDescription>
            Буудлын байршлын мэдээллийг шинэчилнэ үү
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="province">Хот/Аймаг</Label>
            <Select
              value={editLocation.province_city}
              onValueChange={(value) => {
                onEditLocationChange({ ...editLocation, province_city: value, soum: '' });
                onProvinceChange(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Хот/Аймаг сонгох" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov.id} value={String(prov.id)}>
                    {prov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="soum">Дүүрэг/Сум</Label>
            <Select
              value={editLocation.soum}
              onValueChange={(value) => onEditLocationChange({ ...editLocation, soum: value })}
              disabled={!editLocation.province_city || filteredSoums.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Дүүрэг/Сум сонгох" />
              </SelectTrigger>
              <SelectContent>
                {filteredSoums.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="floors">Давхрын тоо</Label>
            <Input
              id="floors"
              type="number"
              value={editLocation.total_floor_number}
              onChange={(e) => onEditLocationChange({ ...editLocation, total_floor_number: e.target.value })}
              placeholder="10"
            />
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
