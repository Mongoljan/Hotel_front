'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

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
      <DialogContent 
        className="w-full h-full sm:w-[800px] sm:h-[600px] max-w-[95vw] max-h-[90vh] p-4 sm:p-6 flex flex-col overflow-hidden" 
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('aboutDialogTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('aboutDialogTitle')}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={draftAbout}
          onChange={(e) => setDraftAbout(e.target.value.slice(0, ABOUT_MAX_LENGTH))}
          placeholder={t('aboutDialogPlaceholder')}
          className="flex-1 w-full resize-none min-h-0 mt-4 mb-0 p-3 overflow-y-auto" 
        />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {draftAbout.length}/{ABOUT_MAX_LENGTH}
          </span>
        <DialogFooter className="shrink-0 flex flex-row items-center justify-between gap-4 pt-2">

          <div className="flex gap-2 shrink-0">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('saving') : t('save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
