'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { UserCheck } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { YesNoToggle } from '@/components/ui/yes-no-toggle';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle } from './PolicyFormRow';

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
          <FormItem>
            <PolicyFormRow label={t('min_guest_age_label')} alignRight>
              <FormControl>
                <YesNoToggle checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </PolicyFormRow>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}