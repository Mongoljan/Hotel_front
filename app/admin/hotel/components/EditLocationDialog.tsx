'use client';

import { useEffect, useState, useRef } from 'react';
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
  // Track draft state separately
  const [draftLocation, setDraftLocation] = useState<EditLocationData>(editLocation);
  const lastSavedRef = useRef<EditLocationData>(editLocation);

  // Sync draft with original values when they change from parent (after save)
  useEffect(() => {
    const hasChanged = 
      editLocation.province_city !== lastSavedRef.current.province_city ||
      editLocation.soum !== lastSavedRef.current.soum ||
      editLocation.total_floor_number !== lastSavedRef.current.total_floor_number;
    
    if (hasChanged) {
      setDraftLocation(editLocation);
      lastSavedRef.current = editLocation;
    }
  }, [editLocation]);

  // Sync draft to parent when changed
  useEffect(() => {
    onEditLocationChange(draftLocation);
  }, [draftLocation, onEditLocationChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" preventOutsideClose hideCloseButton>
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
              value={draftLocation.province_city}
              onValueChange={(value) => {
                setDraftLocation({ ...draftLocation, province_city: value, soum: '' });
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
              value={draftLocation.soum}
              onValueChange={(value) => setDraftLocation({ ...draftLocation, soum: value })}
              disabled={!draftLocation.province_city || filteredSoums.length === 0}
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
              value={draftLocation.total_floor_number}
              onChange={(e) => setDraftLocation({ ...draftLocation, total_floor_number: e.target.value })}
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
