'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { IconSparkles, IconPencil } from '@tabler/icons-react';
import { Star, ChevronDown, ChevronUp, X } from 'lucide-react';
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
      title: 'Хүртээмжийн тохиромжийн онцлог',
      items: resolveItems(accessibilityFeatures, lists.accessibility_features),
    },
  ];

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
    { key: 'accessibility_features', title: 'Хүртээмжийн тохиромжийн онцлог', items: lists.accessibility_features },
  ];

  const renderEditGroup = ({ key, title, items }: GroupConfig) => {
    const selected = draft[key];
    const selectedIds = new Set(selected.map((s) => s.id));
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    const highlightedSelectedItems = selectedItems.filter(
      (i) => selected.find((s) => s.id === i.id)?.is_highlight
    );
    const regularSelectedItems = selectedItems.filter(
      (i) => !selected.find((s) => s.id === i.id)?.is_highlight
    );
    const unselectedItems = items.filter((i) => !selectedIds.has(i.id));
    const isExpanded = expandedGroup === key;
    const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));

    const renderChip = (item: FacilityItem, isHighlighted: boolean) => {
      const canHighlight = isHighlighted || totalDraftHighlights < MAX_HIGHLIGHTS;
      return (
        <div
          key={item.id}
          className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            isHighlighted
              ? 'bg-yellow-100 text-yellow-900 ring-1 ring-yellow-300'
              : 'bg-primary/15 text-primary hover:bg-primary/25'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleHighlight(key, item.id)}
            disabled={!canHighlight}
            title={isHighlighted ? 'Онцлохоос хасах' : 'Онцлох болгох'}
            className={`shrink-0 ${!canHighlight ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <Star
              className={`h-3 w-3 transition-colors ${
                isHighlighted
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-current opacity-50 hover:opacity-100'
              }`}
            />
          </button>
          <span>{item.name_mn}</span>
          <button
            type="button"
            onClick={() => toggleItem(key, item.id)}
            aria-label="Хасах"
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    };

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
            {/* Highlighted section */}
            {highlightedSelectedItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  Онцолсон ({highlightedSelectedItems.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {highlightedSelectedItems.map((item) => renderChip(item, true))}
                </div>
              </div>
            )}

            {/* Regular selected section */}
            {regularSelectedItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">
                  Сонгогдсон ({regularSelectedItems.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {regularSelectedItems.map((item) => renderChip(item, false))}
                </div>
              </div>
            )}

            {/* Divider between sections */}
            {selectedItems.length > 0 && unselectedItems.length > 0 && (
              <div className="border-t" />
            )}

            {/* Unselected section */}
            {unselectedItems.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Боломжтой ({unselectedItems.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {unselectedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(key, item.id)}
                      className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs hover:bg-muted/80 hover:text-foreground transition-colors"
                    >
                      {item.name_mn}
                    </button>
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
                      {items.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">
                          Сонгогдоогүй байна
                        </p>
                      ) : (
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
                      )}
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
