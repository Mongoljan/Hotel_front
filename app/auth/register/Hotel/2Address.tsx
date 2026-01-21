'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelSteps2 } from '../../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_URL = 'https://dev.kacc.mn/api/confirm-address/';

type FormFields = z.infer<typeof schemaHotelSteps2>;

interface Province { id: number; name: string }
interface Soum { id: number; name: string; code: number }

interface CombinedData {
  province: Province[];
  soum: Soum[];
  district: { id: number; name: string; code: number }[];
}

export default function RegisterHotel2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const t = useTranslations("2ConfirmAddress");
  const { user } = useAuth();

  const [combinedData, setCombinedData] = useState<CombinedData>({ province: [], soum: [], district: [] });
  const [filteredSoum, setFilteredSoum] = useState<Soum[]>([]);
  const [pendingSoumValue, setPendingSoumValue] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<FormFields | null>(null);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps2),
    mode: 'onChange',
    defaultValues: {
      province_city: '',
      soum: '',
      district: 1,
      zipCode: '00000',
      total_floor_number: 1,
    },
  });

  const selectedProvinceId = form.watch('province_city');

  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        const res = await fetch(API_COMBINED_DATA);
        const data = await res.json();
        
        // Sort provinces to show Улаанбаатар first
        const sortedProvinces = [...(data.province || [])].sort((a, b) => {
          if (a.name === 'Улаанбаатар') return -1;
          if (b.name === 'Улаанбаатар') return 1;
          return 0;
        });
        
        setCombinedData({
          ...data,
          province: sortedProvinces
        });
      } catch (err) {
        console.error('Error fetching combined data:', err);
      }
    };

    fetchCombinedData();
  }, []);

  useEffect(() => {
    const fetchStep2Data = async () => {
      if (!user?.id || !user?.hotel) return;
      if (combinedData.province.length === 0) return; // Wait for combined data

      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
      const propertyId = stored.propertyId || user.hotel;

      try {
        const res = await fetch(`${API_URL}?property=${propertyId}`);
        const data = await res.json();
        const existing = Array.isArray(data) && data.length > 0 ? data[0] : null;
        const initialValues = stored.step2 || existing;

        if (initialValues) {

          // Convert numbers to strings for Select components
          const normalizedValues = {
            ...initialValues,
            province_city: String(initialValues.province_city || ''),
            soum: String(initialValues.soum || ''),
            district: Number(initialValues.district || 0),
            zipCode: initialValues.zipCode || '00000',
            total_floor_number: Number(initialValues.total_floor_number || 1),
          };

          // Store initial values for comparison
          setInitialValues(normalizedValues);

          // Set province first, then store soum value to be set after filtering
          form.setValue('province_city', normalizedValues.province_city);
          form.setValue('district', normalizedValues.district);
          form.setValue('zipCode', normalizedValues.zipCode);
          form.setValue('total_floor_number', normalizedValues.total_floor_number);

          // Store soum value to set after filteredSoum is populated
          if (normalizedValues.soum) {
            setPendingSoumValue(normalizedValues.soum);
          }

          stored.step2 = initialValues;
          UserStorage.setItem('propertyData', JSON.stringify(stored), user.id);
        }
      } catch (err) {
        console.error('Failed to fetch step 2 data', err);
      }
    };

    fetchStep2Data();
  }, [form, user?.id, user?.hotel, combinedData.province.length]);

  useEffect(() => {
    const provinceId = Number(selectedProvinceId);
    const filtered = combinedData.soum.filter((s) => s.code === provinceId);
    setFilteredSoum(filtered);

    // If there's a pending soum value and filtered list is now available, set it
    if (pendingSoumValue && filtered.length > 0) {
      const soumExists = filtered.some((s) => String(s.id) === pendingSoumValue);
      if (soumExists) {
        form.setValue('soum', pendingSoumValue);
        setPendingSoumValue(null); // Clear pending value
      } else {
        console.warn('❌ Soum value not found in filtered list:', pendingSoumValue);
      }
    }
  }, [selectedProvinceId, combinedData, pendingSoumValue, form]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!user?.id || !user?.hotel) {
      toast.error('User information missing');
      return;
    }

    // Check if data has changed
    if (initialValues) {
      const hasChanged = 
        data.province_city !== initialValues.province_city ||
        data.soum !== initialValues.soum ||
        data.district !== initialValues.district ||
        data.total_floor_number !== initialValues.total_floor_number;

      if (!hasChanged) {
        // No changes, just go to next step
        onNext();
        return;
      }
    }

    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    const propertyId = stored.propertyId || user.hotel;

    if (!propertyId) {
      toast.error('Үл хөдлөх хөрөнгийн ID олдсонгүй. Эхлээд 1-р алхмыг дуусгана уу.');
      return;
    }

    try {
      const checkRes = await fetch(`${API_URL}?property=${propertyId}`);
      const existing = await checkRes.json();

      const payload = {
        ...data,
        zipCode: '00000', // Default dummy zip code since field is removed
        property: propertyId
      };
      let response;

      if (Array.isArray(existing) && existing.length > 0) {
        const id = existing[0].id;
        response = await fetch(`${API_URL}${id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Failed to submit confirm address data');
      const result = await response.json();

      stored.step2 = result;
      UserStorage.setItem('propertyData', JSON.stringify(stored), user.id);

      toast.success(t('address_saved') || 'Хаягийн мэдээлэл хадгалагдлаа!');
      onNext();
    } catch (err) {
      console.error(err);
      toast.error(t('error') || 'Алдаа гарлаа. Дахин оролдоно уу.');
    }
  };

  return (
    <div className="flex justify-center h-full rounded-[12px]">

      <Card className="w-full max-w-[440px]">
        <CardHeader>
          <CardTitle className="text-[30px] font-bold text-center text-black">{t("title")}</CardTitle>
       
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="province_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Хот/Аймаг</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Хот Аймаг сонгох --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {combinedData.province.map((province) => (
                          <SelectItem key={province.id} value={province.id.toString()}>
                            {province.name}
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
                name="soum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сум/Дүүрэг</FormLabel>
                    <Select
                      key={`soum-${selectedProvinceId}-${field.value}`}
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Сум/Дүүрэг сонгох --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSoum.map((soum) => (
                          <SelectItem key={soum.id} value={soum.id.toString()}>
                            {soum.name}
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
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Баг/Хороо</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={1}
                        step={1}
                        placeholder={t('district_placeholder')}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string while typing
                          if (value === '') {
                            field.onChange('');
                          } else {
                            const numValue = parseInt(value, 10);
                            field.onChange(isNaN(numValue) ? '' : Math.floor(numValue));
                          }
                        }}
                        onBlur={(e) => {
                          // Enforce minimum of 1 when field loses focus
                          const value = parseInt(e.target.value, 10);
                          if (isNaN(value) || value < 1) {
                            field.onChange(1);
                          }
                          field.onBlur();
                        }}
                        onKeyDown={(e) => {
                          // Prevent decimal point and minus sign
                          if (e.key === '.' || e.key === '-' || e.key === 'e') {
                            e.preventDefault();
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
                name="total_floor_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Барилгын давхрын тоо</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        placeholder={t('floors_placeholder')}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string while typing
                          if (value === '') {
                            field.onChange('');
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        onBlur={(e) => {
                          // Enforce minimum of 1 when field loses focus
                          const value = Number(e.target.value);
                          if (isNaN(value) || value < 1) {
                            field.onChange(1);
                          }
                          field.onBlur();
                        }}
                        onKeyDown={(e) => {
                          // Prevent decimal point and minus sign
                          if (e.key === '.' || e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("10")}
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1"
                >
                  {t("11")}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
