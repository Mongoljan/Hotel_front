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

type TimeName = 'check_in_from' | 'check_in_until' | 'check_out_from' | 'check_out_until';

function TimeSelect({ form, name }: { form: UseFormReturn<FormFields>; name: TimeName }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <Select
            onValueChange={field.onChange}
            value={field.value || undefined}
          >
            <FormControl>
              <SelectTrigger className={POLICY_TIME_SELECT_CLASS}>
                <SelectValue placeholder={<span className="text-muted-foreground">ЦЦ:ММ</span>} />
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

function TimeRangeRow({ form, label, fromName, untilName }: { form: UseFormReturn<FormFields>; label: string; fromName: TimeName; untilName: TimeName }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center">
        <TimeSelect form={form} name={fromName} />
        <span className="mx-2 text-muted-foreground">—</span>
        <TimeSelect form={form} name={untilName} />
      </div>
    </div>
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

      <TimeRangeRow
        form={form}
        label={t('check_in_time')}
        fromName="check_in_from"
        untilName="check_in_until"
      />

      <TimeRangeRow
        form={form}
        label={t('check_out_time')}
        fromName="check_out_from"
        untilName="check_out_until"
      />
    </div>
  );
}
