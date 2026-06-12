'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { UserCheck } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { OptionButton } from '@/components/ui/option-button';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

export default function MinGuestAgeSection({ form, t }: Props) {
  const mode = form.watch('min_guest_age_mode');

  const setMode = (next: FormFields['min_guest_age_mode']) => {
    form.setValue('min_guest_age_mode', next, { shouldDirty: true, shouldValidate: true });
    if (next === 'none') {
      form.setValue('min_guest_age', 0, { shouldDirty: true, shouldValidate: true });
    } else if (next === '18') {
      form.setValue('min_guest_age', 1, { shouldDirty: true, shouldValidate: true });
      form.clearErrors('min_guest_age');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4" />
        <PolicySectionTitle>{t('min_guest_age_title')}</PolicySectionTitle>
      </div>
      <FormField
        control={form.control}
        name="min_guest_age_mode"
        render={() => (
          <FormItem>

              <FormControl>
                <div className="flex flex-wrap gap-2">
                  <OptionButton selected={mode === 'none'} onClick={() => setMode('none')}>
                    {t('min_guest_age_none')}
                  </OptionButton>
                  <OptionButton selected={mode === '18'} onClick={() => setMode('18')}>
                    Насанд хүрсэн байх
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
