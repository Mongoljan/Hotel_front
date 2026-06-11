'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

export default function PetPolicySection({ form, t }: Props) {
  return (
    <div className="space-y-3">
      <PolicySectionTitle>{t('pet_policy_title')}</PolicySectionTitle>
      <FormField
        control={form.control}
        name="pet_policy"
        render={({ field }) => (
          <FormItem>
            <PolicyFormRow label={t('12')}>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </PolicyFormRow>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
