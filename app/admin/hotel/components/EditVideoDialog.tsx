'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

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
import { ApiNeededLabel } from '@/components/ApiNeededLabel';

const VIDEO_DESC_MAX_LENGTH = 50;

interface EditVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  youtubeUrl: string;
  onSave: (youtubeUrl: string) => void;
  isSaving: boolean;
}

export function EditVideoDialog({
  open,
  onOpenChange,
  youtubeUrl,
  onSave,
  isSaving,
}: EditVideoDialogProps) {
  const t = useTranslations('SixStepInfo');
  const [draftYoutubeUrl, setDraftYoutubeUrl] = useState(youtubeUrl);

  useEffect(() => {
    if (open) {
      setDraftYoutubeUrl(youtubeUrl);
    }
  }, [open, youtubeUrl]);

  const handleSave = () => {
    onSave(draftYoutubeUrl.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('videoDialogTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('videoDialogTitle')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">{t('youtubeLinkLabel')}</Label>
            <div className="flex rounded-md border border-input bg-background shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-ring">
              <span className="inline-flex items-center border-r border-input bg-muted/50 px-3 text-sm text-muted-foreground shrink-0">
                http://
              </span>
              <Input
                id="youtube-url"
                type="text"
                value={draftYoutubeUrl}
                onChange={(e) => setDraftYoutubeUrl(e.target.value)}
                placeholder={t('youtubeLinkPlaceholder')}
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <p className="text-xs text-muted-foreground">{t('youtubeLinkHint')}</p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="video-description">{t('videoDescriptionLabel')}</Label>
              <ApiNeededLabel />
            </div>
            <Textarea
              id="video-description"
              disabled
              placeholder={t('videoDescriptionPlaceholder')}
              className="min-h-[100px] resize-none bg-muted/40"
              maxLength={VIDEO_DESC_MAX_LENGTH}
            />
            <p className="text-sm text-muted-foreground">0/{VIDEO_DESC_MAX_LENGTH}</p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
