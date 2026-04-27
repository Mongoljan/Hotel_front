'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Clock } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';

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
          <Select onValueChange={field.onChange} value={field.value || undefined}>
            <FormControl>
              <SelectTrigger className="w-full h-9">
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
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

export default function CheckInOutSection({ form, t }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <h3 className="text-sm font-semibold">{t('set_time_title')}</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('set_time_description')}
      </p>

      {/* Shared grid aligns both rows so the dash separators sit directly under each other */}
      <div className="p-3 border border-dashed rounded-lg">
        <div className="grid grid-cols-[minmax(120px,160px)_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
          <span className="text-sm font-medium">{t('6')}</span>
          <TimeSelect form={form} name="check_in_from" />
          <span className="text-muted-foreground text-center px-1 select-none">–</span>
          <TimeSelect form={form} name="check_in_until" />

          <span className="text-sm font-medium">{t('8')}</span>
          <TimeSelect form={form} name="check_out_from" />
          <span className="text-muted-foreground text-center px-1 select-none">–</span>
          <TimeSelect form={form} name="check_out_until" />
        </div>
      </div>
    </div>
  );
}
