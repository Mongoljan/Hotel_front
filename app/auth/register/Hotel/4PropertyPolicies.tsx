'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { schemaHotelSteps3 } from '../../../schema';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from 'next-intl';

import CheckInOutSection from './sections/CheckInOutSection';
import CancellationPolicySection from './sections/CancellationPolicySection';
import BreakfastPolicySection from './sections/BreakfastPolicySection';
import ParkingPolicySection from './sections/ParkingPolicySection';
import ChildPolicySection from './sections/ChildPolicySection';

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
      // Check-in/Check-out times (default to 12:00)
      check_in_from: '12:00',
      check_in_until: '12:00',
      check_out_from: '12:00',
      check_out_until: '12:00',
      
      // Cancellation fee
      cancel_time: '12:00',
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
            cancel_time: initialData.cancellation_fee?.cancel_time || '12:00',
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
      toast.error(t('user_info_missing'));
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
      toast.error(t('property_id_not_found'));
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
      toast.error(t('error_try_again'));
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
              
              <CheckInOutSection form={form} t={t} />

              <Separator />

              <CancellationPolicySection form={form} t={t} />

              <Separator />

              <BreakfastPolicySection form={form} t={t} />

              <Separator />

              <ParkingPolicySection form={form} t={t} />

              <Separator />

              <ChildPolicySection form={form} t={t} />

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
