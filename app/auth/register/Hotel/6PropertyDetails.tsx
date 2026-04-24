'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { schemaHotelSteps6 } from '../../../schema';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_PROPERTY_DETAILS = 'https://dev.kacc.mn/api/property-details/';
const MAX_HIGHLIGHTS = 12;

type FormFields = z.infer<ReturnType<typeof schemaHotelSteps6>>;
type FacilityItem = { id: number; name_en: string; name_mn: string };
type SelectedItem = { id: number; is_highlight: boolean };

type GroupKey = keyof FormFields;
type GroupConfig = { key: GroupKey; title: string; items: FacilityItem[] };

type Props = {
  onNext: () => void;
  onBack: () => void;
  proceed: number;
  setProceed: (value: number) => void;
};

export default function RegisterHotel6({ onNext, onBack }: Props) {
  const t = useTranslations('6FinalPropertyDetails');
  const locale = useLocale();
  const { user } = useAuth();

  const [dataLists, setDataLists] = useState<{
    facilities: FacilityItem[];
    additionalFacilities: FacilityItem[];
    activities: FacilityItem[];
    accessibility_features: FacilityItem[];
  }>({ facilities: [], additionalFacilities: [], activities: [], accessibility_features: [] });

  const [expandedGroup, setExpandedGroup] = useState<string | null>('general_facilities');
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<FormFields | null>(null);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps6(t('select_facility_error'))),
    mode: 'onChange',
    defaultValues: {
      general_facilities: [],
      additional_facilities: [],
      activities: [],
      accessibility_features: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_COMBINED_DATA);
        const data = await res.json();
        setDataLists({
          facilities: data.facilities || [],
          additionalFacilities: data.additionalFacilities || [],
          activities: data.activities || [],
          accessibility_features: data.accessibility_features || [],
        });
      } catch (error) {
        console.error('Error fetching combined data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    if (stored.step6) {
      const values: FormFields = {
        general_facilities: stored.step6.general_facilities || [],
        additional_facilities: stored.step6.additional_facilities || [],
        activities: stored.step6.activities || [],
        accessibility_features: stored.step6.accessibility_features || [],
      };
      form.reset(values);
      setInitialValues(values);
    }
  }, [form, user?.id]);

  const getStepId = (step: any) => {
    if (Array.isArray(step)) return step[0]?.id;
    if (typeof step === 'object' && step !== null) return step.id;
    return null;
  };

  const toggleGroup = (key: string) => {
    setExpandedGroup((prev) => (prev === key ? null : key));
  };

  const toggleItem = (fieldName: GroupKey, itemId: number) => {
    const current = (form.getValues(fieldName) as SelectedItem[]) || [];
    const exists = current.find((item) => item.id === itemId);
    form.setValue(
      fieldName,
      exists
        ? current.filter((item) => item.id !== itemId)
        : [...current, { id: itemId, is_highlight: false }],
      { shouldValidate: true }
    );
  };

  const toggleHighlight = (fieldName: GroupKey, itemId: number) => {
    const allValues = form.getValues();
    const fields: GroupKey[] = [
      'general_facilities',
      'additional_facilities',
      'activities',
      'accessibility_features',
    ];
    const totalHighlights = fields.reduce(
      (sum, f) => sum + ((allValues[f] as SelectedItem[]) || []).filter((i) => i.is_highlight).length,
      0
    );

    const current = (form.getValues(fieldName) as SelectedItem[]) || [];
    const item = current.find((i) => i.id === itemId);
    if (!item) return;

    if (!item.is_highlight && totalHighlights >= MAX_HIGHLIGHTS) {
      toast.error(t('highlights_max_reached'));
      return;
    }

    form.setValue(
      fieldName,
      current.map((i) => (i.id === itemId ? { ...i, is_highlight: !i.is_highlight } : i)),
      { shouldValidate: false }
    );
  };

  const toggleSelectAll = (fieldName: GroupKey, items: FacilityItem[]) => {
    const current = (form.getValues(fieldName) as SelectedItem[]) || [];
    const allSelected = items.every((item) => current.some((s) => s.id === item.id));
    form.setValue(
      fieldName,
      allSelected ? [] : items.map((item) => ({ id: item.id, is_highlight: false })),
      { shouldValidate: true }
    );
  };

  const handleNextClick = async () => {
    const valid = await form.trigger('general_facilities');
    if (!valid) return;
    setHighlightModalOpen(true);
  };

  const onSubmit = async (data: FormFields) => {
    try {
      if (!user?.id || !user?.hotel) {
        toast.error(t('user_info_missing'));
        return;
      }

      if (initialValues && JSON.stringify(data) === JSON.stringify(initialValues)) {
        onNext();
        return;
      }

      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
      const propertyId = stored.propertyId;

      if (!propertyId) {
        toast.error(t('property_id_not_found'));
        return;
      }

      const googleMapUrl = stored.step3?.googleMapsUrl || stored.step6?.google_map || '';

      const payload = {
        property: propertyId,
        propertyBasicInfo: getStepId(stored.step1),
        confirmAddress: getStepId(stored.step2),
        propertyPolicies: getStepId(stored.step4),
        google_map: googleMapUrl,
        general_facilities: data.general_facilities,
        additional_facilities: data.additional_facilities,
        activities: data.activities,
        accessibility_features: data.accessibility_features,
      };

      const checkRes = await fetch(`${API_PROPERTY_DETAILS}?property=${propertyId}`);
      const existingDetails = checkRes.ok ? await checkRes.json() : [];

      let response;
      if (existingDetails.length > 0 && existingDetails[0]?.id) {
        response = await fetch(`${API_PROPERTY_DETAILS}${existingDetails[0].id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_PROPERTY_DETAILS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Property detail submission failed.');

      stored.step6 = { ...data, google_map: googleMapUrl };
      UserStorage.setItem('propertyData', JSON.stringify(stored), user.id);
      toast.success(t('details_saved_success'));
      onNext();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('error_try_again'));
    }
  };

  const formValues = form.watch();

  const groups: GroupConfig[] = [
    { key: 'general_facilities', title: t('general_facilities_title'), items: dataLists.facilities },
    { key: 'additional_facilities', title: t('additional_facilities_title'), items: dataLists.additionalFacilities },
    { key: 'activities', title: t('activities_title'), items: dataLists.activities },
    { key: 'accessibility_features', title: t('accessibility_title'), items: dataLists.accessibility_features },
  ];

  // Collect all selected items for the highlights modal
  const allSelectedItems: { fieldName: GroupKey; item: FacilityItem; isHighlighted: boolean }[] = [];
  groups.forEach(({ key, items }) => {
    ((formValues[key] as SelectedItem[]) || []).forEach((sel) => {
      const item = items.find((i) => i.id === sel.id);
      if (item) allSelectedItems.push({ fieldName: key, item, isHighlighted: sel.is_highlight });
    });
  });

  const totalHighlights = allSelectedItems.filter((i) => i.isHighlighted).length;

  const renderGroup = ({ key, title, items }: GroupConfig) => {
    const selected = (formValues[key] as SelectedItem[]) || [];
    const selectedIds = new Set(selected.map((s) => s.id));
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    const unselectedItems = items.filter((i) => !selectedIds.has(i.id));
    const isExpanded = expandedGroup === key;
    const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));

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
              onClick={(e) => { e.stopPropagation(); toggleSelectAll(key, items); }}
              className="text-xs text-primary hover:underline px-1"
            >
              {allSelected ? t('deselect_all') : t('select_all')}
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
            {/* Selected section */}
            {selectedItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  {t('selected_label')} ({selectedItems.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedItems.map((item) => {
                    const label = locale === 'mn' ? item.name_mn : item.name_en;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-200"
                      >
                        <Checkbox
                          id={`${key}-${item.id}`}
                          checked
                          onCheckedChange={() => toggleItem(key, item.id)}
                        />
                        <label
                          htmlFor={`${key}-${item.id}`}
                          className="flex-1 text-sm cursor-pointer leading-none"
                        >
                          {label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider between sections */}
            {selectedItems.length > 0 && unselectedItems.length > 0 && (
              <div className="border-t" />
            )}

            {/* Unselected section */}
            {unselectedItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('available_label')} ({unselectedItems.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {unselectedItems.map((item) => {
                    const label = locale === 'mn' ? item.name_mn : item.name_en;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-md border border-muted hover:bg-muted/30 transition-colors"
                      >
                        <Checkbox
                          id={`${key}-${item.id}`}
                          checked={false}
                          onCheckedChange={() => toggleItem(key, item.id)}
                        />
                        <label
                          htmlFor={`${key}-${item.id}`}
                          className="flex-1 text-sm cursor-pointer leading-none text-muted-foreground"
                        >
                          {label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">…</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-[640px] md:min-w-[440px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
            {groups.map(renderGroup)}

            {form.formState.errors.general_facilities && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.general_facilities.message as string}
              </p>
            )}

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t('5')}
              </Button>
              <Button type="button" onClick={handleNextClick} className="flex-1">
                {t('6')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Highlights modal */}
      <Dialog open={highlightModalOpen} onOpenChange={setHighlightModalOpen}>
        <DialogContent className="max-w-[560px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('highlights_title')}</DialogTitle>
            <p className="text-sm text-muted-foreground">{t('highlights_description')}</p>
          </DialogHeader>

          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-medium">
              {totalHighlights}/{MAX_HIGHLIGHTS} {t('highlights_selected')}
            </span>
            {totalHighlights >= MAX_HIGHLIGHTS && (
              <span className="text-xs text-orange-500 font-medium">
                {t('highlights_max_reached')}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-3">
            {allSelectedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                {t('highlights_no_items')}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allSelectedItems.map(({ fieldName, item, isHighlighted }) => {
                  const label = locale === 'mn' ? item.name_mn : item.name_en;
                  const canToggle = isHighlighted || totalHighlights < MAX_HIGHLIGHTS;
                  return (
                    <button
                      key={`${fieldName}-${item.id}`}
                      type="button"
                      onClick={() => toggleHighlight(fieldName, item.id)}
                      disabled={!canToggle}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all
                        ${
                          isHighlighted
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-900'
                            : canToggle
                            ? 'border-muted hover:border-yellow-300 hover:bg-yellow-50/40'
                            : 'border-muted opacity-40 cursor-not-allowed'
                        }`}
                    >
                      <Star
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isHighlighted
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                      <span className="text-sm leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setHighlightModalOpen(false)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('5')}
            </Button>
            <Button
              onClick={() => {
                setHighlightModalOpen(false);
                form.handleSubmit(onSubmit)();
              }}
            >
              {t('finish')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
