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
          setDefaultValues(stored.step1);
          return;
        }
      }

      try {
        const res = await fetch(`${API_URL}?property=${user.hotel}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const step1Data = data[0];
          UserStorage.setItem('propertyData', JSON.stringify({
            step1: step1Data,
            propertyId: user.hotel,
          }), user.id);
          setDefaultValues(step1Data);
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
    const existingPropertyId = stored.step1?.propertyId;

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Сонгох" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ratings.map(r => (
                          <SelectItem key={r.id} value={r.id.toString()}>
                            {r.rating}
                          </SelectItem>
                        ))}
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
                      <select 
                        multiple 
                        value={field.value || []} 
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                          field.onChange(selectedOptions);
                        }}
                        className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {languages.map(lang => (
                          <option key={lang.id} value={lang.id.toString()}>
                            {lang.languages_name_mn}
                          </option>
                        ))}
                      </select>
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