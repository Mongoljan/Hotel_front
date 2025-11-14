'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelSteps1 } from '../../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Building2, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

      toast.success(t('saveSuccess') || 'Мэдээлэл хадгалагдлаа!');
      onNext();
    } catch (error) {
      console.error(error);
      toast.error(t('error') || 'Алдаа гарлаа. Та дахин оролдоно уу.');
    }
  };

  if (defaultValues === null) return null;

  return (
    <div className="flex justify-center items-center  p-4">

      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
          
          </div>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          
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
                      <Input
                        {...field}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.currentTarget;
                          const value = input.value;
                          // Remove any non-Cyrillic characters (keep Cyrillic, numbers, and spaces)
                          const filtered = value.replace(/[^А-Яа-яӨөҮүЁё0-9\s]/g, '');
                          if (value !== filtered) {
                            input.value = filtered;
                            field.onChange(filtered);
                          }
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
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.currentTarget;
                          const value = input.value;
                          // Remove any non-Latin characters (keep Latin, numbers, and spaces)
                          const filtered = value.replace(/[^A-Za-z0-9\s]/g, '');
                          if (value !== filtered) {
                            input.value = filtered;
                            field.onChange(filtered);
                          }
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
                render={({ field }) => {
                  const [isOpen, setIsOpen] = React.useState(false);
                  return (
                    <FormItem>
                      <FormLabel>{t('3')}</FormLabel>
                      <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(new Date(field.value), "yyyy-MM-dd") : <span>Огноо сонгох</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                              setIsOpen(false); // Close popover after selection
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="star_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      {t('4')}
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2 flex-wrap">
                        {ratings.length === 0 ? (
                          <div className="text-sm text-muted-foreground">Ачааллаж байна...</div>
                        ) : (
                          ratings.map(r => {
                            const isSelected = field.value === r.id.toString();
                            const starCount = parseInt(r.rating) || 0;
                            const isNA = r.rating.toUpperCase() === 'N/A' || !starCount;

                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => field.onChange(r.id.toString())}
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-2 rounded-md border transition-all font-medium",
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-input bg-background hover:bg-accent hover:border-accent-foreground/20"
                                )}
                              >
                                {isNA ? (
                                  <span className="text-sm">Байхгүй</span>
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
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => field.onChange(true)}
                          className={`
                            px-8 py-2 rounded-md text-sm font-medium transition-all border
                            ${field.value === true
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          {t('yes')}
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(false)}
                          className={`
                            px-8 py-2 rounded-md text-sm font-medium transition-all border
                            ${field.value === false
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          {t('no')}
                        </button>
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
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {languages.map((lang) => {
                            const isSelected = field.value?.includes(lang.id.toString());
                            return (
                              <div key={lang.id}>
                                <input
                                  type="checkbox"
                                  id={`lang-${lang.id}`}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const currentValue = field.value || [];
                                    const langIdStr = lang.id.toString();
                                    const newValue = e.target.checked
                                      ? [...currentValue, langIdStr]
                                      : currentValue.filter((id: string) => id !== langIdStr);
                                    field.onChange(newValue);
                                  }}
                                  className="hidden peer"
                                />
                                <label
                                  htmlFor={`lang-${lang.id}`}
                                  className="peer-checked:bg-primary peer-checked:text-primary-foreground
                                             border border-input rounded-md px-3 py-1.5 cursor-pointer
                                             bg-background text-foreground transition hover:bg-accent text-sm inline-block"
                                >
                                  {lang.languages_name_mn}
                                </label>
                              </div>
                            );
                          })}
                        </div>

                        {field.value && field.value.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {field.value.length} хэл сонгогдсон
                          </p>
                        )}
                      </div>
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