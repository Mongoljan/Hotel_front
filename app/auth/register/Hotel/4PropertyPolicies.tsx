'use client';

import React, { useEffect, useState } from 'react';
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
import { useTranslations, useLocale } from 'next-intl';
import { useCombinedData } from '@/app/hooks/useCombinedData';

import CheckInOutSection from './sections/CheckInOutSection';
import BreakfastPolicySection from './sections/BreakfastPolicySection';
import ParkingPolicySection from './sections/ParkingPolicySection';
import ChildPolicySection from './sections/ChildPolicySection';
import LanguagesPolicySection from './sections/LanguagesPolicySection';
import MinGuestAgeSection from './sections/MinGuestAgeSection';
import PetPolicySection from './sections/PetPolicySection';
import AcceptedCardsSection, { type AcceptedCardType } from './sections/AcceptedCardsSection';

const API_URL = 'https://dev.kacc.mn/api/property-policies/';

type FormFields = z.infer<typeof schemaHotelSteps3>;

const normalizeTime = (time: string | null | undefined): string => {
  if (!time) return '';
  const match = time.match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : time;
};

const normalizePrice = (price: string | number | null | undefined): string | null => {
  if (price === null || price === undefined || price === '') return null;
  return String(price).replace(/,/g, '');
};

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel4({ onNext, onBack }: Props) {
  const t = useTranslations('4PropertyPolicies');
  const locale = useLocale();
  const { user } = useAuth();
  const { data: combinedData } = useCombinedData();
  const [initialValues, setInitialValues] = React.useState<FormFields | null>(null);
  const [languages, setLanguages] = useState<{ id: number; languages_name_mn: string }[]>([]);
  const [acceptedCards, setAcceptedCards] = useState<AcceptedCardType[]>([]);

  useEffect(() => {
    if (combinedData?.languages) setLanguages(combinedData.languages);
    if (combinedData?.acceptedCardType) setAcceptedCards(combinedData.acceptedCardType);
  }, [combinedData]);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps3),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      check_in_from: '12:00',
      check_in_until: '12:00',
      check_out_from: '12:00',
      check_out_until: '12:00',
      pet_policy: false,
      min_guest_age: false,
      languages: [],
      accepted_card_ids: [],
      breakfast_status: 'no',
      breakfast_start_time: '',
      breakfast_end_time: '',
      breakfast_price: null,
      breakfast_type: undefined,
      outdoor_parking: 'no',
      outdoor_fee_type: null,
      outdoor_price: null,
      indoor_parking: 'no',
      indoor_fee_type: null,
      indoor_price: null,
      allow_children: false,
      max_child_age: undefined,
      child_bed_available: undefined,
      free_breakfast_max_age: undefined,
      allow_extra_bed: false,
      extra_bed_price: null,
      total_extra_beds: 0,
    },
  });

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
          const step1Languages = Array.isArray(stored.step1?.languages)
            ? stored.step1.languages.map((l: number | string) => Number(l))
            : [];
          const policyLanguages = Array.isArray(initialData.languages)
            ? initialData.languages.map((l: number | string) => Number(l))
            : [];
          const checkInFrom = normalizeTime(initialData.check_in_from) || '';
          const checkOutFrom = normalizeTime(initialData.check_out_from) || '';

          const normalizedValues: FormFields = {
            check_in_from: checkInFrom,
            check_in_until: normalizeTime(initialData.check_in_until) || checkInFrom,
            check_out_from: checkOutFrom,
            check_out_until: normalizeTime(initialData.check_out_until) || checkOutFrom,
            pet_policy: Boolean(initialData.pet_policy),
            min_guest_age: Boolean(initialData.min_guest_age),
            languages: policyLanguages.length > 0 ? policyLanguages : step1Languages,
            accepted_card_ids: Array.isArray(initialData.accepted_cards)
              ? initialData.accepted_cards.map((c: { id: number | string }) => Number(c.id))
              : Array.isArray(initialData.accepted_card_ids)
                ? initialData.accepted_card_ids.map((id: number | string) => Number(id))
                : [],
            breakfast_status: initialData.breakfast_policy?.status || 'no',
            breakfast_start_time: normalizeTime(initialData.breakfast_policy?.start_time) || '',
            breakfast_end_time: normalizeTime(initialData.breakfast_policy?.end_time) || '',
            breakfast_price: normalizePrice(initialData.breakfast_policy?.price),
            breakfast_type: initialData.breakfast_policy?.breakfast_type || undefined,
            outdoor_parking: initialData.parking_policy?.outdoor_parking || 'no',
            outdoor_fee_type: initialData.parking_policy?.outdoor_fee_type || null,
            outdoor_price: normalizePrice(initialData.parking_policy?.outdoor_price),
            indoor_parking: initialData.parking_policy?.indoor_parking || 'no',
            indoor_fee_type: initialData.parking_policy?.indoor_fee_type || null,
            indoor_price: normalizePrice(initialData.parking_policy?.indoor_price),
            allow_children: initialData.child_policy?.allow_children || false,
            max_child_age: initialData.child_policy?.max_child_age || undefined,
            child_bed_available: initialData.child_policy?.child_bed_available || undefined,
            free_breakfast_max_age:
              initialData.child_policy?.free_breakfast_max_age ?? undefined,
            allow_extra_bed: initialData.child_policy?.allow_extra_bed || false,
            extra_bed_price: normalizePrice(initialData.child_policy?.extra_bed_price),
            total_extra_beds: initialData.total_extra_beds ?? 0,
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

    const stripSeconds = (time: string) => (time ? time.slice(0, 5) : time);

    const formattedData = {
      property: propertyId,
      check_in_from: stripSeconds(data.check_in_from),
      check_in_until: stripSeconds(data.check_in_until || data.check_in_from),
      check_out_from: stripSeconds(data.check_out_from),
      check_out_until: stripSeconds(data.check_out_until || data.check_out_from),
      pet_policy: data.pet_policy,
      min_guest_age: data.min_guest_age,
      total_extra_beds: data.total_extra_beds ?? 0,
      languages: data.languages,
      accepted_card_ids: data.accepted_card_ids ?? [],
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
        max_child_age: data.allow_children ? data.max_child_age : 0,
        child_bed_available: data.allow_children ? data.child_bed_available : 'no',
        free_breakfast_max_age:
          data.free_breakfast_max_age !== undefined && data.free_breakfast_max_age !== null
            ? data.free_breakfast_max_age
            : null,
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
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-[640px]">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-center">
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <CheckInOutSection form={form} t={t} />

              <Separator />

              <BreakfastPolicySection form={form} t={t} />

              <Separator />

              <ParkingPolicySection form={form} t={t} />

              <Separator />

              <ChildPolicySection form={form} t={t} />

              <Separator />

              <LanguagesPolicySection form={form} t={t} languages={languages} locale={locale} />

              <Separator />

              <MinGuestAgeSection form={form} t={t} />

              <Separator />

              <PetPolicySection form={form} t={t} />

              {acceptedCards.length > 0 && (
                <>
                  <Separator />
                  <AcceptedCardsSection form={form} t={t} cards={acceptedCards} />
                </>
              )}

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