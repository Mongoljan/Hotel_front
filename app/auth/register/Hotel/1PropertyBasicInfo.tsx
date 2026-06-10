'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelSteps1 } from '../../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Building2, Star } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MonthYearPickerWithValue } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { OptionButton } from "@/components/ui/option-button";
import { LanguageMultiSelect } from '@/components/LanguageMultiSelect';

const API_URL = 'https://dev.kacc.mn/api/property-basic-info/';
const PROPERTIES_API = 'https://dev.kacc.mn/api/properties';
import { useCombinedData } from '@/app/hooks/useCombinedData';
import {
  loadRegistrationHotelNames,
  mergeRegistrationHotelNames,
  type RegistrationHotelNames,
} from '@/utils/registrationHotelNames';

function mapPropertyRegistrationNames(data: Record<string, unknown>): RegistrationHotelNames {
  const propertyName = String(data.PropertyName || data.property_name_mn || '').trim();
  const propertyNameEn = String(
    data.PropertyName_en || data.PropertyNameEn || data.property_name_en || ''
  ).trim();

  if (propertyNameEn) {
    return { property_name_mn: propertyName, property_name_en: propertyNameEn };
  }

  const hasCyrillic = /[А-Яа-яӨөҮүЁё]/.test(propertyName);
  const isLatinOnly = /^[A-Za-z0-9\s.,'-]+$/.test(propertyName);

  if (hasCyrillic) {
    return { property_name_mn: propertyName, property_name_en: '' };
  }
  if (isLatinOnly) {
    return { property_name_mn: '', property_name_en: propertyName };
  }

  return { property_name_mn: propertyName, property_name_en: '' };
}

async function fetchRegistrationHotelNames(
  hotelId: number | string
): Promise<RegistrationHotelNames> {
  try {
    const res = await fetch(`${PROPERTIES_API}/${hotelId}/`, { cache: 'no-store' });
    if (!res.ok) {
      return loadRegistrationHotelNames(hotelId);
    }

    const data = await res.json();
    const registerNo = String(data.register || '').trim();
    const storedNames = loadRegistrationHotelNames(hotelId, registerNo);
    return mergeRegistrationHotelNames(mapPropertyRegistrationNames(data), storedNames);
  } catch {
    return loadRegistrationHotelNames(hotelId);
  }
}

function formatStep1FormData(
  step1Data: Record<string, unknown>,
  registrationNames: RegistrationHotelNames
): FormFields {
  return {
    ...step1Data,
    property_name_mn:
      (step1Data.property_name_mn as string) || registrationNames.property_name_mn || '',
    property_name_en:
      (step1Data.property_name_en as string) || registrationNames.property_name_en || '',
    star_rating: step1Data.star_rating?.toString() || '',
    languages: Array.isArray(step1Data.languages)
      ? step1Data.languages.map((l) => String(l))
      : [],
    total_hotel_rooms: step1Data.total_hotel_rooms?.toString() || '',
    available_rooms: step1Data.available_rooms?.toString() || '',
    part_of_group: Boolean(step1Data.part_of_group),
    group_name: (step1Data.group_name as string) || '',
    start_date: (step1Data.start_date as string) || '',
    sales_room_limitation: Boolean(step1Data.sales_room_limitation),
  } as FormFields;
}

const EMPTY_STEP1_DEFAULTS: FormFields = {
  property_name_mn: '',
  property_name_en: '',
  start_date: '',
  star_rating: '',
  part_of_group: false,
  group_name: '',
  total_hotel_rooms: '',
  available_rooms: '',
  sales_room_limitation: false,
  languages: [],
};

interface LanguageType { id: number; languages_name_mn: string }
interface RatingType { id: number; rating: string }
interface Props { onNext: () => void; onBack: () => void }
type FormFields = z.infer<typeof schemaHotelSteps1>;

export default function RegisterHotel1({ onNext, onBack }: Props) {
  const t = useTranslations('1BasicInfo');
  const locale = useLocale();
  const { user } = useAuth(); // Get user from auth hook
  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [ratings, setRatings] = useState<RatingType[]>([]);
  const [defaultValues, setDefaultValues] = useState<FormFields | null>(null);

  // Use cached hook — avoids duplicate network fetch on every registration step mount
  const { data: combinedHook } = useCombinedData();
  useEffect(() => {
    if (!combinedHook) return;
    setLanguages(combinedHook.languages || []);
    setRatings(combinedHook.ratings || []);
  }, [combinedHook]);

  // Load default values from cache or API (separate from reference data)
  useEffect(() => {
    const initDefaults = async () => {
      if (!user?.hotel || !user?.id) {
        setDefaultValues({} as FormFields);
        return;
      }

      const registrationNames = await fetchRegistrationHotelNames(user.hotel);

      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      if (propertyDataStr) {
        const stored = JSON.parse(propertyDataStr);
        if (stored.step1) {
          setDefaultValues(formatStep1FormData(stored.step1, registrationNames));
          return;
        }
      }

      try {
        const res = await fetch(`${API_URL}?property=${user.hotel}`, { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formattedData = formatStep1FormData(data[0], registrationNames);
          UserStorage.setItem('propertyData', JSON.stringify({
            step1: formattedData,
            propertyId: user.hotel,
          }), user.id);
          setDefaultValues(formattedData);
        } else {
          setDefaultValues({
            ...EMPTY_STEP1_DEFAULTS,
            property_name_mn: registrationNames.property_name_mn,
            property_name_en: registrationNames.property_name_en,
          });
        }
      } catch (error) {
        console.error('Error fetching step1 data:', error);
        setDefaultValues({
          ...EMPTY_STEP1_DEFAULTS,
          property_name_mn: registrationNames.property_name_mn,
          property_name_en: registrationNames.property_name_en,
        });
      }
    };

    initDefaults();
  }, [user?.hotel, user?.id]);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps1),
    mode: 'onChange',
    defaultValues: defaultValues || EMPTY_STEP1_DEFAULTS
  });

  const { handleSubmit, watch, reset } = form;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);


  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!user?.id || !user?.hotel) {
      toast.error(t('user_info_missing'));
      return;
    }

    // Check if data has changed
    if (defaultValues) {
      const hasChanged = JSON.stringify(data) !== JSON.stringify(defaultValues);
      
      if (!hasChanged) {
        // No changes, just go to next step
        onNext();
        return;
      }
    }

    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    const existingPropertyId = stored.step1?.id; // Get the ID from the stored step1 data

    try {
      const cleanedData = {
        ...data,
        group_name: data.part_of_group ? data.group_name : '',
        sales_room_limitation: false, // Default value since field is removed
        property: user.hotel,
      };

      const response = await fetch(
        existingPropertyId ? `${API_URL}${existingPropertyId}/` : API_URL,
        {
          method: existingPropertyId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedData),
        }
      );

      if (!response.ok) throw new Error('Failed to save property basic info');
      const result = await response.json();

      // Store the complete result from API which includes the id field
      UserStorage.setItem('propertyData', JSON.stringify({
        ...stored,
        step1: result,
        propertyId: user.hotel,
      }), user.id);

      toast.success(t('saveSuccess'));
      onNext();
    } catch (error) {
      console.error(error);
      toast.error(t('error'));
    }
  };

  if (defaultValues === null) return null;

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-[640px]">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-center">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="property_name_mn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('1')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('property_name_mn_placeholder')}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger('property_name_mn');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="property_name_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('2')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('property_name_en_placeholder')}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger('property_name_en');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('3')}</FormLabel>
                    <FormControl>
                      <MonthYearPickerWithValue
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('select_date')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="star_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      
                      {t('4')}
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2 flex-wrap">
                        {ratings.length === 0 ? (
                          <div className="text-sm text-muted-foreground">{t('loading_ratings')}</div>
                        ) : (
                          ratings.map(r => {
                            const starCount = parseInt(r.rating) || 0;
                            const isNA = r.rating.toUpperCase() === 'N/A' || !starCount;
                            const savedValue = isNA ? r.id.toString() : starCount.toString();
                            const isSelected = field.value === savedValue;

                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => field.onChange(savedValue)}
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-2 rounded-md border transition-all font-medium",
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-input bg-background hover:bg-accent hover:border-accent-foreground/20"
                                )}
                              >
                                {isNA ? (
                                  <span className="text-sm">{t('no_rating')}</span>
                                ) : (
                                  <>
                                    <Star
                                      className={cn(
                                        "h-4 w-4",
                                        isSelected ? "text-amber-300 fill-amber-300" : "text-amber-500 fill-amber-500"
                                      )}
                                    />
                                    <span className="text-sm">{starCount}</span>
                                  </>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="part_of_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('5')}?</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <OptionButton selected={field.value === true} onClick={() => field.onChange(true)}>{t('yes')}</OptionButton>
                        <OptionButton selected={field.value === false} onClick={() => field.onChange(false)}>{t('no')}</OptionButton>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="group_name"
                render={({ field }) => (
                  <FormItem className={watch('part_of_group') ? '' : 'hidden'}>
                    <FormLabel>{t('groupName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('9')}</FormLabel>
                    <FormControl>
                      <LanguageMultiSelect
                        languages={languages}
                        value={field.value || []}
                        onChange={field.onChange}
                        locale={locale}
                        labels={{
                          selected: t('languages_section_selected'),
                          available: t('languages_section_available'),
                          search: t('languages_search'),
                          placeholder: t('selectLanguagesHint'),
                          done: t('languages_done'),
                          emptySelected: t('languages_empty_selected'),
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 ">
                <div className="flex-1 ">
                  <FormField
                    control={form.control}
                    name="total_hotel_rooms"
                    render={({ field }) => (
                      <FormItem>
                        <div className="h-6"></div>
                        <FormLabel >{t('6')}</FormLabel>

                        <FormControl>
                          <Input type="number" min={1} placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="available_rooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('7')}</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('10')}
                </Button>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1"
                >
                  {t('11')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}