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

interface EditMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googleMap: string;
  onGoogleMapChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function EditMapDialog({
  open,
  onOpenChange,
  googleMap,
  onGoogleMapChange,
  onSave,
  isSaving,
}: EditMapDialogProps) {
  // Track draft state separately
  const [draftGoogleMap, setDraftGoogleMap] = useState(googleMap);
  const lastSavedRef = useRef(googleMap);

  // Sync draft with original value when it changes from parent (after save)
  useEffect(() => {
    if (googleMap !== lastSavedRef.current) {
      setDraftGoogleMap(googleMap);
      lastSavedRef.current = googleMap;
    }
  }, [googleMap]);

  // Sync draft to parent when changed
  useEffect(() => {
    onGoogleMapChange(draftGoogleMap);
  }, [draftGoogleMap, onGoogleMapChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" preventOutsideClose hideCloseButton>
        <DialogHeader>
          <DialogTitle>Google Map засах</DialogTitle>
          <DialogDescription>
            Google Maps-ээс холбоос хуулж оруулна уу
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleMap">Google Maps Embed URL</Label>
            <Input
              id="googleMap"
              type="url"
              value={draftGoogleMap}
              onChange={(e) => setDraftGoogleMap(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-muted-foreground">
              Google Maps дээр Share → Embed a map → Copy HTML код дотрх src холбоосыг хуулна уу
            </p>
          </div>
          {draftGoogleMap && (
            <div className="aspect-video rounded-md overflow-hidden border">
              <iframe
                src={draftGoogleMap}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
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
