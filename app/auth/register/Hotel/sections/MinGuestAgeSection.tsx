'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { UserCheck } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { OptionButton } from '@/components/ui/option-button';
import { schemaHotelSteps3 } from '../../../../schema';
import { PolicySectionTitle } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

export default function MinGuestAgeSection({ form, t }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4" />
        <PolicySectionTitle>{t('min_guest_age_title')}</PolicySectionTitle>
      </div>
      <FormField
        control={form.control}
        name="min_guest_age"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-normal">{t('min_guest_age_label')}</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                <OptionButton
                  className="w-[250px]"
                  selected={field.value === false}
                  onClick={() => field.onChange(false)}
                >
                  {t('min_guest_age_none')}
                </OptionButton>
                <OptionButton
                className="w-[250px] "
                  selected={field.value === true}
                  onClick={() => field.onChange(true)}
                >
                  {t('min_guest_age_18_plus')}
                </OptionButton>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
