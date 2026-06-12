'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { schemaHotelStepsCancellation } from '../../../schema';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from 'next-intl';
import CancellationPolicySection from './sections/CancellationPolicySection';
import { buildCancellationPayload, normalizePercent } from '@/lib/policyFormatters';

const API_URL = 'https://dev.kacc.mn/api/cancellation-fees/';

type FormFields = z.infer<typeof schemaHotelStepsCancellation>;

const normalizeTime = (time: string | null | undefined): string => {
  if (!time) return '';
  const match = time.match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : time;
};

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel5Cancellation({ onNext, onBack }: Props) {
  const t = useTranslations('4PropertyPolicies');
  const { user } = useAuth();
  const [initialValues, setInitialValues] = React.useState<FormFields | null>(null);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelStepsCancellation),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      cancel_time: '12:00',
      single_before_time_percentage: '',
      single_after_time_percentage: '',
      multi_5days_before_percentage: '',
      multi_3days_before_percentage: '',
      multi_2days_before_percentage: '',
      multi_1day_before_percentage: '',
    },
  });

  useEffect(() => {
    const fetchCancellationData = async () => {
      if (!user?.id || !user?.hotel) return;

      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
      const propertyId = stored.propertyId || user.hotel;

      try {
        const res = await fetch(`${API_URL}?property=${propertyId}`);
        const data = await res.json();
        const existing = Array.isArray(data) && data.length > 0 ? data[0] : null;
        const initialData = stored.step5Cancellation || existing;

        if (initialData) {
          const normalizedValues: FormFields = {
            cancel_time: normalizeTime(initialData.cancel_time) || '12:00',
            single_before_time_percentage: normalizePercent(initialData.single_before_time_percentage),
            single_after_time_percentage: normalizePercent(initialData.single_after_time_percentage),
            multi_5days_before_percentage: normalizePercent(initialData.multi_5days_before_percentage),
            multi_3days_before_percentage: normalizePercent(initialData.multi_3days_before_percentage),
            multi_2days_before_percentage: normalizePercent(initialData.multi_2days_before_percentage),
            multi_1day_before_percentage: normalizePercent(initialData.multi_1day_before_percentage),
          };

          setInitialValues(normalizedValues);
          form.reset(normalizedValues);
          stored.step5Cancellation = initialData;
          UserStorage.setItem('propertyData', JSON.stringify(stored), user.id);
        }
      } catch (err) {
        console.error('Failed to fetch cancellation fees:', err);
      }
    };

    fetchCancellationData();
  }, [form, user?.id, user?.hotel]);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
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
    const propertyId = stored.propertyId || user.hotel;

    if (!propertyId) {
      toast.error(t('property_id_not_found'));
      return;
    }

    const formattedData = buildCancellationPayload(data, propertyId);

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

      if (!response.ok) throw new Error('Failed to save cancellation fees');
      const result = await response.json();

      UserStorage.setItem('propertyData', JSON.stringify({
        ...stored,
        step5Cancellation: result,
      }), user.id);

      toast.success(t('policy_saved'));
      onNext();
    } catch (error) {
      console.error(error);
      toast.error(t('error_try_again'));
    }
  };

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-[640px]">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-center">
            {t('cancellation_policy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <CancellationPolicySection form={form} t={t} />
              <Separator />
              <div className="flex gap-3 pt-10">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('13')}
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
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
