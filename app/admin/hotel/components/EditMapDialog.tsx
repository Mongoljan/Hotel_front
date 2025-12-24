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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
              value={googleMap}
              onChange={(e) => onGoogleMapChange(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-muted-foreground">
              Google Maps дээр Share → Embed a map → Copy HTML код дотрх src холбоосыг хуулна уу
            </p>
          </div>
          {googleMap && (
            <div className="aspect-video rounded-md overflow-hidden border">
              <iframe
                src={googleMap}
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
