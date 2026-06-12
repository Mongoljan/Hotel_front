'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  hotelName: string;
  onConfirm: () => void;
};

export default function OnboardingSuccessDialog({ open, hotelName, onConfirm }: Props) {
  const t = useTranslations('5PropertyImages');

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[400px] rounded-2xl border-0 p-8 text-center shadow-xl"
        preventOutsideClose
        hideCloseButton
      >
        <DialogTitle className="sr-only text-primary text-2xl">{t('onboarding_welcome_title')}</DialogTitle>

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F0FE]">
          <Sparkles className="h-8 w-8 text-[#4A7BF7]" />
        </div>

        <h2 className="text-lg font-semibold text-foreground leading-snug">
          {t('onboarding_welcome_title')}
        </h2>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>{t('onboarding_welcome_body', { hotelName: hotelName || '—' })}</p>
          <p>{t('onboarding_welcome_question')}</p>
        </div>

        <Button
          type="button"
          className="mt-6 w-full h-11 rounded-xl bg-[#4A7BF7] hover:bg-[#3d6ae0] text-white font-medium"
          onClick={onConfirm}
        >
          {t('onboarding_welcome_cta')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
