'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelSteps1 } from '../../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const API_URL = 'https://dev.kacc.mn/api/property-basic-info/';
const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';

interface LanguageType { id: number; languages_name_mn: string }
interface RatingType { id: number; rating: string }
interface Props { onNext: () => void; onBack: () => void }
type FormFields = z.infer<typeof schemaHotelSteps1>;

export default function RegisterHotel1({ onNext, onBack }: Props) {
  const t = useTranslations('1BasicInfo');
  const { user } = useAuth(); // Get user from auth hook
  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [ratings, setRatings] = useState<RatingType[]>([]);
  const [defaultValues, setDefaultValues] = useState<FormFields | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_COMBINED_DATA);
        const data = await res.json();
        setLanguages(data.languages || []);
        setRatings(data.ratings || []);
      } catch (error) {
        console.error('Error fetching combined data:', error);
      }
    };

    const initDefaults = async () => {
      if (!user?.hotel || !user?.id) {
        setDefaultValues({} as FormFields);
        return;
      }

      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      if (propertyDataStr) {
        const stored = JSON.parse(propertyDataStr);
        if (stored.step1) {
          console.log('📦 Loaded from storage, raw step1:', stored.step1);
          // Ensure data types are correct for form
          const formattedData = {
            ...stored.step1,
            star_rating: stored.step1.star_rating?.toString() || '',
            languages: Array.isArray(stored.step1.languages) 
              ? stored.step1.languages.map((l: any) => l.toString())
              : [],
            total_hotel_rooms: stored.step1.total_hotel_rooms?.toString() || '',
            available_rooms: stored.step1.available_rooms?.toString() || '',
          };
          console.log('✨ Formatted data for form:', formattedData);
          setDefaultValues(formattedData);
          return;
        }
      }

      try {
        const res = await fetch(`${API_URL}?property=${user.hotel}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const step1Data = data[0];
          // Ensure data types are correct for form
          const formattedData = {
            ...step1Data,
            star_rating: step1Data.star_rating?.toString() || '',
            languages: Array.isArray(step1Data.languages) 
              ? step1Data.languages.map((l: any) => l.toString())
              : [],
            total_hotel_rooms: step1Data.total_hotel_rooms?.toString() || '',
            available_rooms: step1Data.available_rooms?.toString() || '',
          };
          UserStorage.setItem('propertyData', JSON.stringify({
            step1: formattedData,
            propertyId: user.hotel,
          }), user.id);
          setDefaultValues(formattedData);
        } else {
          setDefaultValues({} as FormFields);
        }
      } catch (error) {
        console.error('Error fetching step1 data:', error);
        setDefaultValues({} as FormFields);
      }
    };

    fetchData();
    initDefaults();
  }, [user?.hotel, user?.id]);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps1),
    defaultValues: defaultValues || {
      property_name_mn: '',
      property_name_en: '',
      start_date: '',
      star_rating: '',
      part_of_group: false,
      group_name: '',
      total_hotel_rooms: '',
      available_rooms: '',
      sales_room_limitation: false,
      languages: []
    }
  });

  const { handleSubmit, watch, reset } = form;

  useEffect(() => {
    if (defaultValues) {
      console.log('🔄 Resetting form with defaultValues:', defaultValues);
      reset(defaultValues);
    }
  }, [defaultValues, reset]);


  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!user?.id || !user?.hotel) {
      toast.error('User information missing');
      return;
    }

    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    const existingPropertyId = stored.step1?.id; // Get the ID from the stored step1 data

    try {
      const cleanedData = {
        ...data,
        group_name: data.part_of_group ? data.group_name : '',
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

      toast.success(t('saveSuccess') || 'Мэдээлэл хадгалагдлаа!');
      onNext();
    } catch (error) {
      console.error(error);
      toast.error(t('error') || 'Алдаа гарлаа. Та дахин оролдоно уу.');
    }
  };

  if (defaultValues === null) return null;

  return (
    <div className="flex justify-center items-center min-h-screen p-4">

      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>
            Property basic information setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="property_name_mn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('1')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input type="date" {...field} />
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
                    <FormLabel>{t('4')}</FormLabel>
                    <Select 
                      key={`star_rating-${field.value}`}
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Сонгох" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ratings.length === 0 ? (
                          <SelectItem value="loading" disabled>Ачааллаж байна...</SelectItem>
                        ) : (
                          ratings.map(r => (
                            <SelectItem key={r.id} value={r.id.toString()}>
                              {r.rating}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="part_of_group"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('5')}?</FormLabel>
                    </div>
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
                name="sales_room_limitation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('8')}</FormLabel>
                    </div>
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
                      <div className="space-y-3">
                        {/* Selected languages display */}
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md border">
                            {field.value.map((langId: string) => {
                              const lang = languages.find(l => l.id.toString() === langId);
                              return lang ? (
                                <div
                                  key={langId}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                                >
                                  <span>{lang.languages_name_mn}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newValue = field.value.filter((id: string) => id !== langId);
                                      field.onChange(newValue);
                                    }}
                                    className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}

                        {/* Language selection grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md max-h-60 overflow-y-auto">
                          {languages.map(lang => {
                            const isSelected = field.value?.includes(lang.id.toString());
                            return (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => {
                                  const currentValue = field.value || [];
                                  const langIdStr = lang.id.toString();
                                  const newValue = isSelected
                                    ? currentValue.filter((id: string) => id !== langIdStr)
                                    : [...currentValue, langIdStr];
                                  field.onChange(newValue);
                                }}
                                className={`
                                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                                  ${isSelected
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                                  }
                                `}
                              >
                                <div className={`
                                  h-4 w-4 rounded border-2 flex items-center justify-center transition-all
                                  ${isSelected
                                    ? 'bg-primary-foreground border-primary-foreground'
                                    : 'border-muted-foreground/50'
                                  }
                                `}>
                                  {isSelected && (
                                    <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span className="flex-1 text-left">{lang.languages_name_mn}</span>
                              </button>
                            );
                          })}
                        </div>

                        {(!field.value || field.value.length === 0) && (
                          <p className="text-xs text-muted-foreground px-1">
                            {t('selectLanguagesHint') || 'Нэг буюу хэд хэдэн хэл сонгоно уу'}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="total_hotel_rooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('6')}</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
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
                          <Input type="number" min={0} {...field} />
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