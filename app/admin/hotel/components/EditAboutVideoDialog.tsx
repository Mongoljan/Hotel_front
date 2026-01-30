'use client';

import { useEffect, useState, useRef } from 'react';
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
  // Track if user has made changes since last save
  const [draftAbout, setDraftAbout] = useState(about);
  const [draftYoutubeUrl, setDraftYoutubeUrl] = useState(youtubeUrl);
  const lastSavedRef = useRef({ about, youtubeUrl });

  // Sync draft with original values when they change from parent (after save)
  useEffect(() => {
    if (about !== lastSavedRef.current.about) {
      setDraftAbout(about);
      lastSavedRef.current.about = about;
    }
    if (youtubeUrl !== lastSavedRef.current.youtubeUrl) {
      setDraftYoutubeUrl(youtubeUrl);
      lastSavedRef.current.youtubeUrl = youtubeUrl;
    }
  }, [about, youtubeUrl]);

  // Sync draft to parent when changed
  useEffect(() => {
    onAboutChange(draftAbout);
  }, [draftAbout, onAboutChange]);

  useEffect(() => {
    onYoutubeUrlChange(draftYoutubeUrl);
  }, [draftYoutubeUrl, onYoutubeUrlChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" preventOutsideClose hideCloseButton>
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
              value={draftAbout}
              onChange={(e) => setDraftAbout(e.target.value)}
              placeholder="Буудлын дэлгэрэнгүй мэдээллийг оруулна уу"
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube Video URL</Label>
            <Input
              id="youtube"
              type="url"
              value={draftYoutubeUrl}
              onChange={(e) => setDraftYoutubeUrl(e.target.value)}
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
