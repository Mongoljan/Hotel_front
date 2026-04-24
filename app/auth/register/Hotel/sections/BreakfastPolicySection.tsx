'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Coffee } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionButton } from "@/components/ui/option-button";
import { NumericFormat } from 'react-number-format';
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

export default function BreakfastPolicySection({ form, t }: Props) {
  const breakfastStatus = form.watch('breakfast_status');

  React.useEffect(() => {
    if (breakfastStatus !== 'no') {
      const startTime = form.getValues('breakfast_start_time');
      const endTime = form.getValues('breakfast_end_time');
      if (!startTime) form.setValue('breakfast_start_time', '', { shouldValidate: false });
      if (!endTime) form.setValue('breakfast_end_time', '', { shouldValidate: false });
      form.clearErrors(['breakfast_start_time', 'breakfast_end_time']);
    }
  }, [breakfastStatus, form]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Coffee className="h-4 w-4" />
        <h3 className="text-base font-semibold">{t('breakfast')}</h3>
      </div>

      <FormField
        control={form.control}
        name="breakfast_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('10')}</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                {(['no', 'free', 'paid'] as const).map((value) => (
                  <OptionButton
                    key={value}
                    selected={field.value === value}
                    onClick={() => field.onChange(value)}
                  >
                    {value === 'no' ? t('17') : value === 'free' ? t('18') : t('19')}
                  </OptionButton>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {breakfastStatus !== 'no' && (
        <div className="space-y-3 p-3 border border-dashed rounded-lg">
          <div className="flex items-center gap-4">
            <FormLabel className="min-w-[150px]">{t('breakfast_time')}</FormLabel>
            <FormField
              control={form.control}
              name="breakfast_start_time"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="w-[110px]">
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <span>-</span>
            <FormField
              control={form.control}
              name="breakfast_end_time"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="w-[110px]">
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="breakfast_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('breakfast_type_label')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t('select_placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="buffet">{t('buffet')}</SelectItem>
                    <SelectItem value="room">{t('in_room')}</SelectItem>
                    <SelectItem value="plate">{t('plate')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {breakfastStatus === 'paid' && (
            <FormField
              control={form.control}
              name="breakfast_price"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="min-w-[150px]">{t('price_label')}</FormLabel>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator=","
                        placeholder="0"
                        value={field.value || ''}
                        onValueChange={(values) => field.onChange(values.value || null)}
                        customInput={Input}
                        className="w-40"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
