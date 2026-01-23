'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Clock, Coffee, Car, Baby } from 'lucide-react';
import { schemaHotelSteps3 } from '../../../schema';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { NumericFormat } from 'react-number-format';

const API_URL = 'https://dev.kacc.mn/api/property-policies/';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel4({ onNext, onBack }: Props) {
  const t = useTranslations('4PropertyPolicies');
  const { user } = useAuth();
  const [initialValues, setInitialValues] = React.useState<FormFields | null>(null);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps3),
    mode: 'onChange',
    defaultValues: {
      // Check-in/Check-out times
      check_in_from: '',
      check_in_until: '',
      check_out_from: '',
      check_out_until: '',
      
      // Cancellation fee
      cancel_time: '',
      single_before_time_percentage: '',
      single_after_time_percentage: '',
      multi_5days_before_percentage: '',
      multi_3days_before_percentage: '',
      multi_2days_before_percentage: '',
      multi_1day_before_percentage: '',
      
      // Breakfast policy
      breakfast_status: 'no',
      breakfast_start_time: '',
      breakfast_end_time: '',
      breakfast_price: null,
      breakfast_type: undefined,
      
      // Parking policy
      outdoor_parking: 'no',
      outdoor_fee_type: null,
      outdoor_price: null,
      indoor_parking: 'no',
      indoor_fee_type: null,
      indoor_price: null,
      
      // Child policy
      allow_children: false,
      max_child_age: undefined,
      child_bed_available: undefined,
      allow_extra_bed: false,
      extra_bed_price: null,
    },
  });

  const cancelTime = form.watch('cancel_time');
  const displayCancelTime = cancelTime ? cancelTime.slice(0, 5) : '';
  
  // Watch values for conditional rendering
  const breakfastStatus = form.watch('breakfast_status');
  const outdoorParking = form.watch('outdoor_parking');
  const indoorParking = form.watch('indoor_parking');
  const allowChildren = form.watch('allow_children');
  const allowExtraBed = form.watch('allow_extra_bed');

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
        const initialData = stored.step4 || existing;

        if (initialData) {
          // Normalize values from API response
          const normalizedValues: FormFields = {
            // Check-in/Check-out times
            check_in_from: initialData.check_in_from || '',
            check_in_until: initialData.check_in_until || '',
            check_out_from: initialData.check_out_from || '',
            check_out_until: initialData.check_out_until || '',
            
            // Cancellation fee
            cancel_time: initialData.cancellation_fee?.cancel_time || '',
            single_before_time_percentage: initialData.cancellation_fee?.single_before_time_percentage || '',
            single_after_time_percentage: initialData.cancellation_fee?.single_after_time_percentage || '',
            multi_5days_before_percentage: initialData.cancellation_fee?.multi_5days_before_percentage || '',
            multi_3days_before_percentage: initialData.cancellation_fee?.multi_3days_before_percentage || '',
            multi_2days_before_percentage: initialData.cancellation_fee?.multi_2days_before_percentage || '',
            multi_1day_before_percentage: initialData.cancellation_fee?.multi_1day_before_percentage || '',
            
            // Breakfast policy
            breakfast_status: initialData.breakfast_policy?.status || 'no',
            breakfast_start_time: initialData.breakfast_policy?.start_time || '',
            breakfast_end_time: initialData.breakfast_policy?.end_time || '',
            breakfast_price: initialData.breakfast_policy?.price || null,
            breakfast_type: initialData.breakfast_policy?.breakfast_type || undefined,
            
            // Parking policy
            outdoor_parking: initialData.parking_policy?.outdoor_parking || 'no',
            outdoor_fee_type: initialData.parking_policy?.outdoor_fee_type || null,
            outdoor_price: initialData.parking_policy?.outdoor_price || null,
            indoor_parking: initialData.parking_policy?.indoor_parking || 'no',
            indoor_fee_type: initialData.parking_policy?.indoor_fee_type || null,
            indoor_price: initialData.parking_policy?.indoor_price || null,
            
            // Child policy
            allow_children: initialData.child_policy?.allow_children || false,
            max_child_age: initialData.child_policy?.max_child_age || undefined,
            child_bed_available: initialData.child_policy?.child_bed_available || undefined,
            allow_extra_bed: initialData.child_policy?.allow_extra_bed || false,
            extra_bed_price: initialData.child_policy?.extra_bed_price || null,
          };
          
          setInitialValues(normalizedValues);
          form.reset(normalizedValues);

          stored.step4 = initialData;
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

    // Check if data has changed
    if (initialValues) {
      const hasChanged = JSON.stringify(data) !== JSON.stringify(initialValues);
      
      if (!hasChanged) {
        onNext();
        return;
      }
    }

    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    const propertyId = stored.propertyId || user.hotel;

    if (!propertyId) {
      toast.error(t('property_id_not_found') || 'Үл хөдлөх хөрөнгийн ID олдсонгүй. 1-р алхмыг дуусгана уу.');
      return;
    }

    // Helper function to strip seconds from time (HH:MM:SS -> HH:MM)
    const stripSeconds = (time: string) => time ? time.slice(0, 5) : time;

    // Format data according to new API structure
    const formattedData = {
      property: propertyId,
      check_in_from: stripSeconds(data.check_in_from),
      check_in_until: stripSeconds(data.check_in_until),
      check_out_from: stripSeconds(data.check_out_from),
      check_out_until: stripSeconds(data.check_out_until),
      
      cancellation_fee: {
        property: propertyId,
        cancel_time: stripSeconds(data.cancel_time),
        single_before_time_percentage: data.single_before_time_percentage,
        single_after_time_percentage: data.single_after_time_percentage,
        multi_5days_before_percentage: data.multi_5days_before_percentage,
        multi_3days_before_percentage: data.multi_3days_before_percentage,
        multi_2days_before_percentage: data.multi_2days_before_percentage,
        multi_1day_before_percentage: data.multi_1day_before_percentage,
      },
      
      breakfast_policy: {
        status: data.breakfast_status,
        start_time: data.breakfast_status !== 'no' ? stripSeconds(data.breakfast_start_time || '') : null,
        end_time: data.breakfast_status !== 'no' ? stripSeconds(data.breakfast_end_time || '') : null,
        price: data.breakfast_status === 'paid' ? data.breakfast_price : null,
        breakfast_type: data.breakfast_status !== 'no' ? data.breakfast_type : null,
      },
      
      parking_policy: {
        outdoor_parking: data.outdoor_parking,
        outdoor_fee_type: data.outdoor_parking === 'paid' ? data.outdoor_fee_type : null,
        outdoor_price: data.outdoor_parking === 'paid' ? data.outdoor_price : null,
        indoor_parking: data.indoor_parking,
        indoor_fee_type: data.indoor_parking === 'paid' ? data.indoor_fee_type : null,
        indoor_price: data.indoor_parking === 'paid' ? data.indoor_price : null,
      },
      
      child_policy: {
        allow_children: data.allow_children,
        max_child_age: data.allow_children ? data.max_child_age : null,
        child_bed_available: data.allow_children ? data.child_bed_available : null,
        allow_extra_bed: data.allow_extra_bed || false,
        extra_bed_price: data.allow_extra_bed ? data.extra_bed_price : null,
      },
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
      <Card className="w-full max-w-[700px] md:min-w-[500px]">
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
                      <h4 className="font-medium md:mr-10">{t('6')}</h4>
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
                            Өмнөх өдрийн <span className="text-blue-500 mr-1">{displayCancelTime || '...'}</span> цагаас өмнө цуцалвал
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" min="0" max="100" step="1" {...field} className="w-32" />
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
                            Өмнөх өдрийн <span className="text-blue-500 mr-1">{displayCancelTime || '...'}</span> цагаас хойш цуцалвал
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" min="0" max="100" step="1" {...field} className="w-32" />
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
                          <FormLabel className="min-w-[200px]">Ирэх өдрөөсөө 5 хоногийн өмнөх хувь</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" min="0" max="100" step="1" {...field} className="w-32" />
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
                          <FormLabel className="min-w-[200px]">Ирэх өдрөөсөө 3 хоногийн өмнөх хувь</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" min="0" max="100" step="1" {...field} className="w-32" />
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
                          <FormLabel className="min-w-[200px]">Ирэх өдрөөсөө 2 хоногийн өмнөх хувь</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" min="0" max="100" step="1" {...field} className="w-32" />
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
                          <FormLabel className="min-w-[200px]">Ирэх өдрөөсөө 1 хоногийн өмнөх хувь</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" min="0" max="100" step="1" {...field} className="w-32" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Breakfast Policy */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Өглөөний цай</h3>
                </div>

                <FormField
                  control={form.control}
                  name="breakfast_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('10')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          {(['no', 'free', 'paid'] as const).map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              className={cn(
                                "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                field.value === value
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              {value === 'no' ? t('17') : value === 'free' ? t('18') : t('19')}
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {breakfastStatus !== 'no' && (
                  <div className="space-y-4 p-4 border border-dashed rounded-lg">
                    <div className="flex items-center gap-4">
                      <FormLabel className="min-w-[150px]">Өглөөний цайны цаг</FormLabel>
                      <FormField
                        control={form.control}
                        name="breakfast_start_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} className="w-32" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span>-</span>
                      <FormField
                        control={form.control}
                        name="breakfast_end_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} className="w-32" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="breakfast_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Өглөөний цайны төрөл</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Сонгоно уу" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="buffet">Buffet</SelectItem>
                              <SelectItem value="room">Өрөөнд</SelectItem>
                              <SelectItem value="plate">Тавгаар</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {breakfastStatus === 'paid' && (
                      <FormField
                        control={form.control}
                        name="breakfast_price"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-4">
                              <FormLabel className="min-w-[150px]">Үнэ (₮)</FormLabel>
                              <FormControl>
                                <NumericFormat
                                  thousandSeparator=","
                                  placeholder="0"
                                  value={field.value || ''}
                                  onValueChange={(values) => field.onChange(values.value || null)}
                                  customInput={Input}
                                  className="w-40"
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Parking Policy */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Зогсоолын мэдээлэл</h3>
                </div>

                {/* Outdoor Parking */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="outdoor_parking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Гадна зогсоол</FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            {(['no', 'free', 'paid'] as const).map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => field.onChange(value)}
                                className={cn(
                                  "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                  field.value === value
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                {value === 'no' ? t('17') : value === 'free' ? t('18') : t('19')}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {outdoorParking === 'paid' && (
                    <div className="flex gap-4 p-4 border border-dashed rounded-lg">
                      <FormField
                        control={form.control}
                        name="outdoor_fee_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Төлбөрийн нэгж</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Сонгоно уу" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hour">Цагаар</SelectItem>
                                <SelectItem value="day">Хоногоор</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="outdoor_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Үнэ (₮)</FormLabel>
                            <FormControl>
                              <NumericFormat
                                thousandSeparator=","
                                placeholder="0"
                                value={field.value || ''}
                                onValueChange={(values) => field.onChange(values.value || null)}
                                customInput={Input}
                                className="w-32"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Indoor Parking */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="indoor_parking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дотор зогсоол</FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            {(['no', 'free', 'paid'] as const).map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => field.onChange(value)}
                                className={cn(
                                  "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                  field.value === value
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                {value === 'no' ? t('17') : value === 'free' ? t('18') : t('19')}
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {indoorParking === 'paid' && (
                    <div className="flex gap-4 p-4 border border-dashed rounded-lg">
                      <FormField
                        control={form.control}
                        name="indoor_fee_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Төлбөрийн нэгж</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Сонгоно уу" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hour">Цагаар</SelectItem>
                                <SelectItem value="day">Хоногоор</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="indoor_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Үнэ (₮)</FormLabel>
                            <FormControl>
                              <NumericFormat
                                thousandSeparator=","
                                placeholder="0"
                                value={field.value || ''}
                                onValueChange={(values) => field.onChange(values.value || null)}
                                customInput={Input}
                                className="w-32"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Child Policy */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Хүүхэд болон нэмэлт ор</h3>
                </div>

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

                {allowChildren && (
                  <div className="space-y-4 p-4 border border-dashed rounded-lg">
                    <FormField
                      control={form.control}
                      name="max_child_age"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-4">
                            <FormLabel className="min-w-[200px]">Хүүхдийн дээд нас</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="17"
                                min="0"
                                max="18"
                                step="1"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                      name="child_bed_available"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Хүүхдийн ор байгаа эсэх</FormLabel>
                          <FormControl>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => field.onChange('yes')}
                                className={cn(
                                  "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                                  field.value === 'yes'
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                Тийм
                              </button>
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
                                Үгүй
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="allow_extra_bed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Нэмэлт ор тавих боломжтой эсэх</FormLabel>
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

                {allowExtraBed && (
                  <div className="p-4 border border-dashed rounded-lg">
                    <FormField
                      control={form.control}
                      name="extra_bed_price"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-4">
                            <FormLabel className="min-w-[200px]">Нэмэлт орны үнэ (₮)</FormLabel>
                            <FormControl>
                              <NumericFormat
                                thousandSeparator=","
                                placeholder="0"
                                value={field.value || ''}
                                onValueChange={(values) => field.onChange(values.value || null)}
                                customInput={Input}
                                className="w-40"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
