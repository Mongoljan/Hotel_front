'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditAboutVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  about: string;
  youtubeUrl: string;
  onAboutChange: (value: string) => void;
  onYoutubeUrlChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function EditAboutVideoDialog({
  open,
  onOpenChange,
  about,
  youtubeUrl,
  onAboutChange,
  onYoutubeUrlChange,
  onSave,
  isSaving,
}: EditAboutVideoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Бидний тухай болон Видео засах</DialogTitle>
          <DialogDescription>
            Зочид буудлын танилцуулга болон видео холбоосыг шинэчилнэ үү
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="about">Бидний тухай</Label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => onAboutChange(e.target.value)}
              placeholder="Буудлын дэлгэрэнгүй мэдээллийг оруулна уу"
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube Video URL</Label>
            <Input
              id="youtube"
              type="url"
              value={youtubeUrl}
              onChange={(e) => onYoutubeUrlChange(e.target.value)}
              placeholder="YouTube холбоос оруулах"
            />
            <p className="text-xs text-muted-foreground">
              Youtube бичлэгийн Share-ээс холбоосыг хуулна уу
            </p>
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
