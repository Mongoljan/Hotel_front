'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Clock } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle, POLICY_TIME_SELECT_CLASS } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4).toString().padStart(2, '0');
  const minute = ((i % 4) * 15).toString().padStart(2, '0');
  return { value: `${hour}:${minute}`, label: `${hour}:${minute}` };
});

type TimeName = 'check_in_from' | 'check_out_from';

function TimeSelect({ form, name }: { form: UseFormReturn<FormFields>; name: TimeName }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              if (name === 'check_in_from') {
                form.setValue('check_in_until', value, { shouldValidate: true });
              } else {
                form.setValue('check_out_until', value, { shouldValidate: true });
              }
            }}
            value={field.value || undefined}
          >
            <FormControl>
              <SelectTrigger className={POLICY_TIME_SELECT_CLASS}>
                <SelectValue placeholder="ЦЦ:ММ" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-sm" />
        </FormItem>
      )}
    />
  );
}

export default function CheckInOutSection({ form, t }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <PolicySectionTitle>{t('set_time_title')}</PolicySectionTitle>
      </div>
      <p className="text-sm text-muted-foreground">{t('set_time_description')}</p>

      <PolicyFormRow label={t('check_in_time')}>
        <TimeSelect form={form} name="check_in_from" />
      </PolicyFormRow>

      <PolicyFormRow label={t('check_out_time')}>
        <TimeSelect form={form} name="check_out_from" />
      </PolicyFormRow>
    </div>
  );
}
