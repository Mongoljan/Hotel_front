'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OptionButton } from '@/components/ui/option-button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { IconPencil } from '@tabler/icons-react';
import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useCombinedData } from '@/app/hooks/useCombinedData';
import { cn } from '@/lib/utils';

const API_DETAILS = 'https://dev.kacc.mn/api/property-details/';

interface FacilityItem {
  id: number;
  name_en: string;
  name_mn: string;
}

interface SelectedItem {
  id: number;
  is_highlight: boolean;
}

interface CombinedLists {
  facilities: FacilityItem[];
  additionalFacilities: FacilityItem[];
  activities: FacilityItem[];
  accessibility_features: FacilityItem[];
}

interface Draft {
  general_facilities: SelectedItem[];
  additional_facilities: SelectedItem[];
  activities: SelectedItem[];
  accessibility_features: SelectedItem[];
}

interface ServicesTabProps {
  generalFacilities: SelectedItem[];
  additionalFacilities: SelectedItem[];
  activities: SelectedItem[];
  accessibilityFeatures: SelectedItem[];
  propertyDetailId: number | null;
  onUpdate: () => void;
}

export default function ServicesTab({
  generalFacilities,
  additionalFacilities,
  activities,
  accessibilityFeatures,
  propertyDetailId,
  onUpdate,
}: ServicesTabProps) {
  const t = useTranslations('SixStepInfo');
  // Use cached hook instead of raw fetch — fires one network request per session max
  const { data: combinedHook } = useCombinedData();
  const [lists, setLists] = useState<CombinedLists>({
    facilities: [],
    additionalFacilities: [],
    activities: [],
    accessibility_features: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    general_facilities: [],
    additional_facilities: [],
    activities: [],
    accessibility_features: [],
  });
  const [displayExpanded, setDisplayExpanded] = useState<string | null>('general');
  const [editSheetTab, setEditSheetTab] = useState<keyof Draft>('general_facilities');
  const [searchQuery, setSearchQuery] = useState('');

  // Populate lists from cached hook data (no raw fetch needed)
  useEffect(() => {
    if (!combinedHook) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = combinedHook as any;
    setLists({
      facilities: d.facilities || [],
      additionalFacilities: d.additionalFacilities || [],
      activities: d.activities || [],
      accessibility_features: d.accessibility_features || [],
    });
    setIsLoading(false);
  }, [combinedHook]);

  const toggleDisplayGroup = (key: string) => {
    setDisplayExpanded((prev) => (prev === key ? null : key));
  };

  // Handle multiple shapes coming from the API:
  //   - legacy: number[]                                       (just IDs)
  //   - registration step 6: [{ id, is_highlight }]
  //   - property-details GET: [{ id (junction), facility_id|activity_id|feature_id, name_*, is_highlight }]
  const normalize = (raw: any[]): SelectedItem[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => {
      if (typeof item === 'number') {
        return { id: item, is_highlight: false };
      }
      const realId =
        item.facility_id ??
        item.activity_id ??
        item.feature_id ??
        item.accessibility_id ??
        item.id;
      return { id: Number(realId), is_highlight: Boolean(item.is_highlight) };
    });
  };

  const openEdit = () => {
    setDraft({
      general_facilities: normalize(generalFacilities),
      additional_facilities: normalize(additionalFacilities),
      activities: normalize(activities),
      accessibility_features: normalize(accessibilityFeatures),
    });
    setEditSheetTab('general_facilities');
    setSearchQuery('');
    setIsEditOpen(true);
  };

  const toggleItem = (key: keyof Draft, itemId: number) => {
    setDraft((prev) => {
      const current = prev[key];
      const exists = current.find((i) => i.id === itemId);
      return {
        ...prev,
        [key]: exists
          ? current.filter((i) => i.id !== itemId)
          : [...current, { id: itemId, is_highlight: false }],
      };
    });
  };

  const handleSave = async () => {
    if (!propertyDetailId) {
      toast.error('Property detail ID олдсонгүй');
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch(`${API_DETAILS}${propertyDetailId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general_facilities: draft.general_facilities,
          additional_facilities: draft.additional_facilities,
          activities: draft.activities,
          accessibility_features: draft.accessibility_features,
        }),
      });
      if (!res.ok) throw new Error('Хадгалах үед алдаа гарлаа');
      toast.success('Амжилттай хадгалагдлаа');
      setIsEditOpen(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Display helpers ──────────────────────────────────────────────

  const resolveItems = (raw: any[], pool: FacilityItem[]) => {
    const selected = normalize(raw);
    return selected
      .map((s) => ({ ...s, ...pool.find((p) => p.id === s.id) }))
      .filter((s) => (s as any).name_mn) as (SelectedItem & FacilityItem)[];
  };

  const displayGroups = [
    {
      key: 'general',
      title: t('generalAmenities'),
      items: resolveItems(generalFacilities, lists.facilities),
    },
    {
      key: 'additional',
      title: t('additionalAmenities'),
      items: resolveItems(additionalFacilities, lists.additionalFacilities),
    },
    {
      key: 'paid',
      title: t('paidServices'),
      items: resolveItems(activities, lists.activities),
    },
    {
      key: 'activities',
      title: t('generalServices'),
      items: [] as (SelectedItem & FacilityItem)[],
     
    },

  ];

  const totalSelected =
    generalFacilities.length +
    additionalFacilities.length +
    activities.length +
    accessibilityFeatures.length;

  // ── Edit sheet ───────────────────────────────────────────────────

  const editSheetTabs: { key: keyof Draft; label: string; items: FacilityItem[] }[] = [
    { key: 'general_facilities', label: t('generalAmenities'), items: lists.facilities },
    { key: 'additional_facilities', label: t('additionalAmenities'), items: lists.additionalFacilities },
    { key: 'activities', label: t('generalServices'), items: lists.activities },
  ];

  const activeEditItems = editSheetTabs.find((tab) => tab.key === editSheetTab)?.items ?? [];
  const filteredEditItems = activeEditItems.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return item.name_mn.toLowerCase().includes(q) || item.name_en.toLowerCase().includes(q);
  });
  const activeSelectedIds = new Set(draft[editSheetTab].map((s) => s.id));

  // ── Render ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Мэдээлэл ачааллаж байна...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">{t('servicesSectionTitle')}</h3>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={openEdit}>
          <IconPencil className="h-4 w-4" />
        </Button>
      </div>

      {totalSelected === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{t('servicesEmpty')}</p>
      ) : (
        <div className="space-y-2">
          {displayGroups.map(({ key, title, items }) => {
            const isExpanded = displayExpanded === key;
            return (
              <div key={key} className="border rounded-lg bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleDisplayGroup(key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="font-medium text-sm">
                    {title} ({items.length})
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">{t('servicesNoneSelected')}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                          >
                            {item.name_mn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent
          side="right"
          fallbackTitle={t('servicesSheetTitle')}
          className="flex h-full flex-col gap-0 p-0 sm:max-w-none"
          style={{ width: 520, maxWidth: 520 }}
        >
          <SheetHeader className="border-b px-5 py-4 space-y-0">
            <SheetTitle className="text-base font-semibold">{t('servicesSheetTitle')}</SheetTitle>
          </SheetHeader>

          <div className="px-5 pt-4 pb-2 flex gap-2 overflow-x-auto">
            {editSheetTabs.map((tab) => (
              <OptionButton
                key={tab.key}
                selected={editSheetTab === tab.key}
                onClick={() => {
                  setEditSheetTab(tab.key);
                  setSearchQuery('');
                }}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs"
              >
                {tab.label} ({draft[tab.key].length})
              </OptionButton>
            ))}
          </div>

          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {filteredEditItems.map((item) => {
                const selected = activeSelectedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(editSheetTab, item.id)}
                    className={cn(
                      'flex items-start gap-2 rounded-xl border p-3 text-left transition-colors',
                      selected
                        ? 'border-[#4A7BF7] bg-[#E8F0FE]/60'
                        : 'border-border bg-background hover:bg-muted/40'
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                        selected ? 'border-[#4A7BF7] bg-[#4A7BF7] text-white' : 'border-muted-foreground/30'
                      )}
                    >
                      {selected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <p className={cn('text-sm font-medium leading-tight', selected ? 'text-[#4A7BF7]' : '')}>
                        {item.name_mn}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{item.name_en}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <SheetFooter className="border-t px-5 py-4 flex-row gap-3 sm:justify-end">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
              {t('close')}
            </Button>
            <Button
              className="flex-1 bg-[#84CC16] hover:bg-[#73b512] text-white"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? t('saving') : t('save')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
