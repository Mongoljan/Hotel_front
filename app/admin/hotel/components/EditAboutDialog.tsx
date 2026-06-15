'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ABOUT_MAX_LENGTH = 1000;

interface EditAboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  about: string;
  onSave: (about: string) => void;
  isSaving: boolean;
}

export function EditAboutDialog({
  open,
  onOpenChange,
  about,
  onSave,
  isSaving,
}: EditAboutDialogProps) {
  const t = useTranslations('SixStepInfo');
  const [draftAbout, setDraftAbout] = useState(about);

  useEffect(() => {
    if (open) {
      setDraftAbout(about);
    }
  }, [open, about]);

  const handleSave = () => {
    onSave(draftAbout.slice(0, ABOUT_MAX_LENGTH));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl" hideCloseButton>
        <DialogHeader>
          <DialogTitle>{t('aboutDialogTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('aboutDialogTitle')}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={draftAbout}
          onChange={(e) => setDraftAbout(e.target.value.slice(0, ABOUT_MAX_LENGTH))}
          placeholder={t('aboutDialogPlaceholder')}
          className="min-h-[220px] resize-none"
        />
        <DialogFooter className="flex-row items-center justify-between gap-4 sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {draftAbout.length}/{ABOUT_MAX_LENGTH}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              {t('back')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('saving') : t('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
