'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { IconSparkles, IconPencil } from '@tabler/icons-react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const API_COMBINED = 'https://dev.kacc.mn/api/combined-data/';
const API_DETAILS = 'https://dev.kacc.mn/api/property-details/';
const MAX_HIGHLIGHTS = 12;

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

interface GroupConfig {
  key: keyof Draft;
  title: string;
  items: FacilityItem[];
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
  const [expandedGroup, setExpandedGroup] = useState<string | null>('general_facilities');
  const [displayExpanded, setDisplayExpanded] = useState<string | null>('general_facilities');

  const toggleDisplayGroup = (key: string) => {
    setDisplayExpanded((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_COMBINED);
        if (res.ok) {
          const data = await res.json();
          setLists({
            facilities: data.facilities || [],
            additionalFacilities: data.additionalFacilities || [],
            activities: data.activities || [],
            accessibility_features: data.accessibility_features || [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Handle both legacy number[] and new {id,is_highlight}[] from the API
  const normalize = (raw: any[]): SelectedItem[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((item) =>
      typeof item === 'number'
        ? { id: item, is_highlight: false }
        : { id: Number(item.id), is_highlight: Boolean(item.is_highlight) }
    );
  };

  const openEdit = () => {
    setDraft({
      general_facilities: normalize(generalFacilities),
      additional_facilities: normalize(additionalFacilities),
      activities: normalize(activities),
      accessibility_features: normalize(accessibilityFeatures),
    });
    setExpandedGroup('general_facilities');
    setIsEditOpen(true);
  };

  const toggleGroup = (key: string) => {
    setExpandedGroup((prev) => (prev === key ? null : key));
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

  const toggleSelectAll = (key: keyof Draft, items: FacilityItem[]) => {
    setDraft((prev) => {
      const current = prev[key];
      const allSelected = items.every((item) => current.some((s) => s.id === item.id));
      return {
        ...prev,
        [key]: allSelected
          ? []
          : items.map((item) => ({ id: item.id, is_highlight: false })),
      };
    });
  };

  const toggleHighlight = (key: keyof Draft, itemId: number) => {
    const totalHighlights =
      Object.values(draft).flat().filter((i) => i.is_highlight).length;

    setDraft((prev) => {
      const current = prev[key];
      const item = current.find((i) => i.id === itemId);
      if (!item) return prev;
      if (!item.is_highlight && totalHighlights >= MAX_HIGHLIGHTS) {
        toast.error(`Хамгийн ихдээ ${MAX_HIGHLIGHTS} онцлох зүйл сонгоно уу`);
        return prev;
      }
      return {
        ...prev,
        [key]: current.map((i) =>
          i.id === itemId ? { ...i, is_highlight: !i.is_highlight } : i
        ),
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
      title: 'Ерөнхий байгууламжууд',
      items: resolveItems(generalFacilities, lists.facilities),
    },
    {
      title: 'Нэмэлт байгууламжууд',
      items: resolveItems(additionalFacilities, lists.additionalFacilities),
    },
    {
      title: 'Үйл ажиллагаанууд',
      items: resolveItems(activities, lists.activities),
    },
    {
      title: 'Хүртээмжийн онцлог',
      items: resolveItems(accessibilityFeatures, lists.accessibility_features),
    },
  ].filter((g) => g.items.length > 0);

  const totalSelected =
    generalFacilities.length +
    additionalFacilities.length +
    activities.length +
    accessibilityFeatures.length;

  // ── Edit dialog groups ───────────────────────────────────────────

  const totalDraftHighlights = Object.values(draft).flat().filter((i) => i.is_highlight).length;

  const editGroups: GroupConfig[] = [
    { key: 'general_facilities', title: 'Ерөнхий байгууламжууд', items: lists.facilities },
    { key: 'additional_facilities', title: 'Нэмэлт байгууламжууд', items: lists.additionalFacilities },
    { key: 'activities', title: 'Үйл ажиллагаанууд', items: lists.activities },
    { key: 'accessibility_features', title: 'Хүртээмжийн онцлог', items: lists.accessibility_features },
  ];

  const renderEditGroup = ({ key, title, items }: GroupConfig) => {
    const selected = draft[key];
    const selectedIds = new Set(selected.map((s) => s.id));
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    const unselectedItems = items.filter((i) => !selectedIds.has(i.id));
    const isExpanded = expandedGroup === key;
    const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));

    return (
      <div key={key} className="border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup(key)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{title}</span>
            {selected.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selected.length}/{items.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSelectAll(key, items);
              }}
              className="text-xs text-primary hover:underline px-1"
            >
              {allSelected ? 'Бүгдийг цуцлах' : 'Бүгдийг сонгох'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 space-y-4">
            {selectedItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  Сонгогдсон ({selectedItems.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedItems.map((item) => {
                    const sel = selected.find((s) => s.id === item.id)!;
                    const canHighlight =
                      sel.is_highlight || totalDraftHighlights < MAX_HIGHLIGHTS;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-200"
                      >
                        <Checkbox
                          id={`edit-${key}-${item.id}`}
                          checked
                          onCheckedChange={() => toggleItem(key, item.id)}
                        />
                        <label
                          htmlFor={`edit-${key}-${item.id}`}
                          className="flex-1 text-sm cursor-pointer leading-none"
                        >
                          {item.name_mn}
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleHighlight(key, item.id)}
                          disabled={!canHighlight}
                          title={sel.is_highlight ? 'Онцлохоос хасах' : 'Онцлох болгох'}
                          className={`shrink-0 ${!canHighlight ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <Star
                            className={`h-4 w-4 transition-colors ${
                              sel.is_highlight
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedItems.length > 0 && unselectedItems.length > 0 && (
              <div className="border-t" />
            )}

            {unselectedItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Боломжтой ({unselectedItems.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {unselectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-md border border-muted hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        id={`edit-${key}-${item.id}`}
                        checked={false}
                        onCheckedChange={() => toggleItem(key, item.id)}
                      />
                      <label
                        htmlFor={`edit-${key}-${item.id}`}
                        className="flex-1 text-sm cursor-pointer leading-none text-muted-foreground"
                      >
                        {item.name_mn}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-3 right-3 h-8 w-8 z-10"
        onClick={openEdit}
      >
        <IconPencil className="h-4 w-4" />
      </Button>

      {totalSelected === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Үйлчилгээний мэдээлэл хараахан нэмэгдээгүй байна
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSparkles className="h-5 w-5 text-primary" />
              Үйлчилгээ &amp; байгууламж
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {displayGroups.map(({ title, items }) => {
              const key = title;
              const isExpanded = displayExpanded === key;
              const highlightCount = items.filter((i) => i.is_highlight).length;
              return (
                <div key={key} className="border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleDisplayGroup(key)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {items.length}
                      </Badge>
                      {highlightCount > 0 && (
                        <Badge variant="outline" className="text-xs gap-1 border-yellow-300 text-yellow-700">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {highlightCount}
                        </Badge>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3">
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-colors hover:bg-accent ${
                              item.is_highlight
                                ? 'border-yellow-300 bg-yellow-50/60'
                                : 'border-border bg-card'
                            }`}
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              {item.is_highlight ? (
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <Star className="h-3.5 w-3.5 text-muted-foreground/30" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name_mn}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.name_en}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" preventOutsideClose hideCloseButton>
          <DialogHeader>
            <DialogTitle>Үйлчилгээ засах</DialogTitle>
            <DialogDescription>
              Сонгосон зүйлсийн хажуу дахь ⭐ товчоор онцлох зүйлсийг тэмдэглэнэ үү (хамгийн ихдээ {MAX_HIGHLIGHTS})
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 py-1 px-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{totalDraftHighlights}/{MAX_HIGHLIGHTS}</span>
            <span className="text-muted-foreground">онцлох сонгогдсон</span>
            {totalDraftHighlights >= MAX_HIGHLIGHTS && (
              <span className="text-orange-500 text-xs ml-1">— дээд хязгаарт хүрлээ</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {editGroups.map(renderEditGroup)}
          </div>

          <DialogFooter className="pt-3 border-t gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
            >
              Болих
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
