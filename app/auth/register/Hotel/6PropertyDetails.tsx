'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { schemaHotelSteps6 } from '../../../schema';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const API_PROPERTY_DETAILS = 'https://dev.kacc.mn/api/property-details/';

type FormFields = z.infer<typeof schemaHotelSteps6>;

type Props = {
  onNext: () => void;
  onBack: () => void;
  proceed: number;
  setProceed: (value: number) => void;
};

export default function RegisterHotel6({ onNext, onBack, proceed, setProceed }: Props) {
  const t = useTranslations('6FinalPropertyDetails');
  const locale = useLocale();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<{ id: number; name_en: string; name_mn: string }[]>([]);
  const [initialValues, setInitialValues] = useState<FormFields | null>(null);

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaHotelSteps6),
    defaultValues: {
      general_facilities: [],
    },
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await fetch(API_COMBINED_DATA);
        const data = await res.json();
        setFacilities(data.facilities);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      }
    };
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    
    if (stored.step6) {
      const values = {
        general_facilities: (stored.step6.general_facilities || []).map(String),
      };
      form.reset(values);
      setInitialValues(values);
    }
  }, [form, user?.id]);

  const getStepId = (step: any) => {
    if (Array.isArray(step)) return step[0]?.id;
    if (typeof step === 'object' && step !== null) return step.id;
    return null;
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      if (!user?.id || !user?.hotel) {
        toast.error(t('user_info_missing') || 'User information is missing');
        return;
      }

      // Check if data has changed
      if (initialValues && JSON.stringify(data) === JSON.stringify(initialValues)) {
        onNext();
        return;
      }

      const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
      const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
      const propertyId = stored.propertyId;

      if (!propertyId) {
        toast.error(t('property_id_not_found'));
        return;
      }

      // Get google_map URL from step3
      const googleMapUrl = stored.step3?.googleMapsUrl || stored.step6?.google_map || '';

      console.log('Step 3 data:', stored.step3);
      console.log('Google Map URL to send:', googleMapUrl);

      const payload = {
        propertyBasicInfo: getStepId(stored.step1),
        confirmAddress: getStepId(stored.step2),
        propertyPolicies: getStepId(stored.step4),
        property_photos: Array.isArray(stored.property_photos)
          ? stored.property_photos
          : [stored.property_photos],
        google_map: googleMapUrl,
        general_facilities: [...data.general_facilities].map(Number),
        property: propertyId,
      };

      console.log('Payload being sent:', payload);

      // Check if property detail already exists
      const checkRes = await fetch(`${API_PROPERTY_DETAILS}?property=${propertyId}`);
      const existingDetails = checkRes.ok ? await checkRes.json() : [];

      let response;
      if (existingDetails.length > 0 && existingDetails[0]?.id) {
        // Update existing record using PATCH
        const existingId = existingDetails[0].id;
        console.log('Updating existing property detail:', existingId);
        response = await fetch(`${API_PROPERTY_DETAILS}${existingId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new record using POST
        console.log('Creating new property detail');
        response = await fetch(API_PROPERTY_DETAILS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Property detail submission failed.');

      const result = await response.json();
      stored.step6 = data;
      UserStorage.setItem('propertyData', JSON.stringify(stored), user.id);

      toast.success(t('details_saved_success'));
      onNext();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('error_try_again'));
    }
  };

  return (
    <div className="flex justify-center items-center">

      <Card className="w-full max-w-[600px] md:min-w-[440px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">

            {t('title')}
          </CardTitle>
          <CardDescription className="text-center">

          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('general_facilities_title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('facilities_instruction')}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="general_facilities"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {facilities.map((facility) => (
                          <FormField
                            key={facility.id}
                            control={form.control}
                            name="general_facilities"
                            render={({ field }) => (
                              <FormItem
                                key={facility.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(facility.id.toString())}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      const facilityId = facility.id.toString();
                                      
                                      if (checked) {
                                        field.onChange([...currentValue, facilityId]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter((value) => value !== facilityId)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="cursor-pointer">
                                    {locale === 'mn' ? facility.name_mn : facility.name_en}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('5')}
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1"
                >
                  {t('6')}
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