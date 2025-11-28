'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { IconSparkles, IconCheck, IconPencil } from '@tabler/icons-react';
import { toast } from 'sonner';

interface Facility {
  id: number;
  name_en: string;
  name_mn: string;
}

interface ServicesTabProps {
  facilityIds: number[];
  hotelId: number;
  propertyDetailId: number | null;
  onUpdate: () => void;
}

export default function ServicesTab({ facilityIds, hotelId, propertyDetailId, onUpdate }: ServicesTabProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const res = await fetch('https://dev.kacc.mn/api/combined-data/');
        if (res.ok) {
          const data = await res.json();
          // Try both possible field names
          const allFacs = data.facilities || data.general_facilities || [];
          setAllFacilities(allFacs);
          // Filter to only show facilities that are in facilityIds
          const selectedFacilities = allFacs.filter((f: Facility) =>
            facilityIds.includes(f.id)
          );
          setFacilities(selectedFacilities);
        }
      } catch (error) {
        console.error('Error loading facilities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, [facilityIds]);

  const handleEdit = () => {
    setSelectedFacilityIds([...facilityIds]);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!propertyDetailId) {
      toast.error('Property detail ID олдсонгүй');
      return;
    }

    try {
      setIsSaving(true);

      const res = await fetch(`https://dev.kacc.mn/api/property-details/${propertyDetailId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general_facilities: selectedFacilityIds,
        }),
      });

      if (!res.ok) throw new Error('Үйлчилгээ хадгалах үед алдаа гарлаа');

      toast.success('Үйлчилгээ амжилттай хадгалагдлаа');
      setIsEditDialogOpen(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFacility = (id: number) => {
    if (selectedFacilityIds.includes(id)) {
      setSelectedFacilityIds(selectedFacilityIds.filter(fid => fid !== id));
    } else {
      setSelectedFacilityIds([...selectedFacilityIds, id]);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Үйлчилгээний мэдээлэл ачааллаж байна...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="relative border rounded-lg p-4">
        <Button
          variant="outline"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8"
          onClick={handleEdit}
        >
          <IconPencil className="h-4 w-4" />
        </Button>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Үйлчилгээний мэдээлэл хараахан нэмэгдээгүй байна
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ерөнхий үйлчилгээ засах</DialogTitle>
              <DialogDescription>
                Буудалд байгаа үйлчилгээ, байгууламжийг сонгоно уу
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {allFacilities.map((facility) => (
                <div key={facility.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`fac-${facility.id}`}
                    checked={selectedFacilityIds.includes(facility.id)}
                    onChange={() => toggleFacility(facility.id)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`fac-${facility.id}`} className="cursor-pointer text-sm">
                    {facility.name_mn} / {facility.name_en}
                  </Label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSaving}
              >
                Болих
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-3 right-3 h-8 w-8 z-10"
        onClick={handleEdit}
      >
        <IconPencil className="h-4 w-4" />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-primary" />
            Ерөнхий үйлчилгээ, байгууламж
          </CardTitle>
          <CardDescription>
            Зочид буудалд байгаа үйлчилгээ болон байгууламжийн жагсаалт
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <IconCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{facility.name_mn}</p>
                  <p className="text-xs text-muted-foreground">{facility.name_en}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ерөнхий үйлчилгээ засах</DialogTitle>
            <DialogDescription>
              Буудалд байгаа үйлчилгээ, байгууламжийг сонгоно уу
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded">
            {allFacilities.map((facility) => (
              <div key={facility.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`fac-${facility.id}`}
                  checked={selectedFacilityIds.includes(facility.id)}
                  onChange={() => toggleFacility(facility.id)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`fac-${facility.id}`} className="cursor-pointer text-sm">
                  {facility.name_mn} / {facility.name_en}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Болих
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
