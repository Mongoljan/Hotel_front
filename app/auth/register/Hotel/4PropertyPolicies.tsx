'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { schemaHotelSteps3 } from '../../../schema';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";

const API_URL = 'https://dev.kacc.mn/api/property-policies/';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel4({ onNext, onBack }: Props) {
  const t = useTranslations('4PropertyPolicies');
  const { user } = useAuth();

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps3),
    defaultValues: {
      cancel_time: '',
      single_before_time_percentage: '',
      single_after_time_percentage: '',
      multi_5days_before_percentage: '',
      multi_3days_before_percentage: '',
      multi_2days_before_percentage: '',
      multi_1day_before_percentage: '',
      check_in_from: '',
      check_in_until: '',
      check_out_from: '',
      check_out_until: '',
      breakfast_policy: 'no' as const,
      parking_situation: 'no' as const,
      allow_children: false,
      allow_pets: false,
    },
  });

  const cancelTime = form.watch('cancel_time');

  // Fetch and populate data when component mounts
  useEffect(() => {
    const fetchPolicyData = async () => {
      if (!user?.id || !user?.hotel) return;

      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
      const propertyId = stored.propertyId || user.hotel;

      try {
        const res = await fetch(`${API_URL}?property=${propertyId}`);
        const data = await res.json();
        const existing = Array.isArray(data) && data.length > 0 ? data[0] : null;
        const initialValues = stored.step4 || existing;

        if (initialValues) {
          console.log('📋 Step 4 data from API/storage:', initialValues);

          // Flatten cancellation_fee object
          const normalizedValues = {
            cancel_time: initialValues.cancellation_fee?.cancel_time || initialValues.cancel_time || '',
            single_before_time_percentage: initialValues.cancellation_fee?.single_before_time_percentage || initialValues.single_before_time_percentage || '',
            single_after_time_percentage: initialValues.cancellation_fee?.single_after_time_percentage || initialValues.single_after_time_percentage || '',
            multi_5days_before_percentage: initialValues.cancellation_fee?.multi_5days_before_percentage || initialValues.multi_5days_before_percentage || '',
            multi_3days_before_percentage: initialValues.cancellation_fee?.multi_3days_before_percentage || initialValues.multi_3days_before_percentage || '',
            multi_2days_before_percentage: initialValues.cancellation_fee?.multi_2days_before_percentage || initialValues.multi_2days_before_percentage || '',
            multi_1day_before_percentage: initialValues.cancellation_fee?.multi_1day_before_percentage || initialValues.multi_1day_before_percentage || '',
            check_in_from: initialValues.check_in_from || '',
            check_in_until: initialValues.check_in_until || '',
            check_out_from: initialValues.check_out_from || '',
            check_out_until: initialValues.check_out_until || '',
            breakfast_policy: initialValues.breakfast_policy || 'no',
            parking_situation: initialValues.parking_situation || 'no',
            allow_children: initialValues.allow_children || false,
            allow_pets: initialValues.allow_pets || false,
          };

          console.log('✅ Normalized step 4 values:', normalizedValues);
          form.reset(normalizedValues);

          stored.step4 = initialValues;
          UserStorage.setItem('propertyData', JSON.stringify(stored), user.id);
        }
      } catch (err) {
        console.error('Failed to fetch step 4 data:', err);
      }
    };

    fetchPolicyData();
  }, [form, user?.id, user?.hotel]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!user?.id || !user?.hotel) {
      toast.error('User information missing');
      return;
    }

    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    const propertyId = stored.propertyId || user.hotel;

    if (!propertyId) {
      toast.error(t('property_id_not_found') || 'Үл хөдлөх хөрөнгийн ID олдсонгүй. 1-р алхмыг дуусгана уу.');
      return;
    }

    const formattedData = {
      cancellation_fee: {
        cancel_time: data.cancel_time,
        single_before_time_percentage: data.single_before_time_percentage,
        single_after_time_percentage: data.single_after_time_percentage,
        multi_5days_before_percentage: data.multi_5days_before_percentage,
        multi_3days_before_percentage: data.multi_3days_before_percentage,
        multi_2days_before_percentage: data.multi_2days_before_percentage,
        multi_1day_before_percentage: data.multi_1day_before_percentage,
        property: propertyId,
      },
      check_in_from: data.check_in_from,
      check_in_until: data.check_in_until,
      check_out_from: data.check_out_from,
      check_out_until: data.check_out_until,
      breakfast_policy: data.breakfast_policy,
      allow_children: data.allow_children,
      allow_pets: data.allow_pets,
      parking_situation: data.parking_situation,
      property: propertyId,
    };

    try {
      const checkRes = await fetch(`${API_URL}?property=${propertyId}`);
      const existing = await checkRes.json();

      const response = await fetch(
        existing?.length > 0 ? `${API_URL}${existing[0].id}/` : API_URL,
        {
          method: existing?.length > 0 ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) throw new Error('Failed to save property policy');
      const result = await response.json();

      UserStorage.setItem('propertyData', JSON.stringify({
        ...stored,
        step4: result,
      }), user.id);

      toast.success(t('policy_saved'));
      onNext();
    } catch (error) {
      console.error(error);
      toast.error(t('error_try_again') || 'Алдаа гарлаа. Дахин оролдоно уу.');
    }
  };

  return (
    <div className="flex justify-center items-center">

      <Card className="w-full max-w-[650px] md:min-w-[440px]">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Check-in/Check-out Times */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Цаг тохируулах</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Та өөрийн буудлын дотоод журмын дагуу өрөөнд орох болон гарах цагийг тохируулна уу.
                </p>

                <div className="space-y-4 p-4 border border-dashed rounded-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                    <h4 className="font-medium md:mr-10"> {t('6')}</h4>
                    
                    <div className="w-32">
                      <FormField
                    
                        control={form.control}
                        name="check_in_from"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                           
                              <FormControl>
                                <Input type="time" {...field} className="w-32" />
                              </FormControl>
                          
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      </div>
                        <span className="text-sm text-muted-foreground"> - </span>
                      <FormField
                        control={form.control}
                        name="check_in_until"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="time" {...field} className="w-32" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
               
                    <div className="flex items-center gap-4">
                           <h4 className="font-medium md:mr-10">{t('8')}</h4>
                             <div className="w-32">
                      <FormField
                        control={form.control}
                        name="check_out_from"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                           
                              <FormControl>
                                <Input type="time" {...field} className="w-32" />
                              </FormControl>
                             
                         
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      </div>
                       <span className="text-sm text-muted-foreground"> - </span>
                      <FormField
                        control={form.control}
                        name="check_out_until"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="time" {...field} className="w-32" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cancellation Policy */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Цуцлалтын бодлого</h3>

                <FormField
                  control={form.control}
                  name="cancel_time"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormLabel className="min-w-[200px]">Цуцлах боломжтой цаг</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="w-40" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                {/* Single Room Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-base">1 өрөөний захиалгад нийт төлбөрөөс суутгах хураамжийн хувь:</h4>

                  <FormField
                    control={form.control}
                    name="single_before_time_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-4">
                          <FormLabel className="min-w-[200px]">
                            {cancelTime || '...'} хугацаанаас өмнө цуцлах төлбөр (%)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="w-32"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="single_after_time_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-4">
                          <FormLabel className="min-w-[200px]">
                            {cancelTime || '...'} хугацаанаас хойш цуцлах төлбөр (%)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="w-32"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                {/* Multi Room Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-base">2 болон түүнээс дээш өрөөнд нийт төлбөрөөс суутгах хураамжийн хувь:</h4>

                  <FormField
                    control={form.control}
                    name="multi_5days_before_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-4">
                          <FormLabel className="min-w-[200px]">Ирэх өдрөөсөө 5 хоногийн өмнөх хувь (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="w-32" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="multi_3days_before_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-4">
                          <FormLabel className="min-w-[200px]">Ирэх өдрөөсөө 3 хоногийн өмнөх хувь (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="w-32" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="multi_2days_before_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-4">
                          <FormLabel className="min-w-[200px]">Ирэх өдрөөсөө 2 хоногийн өмнөх хувь (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="w-32"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="multi_1day_before_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-4">
                          <FormLabel className="min-w-[200px]">Ирэх өдрөөсөө 1 хоногийн өмнөх хувь (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="w-32"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Hotel Policies */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Бусад</h3>

                <FormField
                  control={form.control}
                  name="breakfast_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('10')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange('no')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                              field.value === 'no'
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {t('17')}
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('free')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                              field.value === 'free'
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {t('18')}
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('paid')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                              field.value === 'paid'
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {t('19')}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parking_situation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Зогсоолын мэдээлэл</FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange('no')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                              field.value === 'no'
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {t('17')}
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('free')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                              field.value === 'free'
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {t('18')}
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('paid')}
                            className={cn(
                              "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                              field.value === 'paid'
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {t('19')}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="allow_children"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('11')}</FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === true
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Тийм
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === false
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Үгүй
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allow_pets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('12')}</FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === true
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Тийм
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === false
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              Үгүй
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('13')}
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1"
                >
                  {t('14')}
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