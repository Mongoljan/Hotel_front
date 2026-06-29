'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import { schemaHotelSteps6 } from '../../../schema';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

import { useCombinedData } from '@/app/hooks/useCombinedData';
const API_PROPERTY_DETAILS = 'https://dev.kacc.mn/api/property-details/';

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
  const [initialValues, setInitialValues] = useState<FormFields | null>(null);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps6(t('select_facility_error'))) as any,
    mode: 'onChange',
    defaultValues: {
      general_facilities: [],
      additional_facilities: [],
      activities: [],
      accessibility_feature: [],
    },
  });

  const { data: combinedHook } = useCombinedData();
  useEffect(() => {
    if (!combinedHook) return;
    const d = combinedHook as any;
    setDataLists({
      facilities: d.facilities || [],
      additionalFacilities: d.additionalFacilities || [],
      activities: d.activities || [],
      accessibility_features: d.accessibility_features || [],
    });
  }, [combinedHook]);

  useEffect(() => {
    if (!user?.id) return;
    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    if (stored.step6) {
      // Filter saved facility IDs to only include those that still exist
      // in the current data lists (handles stale localStorage after DB reset)
      const validIds = (items: { id: number }[], saved: { id: number; is_highlight: boolean }[]) => {
        const valid = new Set(items.map((i) => i.id));
        return saved.filter((s) => valid.has(s.id));
      };
      const values: FormFields = {
        general_facilities: validIds(dataLists.facilities, stored.step6.general_facilities || []),
        additional_facilities: validIds(dataLists.additionalFacilities, stored.step6.additional_facilities || []),
        activities: validIds(dataLists.activities, stored.step6.activities || []),
        accessibility_feature: validIds(
          dataLists.accessibility_features,
          stored.step6.accessibility_feature || stored.step6.accessibility_features || []
        ),
      };
      form.reset(values);
      setInitialValues(values);
    }
  }, [form, user?.id, dataLists]);

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

  const toggleSelectAll = (fieldName: GroupKey, items: FacilityItem[]) => {
    const current = (form.getValues(fieldName) as SelectedItem[]) || [];
    const allSelected = items.every((item) => current.some((s) => s.id === item.id));
    form.setValue(
      fieldName,
      allSelected ? [] : items.map((item) => ({ id: item.id, is_highlight: false })),
      { shouldValidate: true }
    );
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
        accessibility_feature: data.accessibility_feature,
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

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unable to read error body');
        console.error('Property details API error:', response.status, errorBody);
        throw new Error(`Property detail submission failed (${response.status}): ${errorBody}`);
      }

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
    { key: 'accessibility_feature', title: t('accessibility_title'), items: dataLists.accessibility_features },
  ];

  const renderGroup = ({ key, title, items }: GroupConfig) => {
    const selected = (formValues[key] as SelectedItem[]) || [];
    const selectedIds = new Set(selected.map((s) => s.id));
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    const unselectedItems = items.filter((i) => !selectedIds.has(i.id));
    const isExpanded = expandedGroup === key;
    const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));

    return (
      <div key={key} className={cn(
        "border rounded-lg overflow-hidden",
        key === 'general_facilities' && form.formState.errors.general_facilities && "border-destructive"
      )}>
        <button
          type="button"
          onClick={() => toggleGroup(key)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {title}
              {key === 'general_facilities' && <span className="text-destructive ml-0.5">*</span>}
            </span>
            {selected.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selected.length}/{items.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); toggleSelectAll(key, items); }}
                className="text-xs text-primary hover:underline px-1"
              >
                {allSelected ? t('deselect_all') : t('select_all')}
              </span>
            ) : null}
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
                <p className="text-xs font-medium text-primary uppercase tracking-wide">
                  Сонгосон({selectedItems.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => {
                    const label = locale === 'mn' ? item.name_mn : item.name_en;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(key, item.id)}
                        className="group inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-medium hover:bg-primary/25 transition-colors"
                      >
                        {label}
                        <X className="h-3 w-3 opacity-70 group-hover:opacity-100 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedItems.length > 0 && unselectedItems.length > 0 && (
              <div className="border-t" />
            )}

            {unselectedItems.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Санал болгох({unselectedItems.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {unselectedItems.map((item) => {
                    const label = locale === 'mn' ? item.name_mn : item.name_en;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(key, item.id)}
                        className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs hover:bg-muted/80 hover:text-foreground transition-colors"
                      >
                        {label}
                      </button>
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
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-[640px]">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-center">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {groups.map(renderGroup)}

            {form.formState.errors.general_facilities && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.general_facilities.message as string}
              </p>
            )}

            <div className="flex gap-3 pt-10">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t('5')}
              </Button>
              <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} className="flex-1">
                {t('6')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}