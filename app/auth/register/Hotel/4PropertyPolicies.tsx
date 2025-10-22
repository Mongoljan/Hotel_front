'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Clock, Settings } from 'lucide-react';
import { schemaHotelSteps3 } from '../../../schema';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from 'next-intl';

const API_URL = 'https://dev.kacc.mn/api/property-policies/';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel4({ onNext, onBack }: Props) {
  const t = useTranslations('4PropertyPolicies');
  const { user } = useAuth();
  
  const propertyDataStr = user?.id ? UserStorage.getItem<string>('propertyData', user.id) : null;
  const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
  const step4 = stored.step4;

  const defaultValues = step4
    ? { ...step4, ...(step4?.cancellation_fee || {}) }
    : {
        cancel_time: '',
        before_fee: '',
        after_fee: '',
        beforeManyRoom_fee: '',
        afterManyRoom_fee: '',
        subsequent_days_percentage: '',
        special_condition_percentage: '',
        check_in_from: '',
        check_in_until: '',
        check_out_from: '',
        check_out_until: '',
        breakfast_policy: 'no' as const,
        parking_situation: 'no' as const,
        allow_children: false,
        allow_pets: false,
      };

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps3),
    defaultValues,
  });

  const cancelTime = form.watch('cancel_time');

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
        before_fee: data.before_fee,
        after_fee: data.after_fee,
        beforeManyRoom_fee: data.beforeManyRoom_fee,
        afterManyRoom_fee: data.afterManyRoom_fee,
        subsequent_days_percentage: data.subsequent_days_percentage,
        special_condition_percentage: data.special_condition_percentage,
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
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-center justify-center">
            <Settings className="h-6 w-6" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('title')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Check-in/Check-out Times */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">{t('6')} / {t('8')}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('6')} болон {t('8')} цагийг тохируулна уу
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-dashed rounded-lg">
                  <div className="space-y-4">
                    <h4 className="font-medium">{t('6')}</h4>
                    <div className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name="check_in_from"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-sm text-muted-foreground">{t('from')}</span>
                      <FormField
                        control={form.control}
                        name="check_in_until"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">{t('8')}</h4>
                    <div className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name="check_out_from"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-sm text-muted-foreground">{t('to')}</span>
                      <FormField
                        control={form.control}
                        name="check_out_until"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
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
                <h3 className="text-lg font-semibold">{t('cancellation_policy_title')}</h3>
                
                <FormField
                  control={form.control}
                  name="cancel_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('cancellation_time')}</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="w-40" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="before_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {cancelTime || '...'} {t('before_cancellation_fee')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="after_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {cancelTime || '...'} {t('after_cancellation_fee')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />
                
                <h4 className="font-medium">{t('multi_room_cancellation')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="beforeManyRoom_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('before_multi_room_cancellation')}</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="afterManyRoom_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('after_multi_room_cancellation')}</FormLabel>
                        <FormControl>
                          <Input placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="subsequent_days_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('subsequent_days_percentage')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="special_condition_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('special_condition_percentage')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Hotel Policies */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">{t('title')}</h3>
                
                <FormField
                  control={form.control}
                  name="breakfast_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('10')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('16')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no">{t('17')}</SelectItem>
                          <SelectItem value="free">{t('18')}</SelectItem>
                          <SelectItem value="paid">{t('19')}</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('16')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no">{t('17')}</SelectItem>
                          <SelectItem value="free">{t('18')}</SelectItem>
                          <SelectItem value="paid">{t('19')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="allow_children"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t('11')}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allow_pets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t('12')}
                          </FormLabel>
                        </div>
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