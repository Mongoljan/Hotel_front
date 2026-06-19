'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { IconLink, IconWorld } from '@tabler/icons-react';
import { FacebookIcon, InstagramIcon, TiktokIcon, XIcon, YoutubeIcon } from './SocialIcons';
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
import type { AdditionalInformation } from '../types';

const SHEET_WIDTH = 480;

export type SocialLinkKey = 'web' | 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'x';

export type SocialLinksDraft = Record<SocialLinkKey, string>;

const EMPTY_LINKS: SocialLinksDraft = {
  web: '',
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
  x: '',
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
  { key: 'tiktok', labelKey: 'socialTiktokLabel', icon: TiktokIcon },
  { key: 'x', labelKey: 'socialXLabel', icon: XIcon },
];

interface EditSocialLinksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  additionalInfo: AdditionalInformation | null;
  onSave: (links: {
    website_url: string;
    facebook_url: string;
    instagram_url: string;
    youtube_url: string;
    tiktok_url: string;
    twitter_url: string;
  }) => Promise<boolean | undefined>;
}

export function EditSocialLinksSheet({ open, onOpenChange, additionalInfo, onSave }: EditSocialLinksSheetProps) {
  const t = useTranslations('SixStepInfo');
  const [draft, setDraft] = useState<SocialLinksDraft>(EMPTY_LINKS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft({
        web: additionalInfo?.website_url || '',
        facebook: additionalInfo?.facebook_url || '',
        instagram: additionalInfo?.instagram_url || '',
        youtube: additionalInfo?.youtube_url || '',
        tiktok: additionalInfo?.tiktok_url || '',
        x: additionalInfo?.twitter_url || '',
      });
    }
  }, [open, additionalInfo]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const ok = await onSave({
        website_url: draft.web,
        facebook_url: draft.facebook,
        instagram_url: draft.instagram,
        youtube_url: draft.youtube,
        tiktok_url: draft.tiktok,
        twitter_url: draft.x,
      });
      if (ok) {
        toast.success(t('save'));
        onOpenChange(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
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
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('close')}
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('saving') : t('save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
