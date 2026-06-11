'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { OptionButton } from '@/components/ui/option-button';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle } from './PolicyFormRow';
import { POLICY_INPUT_CLASS } from './PolicyFormRow';

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
      form.setValue('min_guest_age', null, { shouldDirty: true, shouldValidate: true });
    } else if (next === '18') {
      form.setValue('min_guest_age', 18, { shouldDirty: true, shouldValidate: true });
      form.clearErrors('min_guest_age');
    }
  };

  return (
    <div className="space-y-3">
      <PolicySectionTitle>{t('min_guest_age_title')}</PolicySectionTitle>
      <FormField
        control={form.control}
        name="min_guest_age_mode"
        render={() => (
          <FormItem>
            <PolicyFormRow label={t('min_guest_age')}>
              <div className="flex flex-wrap gap-2">
                <OptionButton selected={mode === 'none'} onClick={() => setMode('none')}>
                  {t('min_guest_age_none')}
                </OptionButton>
                <OptionButton selected={mode === '18'} onClick={() => setMode('18')}>
                  18+
                </OptionButton>
                <OptionButton selected={mode === 'custom'} onClick={() => setMode('custom')}>
                  {t('min_guest_age_custom')}
                </OptionButton>
              </div>
            </PolicyFormRow>
            <FormMessage />
          </FormItem>
        )}
      />

      {mode === 'custom' && (
        <FormField
          control={form.control}
          name="min_guest_age"
          render={({ field }) => (
            <FormItem>
              <PolicyFormRow label={t('min_guest_age_custom_input')}>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    placeholder="18"
                    className={POLICY_INPUT_CLASS}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      field.onChange(raw === '' ? null : Number(raw));
                    }}
                  />
                </FormControl>
              </PolicyFormRow>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
