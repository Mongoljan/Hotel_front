'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { IconLink, IconWorld } from '@tabler/icons-react';
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from './SocialIcons';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ApiNeededLabel } from '@/components/ApiNeededLabel';

const SHEET_WIDTH = 480;

type SocialLinkKey = 'web' | 'facebook' | 'instagram' | 'youtube' | 'x' | 'linkedin';

type SocialLinksDraft = Record<SocialLinkKey, string>;

const EMPTY_LINKS: SocialLinksDraft = {
  web: '',
  facebook: '',
  instagram: '',
  youtube: '',
  x: '',
  linkedin: '',
};

const LINK_FIELDS: {
  key: SocialLinkKey;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
  iconClass?: string;
}[] = [
  { key: 'web', labelKey: 'socialWebLabel', icon: IconWorld, iconClass: 'text-muted-foreground' },
  { key: 'facebook', labelKey: 'socialFacebookLabel', icon: FacebookIcon },
  { key: 'instagram', labelKey: 'socialInstagramLabel', icon: InstagramIcon },
  { key: 'youtube', labelKey: 'socialYoutubeLabel', icon: YoutubeIcon },
  { key: 'x', labelKey: 'socialXLabel', icon: XIcon },
  { key: 'linkedin', labelKey: 'socialLinkedinLabel', icon: LinkedinIcon },
];

interface EditSocialLinksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSocialLinksSheet({ open, onOpenChange }: EditSocialLinksSheetProps) {
  const t = useTranslations('SixStepInfo');
  const [draft, setDraft] = useState<SocialLinksDraft>(EMPTY_LINKS);

  useEffect(() => {
    if (open) {
      setDraft(EMPTY_LINKS);
    }
  }, [open]);

  const handleSave = () => {
    toast.info(t('apiNeededLabel'));
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        fallbackTitle={t('socialLinksSheetTitle')}
        className="flex h-full flex-col gap-0 p-0 sm:max-w-none z-[51]"
        style={{ width: SHEET_WIDTH, maxWidth: SHEET_WIDTH }}
      >
        <SheetHeader className="border-b px-5 py-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <SheetTitle className="text-sm font-medium leading-snug text-foreground">
              {t('socialLinksSheetTitle')}
            </SheetTitle>
            <ApiNeededLabel />
          </div>
          <p className="text-sm text-muted-foreground leading-snug pr-2">{t('socialLinksSheetIntro')}</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {LINK_FIELDS.map(({ key, labelKey, icon: Icon, iconClass }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">{t(labelKey)}</Label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Icon className={cn('h-5 w-5', iconClass)} />
                </div>
                <Input
                  type="url"
                  value={draft[key]}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={t('socialLinkPlaceholder')}
                  className="h-11 pl-10 pr-10"
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <IconLink className="h-4 w-4 text-muted-foreground/60" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="border-t px-5 py-4 flex-row gap-3 sm:justify-end">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleSave}>
            {t('save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
